// ClineBox Workspace Templates
// Defines template installations for workspace setup.

export interface TemplateDefinition {
  name: string;
  description: string;
  packages: string[];
  setupCommands: string[];
}

export const TEMPLATES: Record<string, TemplateDefinition> = {
  node: {
    name: "node",
    description: "Node.js workspace with Bun and TypeScript",
    packages: [],
    setupCommands: [
      "bun install -g typescript tsx",
      "tsc --version",
    ],
  },

  python: {
    name: "python",
    description: "Python workspace with pip and uv",
    packages: ["python3", "python3-pip"],
    setupCommands: [
      "pip3 install --upgrade pip",
      "pip3 install uv",
      "uv --version",
    ],
  },

  go: {
    name: "go",
    description: "Go workspace with stable toolchain",
    packages: ["golang-go"],
    setupCommands: ["go version"],
  },

  rust: {
    name: "rust",
    description: "Rust workspace with rustup and cargo",
    packages: ["curl"],
    setupCommands: [
      "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
      '$HOME/.cargo/bin/rustup --version',
      '$HOME/.cargo/bin/cargo --version',
    ],
  },

  zig: {
    name: "zig",
    description: "Zig workspace with Zig binary",
    packages: [],
    setupCommands: [
      "curl -fsSL https://ziglang.org/download/0.13.0/zig-linux-x86_64-0.13.0.tar.xz -o /tmp/zig.tar.xz",
      "tar -xf /tmp/zig.tar.xz -C /tmp",
      "sudo mv /tmp/zig-linux-x86_64-0.13.0/zig /usr/local/bin/zig",
      "rm -rf /tmp/zig*",
      "zig version",
    ],
  },

  blank: {
    name: "blank",
    description: "Minimal environment",
    packages: [],
    setupCommands: [],
  },
};
