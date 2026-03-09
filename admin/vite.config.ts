/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  resolve: {
    alias: {
      '@psychedcms/admin-core': path.resolve(__dirname, '../packages/psychedcms-admin-core/src/index.ts'),
      '@psychedcms/admin-translatable': path.resolve(__dirname, '../packages/psychedcms-admin-translatable/src/index.ts'),
    },
    // Ensure workspace packages resolve their dependencies from admin's node_modules
    dedupe: ['react', 'react-dom', 'react-admin', '@mui/material', '@mui/icons-material', 'react-router-dom', 'react-hook-form'],
  },
  server: {
    allowedHosts: ['psychedcms.local'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
