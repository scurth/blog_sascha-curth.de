<template>
  <div class="projekte-container">
    <router-link v-for="page in pages" :to="page.path">
      <div class="projekte-card">
        <img class="article-image" :src="page.frontmatter.introimage" />
        <div class="page-detail">
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
      if (page.frontmatter.type === 'projekte') {
        this.pages.push(page)
      }
    })
  }
}
</script>
<style scoped>
.projekte-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
.projekte-card {
  width: 700px;
  height: 150px;
  margin: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 10px;
  display: flex;
  align-items: center;
}
.article-image {
  width: 150px;
  margin: 10px;
}
.page-title {
  font-size: 120%;
  font-weight: bold;
}
.page-published {
  font-size: 80%;
}
.page-modified {
  font-size: 80%;
}
.page-author {
  font-size: 80%;
}
.description {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
