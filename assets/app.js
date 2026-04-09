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
          '  <a class="site-link" href="' +
            escapeHtml(site.url) +
            '" target="_blank" rel="noreferrer">进入</a>',
          "</article>",
        ].join("");
      })
      .join("");
  }

  async function loadSites() {
    const response = await fetch("data/sites.json", {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("无法读取站点配置");
    }
    return response.json();
  }

  function renderStatus(container, message) {
    container.innerHTML =
      '<div class="status-card">' + escapeHtml(message) + "</div>";
  }

  async function bootstrap() {
    if (typeof document === "undefined") {
      return;
    }

    const container = document.getElementById("site-list");
    if (!container) {
      return;
    }

    renderStatus(container, "正在加载站点目录...");

    try {
      const sites = await loadSites();
      container.innerHTML = renderSiteRows(sites);
    } catch (error) {
      renderStatus(container, error.message || "站点目录加载失败");
    }
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      bootstrap();
    });
  }

  if (typeof module !== "undefined") {
    module.exports = {
      renderSiteRows,
    };
  }
})();
