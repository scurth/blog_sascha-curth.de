//config.js
module.exports = {
  locales: {
    '/': {
      lang: 'de-DE',
      title: 'Der IoT Rebell',
      description: 'IoT - So, wie es sein sollte 🥂',
    }
  },
  themeConfig: {
    searchPlaceholder: 'Durchsuchen...',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'IoT News', link: '/news/index.html' },
      { text: 'IoT Projekte', link: '/projekte/index.html' },
      { text: 'IoT Kompendium', link: '/kompendium/index.html' },
      { text: 'Glossar', link: '/glossary.html' },
    ],
    //repoLabel: 'Mach mit!',
    //repo: 'https://github.com/scurth/blog_sascha-curth.de',
    logo: '/iot.jpg',
    sidebar: {
      '/kompendium/': [
        '/kompendium/',
        '/kompendium/001_Einleitung',
        '/kompendium/002_Miflora',
        '/kompendium/003_Tasmota',
        '/kompendium/004_Raspberry_WIFI_Access_Point',
        '/kompendium/005_Netatmo_Presence',
        '/kompendium/006_Tinkerforge',
        '/kompendium/098_InfluxDB',
        '/kompendium/099_Grafana'
      ],
      '/projekte/': [
        '/projekte/',
	'/projekte/010_perfektes_netzwerk_2021',
	'/projekte/008_Raspi_Kamera',
        '/projekte/007_VRM_victronenergy_DWD',
        '/projekte/006_WIFI-AP_advanced',
	'/projekte/005_Color_Control_GX',
	'/projekte/004_Garagentor',
	'/projekte/003_IoT_Backup',
	'/projekte/002_Fischzimmer_Luftentfeuchter',
      ],
      '/news/': [
        '/news/',
        '/news/2020-07-15-Telegram-Gruppe',
        '/news/2020-03-07-Hue-Bridge-v1',
        '/news/2020-05-12-Belkin-NetCam-End-of-Life',
        '/news/2020-08-18-Raspberry_und_Tinkerforge',
      ],
    },
  },
  plugins: {
     '@vuepress/last-updated': {},
     'vuepress-plugin-table-of-contents': {},
     '@vuepress/back-to-top': {},
     'check-md': { pattern: '**/*.md' },
     'vuepress-plugin-reading-time': { excludes: ['/about', '/tag/.*'] },
     'authors': {},
     'vuepress-plugin-glossary': {},
     'sitemap': {
         hostname: 'https://www.sascha-curth.de', 
	 dateFormatter: val => {
          return new Date().toISOString()
        }
     },
  },
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' }],
    ['link', { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon/favicon.ico' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
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
