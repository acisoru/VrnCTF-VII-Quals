// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  typescript: {
    strict: true,
  },

  app: {
    head: {
      title: 'NullShare - Image Sharing Platform',
      meta: [
        { name: 'description', content: 'Share your images securely with NullShare' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Simulate a server API for the CTF challenge
  nitro: {
    storage: {
      data: {
        driver: 'fs',
        base: './.data/storage'
      }
    }
  },

  compatibilityDate: '2025-03-22'
})