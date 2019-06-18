const pkg = require('./package')

module.exports = {
  mode: 'spa',

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: [],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://bootstrap-vue.js.org/docs/
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    'bootstrap-vue/nuxt'
  ],

  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: '/api/auth/login',
            method: 'post',
            propertyName: 'token'
          },
          logout: {
            url: '/api/auth/logout',
            method: 'post'
          },
          user: {
            url: '/api/auth/user',
            method: 'get',
            propertyName: 'user'
          }
        },
        // tokenRequired: true,
        // tokenType: 'bearer',
      }
    }
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        babel: {
            presets: ['es2015', 'stage-0']
        }

        config.module.rules.push({
          // enforce: 'pre',
          // test: /\.(js|vue)$/,
          // loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
