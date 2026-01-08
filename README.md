# JW-Yuan.github.io

个人主页网站，包含以下栏目：
- 首页：个人信息介绍
- GitHub 项目：展示个人项目
- 数据集介绍：分享数据集资源
- 论文阅读心得：记录论文阅读笔记

## 使用说明

1. 编辑 `index.html` 文件，更新个人信息
2. 修改 `assets/css/style.css` 可以自定义样式和颜色
3. 将更改推送到 GitHub，GitHub Pages 会自动部署

## 部署说明

### GitHub Pages 部署

1. 确保所有文件已推送到 `main` 分支
2. 在 GitHub 仓库设置中，确保 GitHub Pages 设置为从 `main` 分支部署
3. 网站会在几分钟内自动更新

### 重要文件

- `.nojekyll` - 此文件告诉 GitHub Pages 不要使用 Jekyll 处理（纯静态 HTML 网站必需）
- `index.html` - 首页文件（GitHub Pages 标准）

### 如果网站没有更新

1. **等待几分钟** - GitHub Pages 通常需要 1-10 分钟才能更新
2. **清除浏览器缓存** - 按 `Ctrl+F5` 或 `Cmd+Shift+R` 强制刷新
3. **检查 GitHub Pages 设置** - 确保设置为从 `main` 分支部署
4. **确认 `.nojekyll` 文件存在** - 对于纯静态 HTML 网站，此文件是必需的
5. **检查文件路径** - 确保所有资源文件路径正确

## 自定义内容

### 更新个人信息
在 `index.html` 的首页部分修改个人信息。

### 配置项目展示模式

**所有配置都在根目录的 `config.js` 文件中统一管理！**

项目页面支持两种展示模式：

#### 自动获取模式
编辑根目录的 `config.js`：
```javascript
const SITE_CONFIG = {
    projects: {
        mode: 'auto',  // 设置为 'auto'
        githubUsername: 'JW-Yuan',
        manualRepos: []
    }
};
```
自动获取 GitHub 用户的所有公开仓库。

#### 手动指定模式
编辑根目录的 `config.js`：
```javascript
const SITE_CONFIG = {
    projects: {
        mode: 'manual',  // 设置为 'manual'
        githubUsername: 'JW-Yuan',
        manualRepos: [
            'https://github.com/JW-Yuan/example-repo',
            'JW-Yuan/another-repo',
            'https://github.com/owner/repo-name'
        ]
    }
};
```
手动指定要展示的仓库列表。支持多种 URL 格式：
- `https://github.com/owner/repo`
- `owner/repo`
- `github.com/owner/repo`

**注意**：只需修改根目录的 `config.js` 文件，其他文件会自动读取配置！

### 添加数据集
在 `templates/datasets.html` 中添加新的数据集卡片。

### 添加论文心得
在 `templates/papers.html` 中添加新的论文卡片。

## 配置文件说明

### `config.js` ⭐ **主要配置文件（根目录）**
所有网站配置都在这个文件中，包括：
- `projects.mode`: 项目展示模式（'auto' 或 'manual'）
- `projects.githubUsername`: GitHub 用户名
- `projects.manualRepos`: 手动指定的仓库列表

**配置文件位于根目录，方便修改和管理！**