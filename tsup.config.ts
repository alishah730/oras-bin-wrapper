import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  target: 'node14',
  splitting: false,
  sourcemap: false,
  external: ['tar', 'unzipper'],
  outDir: 'dist',
  minify: false,
  platform: 'node',
  shims: true,
})
