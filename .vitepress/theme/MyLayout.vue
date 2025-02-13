<script setup>
  import DefaultTheme from "vitepress/theme";
  import { useData } from "vitepress";

  const { Layout } = DefaultTheme;
  const { page } = useData();
</script>

<template>
  <Layout>
    <template #doc-before>
      <h1 class="title">{{ page.title }}</h1>
      <br />
      <span class="description">🏷 {{ page.frontmatter.category }}</span> &nbsp;
      <span class="description">🕒 {{ new Date(page.frontmatter.date).toLocaleDateString() }}</span>
      <br />
      <br />
    </template>
  </Layout>
</template>

<style>
  .title {
    letter-spacing: -0.02em;
    line-height: 40px;
    font-size: 32px;
    font-weight: 600;
  }

  .date {
    color: #666;
  }
</style>
