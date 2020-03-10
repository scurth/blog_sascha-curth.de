//config.js
module.exports = {
  title: 'Der IoT Rebell',
  description: 'IoT - So, wie es sein sollte',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'IoT News', link: '/news/index.html' },
      { text: 'IoT Projekte', link: '/projekte/index.html' },
      { text: 'IoT Kompendium', link: '/kompendium/index.html' },
    ],
    sidebar: {
      '/kompendium/': [
        '/kompendium/',
        '/kompendium/001_Einleitung',
        '/kompendium/002_Miflora',
        '/kompendium/003_Tasmota',
        '/kompendium/004_Raspberry_WIFI_Access_Point',
        '/kompendium/099_Grafana',
      ],
      '/projekte/': [
        '/projekte/',
	'/projekte/003_IoT_Backup',
	'/projekte/002_Fischzimmer_Luftentfeuchter',
      ],
      '/news/': [
        '/news/',
      ],
    },
  },
  plugins: [ 
     'social-share', { networks: ['twitter', 'facebook', 'reddit', 'telegram'] },
     '@vuepress/last-updated',
     'vuepress-plugin-table-of-contents',
     '@vuepress/back-to-top',
     'axios',
     'sitemap', { hostname: 'https://www.sascha-curth.de' },
  ],
  head: [
    ['link', { rel: 'icon', href: '/favicon/favicon.ico' }],
    ['link', { rel: 'shortcut icon', href: '/favicon/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon/apple-icon.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '57x57', href: '/favicon/apple-icon-57x57.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '60x60', href: '/favicon/apple-icon-60x60.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '72x72', href: '/favicon/apple-icon-72x72.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '76x76', href: '/favicon/apple-icon-76x76.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '114x114', href: '/favicon/apple-icon-114x114.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '120x120', href: '/favicon/apple-icon-120x120.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '144x144', href: '/favicon/apple-icon-144x144.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '152x152', href: '/favicon/apple-icon-152x152.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-icon-180x180.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192',  href: '/favicon/android-icon-192x192.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' }],
    ['meta', {name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0"}],
    ['meta', {name: "msapplication-TileColor", content: "#ffffff"}],
    ['meta', {name: "msapplication-TileImage", content: "/favicon/ms-icon-144x144.png"}],
    ['meta', {name: "theme-color", content: "#ffffff"}],
  ],
}




