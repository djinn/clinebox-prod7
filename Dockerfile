FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV BUN_VERSION=1.2.5

RUN apt-get update && apt-get install -y \
    bash \
    curl \
    git \
    jq \
    tmux \
    vim \
    nano \
    ripgrep \
    python3 \
    python3-pip \
    unzip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash -s -- bun-v${BUN_VERSION} \
    && ln -sf /root/.bun/bin/bun /usr/local/bin/bun \
    && ln -sf /root/.bun/bin/bunx /usr/local/bin/bunx

# Install Cline globally via Bun
RUN bun install -g cline

RUN useradd -m -s /bin/bash developer

RUN mkdir -p /workspace

COPY scripts/ /opt/clinebox/scripts/

RUN chmod +x /opt/clinebox/scripts/*.sh /opt/clinebox/scripts/*.js

USER developer

WORKDIR /workspace

ENTRYPOINT ["/opt/clinebox/scripts/bootstrap.sh"]
