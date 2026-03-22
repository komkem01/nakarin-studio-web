// https://nuxt.com/docs/api/configuration/nuxt-config
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080'
    }
  },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tailwind.css'],
  routeRules: {
    '/admin': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive'
      }
    },
    '/admin/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive'
      }
    },
    '/manage/login': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive'
      }
    },
    '/manage/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive'
      }
    }
  },
  vite: {
    plugins: [vueJsx()]
  }
})
