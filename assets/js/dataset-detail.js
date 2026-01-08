// 数据集详情页面专用 JavaScript

// 从配置读取数据集路径
const DATASETS_CONFIG = SITE_CONFIG.datasets || {};
// 根据当前页面位置确定路径
// 如果在 templates 文件夹中，使用 ../datasets/；如果在根目录，使用 datasets/
const currentPath = window.location.pathname || window.location.href;
const isInTemplates = currentPath.includes('templates/') || currentPath.includes('/templates/');
const DATASETS_BASE_PATH = isInTemplates ? '../datasets/' : 'datasets/';
const INFO_FILE = DATASETS_CONFIG.files?.info || 'info.json';
const DETAIL_FILE = DATASETS_CONFIG.files?.detail || 'detail.md';
const IMAGES_FOLDER = DATASETS_CONFIG.files?.images || 'img/';

// 从 URL 参数获取数据集 ID
function getDatasetIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}


// 加载数据集基本信息
async function loadDatasetBasicInfo(datasetId) {
    try {
        // 先加载索引文件（字典格式：{ "0001": "数据集名称", ... }）
        // 索引文件现在在根目录
        const indexPath = isInTemplates ? '../datasets.json' : 'datasets.json';
        const indexResponse = await fetch(indexPath);
        if (!indexResponse.ok) {
            throw new Error('无法加载数据集索引');
        }
        const indexData = await indexResponse.json();
        
        // 查找匹配的文件夹
        let datasetFolder = null;
        
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
        if (folderList.includes(datasetId)) {
            datasetFolder = datasetId;
        } else {
            // 尝试在所有文件夹中搜索（通过 info.json 中的 id 字段）
            for (const folderName of folderList) {
                const infoPath = `${DATASETS_BASE_PATH}${folderName}/${INFO_FILE}`;
                const response = await fetch(infoPath);
                if (response.ok) {
                    const data = await response.json();
                    const fileId = data.id || folderName;
                    if (fileId === datasetId) {
                        datasetFolder = folderName;
                        break;
                    }
                }
            }
        }
        
        if (!datasetFolder) {
            throw new Error(`未找到数据集: ${datasetId}`);
        }
        
        // 加载数据集基本信息
        const infoPath = `${DATASETS_BASE_PATH}${datasetFolder}/${INFO_FILE}`;
        const response = await fetch(infoPath);
        if (!response.ok) {
            throw new Error(`无法加载数据集文件: ${infoPath}`);
        }
        
        const data = await response.json();
        // 保存文件夹名称，用于后续加载详情和图片
        data.folderName = datasetFolder;
        
        return data;
    } catch (error) {
        console.error('加载数据集基本信息失败:', error);
        throw error;
    }
}

// 加载 Markdown 文件
async function loadMarkdownFile(folderName) {
    try {
        const markdownPath = `${DATASETS_BASE_PATH}${folderName}/${DETAIL_FILE}`;
        const response = await fetch(markdownPath);
        
        if (!response.ok) {
            // 如果 Markdown 文件不存在，返回 null（不是错误）
            if (response.status === 404) {
                return null;
            }
            throw new Error(`无法加载 Markdown 文件: ${response.status}`);
        }
        
        const markdownText = await response.text();
        return markdownText;
    } catch (error) {
        console.error('加载 Markdown 文件失败:', error);
        return null;
    }
}

// 处理 Markdown 中的图片路径
function processMarkdownImages(markdown, folderName) {
    // 处理相对路径的图片
    // 将 ![alt](image.png) 转换为 ![alt](../datasets/folder-name/img/image.png)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    
    return markdown.replace(imageRegex, (match, alt, src) => {
        // 如果已经是完整 URL，不处理
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
            return match;
        }
        
        // 如果是绝对路径（以 / 开头），不处理
        if (src.startsWith('/')) {
            return match;
        }
        
        // 如果是相对路径，转换为相对于数据集文件夹内 img 文件夹的路径
        const imagePath = `${DATASETS_BASE_PATH}${folderName}/${IMAGES_FOLDER}${src}`;
        return `![${alt}](${imagePath})`;
    });
}

// 渲染基本信息
function renderBasicInfo(dataset) {
    const basicInfoDiv = document.getElementById('basic-info');
    const infoItems = [];
    
    if (dataset.year) {
        infoItems.push({
            label: '年份',
            value: dataset.year,
            icon: 'fas fa-calendar'
        });
    }
    
    if (dataset.organs) {
        infoItems.push({
            label: '器官类型',
            value: dataset.organs,
            icon: 'fas fa-lungs'
        });
    }
    
    if (dataset.staining) {
        infoItems.push({
            label: '染色类型',
            value: dataset.staining,
            icon: 'fas fa-palette'
        });
    }
    
    if (dataset.task) {
        infoItems.push({
            label: '任务类型',
            value: dataset.task,
            icon: 'fas fa-tasks'
        });
    }
    
    if (dataset.size) {
        infoItems.push({
            label: '数据集大小',
            value: dataset.size,
            icon: 'fas fa-hdd'
        });
    }
    
    if (dataset.data) {
        infoItems.push({
            label: '数据格式',
            value: dataset.data,
            icon: 'fas fa-file'
        });
    }
    
    if (dataset.type) {
        infoItems.push({
            label: '数据类型',
            value: dataset.type,
            icon: 'fas fa-image'
        });
    }
    
    if (dataset.other) {
        infoItems.push({
            label: '其他信息',
            value: dataset.other,
            icon: 'fas fa-info-circle'
        });
    }
    
    if (infoItems.length > 0) {
        basicInfoDiv.innerHTML = `
            <div class="info-grid">
                ${infoItems.map(item => `
                    <div class="info-item">
                        <div class="info-label">
                            <i class="${item.icon}"></i> ${item.label}
                        </div>
                        <div class="info-value">${item.value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        basicInfoDiv.innerHTML = '<p>暂无基本信息</p>';
    }
}

// 渲染 Markdown 内容
function renderMarkdown(markdownText, folderName) {
    const markdownDiv = document.getElementById('markdown-content');
    
    if (!markdownText || markdownText.trim() === '') {
        markdownDiv.innerHTML = '<p class="no-content">暂无详细信息</p>';
        return;
    }
    
    // 处理图片路径
    const processedMarkdown = processMarkdownImages(markdownText, folderName);
    
    // 配置 marked 选项
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,  // 支持换行
            gfm: true,     // GitHub Flavored Markdown
            sanitize: false, // 允许 HTML（用于更好的展示）
            smartLists: true,
            smartypants: true
        });
        
        // 渲染 Markdown
        const html = marked.parse(processedMarkdown);
        markdownDiv.innerHTML = html;
    } else {
        // 如果没有 marked 库，显示原始 Markdown（带格式）
        markdownDiv.innerHTML = `<pre class="markdown-raw">${escapeHtml(markdownText)}</pre>`;
    }
}

// HTML 转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 渲染相关链接
function renderLinks(links) {
    // 链接现在可以在 Markdown 中直接写，所以这个函数可以保留用于基本信息中的链接
    // 但主要链接应该在 Markdown 中展示
}

// 加载并渲染数据集详情
async function loadAndRenderDatasetDetail() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const content = document.getElementById('detail-content');
    
    const datasetId = getDatasetIdFromURL();
    
    if (!datasetId) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.querySelector('.error-text').textContent = '未指定数据集 ID';
        return;
    }
    
    try {
        // 检查是否在本地文件系统
        if (window.location.protocol === 'file:') {
            throw new Error('本地文件系统不支持 fetch API。请使用本地服务器（如 Live Server）或部署到 GitHub Pages 后访问。');
        }
        
        // 加载数据集基本信息
        const basicInfo = await loadDatasetBasicInfo(datasetId);
        const folderName = basicInfo.folderName || datasetId;
        
        // 加载 Markdown 文件
        const markdownText = await loadMarkdownFile(folderName);
        
        // 渲染标题
        document.getElementById('dataset-name').textContent = basicInfo.name;
        if (basicInfo.year) {
            document.getElementById('dataset-year').textContent = `(${basicInfo.year})`;
        }
        
        // 渲染元信息标签
        const metaHeader = document.getElementById('dataset-meta-header');
        const metaTags = [];
        if (basicInfo.organs) metaTags.push(`<span class="meta-badge"><i class="fas fa-lungs"></i> ${basicInfo.organs}</span>`);
        if (basicInfo.staining) metaTags.push(`<span class="meta-badge"><i class="fas fa-palette"></i> ${basicInfo.staining}</span>`);
        if (basicInfo.task) metaTags.push(`<span class="meta-badge"><i class="fas fa-tasks"></i> ${basicInfo.task}</span>`);
        if (basicInfo.type) metaTags.push(`<span class="meta-badge"><i class="fas fa-image"></i> ${basicInfo.type}</span>`);
        metaHeader.innerHTML = metaTags.join('');
        
        // 渲染基本信息
        renderBasicInfo(basicInfo);
        
        // 渲染 Markdown 内容
        renderMarkdown(markdownText, folderName);
        
        // 更新页面标题
        document.title = `${basicInfo.name} - 数据集详情 | YJW's Homepage`;
        
        // 显示内容
        loading.style.display = 'none';
        error.style.display = 'none';
        content.style.display = 'block';
        
    } catch (e) {
        console.error('加载数据集详情失败:', e);
        loading.style.display = 'none';
        error.style.display = 'block';
        error.querySelector('.error-text').textContent = `加载失败: ${e.message}`;
    }
}

// 页面加载时执行
window.addEventListener('DOMContentLoaded', () => {
    loadAndRenderDatasetDetail();
});
