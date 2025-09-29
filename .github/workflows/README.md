# GitHub Actions Workflows

This directory contains the CI/CD workflows for the oras-bin-wrapper package.

## Workflows

### `test.yml` - Quick Tests
- **Triggers**: Every push and pull request
- **Purpose**: Fast validation of dual package structure and basic functionality
- **Runtime**: ~2-3 minutes
- **Tests**: 
  - TypeScript compilation and tests
  - CommonJS compatibility (`npm run test:cjs`)
  - ESM compatibility (`npm run test:esm`)
  - Package structure validation

### `ci.yml` - Comprehensive Testing
- **Triggers**: Pushes/PRs to main/master branches
- **Purpose**: Full cross-platform and Node.js version compatibility testing
- **Runtime**: ~15-20 minutes
- **Matrix**: 
  - OS: Ubuntu, Windows, macOS
  - Node.js: 18.x, 20.x, 22.x
- **Tests**: All tests from `test.yml` plus cross-platform validation

### `npm-publish.yml` - Build, Test & Publish
- **Triggers**: 
  - Any push (for testing)
  - Tags matching `v*.*.*` (for publishing)
- **Purpose**: Complete testing and automated publishing to npm
- **Features**:
  - Multi-Node.js version testing (18.x, 20.x, 22.x)
  - All dual package tests
  - Final validation before publish
  - Automated npm publishing with provenance

### `npm-unpublish.yml` - Manual Unpublish
- **Triggers**: Manual workflow dispatch
- **Purpose**: Emergency unpublishing of specific package versions
- **Usage**: Requires manual input of version to unpublish

## Test Coverage

All workflows test the dual package support:
- ✅ CommonJS (`require()`) compatibility
- ✅ ESM (`import`) compatibility  
- ✅ TypeScript definitions
- ✅ Cross-platform binary resolution
- ✅ Package structure validation
- ✅ Build artifact integrity

## Environment Variables

- `ORAS_BIN_DEV=true` - Skips binary extraction during CI (for development testing)
- `NODE_AUTH_TOKEN` - npm authentication token (from secrets)

## Secrets Required

- `NPM_TOEKEN_NO_OTP` - npm token for publishing (note: there's a typo in the secret name that should be maintained for backward compatibility)
