import axios from 'axios'

/**
 * Proxy rotation service - integrated from proxycrawl + scraply patterns
 * Rotates through proxies to avoid rate limiting and IP bans
 */
const PROXY_LIST = [
  { host: 'proxy', port: 8888 },
]

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0',
]

let proxyIndex = 0
let uaIndex = 0

export function rotateProxy() {
  proxyIndex = (proxyIndex + 1) % Math.max(PROXY_LIST.length, 1)
  return PROXY_LIST[proxyIndex]
}

export function rotateUserAgent() {
  uaIndex = (uaIndex + 1) % USER_AGENTS.length
  return USER_AGENTS[uaIndex]
}

export function getAxiosConfig() {
  const cfg = {
    headers: { 'User-Agent': rotateUserAgent(), 'Accept': 'text/html,application/xhtml+xml,*/*', 'Accept-Language': 'en-US,en;q=0.9' },
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: s => s < 500,
  }
  if (PROXY_LIST.length > 0 && PROXY_LIST[0].host !== 'proxy') {
    cfg.proxy = { host: PROXY_LIST[proxyIndex].host, port: PROXY_LIST[proxyIndex].port }
  }
  return cfg
}

export function setProxies(proxies) {
  PROXY_LIST.length = 0
  PROXY_LIST.push(...proxies)
}

export async function fetchWithRetry(url, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const cfg = getAxiosConfig()
      if (i > 0) { cfg.headers['User-Agent'] = rotateUserAgent(); rotateProxy() }
      const { data } = await axios.get(url, cfg)
      return data
    } catch (err) {
      if (i === maxRetries - 1) throw err
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
}
