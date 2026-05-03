FROM node:20-alpine

WORKDIR /app

# Install Python for scraper support
RUN apk add --no-cache python3 py3-pip && \
    pip3 install --break-system-packages stashapp-tools requests cloudscraper beautifulsoup4 lxml python-dateutil pillow

# Install Node dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

# Copy application
COPY server/ ./server/
COPY stremio-addon/ ./stremio-addon/
COPY plex-agent/ ./plex-agent/
COPY jellyfin-plugin/ ./jellyfin-plugin/
COPY stash-bridge/ ./stash-bridge/
COPY webui/ ./webui/
COPY cli/ ./cli/

# Expose ports
EXPOSE 8085 8086

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8085/health || exit 1

# Start
CMD ["node", "server/index.js"]
