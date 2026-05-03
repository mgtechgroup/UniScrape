FROM node:20-alpine

WORKDIR /app

# Install libvips + Python for scraper support
RUN apk add --no-cache \
    vips vips-dev vips-tools \
    python3 py3-pip && \
    pip3 install --break-system-packages \
    pyvips \
    stashapp-tools requests cloudscraper beautifulsoup4 lxml python-dateutil pillow

# Install Node dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

# Copy application directories
COPY server/ ./server/
COPY webui/ ./webui/
COPY cli/ ./cli/

# Expose ports
EXPOSE 8085 8086

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8085/health || exit 1

# Start
CMD ["node", "server/index.js"]
