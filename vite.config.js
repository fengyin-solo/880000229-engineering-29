import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { routeCheckPlugin } from './plugins/routeCheck.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), routeCheckPlugin()],
  server: {
    open: false,
  },
})
