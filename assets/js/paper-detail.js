// 知识点详情页面专用 JavaScript

// 从配置读取知识点路径
const KNOWLEDGE_POINTS_CONFIG = SITE_CONFIG.papers || {};
// 根据当前页面位置确定路径
const currentPath = window.location.pathname || window.location.href;
const isInTemplates = currentPath.includes('templates/') || currentPath.includes('/templates/');
const KNOWLEDGE_POINTS_BASE_PATH = isInTemplates ? '../papers/' : 'papers/';
// 知识点列表文件（列表格式，使用下划线前缀使其排在前面）
const KNOWLEDGE_POINTS_LIST_PATH = `${KNOWLEDGE_POINTS_BASE_PATH}_papers.json`;

// 从 URL 参数获取知识点 ID
function getKnowledgePointIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 加载知识点基本信息（从列表格式的 _papers.json）
async function loadKnowledgePointBasicInfo(kpId) {
    try {
        // 加载知识点列表
        const response = await fetch(KNOWLEDGE_POINTS_LIST_PATH);
        if (!response.ok) {
            throw new Error('无法加载知识点列表');
        }
        const knowledgePointsList = await response.json();
        
        if (!Array.isArray(knowledgePointsList)) {
            throw new Error('_papers.json 格式错误：应该是数组格式');
        }
        
        // 在列表中查找匹配的知识点
        const kp = knowledgePointsList.find(p => p.id === kpId);
        
        if (!kp) {
            throw new Error(`未找到知识点: ${kpId}`);
        }
        
        return kp;
    } catch (error) {
        console.error('加载知识点基本信息失败:', error);
        throw error;
    }
}

// 加载 Markdown 文件（从 papers/{id}.md）
async function loadMarkdownFile(kpId) {
    try {
        const markdownPath = `${KNOWLEDGE_POINTS_BASE_PATH}${kpId}.md`;
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
async function renderMarkdown(markdownContent, kpId) {
    const markdownContainer = document.getElementById('markdown-container');
    if (!markdownContent) {
        markdownContainer.innerHTML = '<p>暂无详细信息。</p>';
        return;
    }

    // 使用 marked.js 渲染 Markdown
    markdownContainer.innerHTML = marked.parse(markdownContent);
}

// 渲染基本信息
function renderBasicInfo(kp) {
    // 设置标题
    document.getElementById('paper-name').textContent = kp.title || '未命名知识点';
    
    // 设置分类和标签
    const metaHeader = document.getElementById('paper-meta-header');
    metaHeader.innerHTML = '';
    
    if (kp.category) {
        const categoryTag = document.createElement('span');
        categoryTag.className = 'meta-tag';
        categoryTag.innerHTML = `<i class="fas fa-folder"></i> ${kp.category}`;
        metaHeader.appendChild(categoryTag);
    }
    
    if (kp.tags && kp.tags.length > 0) {
        kp.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'meta-tag';
            tagElement.innerHTML = `<i class="fas fa-tag"></i> ${tag}`;
            metaHeader.appendChild(tagElement);
        });
    }
    
    // 渲染相关论文列表
    if (kp.papers && kp.papers.length > 0) {
        const papersSection = document.getElementById('papers-section');
        if (papersSection) {
            papersSection.innerHTML = `
                <h3><i class="fas fa-book"></i> 相关论文 (${kp.papers.length} 篇)</h3>
                <div class="papers-list">
                    ${kp.papers.map((paper, index) => {
                        const displayName = paper.shortName || paper.name;
                        const year = paper.year ? ` (${paper.year})` : '';
                        const authors = paper.authors ? ` - ${paper.authors}` : '';
                        const venue = paper.venue ? ` [${paper.venue}]` : '';
                        const taskText = paper.task ? (Array.isArray(paper.task) ? paper.task.join(', ') : paper.task) : '';
                        
                        let linksHtml = '';
                        if (paper.links) {
                            const linkItems = [];
                            if (paper.links.pdf) {
                                linkItems.push(`<a href="${paper.links.pdf}" target="_blank" class="link-btn"><i class="fas fa-file-pdf"></i> PDF</a>`);
                            }
                            if (paper.links.code) {
                                linkItems.push(`<a href="${paper.links.code}" target="_blank" class="link-btn"><i class="fab fa-github"></i> Code</a>`);
                            }
                            if (linkItems.length > 0) {
                                linksHtml = `<div class="paper-links">${linkItems.join(' ')}</div>`;
                            }
                        }
                        
                        return `
                            <div class="paper-item">
                                <div class="paper-item-header">
                                    <h4>${index + 1}. ${displayName}${year}</h4>
                                </div>
                                <div class="paper-item-info">
                                    ${authors ? `<div class="info-row"><i class="fas fa-users"></i> ${authors}</div>` : ''}
                                    ${venue ? `<div class="info-row"><i class="fas fa-building"></i> ${venue}</div>` : ''}
                                    ${taskText ? `<div class="info-row"><i class="fas fa-tasks"></i> ${taskText}</div>` : ''}
                                </div>
                                ${linksHtml}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    }
}

// 加载并显示知识点详情
async function loadKnowledgePointDetail() {
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
        
        // 从 URL 获取知识点 ID
        const kpId = getKnowledgePointIdFromURL();
        if (!kpId) {
            throw new Error('未指定知识点 ID');
        }
        
        // 加载基本信息
        const kpInfo = await loadKnowledgePointBasicInfo(kpId);
        
        // 渲染基本信息
        renderBasicInfo(kpInfo);
        
        // 加载并渲染 Markdown
        const markdownContent = await loadMarkdownFile(kpId);
        await renderMarkdown(markdownContent, kpId);
        
        // 显示内容
        loading.style.display = 'none';
        content.style.display = 'block';
        
    } catch (error) {
        console.error('加载知识点详情失败:', error);
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
    loadKnowledgePointDetail();
});
