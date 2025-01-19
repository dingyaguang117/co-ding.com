---
layout: home
---

<script setup>
import { data as posts } from './posts.data.js'
</script>

<h1>All Blog Posts</h1>
<ul>
  <li v-for="post of posts">
    <a :href="post.url">{{ post.frontmatter.title }}</a>
    <span> @ {{ post.frontmatter.date }}</span>
  </li>
</ul>
