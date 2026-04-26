(function () {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char];
    });
  }

  function isSafeUrl(value) {
    return /^https?:\/\//.test(String(value));
  }

  function renderExternalLink(url, label, className) {
    return (
      '<a class="' +
      escapeHtml(className || "text-link") +
      '" href="' +
      escapeHtml(url) +
      '" target="_blank" rel="noreferrer">' +
      escapeHtml(label) +
      "</a>"
    );
  }

  function renderTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) {
      return "";
    }
    return (
      '<div class="tag-row">' +
      tags
        .map(function (tag) {
          return '<span class="tag">' + escapeHtml(tag) + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  function renderProfile(profile) {
    const github = profile.github || {};
    const education = Array.isArray(profile.education) ? profile.education : [];
    const projects = Array.isArray(profile.projects) ? profile.projects : [];
    const avatar = profile.avatar
      ? '<img class="avatar-image" src="' +
        escapeHtml(profile.avatar) +
        '" alt="' +
        escapeHtml(profile.name) +
        '" onerror="this.hidden=true; this.nextElementSibling.hidden=false;" />'
      : "";
    const fallbackHidden = profile.avatar ? " hidden" : "";

    return [
      '<div class="profile-layout">',
      '  <div class="avatar-frame">',
      avatar,
      '    <div class="avatar-fallback"' +
        fallbackHidden +
        ">" +
        escapeHtml(profile.name || "j") +
        "</div>",
      "  </div>",
      '  <div class="profile-copy">',
      '    <p class="eyebrow">jadelai.top</p>',
      '    <h1 id="profile-title">' + escapeHtml(profile.name) + "</h1>",
      '    <p class="profile-role">' + escapeHtml(profile.role) + "</p>",
      '    <p class="hero-copy">' + escapeHtml(profile.bio) + "</p>",
      '    <div class="hero-actions">',
      github.url
        ? renderExternalLink(github.url, github.label || "GitHub", "primary-link")
        : "",
      '      <a class="secondary-link" href="#posts-title">阅读笔记</a>',
      "    </div>",
      "  </div>",
      "</div>",
      '<div class="profile-grid">',
      '  <div class="mini-panel">',
      "    <h2>当前身份</h2>",
      "    <p>" + escapeHtml(profile.role) + "</p>",
      "  </div>",
      '  <div class="mini-panel">',
      "    <h2>关注方向</h2>",
      "    <p>临床医学、科研训练、生信分析、代码工具化。</p>",
      "  </div>",
      '  <div class="mini-panel">',
      "    <h2>持续记录</h2>",
      "    <p>把学习过程中的问题、方法和感想沉淀为可继续迭代的内容。</p>",
      "  </div>",
      "</div>",
      renderEducationList(education),
      renderProjectList(projects, github),
    ].join("");
  }

  function renderEducationList(items) {
    if (!items.length) {
      return '<div class="status-card">暂无学习经历。</div>';
    }
    return items
      .map(function (item) {
        return [
          '<article class="timeline-item">',
          '  <p class="timeline-period">' + escapeHtml(item.period) + "</p>",
          "  <h3>" + escapeHtml(item.title) + "</h3>",
          "  <p>" + escapeHtml(item.description) + "</p>",
          "</article>",
        ].join("");
      })
      .join("");
  }

  function renderProjectList(projects, github) {
    const links = projects.slice();
    if (github && github.url) {
      links.unshift({
        name: github.label || "GitHub",
        url: github.url,
        description: "查看我的代码仓库、项目记录和后续开源内容。",
      });
    }
    if (!links.length) {
      return '<div class="status-card">暂无 GitHub 项目。</div>';
    }
    return links
      .map(function (project) {
        return [
          '<article class="site-item">',
          '  <div class="site-meta">',
          "    <h3>" + escapeHtml(project.name) + "</h3>",
          '    <p class="site-desc">' + escapeHtml(project.description) + "</p>",
          '    <p class="site-url">' + escapeHtml(project.url) + "</p>",
          "  </div>",
          renderExternalLink(project.url, "查看", "site-link"),
          "</article>",
        ].join("");
      })
      .join("");
  }

  function renderSiteRows(sites) {
    return sites
      .map(function (site) {
        return [
          '<article class="site-item">',
          '  <div class="site-meta">',
          "    <h3>" + escapeHtml(site.name) + "</h3>",
          '    <p class="site-desc">' + escapeHtml(site.description) + "</p>",
          '    <p class="site-url">' + escapeHtml(site.url) + "</p>",
          "  </div>",
          renderExternalLink(site.url, "进入", "site-link"),
          "</article>",
        ].join("");
      })
      .join("");
  }

  function renderPostCards(posts) {
    if (!posts.length) {
      return '<div class="status-card">暂无文章。</div>';
    }
    return posts
      .map(function (post) {
        return [
          '<article class="post-card">',
          '  <div class="post-card-meta">',
          '    <time datetime="' +
            escapeHtml(post.date) +
            '">' +
            escapeHtml(post.date) +
            "</time>",
          renderTags(post.tags),
          "  </div>",
          "  <h3>" + escapeHtml(post.title) + "</h3>",
          "  <p>" + escapeHtml(post.summary) + "</p>",
          '  <a class="text-link" href="post.html?id=' +
            encodeURIComponent(post.id) +
            '">阅读全文</a>',
          "</article>",
        ].join("");
      })
      .join("");
  }

  function findPostById(posts, id) {
    for (let index = 0; index < posts.length; index += 1) {
      if (posts[index].id === id) {
        return posts[index];
      }
    }
    return null;
  }

  function formatInline(value) {
    let html = escapeHtml(value);
    html = html.replace(/`([^`]+)`/g, function (_match, code) {
      return "<code>" + escapeHtml(code) + "</code>";
    });
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      function (_match, label, url) {
        if (!isSafeUrl(url)) {
          return escapeHtml(label);
        }
        return (
          '<a href="' +
          escapeHtml(url) +
          '" target="_blank" rel="noreferrer">' +
          escapeHtml(label) +
          "</a>"
        );
      },
    );
    return html;
  }

  function flushParagraph(paragraphLines, output) {
    if (paragraphLines.length) {
      output.push("<p>" + formatInline(paragraphLines.join(" ")) + "</p>");
      paragraphLines.length = 0;
    }
  }

  function flushList(listItems, output) {
    if (listItems.length) {
      output.push(
        "<ul>" +
          listItems
            .map(function (item) {
              return "<li>" + formatInline(item) + "</li>";
            })
            .join("") +
          "</ul>",
      );
      listItems.length = 0;
    }
  }

  function renderMarkdown(markdown) {
    const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
    const output = [];
    const paragraphLines = [];
    const listItems = [];
    let inCode = false;
    let codeLanguage = "";
    let codeLines = [];

    lines.forEach(function (line) {
      const fence = line.match(/^```([A-Za-z0-9_-]*)\s*$/);
      if (fence) {
        if (inCode) {
          output.push(
            '<pre><code class="' +
              (codeLanguage ? "language-" + escapeHtml(codeLanguage) : "") +
              '">' +
              escapeHtml(codeLines.join("\n")) +
              "</code></pre>",
          );
          inCode = false;
          codeLanguage = "";
          codeLines = [];
        } else {
          flushParagraph(paragraphLines, output);
          flushList(listItems, output);
          inCode = true;
          codeLanguage = fence[1] || "";
        }
        return;
      }

      if (inCode) {
        codeLines.push(line);
        return;
      }

      if (!line.trim()) {
        flushParagraph(paragraphLines, output);
        flushList(listItems, output);
        return;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushParagraph(paragraphLines, output);
        flushList(listItems, output);
        const level = heading[1].length;
        output.push(
          "<h" +
            level +
            ">" +
            formatInline(heading[2]) +
            "</h" +
            level +
            ">",
        );
        return;
      }

      const quote = line.match(/^>\s+(.+)$/);
      if (quote) {
        flushParagraph(paragraphLines, output);
        flushList(listItems, output);
        output.push("<blockquote><p>" + formatInline(quote[1]) + "</p></blockquote>");
        return;
      }

      const listItem = line.match(/^-\s+(.+)$/);
      if (listItem) {
        flushParagraph(paragraphLines, output);
        listItems.push(listItem[1]);
        return;
      }

      flushList(listItems, output);
      paragraphLines.push(line.trim());
    });

    if (inCode) {
      output.push("<pre><code>" + escapeHtml(codeLines.join("\n")) + "</code></pre>");
    }
    flushParagraph(paragraphLines, output);
    flushList(listItems, output);
    return output.join("");
  }

  async function loadJson(path, errorMessage) {
    const response = await fetch(path, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async function loadText(path, errorMessage) {
    const response = await fetch(path, {
      headers: {
        Accept: "text/markdown,text/plain",
      },
    });
    if (!response.ok) {
      throw new Error(errorMessage);
    }
    return response.text();
  }

  function renderStatus(container, message) {
    container.innerHTML =
      '<div class="status-card">' + escapeHtml(message) + "</div>";
  }

  async function bootstrapHome() {
    const profileRoot = document.getElementById("profile-root");
    const siteList = document.getElementById("site-list");
    const educationList = document.getElementById("education-list");
    const postList = document.getElementById("post-list");
    const githubPanel = document.getElementById("github-panel");

    if (!profileRoot || !siteList || !educationList || !postList || !githubPanel) {
      return;
    }

    [profileRoot, siteList, educationList, postList, githubPanel].forEach(function (
      container,
    ) {
      renderStatus(container, "正在加载内容...");
    });

    try {
      const profile = await loadJson("data/profile.json", "无法读取个人资料");
      const sites = await loadJson("data/sites.json", "无法读取工具配置");
      const posts = await loadJson("data/posts.json", "无法读取文章索引");

      profileRoot.innerHTML = renderProfile(profile);
      siteList.innerHTML = renderSiteRows(sites);
      educationList.innerHTML = renderEducationList(profile.education || []);
      postList.innerHTML = renderPostCards(posts);
      githubPanel.innerHTML = renderProjectList(profile.projects || [], profile.github);
    } catch (error) {
      const message = error.message || "页面内容加载失败";
      [profileRoot, siteList, educationList, postList, githubPanel].forEach(function (
        container,
      ) {
        renderStatus(container, message);
      });
    }
  }

  async function bootstrapPost() {
    const container = document.getElementById("post-view");
    if (!container) {
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (!id) {
        throw new Error("缺少文章 id");
      }
      const posts = await loadJson("data/posts.json", "无法读取文章索引");
      const post = findPostById(posts, id);
      if (!post) {
        throw new Error("未找到这篇文章");
      }
      const markdown = await loadText(post.file, "无法读取文章内容");
      document.title = post.title + " | jadelai.top";
      container.innerHTML = [
        '<header class="article-header">',
        '  <p class="eyebrow">NOTES</p>',
        "  <h1>" + escapeHtml(post.title) + "</h1>",
        '  <div class="post-card-meta">',
        '    <time datetime="' +
          escapeHtml(post.date) +
          '">' +
          escapeHtml(post.date) +
          "</time>",
        renderTags(post.tags),
        "  </div>",
        '  <p class="article-summary">' + escapeHtml(post.summary) + "</p>",
        "</header>",
        '<div class="article-content">',
        renderMarkdown(markdown),
        "</div>",
      ].join("");
    } catch (error) {
      renderStatus(container, error.message || "文章加载失败");
    }
  }

  async function bootstrap() {
    if (typeof document === "undefined") {
      return;
    }
    await bootstrapHome();
    await bootstrapPost();
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      bootstrap();
    });
  }

  if (typeof module !== "undefined") {
    module.exports = {
      findPostById,
      renderEducationList,
      renderMarkdown,
      renderPostCards,
      renderProfile,
      renderProjectList,
      renderSiteRows,
    };
  }
})();
