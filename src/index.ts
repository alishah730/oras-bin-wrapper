import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * Get the current directory path compatible with both CommonJS and ESM
 */
function getCurrentDir(): string {
  // Check if __dirname is available (CommonJS)
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  
  // ESM environment - we need to construct the path differently
  // Since we can't reliably use import.meta in the build, let's use a heuristic
  const cwd = process.cwd();
  
  // Check if we're running from project root (has package.json)
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    // We're in project root, dist should be here
    const distPath = path.join(cwd, 'dist');
    if (fs.existsSync(distPath)) {
      return distPath;
    }
  }
  
  // If we can't determine the correct path, try some common patterns
  // Check if current working directory has a .bin sibling
  const potentialBinDir = path.join(cwd, '.bin');
  if (fs.existsSync(potentialBinDir)) {
    return cwd;
  }
  
  // Check if we're in a subdirectory and need to go up
  const parentBinDir = path.join(path.dirname(cwd), '.bin');
  if (fs.existsSync(parentBinDir)) {
    return path.dirname(cwd);
  }
  
  // Last resort: assume we're in a dist-like directory
  return cwd;
}

/**
 * Returns the absolute path to the oras binary in the .bin directory.
 * Throws if the oras binary is not present.
 */
export function getOrasBinaryPath(): string {
  const currentDir = getCurrentDir();
  const binDir = path.resolve(currentDir, '../.bin');
  
  // Check if .bin directory exists
  if (!fs.existsSync(binDir)) {
    // Provide better error context
    const debugInfo = {
      currentDir,
      binDir,
      cwd: process.cwd(),
      hasDirname: typeof __dirname !== 'undefined',
      currentDirExists: fs.existsSync(currentDir),
      parentDirContents: fs.existsSync(path.dirname(currentDir)) ? fs.readdirSync(path.dirname(currentDir)) : 'N/A'
    };
    throw new Error(`Binary directory not found: ${binDir}\nDebug info: ${JSON.stringify(debugInfo, null, 2)}`);
  }
  
  const files = fs.readdirSync(binDir).filter(f => !f.startsWith('.'));
  const binaryName = process.platform === 'win32' ? 'oras.exe' : 'oras';
  const orasPath = files.find(f => f === binaryName);
  
  if (!orasPath) {
    throw new Error(`oras binary (${binaryName}) not found in .bin. Files present: ${files.join(', ')}`);
  }
  
  return path.join(binDir, orasPath);
}

// For backward compatibility, export getOrasBinaryPath as default
// This avoids the import-time execution issue
export default getOrasBinaryPath;
