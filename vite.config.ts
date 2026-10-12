import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// @ts-ignore
import { apiMiddleware } from './server/apiMiddleware.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiMiddleware()],
})

