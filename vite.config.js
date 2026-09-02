import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel deployment — base is always '/'
export default defineConfig({
  plugins: [react()],
  base: '/',
})
