import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * Find the oras-bin-wrapper package directory by searching up the directory tree
 */
function findOrasPackageDir(): string {
  let currentDir = process.cwd();
  
  // Check if __dirname is available (CommonJS) and we're inside the oras-bin-wrapper package
  if (typeof __dirname !== 'undefined') {
    // If we're running from within oras-bin-wrapper package
    const packageJsonPath = path.resolve(__dirname, '../package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (pkg.name === 'oras-bin-wrapper') {
          return path.dirname(packageJsonPath);
        }
      } catch {
        // Ignore parsing errors
      }
    }
    currentDir = __dirname;
  }

  // Search for node_modules/oras-bin-wrapper from current working directory up
  let searchDir = currentDir;
  while (searchDir) {
    const orasPackageDir = path.join(searchDir, 'node_modules', 'oras-bin-wrapper');
    if (fs.existsSync(orasPackageDir)) {
      const packageJsonPath = path.join(orasPackageDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          if (pkg.name === 'oras-bin-wrapper') {
            return orasPackageDir;
          }
        } catch {
          // Ignore parsing errors
        }
      }
    }
    
    const parentDir = path.dirname(searchDir);
    if (parentDir === searchDir) {
      // We've reached the root
      break;
    }
    searchDir = parentDir;
  }
  
  // Fallback: check if we're in the oras-bin-wrapper package directory itself
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (pkg.name === 'oras-bin-wrapper') {
        return process.cwd();
      }
    } catch {
      // Ignore parsing errors
    }
  }
  
  throw new Error('Could not find oras-bin-wrapper package directory');
}

/**
 * Returns the absolute path to the oras binary in the .bin directory.
 * Throws if the oras binary is not present.
 */
export function getOrasBinaryPath(): string {
  const orasPackageDir = findOrasPackageDir();
  const binDir = path.join(orasPackageDir, '.bin');
  
  // Check if .bin directory exists
  if (!fs.existsSync(binDir)) {
    // Provide better error context
    const debugInfo = {
      orasPackageDir,
      binDir,
      cwd: process.cwd(),
      hasDirname: typeof __dirname !== 'undefined',
      packageDirExists: fs.existsSync(orasPackageDir),
      packageDirContents: fs.existsSync(orasPackageDir) ? fs.readdirSync(orasPackageDir) : 'N/A'
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
