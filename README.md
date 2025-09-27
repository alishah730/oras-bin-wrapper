# oras-bin-wrapper

Node.js wrapper for the [oras](https://github.com/oras-project/oras) CLI binaries. Automatically selects the correct binary for your OS and architecture after install.

**✨ New: Dual Package Support!** This package now supports both CommonJS and ES Modules (ESM).

## Installation

```sh
npm install oras-bin-wrapper
```

## Usage

### CommonJS
```js
const getOrasBinaryPath = require('oras-bin-wrapper').default;
const { getOrasBinaryPath: getPath } = require('oras-bin-wrapper');
const { spawnSync } = require('child_process');

// Using default export (function)
const binaryPath = getOrasBinaryPath();
const result = spawnSync(binaryPath, ['version'], { encoding: 'utf-8' });
console.log(result.stdout);

// Using named export function  
const binaryPath2 = getPath();
console.log('Binary located at:', binaryPath2);
```

### ES Modules (ESM)
```js
import getOrasBinaryPath, { getOrasBinaryPath as getPath } from 'oras-bin-wrapper';
import { spawnSync } from 'child_process';

// Using default export (function)
const binaryPath = getOrasBinaryPath();
const result = spawnSync(binaryPath, ['version'], { encoding: 'utf-8' });
console.log(result.stdout);

// Using named export function
const binaryPath2 = getPath();
console.log('Binary located at:', binaryPath2);
```

### TypeScript
```typescript
import getOrasBinaryPath, { getOrasBinaryPath as getPath } from 'oras-bin-wrapper';
import { spawnSync } from 'child_process';

const binaryPath: string = getOrasBinaryPath();
const result = spawnSync(binaryPath, ['version'], { encoding: 'utf-8' });
```

## How it works
- On install, only the binary matching your platform is kept in the `.bin/` folder.
- The module exports the path to the binary for use with `child_process`.

## Updating Binaries
- To update the oras binary, just replace the files in `.bin/` with new versions (keep the naming convention). No code changes required.

## Features

- ✅ **Dual Package Support**: Works with both CommonJS (`require()`) and ES Modules (`import`)
- ✅ **Cross-Platform**: Automatically detects and installs the correct binary for your OS/architecture
- ✅ **TypeScript Support**: Full type definitions included
- ✅ **Node.js 14+**: Compatible with modern Node.js versions
- ✅ **Zero Dependencies**: No runtime dependencies (tar and unzipper only used during install)

## Testing

```sh
# Run all tests
npm test

# Test CommonJS specifically
npm run test:cjs

# Test ESM specifically  
npm run test:esm
```

## Publishing
- Versioning and publishing are automated via GitHub Actions. See `.github/workflows/publish.yml`.

---

MIT License
