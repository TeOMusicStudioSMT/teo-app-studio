import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // relatywne ścieżki — działa serwowane pod /apps/app na moście
  plugins: [react()],
})
