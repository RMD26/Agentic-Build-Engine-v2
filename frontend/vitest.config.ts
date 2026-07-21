import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: ['services/**/*.ts', 'store.ts', 'constants.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'node_modules/**', 'dist/**'],
    },
  },
});
