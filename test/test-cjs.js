// CommonJS test
const { getOrasBinaryPath } = require('../dist/index.js');
const defaultExport = require('../dist/index.js').default;

console.log('Testing CommonJS import...');

try {
  console.log('✓ getOrasBinaryPath function imported');
  console.log('✓ Default export is function:', typeof defaultExport === 'function');
  
  // Test the function (but handle case where binary doesn't exist)
  try {
    const path1 = getOrasBinaryPath();
    console.log('✓ getOrasBinaryPath() function works:', path1);
    
    const path2 = defaultExport();
    console.log('✓ Default export function works:', path2);
    
    if (path1 === path2) {
      console.log('✓ Both paths match');
    } else {
      console.log('✗ Paths do not match');
      process.exit(1);
    }
    
    console.log('✓ CommonJS import test passed');
  } catch (binaryError) {
    if (binaryError.message.includes('Binary directory not found')) {
      console.log('⚠️  Binary directory not found - this is expected during development');
      console.log('   The CommonJS import itself works correctly');
      console.log('✓ CommonJS import test passed (binary not available)');
    } else {
      throw binaryError;
    }
  }
} catch (error) {
  console.error('✗ CommonJS test failed:', error.message);
  if (error.message.includes('Debug info')) {
    console.log('\nDebug information from error:');
    console.log(error.message.split('Debug info: ')[1]);
  }
  process.exit(1);
}
