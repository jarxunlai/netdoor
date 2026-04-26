const test = require("node:test");
const assert = require("node:assert/strict");

const {
  findPostById,
  renderMarkdown,
  renderPostCards,
  renderProfile,
  renderSiteRows,
} = require("../assets/app.js");

test("renderSiteRows renders one row per site with description and link", () => {
  const html = renderSiteRows([
    {
      id: "bca",
      name: "BCA",
      url: "https://bca.jadelai.top",
      description: "生信分析站点",
    },
    {
      id: "doc",
      name: "DOC",
      url: "https://doc.jadelai.top",
      description: "文档中心",
    },
  ]);

  assert.match(html, /BCA/);
  assert.match(html, /生信分析站点/);
  assert.match(html, /https:\/\/doc\.jadelai\.top/);
  assert.match(html, /进入/);
});

test("renderSiteRows preserves input order", () => {
  const html = renderSiteRows([
    {
      id: "animal",
      name: "ANIMAL",
      url: "https://animal.jadelai.top",
      description: "动物数据页",
    },
    {
      id: "bca",
      name: "BCA",
      url: "https://bca.jadelai.top",
      description: "生信分析站点",
    },
  ]);

  assert.ok(html.indexOf("ANIMAL") < html.indexOf("BCA"));
});

test("renderProfile renders identity, education, and GitHub links", () => {
  const html = renderProfile({
    name: "jarxuanlai",
    role: "临床医学在研研究生",
    bio: "关注科研、代码、生信与工具开发。",
    github: {
      url: "https://github.com/jarxunlai",
      label: "GitHub",
    },
    education: [
      {
        period: "现在",
        title: "临床医学在研研究生",
        description: "在医学训练中探索科研问题。",
      },
    ],
    projects: [
      {
        name: "netdoor",
        url: "https://github.com/jarxunlai/netdoor",
        description: "个人主页和工具入口。",
      },
    ],
  });

  assert.match(html, /jarxuanlai/);
  assert.match(html, /临床医学在研研究生/);
  assert.match(html, /https:\/\/github\.com\/jarxunlai/);
  assert.match(html, /netdoor/);
});

test("renderPostCards links each post to post.html by id", () => {
  const html = renderPostCards([
    {
      id: "hello-blog",
      title: "新的个人主页",
      date: "2026-04-26",
      summary: "记录这个站点的开始。",
      tags: ["blog", "科研"],
      file: "content/posts/hello-blog.md",
    },
  ]);

  assert.match(html, /新的个人主页/);
  assert.match(html, /post\.html\?id=hello-blog/);
  assert.match(html, /blog/);
});

test("findPostById returns the matching post only", () => {
  const posts = [
    { id: "first", title: "First" },
    { id: "second", title: "Second" },
  ];

  assert.equal(findPostById(posts, "second").title, "Second");
  assert.equal(findPostById(posts, "missing"), null);
});

test("renderMarkdown supports headings, lists, links, quotes, and code", () => {
  const html = renderMarkdown(
    [
      "# 标题",
      "",
      "> 一点感想",
      "",
      "- 项目一",
      "- 项目二",
      "",
      "访问 [GitHub](https://github.com/jarxunlai) 并阅读 `code`。",
      "",
      "```js",
      "const name = 'jarxuanlai';",
      "```",
    ].join("\n"),
  );

  assert.match(html, /<h1>标题<\/h1>/);
  assert.match(html, /<blockquote><p>一点感想<\/p><\/blockquote>/);
  assert.match(html, /<ul><li>项目一<\/li><li>项目二<\/li><\/ul>/);
  assert.match(html, /<a href="https:\/\/github\.com\/jarxunlai"/);
  assert.match(html, /<code>code<\/code>/);
  assert.match(html, /<pre><code class="language-js">/);
});
