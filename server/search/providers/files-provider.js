import { join, extname } from 'path'
import { readdirSync, statSync, existsSync } from 'fs'
import { homedir } from 'os'

// Common media file extensions
const MEDIA_EXTS = new Set([
  '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpg', '.mpeg',
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff',
  '.srt', '.vtt', '.ass', '.ssa', '.sub',
  '.nfo', '.torrent',
])

// Common search paths
const SEARCH_PATHS = [
  'D:\\Media\\Adult',
  'D:\\Media\\Scenes',
  'D:\\Media\\Movies',
  'D:\\Downloads',
  'E:\\Media',
  'C:\\Users\\Public\\Videos',
  join(homedir(), 'Videos'),
  join(homedir(), 'Downloads'),
  join(homedir(), 'Media'),
]

export async function searchLocalFiles(query, options = {}) {
  const { limit = 50 } = options
  const results = []
  const q = query.toLowerCase()

  for (const searchPath of SEARCH_PATHS) {
    if (!existsSync(searchPath)) continue
    
    try {
      searchDir(searchPath, q, results, 3, limit)
    } catch {
      // Skip inaccessible directories
    }
    
    if (results.length >= limit) break
  }

  return results
}

function searchDir(dir, query, results, maxDepth, limit) {
  if (maxDepth <= 0 || results.length >= limit) return

  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    if (results.length >= limit) break

    const fullPath = join(dir, entry.name)
    const nameLower = entry.name.toLowerCase()

    if (entry.isDirectory()) {
      // Search subdirectory if name matches or depth allows
      if (nameLower.includes(query) || maxDepth > 1) {
        searchDir(fullPath, query, results, maxDepth - 1, limit)
      }
    } else if (entry.isFile() && MEDIA_EXTS.has(extname(nameLower))) {
      if (nameLower.includes(query)) {
        try {
          const stats = statSync(fullPath)
          results.push({
            title: entry.name,
            path: fullPath,
            size: formatBytes(stats.size),
            modified: stats.mtime.toISOString(),
            extension: extname(entry.name),
            source: 'local',
            score: calculateFileMatchScore(entry.name, query),
            type: 'localfile',
          })
        } catch {}
      }
    }
  }
}

function calculateFileMatchScore(filename, query) {
  const name = filename.toLowerCase()
  let score = 0
  if (name === query) score = 100
  else if (name.startsWith(query)) score = 80
  else if (name.includes(query)) score = 60
  // Boost for quality indicators in filename
  if (name.includes('1080p') || name.includes('4k')) score += 10
  if (name.includes('60fps')) score += 5
  return score
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function setSearchPaths(paths) {
  SEARCH_PATHS.length = 0
  SEARCH_PATHS.push(...paths)
}
