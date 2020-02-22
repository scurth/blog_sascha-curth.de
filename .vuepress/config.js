//config.js
module.exports = {
  title: 'Der IoT Rebell',
  description: 'IoT - So, wie es sein sollte',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'IoT Blog', link: '/blog' },
    ],
   sidebar: [
      '/blog/Einleitung',
      '/blog/Miflora',
      '/blog/Tasmota',
    ]
  },
  plugins: [ 
     'social-share', { networks: ['twitter', 'facebook', 'reddit', 'telegram'] },
     '@vuepress/last-updated',
     'vuepress-plugin-table-of-contents',
  ],
}
