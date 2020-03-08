---
title: Test
description: TEst desc
introimage: "/images/projekte/luftfeuchter-optimierung.jpg"
author: Sascha Curth
type: test
lang: de-DE
published: 27.02.2020
modified: 29.02.2020
---
# Inhalt

!!! note Testing Notes
Good Note
!!!

!!! info Information
Info icon
!!!

<div v-for="i in items">
    <h2>{{i.first_name}} {{i.last_name}}</h2>
    <img :src="i.avatar"/>
</div>

<script>
const axios = require('axios')
export default {
  data () {
      return {
          items: []
      }
  },
  beforeMount() {
    axios.get('https://reqres.in/api/users')
    .then(response => {
       this.$data.items = response.data.data
    })
    .catch(error => {
        console.log(error);
    })
  }
}
</script>
