// 论文详情页面专用 JavaScript

// 从配置读取论文路径
const PAPERS_CONFIG = SITE_CONFIG.papers || {};
// 根据当前页面位置确定路径
const currentPath = window.location.pathname || window.location.href;
const isInTemplates = currentPath.includes('templates/') || currentPath.includes('/templates/');
const PAPERS_BASE_PATH = isInTemplates ? '../papers/' : 'papers/';
const INFO_FILE = PAPERS_CONFIG.files?.info || 'info.json';
const DETAIL_FILE = PAPERS_CONFIG.files?.detail || 'detail.md';

// 从 URL 参数获取论文 ID
function getPaperIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 加载论文基本信息
async function loadPaperBasicInfo(paperId) {
    try {
        // 先加载索引文件（字典格式：{ "0001": "论文名称", ... }）
        // 索引文件现在在根目录
        const indexPath = isInTemplates ? '../papers.json' : 'papers.json';
        const indexResponse = await fetch(indexPath);
        if (!indexResponse.ok) {
            throw new Error('无法加载论文索引');
        }
        const indexData = await indexResponse.json();
        
        // 查找匹配的文件夹
        let paperFolder = null;
        
        // 处理索引格式（可能是数组或字典）
        let folderList;
        if (Array.isArray(indexData)) {
            // 旧格式：数组
            folderList = indexData;
        } else {
            // 新格式：字典，提取 key（数字 ID）
            folderList = Object.keys(indexData).sort();
        }
        
        // 首先尝试精确匹配（数字 ID）
        if (folderList.includes(paperId)) {
            paperFolder = paperId;
        } else {
            // 尝试在所有文件夹中搜索（通过 info.json 中的 id 字段）
            for (const folderName of folderList) {
                const infoPath = `${PAPERS_BASE_PATH}${folderName}/${INFO_FILE}`;
                const response = await fetch(infoPath);
                if (response.ok) {
                    const data = await response.json();
                    const fileId = data.id || folderName;
                    if (fileId === paperId) {
                        paperFolder = folderName;
                        break;
                    }
                }
            }
        }
        
        if (!paperFolder) {
            throw new Error(`未找到论文: ${paperId}`);
        }
        
        // 加载论文基本信息
        const infoPath = `${PAPERS_BASE_PATH}${paperFolder}/${INFO_FILE}`;
        const response = await fetch(infoPath);
        if (!response.ok) {
            throw new Error(`无法加载论文文件: ${infoPath}`);
        }
        
        const data = await response.json();
        // 保存文件夹名称，用于后续加载详情
        data.folderName = paperFolder;
        
        return data;
    } catch (error) {
        console.error('加载论文基本信息失败:', error);
        throw error;
    }
}

// 加载 Markdown 文件
async function loadMarkdownFile(folderName) {
    try {
        const markdownPath = `${PAPERS_BASE_PATH}${folderName}/${DETAIL_FILE}`;
        const response = await fetch(markdownPath);
        
        if (!response.ok) {
            console.warn(`Markdown 文件不存在: ${markdownPath}`);
            return null;
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
        const markdownContent = await loadMarkdownFile(paperInfo.folderName);
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

