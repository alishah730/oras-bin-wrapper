#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating dual package build...\n');

const distDir = path.join(__dirname, 'dist');
const requiredFiles = [
  'index.js',    // CommonJS
  'index.mjs',   // ESM  
  'index.d.ts',  // TypeScript declarations
  'postinstall.js',  // CommonJS postinstall
  'postinstall.mjs', // ESM postinstall
  'postinstall.d.ts' // TypeScript declarations for postinstall
];

let success = true;

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.log('❌ dist/ directory not found. Run "npm run build" first.');
  success = false;
} else {
  console.log('✅ dist/ directory found');
  
  // Check if all required files exist
  for (const file of requiredFiles) {
    const filePath = path.join(distDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
      
      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        console.log(`   Size: ${stats.size} bytes`);
      } else {
        console.log(`⚠️  ${file} is empty`);
      }
    } else {
      console.log(`❌ ${file} is missing`);
      success = false;
    }
  }
}

// Check package.json exports
console.log('\n📦 Checking package.json exports...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

if (packageJson.exports && packageJson.exports['.']) {
  const exports = packageJson.exports['.'];
  console.log('✅ Exports field found:');
  console.log(`   import: ${exports.import}`);
  console.log(`   require: ${exports.require}`);
  console.log(`   types: ${exports.types}`);
} else {
  console.log('❌ Missing exports field in package.json');
  success = false;
}

if (packageJson.main) {
  console.log(`✅ Main field: ${packageJson.main}`);
} else {
  console.log('❌ Missing main field in package.json');
  success = false;
}

if (packageJson.module) {
  console.log(`✅ Module field: ${packageJson.module}`);
} else {
  console.log('❌ Missing module field in package.json');
  success = false;
}

if (packageJson.types) {
  console.log(`✅ Types field: ${packageJson.types}`);
} else {
  console.log('❌ Missing types field in package.json');
  success = false;
}

console.log('\n📋 Build script check...');
if (packageJson.scripts && packageJson.scripts.build === 'tsup') {
  console.log('✅ Build script uses tsup');
} else {
  console.log('❌ Build script should use tsup');
  success = false;
}

// Check tsup config
console.log('\n⚙️  Checking tsup configuration...');
if (fs.existsSync(path.join(__dirname, 'tsup.config.ts'))) {
  console.log('✅ tsup.config.ts found');
} else {
  console.log('❌ tsup.config.ts missing');
  success = false;
}

console.log('\n' + '='.repeat(50));
if (success) {
  console.log('🎉 All checks passed! Dual package setup is ready.');
  console.log('\nNext steps:');
  console.log('1. Run "npm run build" to build the packages');
  console.log('2. Run "npm run test:cjs" to test CommonJS');
  console.log('3. Run "npm run test:esm" to test ESM');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}
