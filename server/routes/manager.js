import express from 'express'
import { searchEngine } from '../search/engine.js'
import { getPluginSources, getPluginsByType } from '../search/providers/stash-plugins-registry.js'
import { torrentUpdater } from '../search/providers/torrent-updater.js'
import { torrentStream } from '../search/providers/webtorrent.js'
import { getAllScrapers, getGayScrapers } from '../scrapers/loader.js'

export const managerRouter = express.Router()

// Initialize search engine
searchEngine.init().catch(console.error)

// --- Unified Search ---
managerRouter.get('/search', async (req, res) => {
  const { q, providers, limit, gay } = req.query
  if (!q) return res.status(400).json({ error: 'Missing ?q= query parameter' })

  const results = await searchEngine.search(q, {
    providers: providers?.split(',') || undefined,
    limit: parseInt(limit) || 50,
    filterGay: gay === 'true',
  })

  res.json({
    query: q,
    total: results.length,
    results,
    providers_used: providers?.split(',') || ['scrapers', 'torrents', 'webstreams', 'localfiles', 'scrapesites'],
  })
})

// --- Unified search (all sources) ---
managerRouter.get('/search/all', async (req, res) => {
  const { q } = req.query
  if (!q) return res.status(400).json({ error: 'Missing ?q= query parameter' })

  const results = await searchEngine.unifiedSearch(q)

  res.json({
    query: q,
    total: results.length,
    results,
    breakdown: {
      torrents: results.filter(r => r.type === 'torrent').length,
      webstreams: results.filter(r => r.type === 'webstream').length,
      scrapers: results.filter(r => r.type === 'scraper').length,
      localfiles: results.filter(r => r.type === 'localfile').length,
      scrapesites: results.filter(r => r.type === 'scrapesite').length,
    }
  })
})

// --- Plugin Registry ---
managerRouter.get('/plugins', (req, res) => {
  const { type } = req.query
  const plugins = type ? getPluginsByType(type) : getPluginSources()
  res.json({
    total: plugins.length,
    by_type: {
      official: getPluginsByType('official').length,
      community: getPluginsByType('community').length,
      theme: getPluginsByType('theme').length,
      bridge: getPluginsByType('bridge').length,
    },
    plugins,
  })
})

managerRouter.get('/plugins/:name', (req, res) => {
  const plugins = getPluginSources()
  const plugin = plugins.find(p => p.name.toLowerCase().replace(/\s+/g,'-') === req.params.name.toLowerCase())
  if (!plugin) return res.status(404).json({ error: 'Plugin not found' })
  res.json(plugin)
})

// --- Torrent Updater / DHT ---
managerRouter.get('/torrent/feeds', (req, res) => {
  res.json({ feeds: torrentUpdater.getFeeds() })
})

managerRouter.get('/torrent/stream', (req, res) => {
  const { hash } = req.query
  if (!hash) return res.status(400).json({ error: 'hash required' })
  res.json(torrentStream.getStreamInfo(hash))
})

managerRouter.get('/torrent/trackers', (req, res) => {
  res.json(torrentStream.getTrackers())
})

// --- File system search ---
managerRouter.get('/files/search', async (req, res) => {
  const { q, path } = req.query
  if (!q) return res.status(400).json({ error: 'Missing ?q= query parameter' })

  const results = await searchEngine.search(q, {
    providers: path ? ['localfiles'] : ['localfiles'],
    limit: 100,
  })

  res.json({ query: q, total: results.length, results })
})

// --- Manager dashboard ---
managerRouter.get('/dashboard', (req, res) => {
  const scrapers = getAllScrapers()
  res.json({
    total_scrapers: scrapers.length,
    by_type: {
      scene: scrapers.filter(s => s.type === 'scene').length,
      performer: scrapers.filter(s => s.type === 'performer').length,
      gallery: scrapers.filter(s => s.type === 'gallery').length,
      group: scrapers.filter(s => s.type === 'group').length,
      image: scrapers.filter(s => s.type === 'image').length,
    },
    gay_scrapers: getGayScrapers().length,
    python_scrapers: scrapers.filter(s => s.requiresPython).length,
    browser_scrapers: scrapers.filter(s => s.requiresBrowser).length,
    search_engine: 'ready',
    supported_platforms: ['stremio', 'plex', 'jellyfin', 'stash'],
    torrent_trackers: 15,
    rss_feeds: 6,
    stream_sources: ['Pornhub', 'XVideos', 'XNXX', 'XHamster', 'RedTube', 'YouPorn', 'Motherless', 'Eporner', 'SpankBang'],
    torrent_sources: ['1337x', 'TorrentGalaxy', 'YTS'],
  })
})

// --- Enable all scrapers ---
managerRouter.post('/enable-all', (req, res) => {
  const scrapers = getAllScrapers()
  scrapers.forEach(s => { s.enabled = true })
  res.json({ success: true, enabled: scrapers.length })
})

// --- Enable gay scrapers ---
managerRouter.post('/enable-gay', (req, res) => {
  const scrapers = getGayScrapers()
  scrapers.forEach(s => { s.enabled = true })
  res.json({ success: true, enabled: scrapers.length, scrapers: scrapers.map(s => s.name) })
})

// --- Reload scrapers ---
managerRouter.post('/reload', async (req, res) => {
  const { loadScrapers } = await import('../scrapers/loader.js')
  const count = await loadScrapers(req.body.path || process.env.SCRAPERS_PATH)
  await searchEngine.loadScrapersIntoIndex()
  res.json({ success: true, count })
})

// --- Configure file search paths ---
managerRouter.post('/paths', async (req, res) => {
  const { setSearchPaths } = await import('../search/providers/files-provider.js')
  setSearchPaths(req.body.paths || [])
  res.json({ success: true, paths: req.body.paths })
})

// --- EXPOrt / Import scraper config ---
managerRouter.get('/export', (req, res) => {
  const scrapers = getAllScrapers()
  res.json({
    export_date: new Date().toISOString(),
    total_scrapers: scrapers.length,
    enabled_scrapers: scrapers.filter(s => s.enabled).length,
    scrapers: scrapers,
  })
})
