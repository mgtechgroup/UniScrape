import express from 'express'
import { execSync } from 'child_process'
import Parser from 'rss-parser'
import axios from 'axios'

const rssParser = new Parser()

export function torrentPlugin() {
  const router = express.Router()

  // Public trackers
  const PUBLIC_TRACKERS = [
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://open.tracker.cl:1337/announce',
    'udp://tracker.openbittorrent.com:6969/announce',
    'udp://tracker.coppersurfer.tk:6969/announce',
    'udp://tracker.leechers-paradise.org:6969/announce',
    'udp://tracker.internetwarriors.net:1337/announce',
    'udp://tracker.torrent.eu.org:451/announce',
    'udp://tracker.moeking.me:6969/announce',
    'udp://explodie.org:6969/announce',
    'udp://tracker.tiny-vps.com:6969/announce',
    'udp://open.demonii.com:1337/announce',
    'udp://tracker.debian.org:6969/announce',
    'udp://open.stealth.si:80/announce',
    'udp://tracker.cyberia.is:6969/announce',
    'http://tracker.bt4g.com:2095/announce',
  ]

  // RSS feed sources
  const RSS_FEEDS = [
    { name: '1337x', url: 'https://1337x.to/rss' },
    { name: 'TorrentGalaxy', url: 'https://torrentgalaxy.to/rss' },
    { name: 'EZTV', url: 'https://eztv.re/ezrss.xml' },
    { name: 'YTS', url: 'https://yts.mx/rss' },
    { name: 'PornRips', url: 'https://pornrips.to/rss' },
    { name: 'Nyaa', url: 'https://nyaa.si/?page=rss' },
  ]

  // Get public trackers
  router.get('/trackers', (req, res) => {
    res.json({
      public: PUBLIC_TRACKERS,
      count: PUBLIC_TRACKERS.length,
    })
  })

  // Get RSS feeds
  router.get('/feeds', (req, res) => {
    res.json({ feeds: RSS_FEEDS })
  })

  // Fetch RSS feed
  router.get('/feed/:feedId', async (req, res) => {
    const feed = RSS_FEEDS.find(f => f.name.toLowerCase() === req.params.feedId.toLowerCase())
    if (!feed) return res.status(404).json({ error: 'Feed not found' })

    try {
      const data = await rssParser.parseURL(feed.url)
      res.json({
        feed: feed.name,
        items: (data.items || []).slice(0, 50).map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          content: item.contentSnippet,
          enclosure: item.enclosure,
        }))
      })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // Generate magnet link
  router.get('/magnet', (req, res) => {
    const { hash, title, trackers } = req.query
    if (!hash) return res.status(400).json({ error: 'hash required' })

    const allTrackers = [...PUBLIC_TRACKERS, ...(trackers?.split(',') || [])]
    const magnet = `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title || '')}&tr=${allTrackers.join('&tr=')}`
    
    res.json({ magnet })
  })

  // Parse torrent file
  router.post('/parse', (req, res) => {
    const { torrentUrl } = req.body
    if (!torrentUrl) return res.status(400).json({ error: 'torrentUrl required' })

    try {
      // In production: download and parse torrent file
      res.json({
        url: torrentUrl,
        trackers: PUBLIC_TRACKERS,
        message: 'Torrent parsing requires python torrent-parser',
      })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // DHT / P2P search (via libtorrent/bittorrent-dht)
  router.get('/search', (req, res) => {
    const { query } = req.query
    res.json({
      query,
      results: [],
      message: 'DHT search available via external scraper integration',
    })
  })

  return router
}
