#!/usr/bin/env node
import { execSync, spawn } from 'child_process'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const cmd = process.argv[2]
const args = process.argv.slice(3)

const help = () => {
  console.log(`
  UniScrape CLI - Universal Media Scraping Tool
  
  Commands:
    start              Start the universal scraping server
    search <query>     Search across all sources
    scrapers list      List all 800+ available scrapers
    scrapers gay       List gay/queer scrapers
    scrapers enable    Enable all scrapers
    torrent <query>    Search torrents
    stream <query>     Search web streams
    files <path>       Search local files
    install            Install as Windows service
    docker start       Start Docker stack
    docker stop        Stop Docker stack
    
  Usage:
    uniscrape search "lexi belle"
    uniscrape torrent "brazzers"
    uniscrape stream "latina"
  `)
}

switch (cmd) {
  case 'start':
    spawn('node', [join(__dirname, '..', 'server', 'index.js')], {
      stdio: 'inherit',
      env: { ...process.env, PORT: process.env.PORT || '8085' }
    })
    break

  case 'search':
  case 'torrent':
  case 'stream':
  case 'files': {
    const query = args.join(' ')
    if (!query) { console.log('Usage: uniscrape search <query>'); break }
    const endpoint = cmd === 'torrent' ? 'search?providers=torrents' :
                     cmd === 'stream' ? 'search?providers=webstreams' :
                     cmd === 'files' ? 'files/search' : 'search/all'
    try {
      const port = process.env.PORT || '8085'
      const result = execSync(`curl -s "http://localhost:${port}/api/v1/manager/${endpoint}&q=${encodeURIComponent(query)}"`, { encoding: 'utf8' })
      const data = JSON.parse(result)
      console.log(`\n${data.total} results for "${data.query}":\n`)
      data.results?.slice(0, 20).forEach((r, i) => {
        console.log(`${i + 1}. [${r.type}] ${r.title}`)
        if (r.url) console.log(`   ${r.url}`)
        if (r.seeds) console.log(`   Seeds: ${r.seeds} | Size: ${r.size}`)
      })
    } catch {
      console.log('Make sure the UniScrape server is running: uniscrape start')
    }
    break
  }

  case 'scrapers': {
    const sub = args[0]
    const port = process.env.PORT || '8085'
    try {
      if (sub === 'gay') {
        const result = execSync(`curl -s "http://localhost:${port}/api/v1/scrape/gay/list"`, { encoding: 'utf8' })
        const data = JSON.parse(result)
        console.log(`\n🏳️‍🌈 ${data.total} gay/queer scrapers:\n`)
        data.scrapers.forEach(s => console.log(`  ${s.name.padEnd(30)} ${s.type.padEnd(12)} ${s.url}`))
      } else if (sub === 'list') {
        const result = execSync(`curl -s "http://localhost:${port}/api/v1/scrape/"`, { encoding: 'utf8' })
        const data = JSON.parse(result)
        console.log(`\n${data.total} scrapers across ${data.types.length} types\n`)
      } else if (sub === 'enable') {
        execSync(`curl -s -X POST "http://localhost:${port}/api/v1/manager/enable-all"`, { encoding: 'utf8' })
        console.log('All scrapers enabled.')
      } else {
        help()
      }
    } catch {
      console.log('Make sure the UniScrape server is running: uniscrape start')
    }
    break
  }

  case 'docker': {
    const sub = args[0]
    const dockerDir = join(__dirname, '..', 'docker')
    if (sub === 'start') execSync(`docker compose -f ${dockerDir}/docker-compose.yml up -d`, { stdio: 'inherit' })
    else if (sub === 'stop') execSync(`docker compose -f ${dockerDir}/docker-compose.yml down`, { stdio: 'inherit' })
    else help()
    break
  }

  case 'install': {
    console.log('Installing UniScrape as Windows service...')
    // Create scheduled task for auto-start
    execSync(`schtasks /create /tn "UniScrape" /tr "node ${join(__dirname, '..', 'server', 'index.js')}" /sc onstart /rl highest /f`, { stdio: 'inherit' })
    console.log('UniScrape installed as Windows auto-start service.')
    break
  }

  default:
    help()
}
