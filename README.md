# netdoor

`jadelai.top` 的个人主页和轻量 Blog 项目。它现在不再只是站点目录，而是 `jarxuanlai` 的个人内容入口：展示临床医学在研研究生的个人介绍、工具作品、学习经历、Markdown 文章/感想，以及 GitHub 精选链接。

项目保持纯静态：没有后端、没有数据库、没有构建步骤。Cloudflare Pages 可以直接从 GitHub 仓库同步部署。

## 当前功能

- 首页：个人介绍、头像、工具作品、学习经历、最近文章、GitHub 项目入口
- 文章页：通过 `/post.html?id=文章ID` 读取 Markdown 文章
- 内容配置：个人资料、工具站点、文章索引用 JSON 维护
- 内容校验：`pixi run check` 会检查 URL、文章文件、头像文件和必填字段
- 部署方式：GitHub push 后由 Cloudflare Pages 自动同步部署

## 目录结构

```text
.
├── index.html              # 个人主页
├── post.html               # 文章详情页
├── assets/
│   ├── app.js              # 页面渲染、Markdown 渲染、数据加载
│   └── styles.css          # 首页和文章页样式
├── content/posts/          # Markdown 文章正文
├── data/
│   ├── profile.json        # 个人资料、头像、学习经历、GitHub 项目
│   ├── sites.json          # 工具站点列表
│   └── posts.json          # 文章索引
├── image/                  # 头像和后续图片资源
├── scripts/                # 本地预览与校验脚本
├── tests/                  # 回归测试
├── pixi.toml               # 本地任务定义
└── pixi.lock               # pixi 环境锁定文件
```

线上展示至少需要这些文件和目录：

- `index.html`
- `post.html`
- `assets/`
- `data/`
- `content/`
- `image/`

## 本地预览

启动本地静态服务：

```bash
pixi run serve
```

脚本会自动选择可用端口，通常是：

```text
http://127.0.0.1:8010
```

打开首页：

```text
http://127.0.0.1:8010/
```

打开文章页：

```text
http://127.0.0.1:8010/post.html?id=hello-blog
```

## 本地检查

每次更新内容后建议运行：

```bash
pixi run check
```

它会检查：

- `data/sites.json` 中每个工具站点是否有 `id`、`name`、`url`、`description`
- 所有 URL 是否是合法的 `http` 或 `https`
- `data/profile.json` 的个人资料字段是否完整
- `profile.avatar` 指向的头像文件是否存在
- `data/posts.json` 中每篇文章的 `id`、`title`、`date`、`summary`、`tags`、`file` 是否完整
- 每篇文章对应的 Markdown 文件是否真实存在
- 文章 ID 是否重复

完整测试：

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/test_app.js
node --check assets/app.js
```

## 更新个人资料

编辑 `data/profile.json`。

常用字段：

- `name`：首页公开显示名
- `role`：当前身份
- `bio`：首页个人介绍
- `avatar`：头像图片路径
- `github.url`：GitHub 主页链接
- `education`：学习经历
- `projects`：GitHub 或其他精选项目链接

当前头像使用：

```json
"avatar": "image/7ff6517f5a0479c2c2bfe0537a27c0ed.jpg"
```

后续替换头像时：

1. 把新头像放进 `image/`，例如 `image/avatar-2026.jpg`
2. 修改 `data/profile.json` 里的 `avatar`
3. 运行 `pixi run check`
4. 提交并 push 到 GitHub

如果不设置 `avatar`，首页会自动使用 `jarxuanlai` 文本兜底。

## 新增或修改工具

编辑 `data/sites.json`。

新增示例：

```json
{
  "id": "new-site",
  "name": "NEW SITE",
  "url": "https://new.jadelai.top",
  "description": "新站点说明"
}
```

规则：

- `id` 用英文、数字和短横线更稳妥
- `url` 必须包含 `https://` 或 `http://`
- 顺序就是首页展示顺序

修改后运行：

```bash
pixi run check
```

## 新增文章

第一步：新增 Markdown 文件。

例如：

```text
content/posts/my-note.md
```

内容示例：

```markdown
# 我的新笔记

这里写正文。

## 小标题

- 要点一
- 要点二

> 一段引用。

访问 [GitHub](https://github.com/jarxunlai)。
```

第二步：在 `data/posts.json` 里新增索引。

```json
{
  "id": "my-note",
  "title": "我的新笔记",
  "date": "2026-04-26",
  "summary": "这篇文章的简短摘要。",
  "tags": ["科研", "学习"],
  "file": "content/posts/my-note.md"
}
```

第三步：检查并预览。

```bash
pixi run check
pixi run serve
```

文章地址：

```text
/post.html?id=my-note
```

当前 Markdown 支持：

- `#`、`##`、`###` 标题
- 普通段落
- `-` 无序列表
- `>` 引用
- `[文字](https://example.com)` 链接
- `` `inline code` `` 行内代码
- 三反引号代码块

## 更新 GitHub 项目入口

编辑 `data/profile.json` 中的 `projects`。

示例：

```json
{
  "name": "project-name",
  "url": "https://github.com/jarxunlai/project-name",
  "description": "项目说明。"
}
```

第一版只使用静态链接，不调用 GitHub API。这样 Cloudflare Pages 部署最稳定，也不会受到 API 限流影响。

## GitHub 提交流程

建议每次更新按这个顺序：

```bash
pixi run check
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/test_app.js
node --check assets/app.js
git status --short
git add index.html post.html assets data content image scripts tests README.md pixi.toml pixi.lock .gitignore
git commit -m "Update personal blog site"
git push
```

如果只改文章或图片，也可以只 add 对应文件，但 push 前仍建议运行 `pixi run check`。

## `.gitignore` 说明

仓库会忽略：

- `.pixi/`、虚拟环境、`node_modules/`
- Python/JS 缓存和测试覆盖率输出
- 编辑器配置、本地 agent 状态
- 临时日志和本地 review 草稿

仓库不会忽略这些线上需要的静态资源：

- `assets/`
- `data/`
- `content/`
- `image/`
- `index.html`
- `post.html`

这能保证 GitHub push 后，Cloudflare Pages 可以拿到完整静态站点。

## Cloudflare Pages + GitHub 自动部署

你当前使用的是 Cloudflare 连接 GitHub 仓库后自动同步构建。这个项目不需要构建命令，推荐配置如下：

- Framework preset：`None`
- Build command：留空
- Build output directory：`/` 或仓库根目录
- Root directory：留空，除非你把项目放进 monorepo 子目录
- Production branch：你的正式部署分支，例如 `main`

部署流程：

1. 本地修改内容
2. 运行检查和测试
3. commit 并 push 到 GitHub
4. Cloudflare Pages 自动拉取 GitHub 最新提交
5. Pages 部署完成后访问 `https://jadelai.top`

如果 Cloudflare 部署后页面缺头像或文章，优先检查：

- 图片是否已经被 `git add` 并 push
- `data/profile.json` 的 `avatar` 路径是否正确
- `data/posts.json` 的 `file` 路径是否正确
- Cloudflare Pages 的最新部署是否来自你刚 push 的 commit

## 发布前清单

每次 push 前快速确认：

- 首页文案是否正确
- 新文章能通过 `/post.html?id=文章ID` 打开
- `pixi run check` 通过
- 测试通过
- `git status --short` 中没有误提交 `.pixi/`、缓存、临时日志
- 新头像和文章图片在 `image/` 或其他静态目录中，并已加入 git

## Cloudflare 参考文档

- Pages Git integration: https://developers.cloudflare.com/pages/get-started/git-integration/
- Custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
