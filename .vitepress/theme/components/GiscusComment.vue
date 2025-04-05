<template>
  <div style="margin-top: 24px">
    <Giscus
      id="comments"
      repo="dingyaguang117/co-ding.com"
      repoid="R_kgDON2vWtw"
      category="Announcements"
      categoryid="DIC_kwDON2vWt84CozkH"
      mapping="pathname"
      term="Welcome to giscus!"
      reactionsenabled="1"
      emitmetadata="0"
      inputposition="bottom"
      :theme="isDark ? 'dark' : 'light'"
      :key="route.path"
    ></Giscus>
  </div>
</template>

<script setup>
  import Giscus from "@giscus/vue";
  import { useRoute, useData } from "vitepress";

  const route = useRoute();
  const { isDark } = useData();
</script>
