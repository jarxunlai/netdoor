# netdoor

`jadelai.top` 的静态门户首页项目，用来统一进入当前维护的网页站点。

## 目录结构

- `index.html`：门户页面骨架
- `assets/styles.css`：页面样式与主题变量
- `assets/app.js`：读取站点配置并渲染站点目录
- `data/sites.json`：站点配置文件
- `scripts/check_sites.py`：站点配置校验脚本
- `tests/`：轻量回归测试

## 本地使用

启动本地静态预览：

```bash
pixi run serve
```

校验站点配置：

```bash
pixi run check
```

## 新增站点

在 `data/sites.json` 末尾新增一个对象，字段固定为：

```json
{
  "id": "new-site",
  "name": "NEW SITE",
  "url": "https://new.jadelai.top",
  "description": "新站点说明"
}
```

新增后运行 `pixi run check`，确认配置合法即可。

## Cloudflare 静态发布

这个项目是纯静态站点，最小发布方式推荐用 **Cloudflare Pages + Direct Upload**。这样不需要额外构建步骤，也不需要自己维护源站服务。

### 发布前检查

先在本地确认站点配置合法：

```bash
pixi run check
```

如果要本地预览页面，再运行：

```bash
pixi run serve
```

脚本会自动选择一个空闲端口，并输出类似 `http://127.0.0.1:8010` 的本地地址。

### 第一次发布到 Pages

1. 登录 Cloudflare Dashboard。
2. 进入 `Workers & Pages`。
3. 选择 `Create application`。
4. 选择 `Pages`。
5. 选择 `Direct Upload`。
6. 项目名建议填写 `netdoor` 或你想要的正式名称。
7. 上传当前项目目录中的静态文件。

建议只上传这些内容：

- `index.html`
- `assets/`
- `data/`

不需要上传：

- `tests/`
- `scripts/`
- `dos/`
- `.pixi/`
- `.superpowers/`

上传完成后，Cloudflare 会先给你一个 `*.pages.dev` 地址用于预览。

### 绑定 `jadelai.top`

当 `pages.dev` 预览正常后，再把根域绑定到这个 Pages 项目：

1. 打开对应的 Pages 项目。
2. 进入 `Custom domains`。
3. 选择 `Set up a domain`。
4. 输入 `jadelai.top`。
5. 按页面提示完成域名激活。

如果 `jadelai.top` 这个根域已经托管在当前 Cloudflare 账号下，Cloudflare 会自动帮你补对应记录。  
如果根域还没有接入 Cloudflare，则需要先把 `jadelai.top` 作为 zone 接入，并把域名的 nameserver 切到 Cloudflare。

### 后续更新

后面每次改了门户页，只需要重复这条最短路径：

1. 修改代码或 `data/sites.json`
2. 运行 `pixi run check`
3. 重新上传 `index.html`、`assets/`、`data/` 到同一个 Pages 项目

### 两个注意点

- 如果你选择的是 `Direct Upload`，Cloudflare 文档说明后续**不能直接切换成 Git integration**；如果以后想改成自动从 Git 部署，通常需要新建一个 Pages 项目。
- 添加自定义域名时，不要只手工加 DNS 记录；应先在 Pages 项目的 `Custom domains` 里完成关联，否则 Cloudflare 文档提到可能出现域名解析或 `522` 问题。

### 官方文档

- Direct Upload: https://developers.cloudflare.com/pages/get-started/direct-upload/
- Custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
