const test = require("node:test");
const assert = require("node:assert/strict");

const { renderSiteRows } = require("../assets/app.js");

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
