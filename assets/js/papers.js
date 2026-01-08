// 论文页面专用 JavaScript

// 从配置读取论文路径
const PAPERS_CONFIG = SITE_CONFIG.papers || {};
// 根据当前页面位置确定路径
const currentPath = window.location.pathname || window.location.href;
const isInTemplates = currentPath.includes('templates/') || currentPath.includes('/templates/');
const PAPERS_BASE_PATH = isInTemplates ? '../papers/' : 'papers/';
// 索引文件现在在根目录
const PAPERS_INDEX_PATH = isInTemplates ? '../papers.json' : 'papers.json';
const INFO_FILE = PAPERS_CONFIG.files?.info || 'info.json';

// 调试信息
console.log('论文路径配置:', {
    currentPath: currentPath,
    isInTemplates: isInTemplates,
    PAPERS_BASE_PATH: PAPERS_BASE_PATH,
    PAPERS_INDEX_PATH: PAPERS_INDEX_PATH
});

// 存储所有论文
let allPapers = [];
let filteredPapers = [];

// 解析任务类型（支持字符串和数组格式）
function parseTasks(task) {
    if (!task) return [];
    // 如果是数组，直接返回（转换为小写）
    if (Array.isArray(task)) {
        return task.map(t => String(t).trim().toLowerCase()).filter(t => t.length > 0);
    }
    // 如果是字符串，支持多种分隔符：+、,、|、空格
    if (typeof task === 'string') {
        return task
            .split(/[+,\|]/)
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);
    }
    return [];
}

// 加载论文索引（字典格式：{ "0001": "论文名称", ... }）
async function loadPapersIndex() {
    try {
        console.log('正在加载论文索引:', PAPERS_INDEX_PATH);
        const response = await fetch(PAPERS_INDEX_PATH);
        if (!response.ok) {
            console.error('加载索引失败:', {
                status: response.status,
                statusText: response.statusText,
                url: PAPERS_INDEX_PATH
            });
            throw new Error(`Failed to load index: ${response.status} - ${response.statusText}`);
        }
        const indexData = await response.json();
        // 如果是数组格式（旧格式），转换为字典格式
        let folderList;
        if (Array.isArray(indexData)) {
            // 旧格式：数组，直接使用
            folderList = indexData;
            console.log('检测到旧格式索引（数组），找到', folderList.length, '篇论文');
        } else {
            // 新格式：字典，提取 key（数字 ID）
            folderList = Object.keys(indexData).sort();
            console.log('成功加载论文索引（字典格式），找到', folderList.length, '篇论文');
        }
        return folderList;
    } catch (error) {
        console.error('加载论文索引失败:', error);
        throw error;
    }
}

// 加载单个论文（从文件夹内的 info.json）
async function loadPaper(folderName) {
    try {
        const infoPath = `${PAPERS_BASE_PATH}${folderName}/${INFO_FILE}`;
        const response = await fetch(infoPath);
        if (!response.ok) {
            console.warn(`论文 ${folderName} 的 ${INFO_FILE} 文件不存在或无法加载`);
            return null;
        }
        const data = await response.json();
        // 添加文件夹名称作为 id（如果没有 id）
        if (!data.id) {
            data.id = folderName;
        }
        // 解析任务类型（支持数组和字符串格式）
        data.tasks = parseTasks(data.task);
        // 如果 task 是字符串，保留原值用于显示；如果是数组，转换为字符串显示
        if (Array.isArray(data.task)) {
            data.task = data.task.join(' + ');
        }
        return data;
    } catch (error) {
        console.error(`加载论文 ${folderName} 失败:`, error);
        return null;
    }
}

// 加载所有论文
async function loadAllPapers() {
    try {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const container = document.getElementById('papers-table-container');
        
        // 检查是否在本地文件系统
        if (window.location.protocol === 'file:') {
            throw new Error('本地文件系统不支持 fetch API。请使用本地服务器（如 Live Server）或部署到 GitHub Pages 后访问。');
        }
        
        loading.style.display = 'block';
        error.style.display = 'none';
        container.style.display = 'none';
        
        // 加载索引（文件夹列表）
        const folderList = await loadPapersIndex();
        
        if (!folderList || folderList.length === 0) {
            throw new Error('论文索引文件为空');
        }
        
        // 并行加载所有论文
        const paperPromises = folderList.map(folderName => loadPaper(folderName));
        const papers = await Promise.all(paperPromises);
        
        // 过滤掉加载失败的论文
        allPapers = papers.filter(p => p !== null);
        
        if (allPapers.length === 0) {
            throw new Error('没有成功加载任何论文');
        }
        
        // 按数据集名称的字符顺序排序
        allPapers.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB, 'zh-CN');
        });
        
        // 初始化筛选器
        initializeFilters();
        
        // 应用筛选（初始显示所有论文）
        applyFilters();
        
        loading.style.display = 'none';
        container.style.display = 'block';
        
    } catch (error) {
        console.error('加载论文失败:', error);
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

// 初始化筛选器
function initializeFilters() {
    // 收集所有唯一值
    const taskSet = new Set();
    const yearSet = new Set();
    
    allPapers.forEach(paper => {
        // 任务类型
        if (paper.tasks && Array.isArray(paper.tasks)) {
            paper.tasks.forEach(task => taskSet.add(task));
        }
        // 年份
        if (paper.year) {
            yearSet.add(paper.year);
        }
    });
    
    // 初始化任务类型筛选器（多选下拉菜单）
    initializeTaskFilter(Array.from(taskSet).sort());
    
    // 填充年份下拉框
    populateSelect('filter-year', Array.from(yearSet).sort().reverse());
    
    // 绑定事件监听器
    document.getElementById('filter-year').addEventListener('change', applyFilters);
    document.getElementById('search-name').addEventListener('input', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

// 初始化任务类型筛选器（多选下拉菜单）
function initializeTaskFilter(uniqueTasks) {
    const toggle = document.getElementById('filter-task-toggle');
    const container = document.getElementById('filter-task-container');
    const selectedText = document.getElementById('filter-task-selected');
    
    container.innerHTML = ''; // 清空之前的内容
    
    uniqueTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `task-${task}`;
        checkbox.value = task;
        checkbox.addEventListener('change', () => {
            updateTaskFilterDisplay();
            applyFilters();
        });
        
        const label = document.createElement('label');
        label.htmlFor = `task-${task}`;
        label.textContent = task;
        
        item.appendChild(checkbox);
        item.appendChild(label);
        container.appendChild(item);
    });
    
    // 点击切换按钮展开/收起下拉菜单
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = toggle.classList.contains('active');
        if (isActive) {
            toggle.classList.remove('active');
            container.classList.remove('show');
        } else {
            toggle.classList.add('active');
            container.classList.add('show');
        }
    });
    
    // 点击外部区域关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !container.contains(e.target)) {
            toggle.classList.remove('active');
            container.classList.remove('show');
        }
    });
    
    // 更新显示文本
    updateTaskFilterDisplay();
}

// 更新任务筛选器显示文本
function updateTaskFilterDisplay() {
    const selectedTasks = Array.from(document.querySelectorAll('#filter-task-container input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    const selectedText = document.getElementById('filter-task-selected');
    
    if (selectedTasks.length === 0) {
        selectedText.textContent = '全部';
    } else if (selectedTasks.length === 1) {
        selectedText.textContent = selectedTasks[0];
    } else {
        selectedText.textContent = `已选择 ${selectedTasks.length} 项`;
    }
}

// 填充下拉选择框
function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // 保留"全部"选项
    const firstOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (firstOption) {
        select.appendChild(firstOption);
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

// 应用筛选
function applyFilters() {
    const yearFilter = document.getElementById('filter-year').value;
    const searchName = document.getElementById('search-name').value.toLowerCase().trim();
    
    // 获取选中的任务类型
    const selectedTasks = Array.from(document.querySelectorAll('#filter-task-container input[type="checkbox"]:checked'))
        .map(cb => cb.value.toLowerCase());
    
    filteredPapers = allPapers.filter(paper => {
        // 年份筛选
        if (yearFilter && String(paper.year) !== yearFilter) return false;
        
        // 任务筛选（多选）- 论文必须包含所有选中的任务
        if (selectedTasks.length > 0) {
            const paperTasks = paper.tasks || [];
            const hasAllTasks = selectedTasks.every(selectedTask => 
                paperTasks.some(pt => pt === selectedTask)
            );
            if (!hasAllTasks) return false;
        }
        
        // 名称搜索
        if (searchName && !paper.name.toLowerCase().includes(searchName)) return false;
        
        return true;
    });
    
    // 按数据集名称的字符顺序排序
    filteredPapers.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB, 'zh-CN');
    });
    
    // 更新计数
    document.getElementById('paper-count').innerHTML = `共 <strong>${filteredPapers.length}</strong> 篇论文`;
    
    // 渲染表格
    renderTable();
}

// 重置筛选器
function resetFilters() {
    document.getElementById('filter-year').value = '';
    document.getElementById('search-name').value = '';
    
    // 取消所有任务类型复选框
    document.querySelectorAll('#filter-task-container input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    updateTaskFilterDisplay();
    applyFilters();
}

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('papers-tbody');
    tbody.innerHTML = '';
    
    if (filteredPapers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">没有找到匹配的论文</td></tr>';
        return;
    }
    
    filteredPapers.forEach((paper, index) => {
        const row = document.createElement('tr');
        
        // 第一列：论文名称 (年份) - 可点击跳转到详情页
        // 显示缩写，如果有 shortName 就用 shortName，否则用 name
        const nameCell = document.createElement('td');
        nameCell.className = 'paper-name-cell';
        const paperId = paper.id || paper.name.toLowerCase().replace(/\s+/g, '-');
        const displayName = paper.shortName || paper.name; // 优先使用 shortName
        nameCell.innerHTML = `
            <div class="paper-name">
                <a href="paper-detail.html?id=${paperId}" class="paper-name-link">
                    <strong>${displayName}</strong>
                    ${paper.year ? `<span class="paper-year">(${paper.year})</span>` : ''}
                    <i class="fas fa-external-link-alt link-icon"></i>
                </a>
            </div>
            <div class="paper-meta">
                ${paper.task ? `<span class="meta-tag"><i class="fas fa-tasks"></i> ${Array.isArray(paper.task) ? paper.task.join(' + ') : paper.task}</span>` : ''}
            </div>
        `;
        
        // 第二列：作者/会议
        const authorsCell = document.createElement('td');
        authorsCell.className = 'paper-authors-cell';
        authorsCell.innerHTML = `
            ${paper.authors ? `
                <div class="info-row">
                    <i class="fas fa-users"></i>
                    <span>${paper.authors}</span>
                </div>
            ` : ''}
            ${paper.venue ? `
                <div class="info-row">
                    <i class="fas fa-building"></i>
                    <span>${paper.venue}</span>
                </div>
            ` : ''}
        `;
        
        // 第三列：其他信息
        const infoCell = document.createElement('td');
        infoCell.className = 'paper-info-cell';
        const infoHtml = [];
        // 如果有全称（name）且与显示名称（shortName）不同，则显示全称
        if (paper.name && paper.shortName && paper.name !== paper.shortName) {
            infoHtml.push(`
                <div class="info-row">
                    <i class="fas fa-file-alt"></i>
                    <strong>全称：</strong>${paper.name}
                </div>
            `);
        }
        if (paper.summary) {
            infoHtml.push(`
                <div class="info-row">
                    <i class="fas fa-lightbulb"></i>
                    <strong>核心思想：</strong>${paper.summary.length > 100 ? paper.summary.substring(0, 100) + '...' : paper.summary}
                </div>
            `);
        }
        if (paper.insights) {
            infoHtml.push(`
                <div class="info-row">
                    <i class="fas fa-comment-dots"></i>
                    <strong>个人心得：</strong>${paper.insights.length > 100 ? paper.insights.substring(0, 100) + '...' : paper.insights}
                </div>
            `);
        }
        if (paper.links) {
            const linksHtml = [];
            if (paper.links.pdf) {
                linksHtml.push(`<a href="${paper.links.pdf}" target="_blank" class="link-btn"><i class="fas fa-file-pdf"></i> PDF</a>`);
            }
            if (paper.links.code) {
                linksHtml.push(`<a href="${paper.links.code}" target="_blank" class="link-btn"><i class="fab fa-github"></i> Code</a>`);
            }
            if (linksHtml.length > 0) {
                infoHtml.push(`<div class="info-row">${linksHtml.join(' ')}</div>`);
            }
        }
        infoCell.innerHTML = infoHtml.length > 0 ? infoHtml.join('') : '<span class="no-info">暂无其他信息</span>';
        
        row.appendChild(nameCell);
        row.appendChild(authorsCell);
        row.appendChild(infoCell);
        tbody.appendChild(row);
    });
}

// 页面加载时执行
window.addEventListener('DOMContentLoaded', () => {
    loadAllPapers();
});
