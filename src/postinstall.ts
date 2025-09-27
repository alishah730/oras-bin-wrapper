import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as tar from 'tar';
import * as unzipper from 'unzipper';
import { fileURLToPath } from 'url';

export type SupportedPlatform = 'darwin' | 'linux' | 'win32';
export type SupportedArch = 'x64' | 'arm64';

/**
 * Skips binary extraction in CI/CD and dev environments.
 * Ensures postinstall only runs for end users, never in CI or during publish.
 */
function isDevInstall(): boolean {
  console.log('[oras-bin] Checking if this is a dev install...', process.env);
  // return !(
  //   process.env.ORAS_BIN_DEV ||
  //   process.env.npm_lifecycle_event === 'build' ||
  //   process.env.npm_config_argv?.includes('link')
  // )
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
 * Get the current directory path compatible with both CommonJS and ESM
 */
function getCurrentDir(): string {
  // Check if __dirname is available (CommonJS)
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  
  // ESM fallback - use eval to avoid TypeScript compilation issues
  try {
    const importMeta = eval('import.meta');
    if (importMeta && importMeta.url) {
      return path.dirname(fileURLToPath(importMeta.url));
    }
  } catch {
    // Fall through to default
  }
  
  // Fallback to current working directory
  return process.cwd();
}

export async function extractBinary() {
  if (isDevInstall()) {
    console.log('[oras-bin] Skipping binary extraction/cleanup (dev mode/CI detected)');
    return;
  }
  const currentDir = getCurrentDir();
  const libDir = path.resolve(currentDir, '../lib');
  const binDir = path.resolve(currentDir, '../.bin');
  if (!fs.existsSync(libDir)) {
    console.error('[oras-bin] ERROR: lib directory does not exist. Please add compressed oras binaries to lib/.');
    return;
  }
  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir);
  const platform = os.platform() as SupportedPlatform;
  const arch = os.arch() as SupportedArch;
  const pattern = getBinaryPattern(platform, arch);
  const files = fs.readdirSync(libDir);
  console.log(`[oras-bin] Files in lib:`, files);
  console.log(`[oras-bin] Extracting binary for platform: ${platform}, arch: ${arch}, pattern: ${pattern}`);
  if (files.length === 0) {
    console.error('[oras-bin] ERROR: No files found in lib directory.');
    return;
  }
  const archive = files.find(f => f.includes(pattern));
  if (!archive) {
    console.error(`[oras-bin] ERROR: No file found matching pattern '${pattern}'. Files present:`, files);
    throw new Error(`No matching oras binary archive found for pattern: ${pattern}`);
  }
  const archivePath = path.join(libDir, archive);
  // Extract based on file type
  if (archive.endsWith('.tar.gz')) {
    await tar.x({
      file: archivePath,
      cwd: binDir
    });
  } else if (archive.endsWith('.zip')) {
    await fs.createReadStream(archivePath)
      .pipe(unzipper.Extract({ path: binDir }))
      .promise();
  } else {
    throw new Error('Unsupported archive format: ' + archive);
  }
  // Set executable permission for all files in .bin
  const binFiles = fs.readdirSync(binDir);
  for (const f of binFiles) {
    const fullPath = path.join(binDir, f);
    if (fs.statSync(fullPath).isFile()) {
      fs.chmodSync(fullPath, 0o755);
    }
  }
  // Clean up lib folder
  for (const f of files) {
    if (!f.startsWith('.')) fs.rmSync(path.join(libDir, f));
  }
}

// Await extraction and handle errors
extractBinary().catch((err) => {
  console.error('[oras-bin] Extraction failed:', err);
  process.exit(1);
});
