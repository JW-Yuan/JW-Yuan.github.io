// 论文详情页面专用 JavaScript

// 从配置读取论文路径
const PAPERS_CONFIG = SITE_CONFIG.papers || {};
// 根据当前页面位置确定路径
const currentPath = window.location.pathname || window.location.href;
const isInTemplates = currentPath.includes('templates/') || currentPath.includes('/templates/');
const PAPERS_BASE_PATH = isInTemplates ? '../papers/' : 'papers/';
// 论文列表文件（列表格式，使用下划线前缀使其排在前面）
const PAPERS_LIST_PATH = `${PAPERS_BASE_PATH}_papers.json`;

// 从 URL 参数获取论文 ID
function getPaperIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 加载论文基本信息（从列表格式的 _papers.json）
async function loadPaperBasicInfo(paperId) {
    try {
        // 加载论文列表
        const response = await fetch(PAPERS_LIST_PATH);
        if (!response.ok) {
            throw new Error('无法加载论文列表');
        }
        const papersList = await response.json();
        
        if (!Array.isArray(papersList)) {
            throw new Error('_papers.json 格式错误：应该是数组格式');
        }
        
        // 在列表中查找匹配的论文
        const paper = papersList.find(p => p.id === paperId);
        
        if (!paper) {
            throw new Error(`未找到论文: ${paperId}`);
        }
        
        return paper;
    } catch (error) {
        console.error('加载论文基本信息失败:', error);
        throw error;
    }
}

// 加载 Markdown 文件（从 papers/{id}.md）
async function loadMarkdownFile(paperId) {
    try {
        const markdownPath = `${PAPERS_BASE_PATH}${paperId}.md`;
        const response = await fetch(markdownPath);
        
        if (!response.ok) {
            // 如果 Markdown 文件不存在，返回 null（不是错误）
            if (response.status === 404) {
                return null;
            }
            throw new Error(`无法加载 Markdown 文件: ${response.status}`);
        }
        
        return await response.text();
    } catch (error) {
        console.error('加载 Markdown 文件失败:', error);
        return null;
    }
}

// 渲染 Markdown 内容
async function renderMarkdown(markdownContent, paperId) {
    const markdownContainer = document.getElementById('markdown-container');
    if (!markdownContent) {
        markdownContainer.innerHTML = '<p>暂无详细信息。</p>';
        return;
    }

    // 使用 marked.js 渲染 Markdown
    markdownContainer.innerHTML = marked.parse(markdownContent);
}

// 渲染基本信息
function renderBasicInfo(paper) {
    // 设置标题
    document.getElementById('paper-name').textContent = paper.name;
    
    // 设置年份
    if (paper.year) {
        const yearBadge = document.getElementById('paper-year');
        yearBadge.textContent = paper.year;
        yearBadge.style.display = 'inline-block';
    }
    
    // 设置元信息标签
    const metaHeader = document.getElementById('paper-meta-header');
    metaHeader.innerHTML = '';
    
    if (paper.authors) {
        const authorTag = document.createElement('span');
        authorTag.className = 'meta-tag';
        authorTag.innerHTML = `<i class="fas fa-users"></i> ${paper.authors}`;
        metaHeader.appendChild(authorTag);
    }
    
    if (paper.venue) {
        const venueTag = document.createElement('span');
        venueTag.className = 'meta-tag';
        venueTag.innerHTML = `<i class="fas fa-building"></i> ${paper.venue}`;
        metaHeader.appendChild(venueTag);
    }
    
    if (paper.task) {
        const taskText = Array.isArray(paper.task) ? paper.task.join(', ') : paper.task;
        const taskTag = document.createElement('span');
        taskTag.className = 'meta-tag';
        taskTag.innerHTML = `<i class="fas fa-tasks"></i> ${taskText}`;
        metaHeader.appendChild(taskTag);
    }
    
    // 添加链接
    if (paper.links) {
        const linksDiv = document.createElement('div');
        linksDiv.className = 'paper-links-header';
        
        if (paper.links.pdf) {
            const pdfLink = document.createElement('a');
            pdfLink.href = paper.links.pdf;
            pdfLink.target = '_blank';
            pdfLink.className = 'link-btn';
            pdfLink.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
            linksDiv.appendChild(pdfLink);
        }
        
        if (paper.links.code) {
            const codeLink = document.createElement('a');
            codeLink.href = paper.links.code;
            codeLink.target = '_blank';
            codeLink.className = 'link-btn';
            codeLink.innerHTML = '<i class="fab fa-github"></i> Code';
            linksDiv.appendChild(codeLink);
        }
        
        if (linksDiv.children.length > 0) {
            metaHeader.appendChild(linksDiv);
        }
    }
}

// 加载并显示论文详情
async function loadPaperDetail() {
    try {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const content = document.getElementById('detail-content');
        
        // 检查是否在本地文件系统
        if (window.location.protocol === 'file:') {
            throw new Error('本地文件系统不支持 fetch API。请使用本地服务器（如 Live Server）或部署到 GitHub Pages 后访问。');
        }
        
        loading.style.display = 'block';
        error.style.display = 'none';
        content.style.display = 'none';
        
        // 从 URL 获取论文 ID
        const paperId = getPaperIdFromURL();
        if (!paperId) {
            throw new Error('未指定论文 ID');
        }
        
        // 加载基本信息
        const paperInfo = await loadPaperBasicInfo(paperId);
        
        // 渲染基本信息
        renderBasicInfo(paperInfo);
        
        // 加载并渲染 Markdown
        const markdownContent = await loadMarkdownFile(paperId);
        await renderMarkdown(markdownContent, paperId);
        
        // 显示内容
        loading.style.display = 'none';
        content.style.display = 'block';
        
    } catch (error) {
        console.error('加载论文详情失败:', error);
        const loading = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p class="error-text">加载失败: ${error.message}</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-light);">
                提示：如果是在本地打开，请使用本地服务器（如 VS Code 的 Live Server 扩展）或部署到 GitHub Pages 后访问。
            </p>
        `;
    }
}

// 页面加载时执行
window.addEventListener('DOMContentLoaded', () => {
    loadPaperDetail();
});

