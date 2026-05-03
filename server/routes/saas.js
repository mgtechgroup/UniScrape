import express from 'express'

// SaaS billing upgrade routes - links to BLBGenSix AI platform
const saasRouter = express.Router()

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    scrapers: 50,
    requestsPerDay: 100,
    searchProviders: ['scrapers'],
    features: ['Basic search', '50 scrapers', 'Community support'],
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    priceId: 'price_uniscrape_pro_monthly',
    scrapers: -1,
    requestsPerDay: 10000,
    searchProviders: ['scrapers', 'torrents', 'webstreams', 'localfiles', 'scrapesites'],
    features: ['All 800+ scrapers', 'Advanced search', 'Torrent search', 'Web stream search', 'Priority support', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 49.99,
    priceId: 'price_uniscrape_enterprise_monthly',
    scrapers: -1,
    requestsPerDay: -1,
    searchProviders: ['scrapers', 'torrents', 'webstreams', 'localfiles', 'scrapesites', 'dht'],
    features: ['Unlimited everything', 'Custom scrapers', 'Private instances', 'SLA guarantee', 'DHT search', 'White-label'],
  },
}

saasRouter.get('/plans', (req, res) => {
  res.json({
    plans: PLANS,
    upgrade_url: 'https://blbgensixai.club/upgrade',
    billing_provider: 'Stripe',
  })
})

saasRouter.get('/upgrade', (req, res) => {
  res.json({
    message: 'Upgrade UniScrape',
    plans: [
      {
        id: 'pro',
        name: 'UniScrape Pro',
        price: '$9.99/mo',
        url: 'https://blbgensixai.club/billing/checkout?plan=uniscrape-pro',
        stripe_price_id: PLANS.pro.priceId,
      },
      {
        id: 'enterprise',
        name: 'UniScrape Enterprise',
        price: '$49.99/mo',
        url: 'https://blbgensixai.club/billing/checkout?plan=uniscrape-enterprise',
        stripe_price_id: PLANS.enterprise.priceId,
      },
    ],
    payment_methods: ['stripe', 'paypal', 'crypto_ethereum', 'crypto_bitcoin', 'crypto_solana'],
    cold_wallet_only: true,
  })
})

saasRouter.get('/status', (req, res) => {
  // Check API key / JWT for plan status
  const apiKey = req.headers['x-api-key'] || req.query.api_key
  res.json({
    plan: apiKey ? 'pro' : 'free',
    limits: apiKey ? PLANS.pro : PLANS.free,
    upgrade_available: !apiKey,
  })
})

export { saasRouter, PLANS }
