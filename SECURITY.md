# Security Policy — UniScrape

## Reporting a Vulnerability

**DO NOT OPEN A PUBLIC ISSUE** for security vulnerabilities.

Report security issues to: `security@blbgensixai.club`

We respond within 48 hours. Include:
- Description of the vulnerability
- Steps to reproduce
- Impact assessment
- Suggested fix (if available)

## Supported Versions

| Version | Supported |
|---|---|
| 1.x (latest) | ✅ |
| < 1.0 | ❌ |

## Security Features

- **No hardcoded credentials** — All secrets via environment variables
- **Rate limiting** — API endpoints limited to 100 req/15min
- **Helmet.js** — CSP, HSTS, X-Frame-Options, etc.
- **Input validation** — All scraper inputs sanitized
- **Zero-trust architecture** — Each request independently authenticated
- **No password storage** — Biometric/Passkey only
- **Dependency scanning** — GitHub Dependabot enabled

## Branch Protection

- `main` branch requires pull request review
- CODEOWNERS must approve all `server/` changes
- CI must pass before merge
- No direct pushes to main

## Responsible Disclosure

We follow coordinated vulnerability disclosure. Please allow us 90 days before public disclosure.
