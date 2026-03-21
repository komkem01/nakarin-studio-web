// https://nuxt.com/docs/api/configuration/nuxt-config
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  vite: {
    plugins: [vueJsx()]
  }
})
