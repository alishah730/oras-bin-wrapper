# oras-bin-wrapper

[![npm version](https://badge.fury.io/js/oras-bin-wrapper.svg)](https://www.npmjs.com/package/oras-bin-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Node.js wrapper for the [oras](https://github.com/oras-project/oras) CLI. Installs the correct binary for your OS/architecture and exports its path.

Package versions are kept in sync with [oras releases](https://github.com/oras-project/oras/releases) — `oras-bin-wrapper@1.3.1` ships the `oras v1.3.1` binary.

## Installation

```sh
npm install oras-bin-wrapper
```

On install, the binary matching your platform is extracted to `node_modules/.bin/oras`.

## Usage

### CommonJS

```js
const { getOrasBinaryPath } = require('oras-bin-wrapper');
const { spawnSync } = require('child_process');

const result = spawnSync(getOrasBinaryPath(), ['version'], { encoding: 'utf-8' });
console.log(result.stdout);
```

### ES Modules

```js
import { getOrasBinaryPath } from 'oras-bin-wrapper';
import { spawnSync } from 'child_process';

const result = spawnSync(getOrasBinaryPath(), ['version'], { encoding: 'utf-8' });
console.log(result.stdout);
```

### TypeScript

```typescript
import { getOrasBinaryPath } from 'oras-bin-wrapper';
import { spawnSync } from 'child_process';

const binaryPath: string = getOrasBinaryPath();
const result = spawnSync(binaryPath, ['version'], { encoding: 'utf-8' });
console.log(result.stdout);
```

## Supported Platforms

| OS      | Architecture       |
| ------- | ------------------ |
| macOS   | Intel (x64), ARM (arm64) |
| Linux   | x64, arm64         |
| Windows | x64                |

## How Releases Work

This package mirrors [oras releases](https://github.com/oras-project/oras/releases):

1. Create a git tag matching the oras version: `git tag v1.3.1 && git push --tags`
2. GitHub Actions automatically downloads all platform binaries for that version
3. The package is built, tested, and published to npm

Pre-release tags like `v1.4.0-beta.1` are published under their pre-release npm tag (e.g. `npm install oras-bin-wrapper@beta`).

## Development

```sh
# Install (skips binary extraction in dev)
ORAS_BIN_DEV=true npm install

# Build
npm run build

# Download binaries locally (optional)
npm run download-binaries        # latest stable
bash update-oras-binaries.sh 1.3.1  # specific version

# Test
npm test          # TypeScript tests
npm run test:cjs  # CommonJS
npm run test:esm  # ESM
```

## License

MIT
