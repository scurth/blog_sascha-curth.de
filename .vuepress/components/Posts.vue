<template>
  <div class="post-container">
    <router-link v-for="page in pages" :to="page.path">
      <div class="post-card">
        <div class="page-detail">
          <img class="article-image" :src="page.frontmatter.introimage" />
          <div class="page-title">{{ page.title }}</div>
          <div class="page-author">Author: {{ page.frontmatter.author }}</div>
          <div class="page-published" font-color="black">Erstellt: {{ page.frontmatter.published }}</div>
          <div class="page-modified">Letzte Änderung: {{ page.frontmatter.modified }}</div>
        </div>
      </div>
    </router-link>
  </div>
</template>
<script>
export default {
  data() {
    return {
      pages: []
    }
  },
  mounted() {
    this.$site.pages.forEach(page => {
      if (page.frontmatter.type === 'article') {
        this.pages.push(page)
      }
    })
  }
}
</script>
<style scoped>
.post-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
.post-card {
  width: 250px;
  height: 180px;
  margin: 1px;
  border: 2px solid #ccc;
  border-radius: 3px;
  padding: 20px;
  display: flex;
  align-items: left;
}
.article-image {
  height: 80px;
  margin: 10px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.page-title {
  font-size: 120%;
  font-weight: bold;
}
.page-published {
  font-size: 60%;
}
.page-modified {
  font-size: 60%;
}
.page-author {
  font-size: 60%;
}
</style>
