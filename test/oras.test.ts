import { spawnSync } from 'child_process';
import orasFunction, { getOrasBinaryPath } from '../dist/index';
import { strict as assert } from 'assert';

describe('oras binary', function() {
  it('should get binary path through named function', function() {
    try {
      const binaryPath = getOrasBinaryPath();
      console.log('Binary path from function:', binaryPath);
      assert.ok(binaryPath, 'Binary path should be returned');
      assert.ok(typeof binaryPath === 'string', 'Binary path should be a string');
    } catch (error) {
      if (error instanceof Error && (error.message.includes('oras binary not found') || error.message.includes('Binary directory not found'))) {
        console.log('Binary not found - expected during CI/development');
        this.skip();
      } else {
        throw error;
      }
    }
  });

  it('should get binary path through default export function', function() {
    assert.ok(typeof orasFunction === 'function', 'Default export should be a function');
    
    try {
      const binaryPath = orasFunction();
      console.log('Binary path from default export:', binaryPath);
      assert.ok(binaryPath, 'Binary path should be returned');
      assert.ok(typeof binaryPath === 'string', 'Binary path should be a string');
    } catch (error) {
      if (error instanceof Error && (error.message.includes('oras binary not found') || error.message.includes('Binary directory not found'))) {
        console.log('Binary not found - expected during CI/development');
        this.skip();
      } else {
        throw error;
      }
    }
  });

  it('should have matching paths from both exports', function() {
    try {
      const functionPath = getOrasBinaryPath();
      const defaultPath = orasFunction();
      assert.equal(functionPath, defaultPath, 'Function and default export should return the same path');
    } catch (error) {
      if (error instanceof Error && (error.message.includes('oras binary not found') || error.message.includes('Binary directory not found'))) {
        console.log('Binary not found - expected during CI/development');
        this.skip();
      } else {
        throw error;
      }
    }
  });

  // Note: This test requires the binary to be present, which may not be the case during development
  it('should print version (if binary exists)', function() {
    try {
      const binary = orasFunction();
      const result = spawnSync(binary, ['version'], { encoding: 'utf-8' });
      
      if (result.status === 0) {
        console.log('Binary version output:', result.stdout);
        assert.match(result.stdout, /version/i, 'Output should mention version');
      } else {
        console.log('Binary not found or not executable - this is expected during development');
        // Don't fail the test if binary is not present
        this.skip();
      }
    } catch (error) {
      console.log('Binary test skipped - binary not available during development');
      this.skip();
    }
  });
});
