import { defineConfig } from 'tsup'

export default defineConfig({
  // Entry points
  entry: ['src/index.ts', 'src/postinstall.ts'],
  
  // Output formats
  format: ['cjs', 'esm'],
  
  // Generate type definitions
  dts: true,
  
  // Clean output directory before build
  clean: true,
  
  // Bundle target
  target: 'node14',
  
  // Splitting for better tree-shaking
  splitting: false,
  
  // Source maps for debugging
  sourcemap: true,
  
  // External dependencies (don't bundle)
  external: ['tar', 'unzipper'],
  
  // Output directory
  outDir: 'dist',
  
  // Minification for production
  minify: false,
  
  // Platform target
  platform: 'node',
})
