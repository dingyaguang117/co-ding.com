import { createContentLoader } from "vitepress";

export default createContentLoader("blog/*/*.md", {
  includeSrc: true, // 包含原始 markdown 源?
  render: true, // 包含渲染的整页 HTML?
  excerpt: true, // 包含摘录?
  transform(rawData) {
    // 根据需要对原始数据进行 map、sort 或 filter
    // 最终的结果是将发送给客户端的内容
    return rawData
      .filter((post) => {
        return !post.frontmatter.hidden;
      })
      .sort((a, b) => {
        return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date);
      })
      .map((post) => {
        let date = new Date(post.frontmatter.date).toLocaleDateString();
        post.frontmatter.date = date;
        return post;
      });
  },
});
