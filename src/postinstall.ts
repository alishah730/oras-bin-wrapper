import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as tar from 'tar';
import * as unzipper from 'unzipper';

export type SupportedPlatform = 'darwin' | 'linux' | 'win32';
export type SupportedArch = 'x64' | 'arm64';

/**
 * Skips binary extraction in CI/CD and dev environments.
 * Set ORAS_BIN_DEV=true to skip binary extraction.
 */
function isDevInstall(): boolean {
  return process.env.ORAS_BIN_DEV === 'true';
}

export function getBinaryPattern(platform: SupportedPlatform, arch: SupportedArch): string {
  if (platform === 'darwin') {
    if (arch === 'arm64') return 'darwin_arm64';
    if (arch === 'x64') return 'darwin_amd64';
  } else if (platform === 'linux') {
    if (arch === 'x64') return 'linux_amd64';
    if (arch === 'arm64') return 'linux_arm64';
  } else if (platform === 'win32') {
    if (arch === 'x64') return 'windows_amd64';
  }
  throw new Error(`Unsupported platform/arch: ${platform}/${arch}`);
}

/**
 * Get the package root directory.
 * This works when running from postinstall.js at root or dist/postinstall.js
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
 * When installed as a dependency, this is: project/node_modules/.bin
 * When running locally (dev), this is: oras-bin-wrapper/node_modules/.bin or oras-bin-wrapper/.bin
 */
function getRootBinDir(): string {
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

export async function extractBinary() {
  if (isDevInstall()) {
    console.log('[oras-bin] Skipping binary extraction/cleanup (dev mode detected)');
    return;
  }
  const packageDir = getPackageDir();
  const libDir = path.join(packageDir, 'lib');
  const binDir = getRootBinDir();
  if (!fs.existsSync(libDir)) {
    console.error('[oras-bin] ERROR: lib directory does not exist. Please add compressed oras binaries to lib/.');
    return;
  }
  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir);
  const platform = os.platform() as SupportedPlatform;
  const arch = os.arch() as SupportedArch;
  const pattern = getBinaryPattern(platform, arch);
  const files = fs.readdirSync(libDir).filter(f => !f.startsWith('.'));
  
  console.log(`[oras-bin] Extracting binary for ${platform}/${arch}`);
  
  if (files.length === 0) {
    console.error('[oras-bin] ERROR: No binary archives found in lib directory.');
    return;
  }
  const archive = files.find(f => f.includes(pattern));
  if (!archive) {
    throw new Error(`No matching oras binary archive found for pattern: ${pattern}`);
  }
  const archivePath = path.join(libDir, archive);
  console.log(`[oras-bin] Extracting: ${archive}`);
  
  // Extract to temp directory first
  const tempDir = path.join(packageDir, '.temp-extract');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Extract based on file type
  if (archive.endsWith('.tar.gz')) {
    await tar.x({
      file: archivePath,
      cwd: tempDir
    });
  } else if (archive.endsWith('.zip')) {
    await fs.createReadStream(archivePath)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();
  } else {
    throw new Error('Unsupported archive format: ' + archive);
  }
  
  // Find and move only the oras binary to the target bin directory
  const binaryName = platform === 'win32' ? 'oras.exe' : 'oras';
  const extractedBinary = path.join(tempDir, binaryName);
  const targetBinary = path.join(binDir, binaryName);
  
  if (!fs.existsSync(extractedBinary)) {
    throw new Error(`Binary ${binaryName} not found in extracted archive`);
  }
  
  // Copy binary to target location
  fs.copyFileSync(extractedBinary, targetBinary);
  
  // Set executable permission
  fs.chmodSync(targetBinary, 0o755);
  
  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true });
  // Clean up lib folder (remove archives, keep hidden files like .keep)
  for (const f of files) {
    fs.rmSync(path.join(libDir, f));
  }
  
  console.log('[oras-bin] Binary extraction complete');
}

// Await extraction and handle errors
extractBinary().catch((err) => {
  console.error('[oras-bin] Extraction failed:', err);
  process.exit(1);
});
