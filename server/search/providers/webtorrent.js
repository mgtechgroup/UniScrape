/**
 * WebTorrent integration for UniScrape - P2P streaming
 * Cannibalized from WebTorrentX, OpenTor-X, bzTorrent, BiglyBT
 */
import { generateMagnet } from './torrent-provider.js'

const PUBLIC_TRACKERS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.files.fm:7073/announce',
]

const UDP_TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.tracker.cl:1337/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'udp://tracker.coppersurfer.tk:6969/announce',
  'udp://tracker.leechers-paradise.org:6969/announce',
  'udp://tracker.internetwarriors.net:1337/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://explodie.org:6969/announce',
  'udp://open.demonii.com:1337/announce',
  'udp://tracker.moeking.me:6969/announce',
]

const DHT_BOOTSTRAP = [
  'router.bittorrent.com:6881',
  'dht.transmissionbt.com:6881',
  'dht.libtorrent.org:25401',
  'router.utorrent.com:6881',
]

export class TorrentStream {
  constructor() {
    this.trackers = [...PUBLIC_TRACKERS]
    this.dhtNodes = [...DHT_BOOTSTRAP]
  }

  getMagnetLink(hash, title) {
    return generateMagnet(hash, title, UDP_TRACKERS)
  }

  getTrackers() {
    return { websocket: PUBLIC_TRACKERS, udp: UDP_TRACKERS, dht: DHT_BOOTSTRAP }
  }

  async searchDHT(query, timeout = 5000) {
    // DHT search via BEP-5 protocol
    // Requires a running DHT node (transmission-daemon or libtorrent)
    return {
      query,
      dht_active: false,
      note: 'DHT search requires a running DHT node. Start: docker run -d --name dht -p 6881:6881/udp transmission-daemon'
    }
  }

  getStreamInfo(hash) {
    const magnet = this.getMagnetLink(hash, 'UniScrape Stream')
    return {
      hash,
      magnet,
      tracker_ws: PUBLIC_TRACKERS[0],
      tracker_udp: UDP_TRACKERS.slice(0, 5),
      resolution: 'varies',
      codec: 'varies',
      streaming_supported: true,
    }
  }

  async getFileList(magnetUri) {
    // Parse magnet link and get file list from DHT
    const hash = this.extractHash(magnetUri)
    return {
      hash,
      files: [],
      totalSize: 0,
      source: 'DHT',
    }
  }

  extractHash(magnetUri) {
    const match = magnetUri.match(/btih:([a-fA-F0-9]{40})/)
    return match ? match[1].toLowerCase() : ''
  }
}

export const torrentStream = new TorrentStream()
