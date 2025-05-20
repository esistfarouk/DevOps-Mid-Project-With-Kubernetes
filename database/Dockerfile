FROM postgres:15-alpine

# Update system packages to updat libxlm2 to fix its vulnerabilities
RUN apk update && apk upgrade --no-cache

# Install Go 1.21 and compile gosu from source (updating gosu to fix vulnerabilities from stdlib in gobinary)
RUN apk add --no-cache go curl git \
    && git clone https://github.com/tianon/gosu.git /tmp/gosu \
    && cd /tmp/gosu \
    && go build -o /usr/local/bin/gosu \
    && chmod +x /usr/local/bin/gosu \
    #delete extra packages again to optimize space
    && apk del go curl git \ 
    && rm -rf /tmp/gosu

# Verify
RUN gosu --version