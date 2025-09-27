# Dual Package Build Instructions

This package has been refactored to support both CommonJS and ESM (ES Modules) using tsup.

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

## Building

1. Build the dual packages:
   ```bash
   npm run build
   ```

This will generate:
- `dist/index.js` - CommonJS version
- `dist/index.mjs` - ES Module version
- `dist/index.d.ts` - TypeScript declarations
- `dist/postinstall.js` - CommonJS postinstall script
- `dist/postinstall.mjs` - ESM postinstall script

## Testing

### Test Both Formats
```bash
# Test all formats
npm test

# Test CommonJS specifically
npm run test:cjs

# Test ESM specifically  
npm run test:esm
```

### Manual Testing

1. **CommonJS Usage:**
   ```javascript
   const { getOrasBinaryPath } = require('oras-bin-wrapper');
   const getOrasPath = require('oras-bin-wrapper').default;
   
   console.log(getOrasBinaryPath());  // Named function
   console.log(getOrasPath());        // Default export (same function)
   ```

2. **ESM Usage:**
   ```javascript
   import getOrasBinaryPath, { getOrasBinaryPath as getPath } from 'oras-bin-wrapper';
   
   console.log(getOrasBinaryPath());  // Default export
   console.log(getPath());           // Named export (same function)
   ```

## Package.json Changes

The package now includes:
- `"module": "dist/index.mjs"` - Points to ES module version
- `"exports"` field for proper dual package exports
- Updated build scripts using tsup
- New test scripts for both formats

## Source Code Changes

1. **Compatible Directory Resolution:** Added `getCurrentDir()` function that works in both CommonJS and ESM environments
2. **ESM Import.meta Support:** Used eval to avoid TypeScript compilation issues while supporting `import.meta.url` in ESM
3. **Dual Build Support:** tsup configuration generates both CommonJS and ESM outputs

## Key Features

- ✅ Works with `require()` (CommonJS)
- ✅ Works with `import` (ESM)
- ✅ Proper TypeScript declarations
- ✅ Node.js 14+ compatibility
- ✅ Cross-platform binary resolution
- ✅ Maintains backward compatibility

## Troubleshooting

If you encounter issues:

1. **Build fails:** Make sure all dependencies are installed
2. **Import errors:** Check that you're using the correct import syntax for your environment
3. **Path resolution issues:** The package automatically detects CommonJS vs ESM and resolves paths accordingly
