// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme";
import MyLayout from "./MyLayout.vue";

import "./style.css";

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: MyLayout,
  enhanceApp({ app, router, siteData }) {
    // ...
  },
};
