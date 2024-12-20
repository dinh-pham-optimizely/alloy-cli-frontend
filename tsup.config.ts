import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
});
