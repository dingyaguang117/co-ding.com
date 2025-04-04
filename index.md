---
# https://vitepress.dev/reference/default-theme-home-page
layout: page
---

<script setup>
import { data as posts } from './blog/posts.data.js'

</script>

<div class="main">
  <!-- <h1>All Blog Posts</h1> -->
  <ul>
    <div class="blog" v-for="post of posts">
      <a class="title" :href="post.url">{{ post.frontmatter.title }}</a>
      <div>
        <span class="description">🏷 {{ post.frontmatter.category }}</span> &nbsp;
        <span class="description">🕒 {{ post.frontmatter.date }}</span>
      </div>
    </div>
  </ul>
</div>

<style>
  .main {
    width: 680px;
    margin: 0 auto;
  }

  .blog {
    margin: 50px 0;

    .title {
        color: var(--vp-c-text-1);
        font-size: 18px;
        font-weight: bold;
        text-decoration: none;
    }

    .description {
      font-size: 13px;
      color: var(--vp-c-text-2);
    }
  }
</style>
