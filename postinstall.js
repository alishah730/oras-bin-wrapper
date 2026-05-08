/**
 * oras-bin-wrapper postinstall script
 * Extracts the appropriate oras binary for the current platform
 */
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const tar = require("tar");
const unzipper = require("unzipper");

/**
 * Check if this is a dev install (skip extraction if ORAS_BIN_DEV=true)
 */
function isDevInstall() {
  return process.env.ORAS_BIN_DEV === 'true';
}

/**
 * Get the binary archive pattern for the current platform/arch
 */
function getBinaryPattern(platform, arch) {
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
 * Get the root project's node_modules/.bin directory.
 * When installed as a dependency: project/node_modules/.bin
 * When running locally (dev): oras-bin-wrapper/.bin
 */
function getRootBinDir() {
  const packageDir = __dirname;
  
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
 * Extract the oras binary for the current platform
 */
async function extractBinary() {
  if (isDevInstall()) {
    console.log('[oras-bin] Skipping binary extraction (dev mode detected)');
    return;
  }

  const libDir = path.resolve(__dirname, 'lib');
  const binDir = getRootBinDir();

  if (!fs.existsSync(libDir)) {
    console.error('[oras-bin] ERROR: lib directory does not exist.');
    return;
  }

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const platform = os.platform();
  const arch = os.arch();
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

  // Extract based on file type - use temp directory first
  const tempDir = path.join(__dirname, '.temp-extract');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });
  
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

  // Clean up lib folder (remove archives, keep .keep files)
  for (const f of files) {
    fs.rmSync(path.join(libDir, f));
  }

  console.log('[oras-bin] Binary extraction complete');
}

// Run extraction
extractBinary().catch((err) => {
  console.error('[oras-bin] Extraction failed:', err);
  process.exit(1);
});
