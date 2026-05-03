import { load } from 'cheerio'
import { fetchWithRetry } from './proxy-rotator.js'

/**
 * OpenGraph / Link Metadata Extractor
 * Integrated from link-meta-extractor + SourceScraper patterns
 */
export async function extractMetadata(url) {
  try {
    const html = await fetchWithRetry(url)
    const $ = load(html)

    const meta = {
      url,
      title: $('meta[property="og:title"]').attr('content') || $('title').text() || '',
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
      image: $('meta[property="og:image"]').attr('content') || $('meta[property="og:image:secure_url"]').attr('content') || '',
      siteName: $('meta[property="og:site_name"]').attr('content') || '',
      type: $('meta[property="og:type"]').attr('content') || 'website',
      locale: $('meta[property="og:locale"]').attr('content') || '',
      
      // Twitter cards
      twitterTitle: $('meta[name="twitter:title"]').attr('content') || '',
      twitterImage: $('meta[name="twitter:image"]').attr('content') || '',
      twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
      
      // Schema.org
      schemaType: $('script[type="application/ld+json"]').first().text() || '',
      
      // General
      favicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || '',
      language: $('html').attr('lang') || '',
      
      // Media
      videos: [],
      audios: [],
      images: [],
    }

    // Extract video sources
    $('video source, video[src]').each((i, el) => {
      const src = $(el).attr('src') || ''
      if (src) meta.videos.push(src)
    })

    // Extract audio sources
    $('audio source, audio[src]').each((i, el) => {
      const src = $(el).attr('src') || ''
      if (src) meta.audios.push(src)
    })

    // Extract all images
    $('img[src]').each((i, el) => {
      if (i >= 10) return false
      const src = $(el).attr('src') || ''
      const alt = $(el).attr('alt') || ''
      if (src && !src.startsWith('data:')) {
        meta.images.push({ src: absolutify(src, url), alt })
      }
    })

    // Fix relative URLs
    if (meta.image) meta.image = absolutify(meta.image, url)
    if (meta.favicon) meta.favicon = absolutify(meta.favicon, url)

    return meta
  } catch (e) {
    return { url, error: e.message }
  }
}

function absolutify(path, baseUrl) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('//')) return 'https:' + path
  try {
    return new URL(path, baseUrl).href
  } catch {
    return path
  }
}

/**
 * Bulk metadata extraction for multiple URLs
 */
export async function extractBulkMetadata(urls) {
  const results = await Promise.allSettled(urls.map(url => extractMetadata(url)))
  return results.map((r, i) => ({
    url: urls[i],
    ...(r.status === 'fulfilled' ? r.value : { error: r.reason.message }),
  }))
}
