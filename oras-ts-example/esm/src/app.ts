// app.ts
import { getOrasBinaryPath } from 'oras-bin-wrapper';
import { execSync } from 'child_process';

// Get the binary path
console.log(`ORAS binary path: ${getOrasBinaryPath()}`);

// Execute the binary
try {
  const result = execSync(`${getOrasBinaryPath()} version`, { encoding: 'utf8' });
  console.log('ORAS version:', result.trim());
} catch (error) {
  console.error('Error executing ORAS binary:', error);
}