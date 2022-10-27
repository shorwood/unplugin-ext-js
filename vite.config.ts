/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    api: {
      port: 9000,
    },
    coverage: {
      all: true,
      reporter: ['clover', 'cobertura', 'lcov', 'text'],
      include: ['src'],
      extension: ['ts'],
      excludeNodeModules: true,
      reportsDirectory: resolve(__dirname, './coverage'),
    },
    environment: 'node',
  },
})
