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
    ]
  },
  plugins: [ 
     'social-share', { networks: ['twitter', 'facebook', 'reddit', 'telegram'] },
     '@vuepress/last-updated',
     'vuepress-plugin-table-of-contents',
  ],
}
