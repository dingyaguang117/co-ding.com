<script setup>
  import DefaultTheme from "vitepress/theme";
  import { useData } from "vitepress";

  const { Layout } = DefaultTheme;
  const { page } = useData();
</script>

<template>
  <Layout>
    <!-- doc 顶部 -->
    <template #doc-before>
      <div class="doc-header">
        <h1 class="title">{{ page.title }}</h1>
        <br />
        <span class="description">🏷 {{ page.frontmatter.category }}</span> &nbsp;
        <span class="description">🕒 {{ new Date(page.frontmatter.date).toLocaleDateString() }}</span>
        <br />
        <br />
      </div>
    </template>

    <!-- 所有页面底部 -->
    <template #layout-bottom>
      <div class="footer">
        <p>Powered By VitePress</p>
        <p>© 2012-{{ new Date().getFullYear() }} | Yaguang's Blog</p>
      </div>
    </template>
  </Layout>
</template>

<style>
  .doc-header .title {
    letter-spacing: -0.02em;
    line-height: 40px;
    font-size: 32px;
    font-weight: 600;
  }

  .doc-header .description {
    color: var(--vp-c-text-2);
  }

  .footer {
    border-top: 1px solid #eaeaea;
    text-align: center;
    padding: 40px 0;
    font-size: 14px;
    color: var(--vp-c-text-2);
  }
</style>
