import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Yaguang's Blog",
  description: "Keep Thinking, Keep Coding",
  lastUpdated: false,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Blogs", link: "/" },
      // { text: "Projects", link: "/projects" },
      // { text: "About", link: "/about" },
    ],
    sidebar1: [
      {
        text: "杂项",
        items: [
          { text: "PDF 表单格式解析与填充操作", link: "/blog/miscellanea/2022-04-30-pdf-specification.md" },
          { text: "代码设计原则", link: "/blog/miscellanea/2021-04-01-code-design-princples.md" },
          // { text: "Graylog 查询指南", link: "/blog/miscellanea/2020-10-10-graylog-tips.md" },
          // { text: "", link: "/blog/miscellanea/2019-06-08-talk-about-5G.md" },
          { text: "程序员的安全意识", link: "/blog/miscellanea/2016-06-01-google-authenticator.md" },
          { text: "局域网内的设备搜索", link: "/blog/miscellanea/2016-02-06-device-discovery-in-lan.md" },
          // { text: "Curl 统计页面各项性能指标", link: "/blog/miscellanea/2015-06-10-curl-w.md" },
          // { text: "C#对JSON的支持", link: "/blog/miscellanea/2013-07-19-csharp-json.md" },
          { text: "视频聚合APP的后台架构", link: "/blog/miscellanea/2013-05-31-video-app-backend-architecture.md" },
          // { text: "mongodb 的数组定位器$", link: "/blog/miscellanea/2012-12-14-mongodb-indicator.md" },
          {
            text: "emoji,unicode,json,python,ucs-4",
            link: "/blog/miscellanea/2012-10-19-emoji-unicode-json-python-ucs4.md",
          },
          { text: "DNS 的 CNAME 记录 与 SAE 的域名绑定", link: "/blog/miscellanea/2012-08-31-dns-cname.md" },
          { text: "多线程下载策略分析", link: "/blog/miscellanea/2012-03-04-download-strategy.md" },
        ],
      },
      {
        text: "算法与数据结构",
        items: [
          { text: "Project Euler 201 - 多维背包", link: "/blog/algorithm/2012-01-01-multi-dimensional-bag.md" },
          { text: "Project Euler 1-10 题", link: "/blog/algorithm/2012-08-19-projecteuler.md" },
          { text: "三角形费马点", link: "/blog/algorithm/2012-01-27-fermat-point.md" },
          { text: "快速赢得《你画我猜》 - DFS + Trie Tree", link: "/blog/algorithm/2012-04-05-dfs-trie.md" },
          {
            text: "NP问题 - 旅行商问题的动态规划解决 O(N*logN)",
            link: "/blog/algorithm/2012-11-24-dp-solution-of-tsp-problem.md",
          },
          { text: "58同城验证码识别", link: "/blog/algorithm/2013-03-03-58ImgRecognize.md" },
          { text: "XML <-> JSON", link: "/blog/algorithm/2013-04-11-xml-json.md" },
          { text: "实现支持 Unicode 中文的 AC 自动机", link: "/blog/algorithm/2012-05-26-python-acautomaton.md" },
          { text: "Bloom Filter - 布隆过滤器", link: "/blog/algorithm/2012-10-08-bloom-filter.md" },
          { text: "Double Array Trie - 双数组 Trie 树", link: "/blog/algorithm/2013-05-28-DoubleArrayTrie.md" },
          { text: "使用编辑距离实现 Diff 算法", link: "/blog/algorithm/2013-11-06-pydiff.md" },
        ],
      },
      {
        text: "前端开发",
        items: [
          { text: "Chrome 浏览器插件编程入门", link: "/blog/frontend/2013-05-18-chrome-extension.md" },
          {
            text: "MindHero 项目总结 -- Chrome插件开发",
            link: "/blog/frontend/2019-10-18-chrome-extension-summary.md",
          },
          { text: "SVG 不规则圆形动画", link: "/blog/frontend/2019-04-12-svg-animation.md" },
        ],
      },
      {
        text: "Python",
        items: [
          { text: "Python 实现的 HTTP(s) 代理服务器", link: "/blog/python/2014-01-25-Python-Http-Proxy.md" },
          // { text: "MoviePy TextClip使用细节", link: "/blog/python/2015-03-05-moviepy.md" },
          { text: "Python 程序的内存泄露排查", link: "/blog/python/2016-06-05-python-memory-leak.md" },
          { text: "Python3 新特性与升级事项", link: "/blog/python/2019-12-12-python3-new-features.md" },
          { text: "Python Debug with GDB", link: "/blog/python/2019-12-30-python-gdb-debug.md" },
          { text: "使用 asyncio 100行代码实现 https 代理", link: "/blog/python/2020-01-01-http-proxy-by-asyncio.md" },
          { text: "SQLAlchemy 使用简略", link: "/blog/python/2020-01-27-sqlalchemy_guide.md" },
          { text: "使用 line_profiler 进行性能分析优化", link: "/blog/python/2020-09-25-line-profiler.md" },
        ],
      },
      {
        text: "Golang",
        items: [{ text: "Golang 实现 Hook", link: "/blog/golang/2023-06-21-golang-hook.md" }],
      },
      {
        text: "生活随笔",
        items: [
          { text: "奥森小记", link: "/blog/life/2022-10-16-olympic-park.md" },
          { text: "关于新的生活态度", link: "/blog/life/2013-02-24-about-life.md" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/dingyaguang117" }],
  },
  markdown: {
    theme: { light: "dracula", dark: "dracula" },
  },
});
