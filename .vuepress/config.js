//config.js
module.exports = {
  title: 'Der IoT Rebell',
  description: 'IoT - So, wie es sein sollte',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'IoT Kompendium', link: '/kompendium' },
      { text: 'IoT Projekte', link: '/projekte' },
    ],
   sidebar: [
      '/kompendium/001_Einleitung',
      '/kompendium/002_Miflora',
      '/kompendium/003_Tasmota',
      '/kompendium/099_Grafana',
    ]
  },
  plugins: [ 
     'social-share', { networks: ['twitter', 'facebook', 'reddit', 'telegram'] },
     '@vuepress/last-updated',
     '@vuepress/sitemap',
     'vuepress-plugin-table-of-contents',
  ],
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', {name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0"}],
  ],
}
