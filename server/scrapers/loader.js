import { readdirSync, readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
import yaml from 'js-yaml'

let loadedScrapers = []
let scraperIndex = {}

export async function loadScrapers(scrapersPath) {
  if (!existsSync(scrapersPath)) {
    console.warn(`Scrapers path not found: ${scrapersPath}`)
    return 0
  }

  loadedScrapers = []
  scraperIndex = {}
  
  const files = readdirSync(scrapersPath, { recursive: true })
  
  for (const file of files) {
    const ext = extname(file).toLowerCase()
    const fullPath = join(scrapersPath, file)
    
    if (ext === '.yml' || ext === '.yaml') {
      try {
        const content = readFileSync(fullPath, 'utf8')
        const scraper = yaml.load(content)
        
        if (scraper && scraper.name) {
          const entry = {
            id: file.replace(/\.ya?ml$/, ''),
            name: scraper.name,
            file,
            path: fullPath,
            type: determineType(scraper),
            url: scraper.url || scraper.sceneURL || '',
            description: scraper.description || '',
            requiresPython: file.includes('py_scraper') || file.toLowerCase().includes('python'),
            requiresBrowser: scraper.useCDP || false,
            enabled: true,
            scraperConfig: scraper,
          }
          
          loadedScrapers.push(entry)
          scraperIndex[entry.id] = entry
        }
      } catch (e) {
        // Skip malformed YAML
      }
    }
  }

  console.log(`Loaded ${loadedScrapers.length} scrapers from ${scrapersPath}`)
  return loadedScrapers.length
}

function determineType(scraper) {
  if (scraper.sceneByName || scraper.sceneByURL || scraper.sceneByQueryFragment || scraper.sceneByFragment) return 'scene'
  if (scraper.galleryByName || scraper.galleryByURL || scraper.galleryByFragment) return 'gallery'
  if (scraper.performerByName || scraper.performerByURL || scraper.performerByFragment) return 'performer'
  if (scraper.groupByName || scraper.groupByURL) return 'group'
  if (scraper.imageByName || scraper.imageByURL) return 'image'
  return 'scene'
}

export function getScraper(id) {
  return scraperIndex[id] || null
}

export function getAllScrapers() {
  return loadedScrapers
}

export function getScrapersByType(type) {
  return loadedScrapers.filter(s => s.type === type)
}

export function searchScrapers(query) {
  const q = query.toLowerCase()
  return loadedScrapers.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.id.toLowerCase().includes(q) ||
    s.url.toLowerCase().includes(q)
  )
}

export function getGayScrapers() {
  const gayKeywords = [
    'gay', 'twink', 'bear', 'daddy', 'queer', 'male', 'men', 'boy',
    'cock', 'hunk', 'muscle', 'leather', 'stud', 'bromo', 'czechhunter',
    'seancody', 'cockyboys', 'helix', 'belami', 'kristenbjorn', 'menatplay',
    'randyblue', 'corbinfisher', 'ragingstallion', 'titanmen', 'falconstudios',
    'gaywire', 'hothouse', 'freshmen', 'staxus', 'noodlesdude', 'menrush',
    'queercrush', 'gayhoopla', 'whoaboyz', 'englishlads', 'eastboys', 'mengalaxy',
    'blakemason', 'timtales', 'bromocorp', 'frenchtwinks', 'boyfun', 'boycrush',
    'colbyknox', 'peterskingdom', 'boynapped', 'blackmaleme', 'gaynetwork',
    'fratx', 'guysinsweatpants', 'himerostv', 'mensrush', 'nakedsword',
    'pridestudios', 'redhotstraightboys', 'biphoria', 'biguysfuck', 'bicollegefucks',
  ]
  return loadedScrapers.filter(s => 
    gayKeywords.some(kw => s.name.toLowerCase().includes(kw) || s.id.toLowerCase().includes(kw))
  )
}
