import * as path from 'path';
import * as fs from 'fs';

/**
 * Get the package directory (where oras-bin-wrapper is installed)
 * Uses __dirname which is shimmed by tsup for ESM
 */
function getPackageDir(): string {
  const currentDir = __dirname;
  
  // Check if we're in the dist folder
  if (path.basename(currentDir) === 'dist') {
    return path.dirname(currentDir);
  }
  
  return currentDir;
}

/**
 * Get the root project's node_modules/.bin directory.
 * When installed as a dependency: project/node_modules/.bin
 * When running locally (dev): oras-bin-wrapper/.bin
 */
function getBinDir(): string {
  const packageDir = getPackageDir();
  
  // Check if we're installed as a dependency (inside node_modules/oras-bin-wrapper)
  const parentDir = path.dirname(packageDir);
  if (path.basename(parentDir) === 'node_modules') {
    // We're in node_modules/oras-bin-wrapper, so root bin is node_modules/.bin
    return path.join(parentDir, '.bin');
  }
  
  // Local development - use .bin in package directory
  return path.join(packageDir, '.bin');
}

/**
 * Returns the absolute path to the oras binary in the node_modules/.bin directory.
 * Throws if the oras binary is not present.
 */
export function getOrasBinaryPath(): string {
  const binDir = getBinDir();
  const binaryName = process.platform === 'win32' ? 'oras.exe' : 'oras';
  const binaryPath = path.join(binDir, binaryName);
  
  // Check if binary exists
  if (!fs.existsSync(binaryPath)) {
    throw new Error(`oras binary not found at: ${binaryPath}\nRun 'npm install' to install the binary.`);
  }
  
  return binaryPath;
}

// For backward compatibility, export getOrasBinaryPath as default
// This avoids the import-time execution issue
export default getOrasBinaryPath;
