// 知识点页面专用 JavaScript

// 从配置读取知识点路径
const KNOWLEDGE_POINTS_CONFIG = SITE_CONFIG.papers || {};
// 根据当前页面位置确定路径
const currentPath = window.location.pathname || window.location.href;
const isInTemplates = currentPath.includes('templates/') || currentPath.includes('/templates/');
const KNOWLEDGE_POINTS_BASE_PATH = isInTemplates ? '../papers/' : 'papers/';
// 索引文件现在在 papers 文件夹中，是列表格式，使用下划线前缀使其排在前面
const KNOWLEDGE_POINTS_INDEX_PATH = `${KNOWLEDGE_POINTS_BASE_PATH}_papers.json`;

// 调试信息
console.log('知识点路径配置:', {
    currentPath: currentPath,
    isInTemplates: isInTemplates,
    KNOWLEDGE_POINTS_BASE_PATH: KNOWLEDGE_POINTS_BASE_PATH,
    KNOWLEDGE_POINTS_INDEX_PATH: KNOWLEDGE_POINTS_INDEX_PATH
});

// 存储所有知识点
let allKnowledgePoints = [];
let filteredKnowledgePoints = [];

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

// 从知识点中提取所有任务类型
function extractAllTasks(knowledgePoint) {
    const taskSet = new Set();
    if (knowledgePoint.papers && Array.isArray(knowledgePoint.papers)) {
        knowledgePoint.papers.forEach(paper => {
            if (paper.task) {
                const tasks = parseTasks(paper.task);
                tasks.forEach(task => taskSet.add(task));
            }
        });
    }
    return Array.from(taskSet);
}

// 从知识点中提取所有年份
function extractAllYears(knowledgePoint) {
    const yearSet = new Set();
    if (knowledgePoint.papers && Array.isArray(knowledgePoint.papers)) {
        knowledgePoint.papers.forEach(paper => {
            if (paper.year) {
                yearSet.add(paper.year);
            }
        });
    }
    return Array.from(yearSet);
}

// 加载所有知识点（从 _papers.json 列表格式）
async function loadKnowledgePointsList() {
    try {
        console.log('正在加载知识点列表:', KNOWLEDGE_POINTS_INDEX_PATH);
        const response = await fetch(KNOWLEDGE_POINTS_INDEX_PATH);
        if (!response.ok) {
            console.error('加载知识点列表失败:', {
                status: response.status,
                statusText: response.statusText,
                url: KNOWLEDGE_POINTS_INDEX_PATH
            });
            throw new Error(`Failed to load knowledge points: ${response.status} - ${response.statusText}`);
        }
        const knowledgePointsList = await response.json();
        
        if (!Array.isArray(knowledgePointsList)) {
            throw new Error('_papers.json 格式错误：应该是数组格式');
        }
        
        console.log('成功加载知识点列表，找到', knowledgePointsList.length, '个知识点');
        
        // 处理每个知识点
        return knowledgePointsList.map(kp => {
            // 确保 id 字段存在
            if (!kp.id) {
                console.warn('知识点缺少 id 字段:', kp);
                return null;
            }
            // 提取所有任务类型
            kp.allTasks = extractAllTasks(kp);
            // 提取所有年份
            kp.allYears = extractAllYears(kp);
            return kp;
        }).filter(kp => kp !== null);
    } catch (error) {
        console.error('加载知识点列表失败:', error);
        throw error;
    }
}

// 加载所有知识点
async function loadAllKnowledgePoints() {
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
        
        // 直接加载知识点列表（列表格式，包含所有信息）
        allKnowledgePoints = await loadKnowledgePointsList();
        
        if (allKnowledgePoints.length === 0) {
            throw new Error('没有成功加载任何知识点');
        }
        
        // 按知识点标题的字符顺序排序
        allKnowledgePoints.sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            return titleA.localeCompare(titleB, 'zh-CN');
        });
        
        // 初始化筛选器
        initializeFilters();
        
        // 应用筛选（初始显示所有知识点）
        applyFilters();
        
        loading.style.display = 'none';
        container.style.display = 'block';
        
    } catch (error) {
        console.error('加载知识点失败:', error);
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
    const categorySet = new Set();
    
    allKnowledgePoints.forEach(kp => {
        // 任务类型
        if (kp.allTasks && Array.isArray(kp.allTasks)) {
            kp.allTasks.forEach(task => taskSet.add(task));
        }
        // 年份
        if (kp.allYears && Array.isArray(kp.allYears)) {
            kp.allYears.forEach(year => yearSet.add(year));
        }
        // 分类
        if (kp.category) {
            categorySet.add(kp.category);
        }
    });
    
    // 初始化任务类型筛选器（多选下拉菜单）
    initializeTaskFilter(Array.from(taskSet).sort());
    
    // 填充年份下拉框
    populateSelect('filter-year', Array.from(yearSet).sort().reverse());
    
    // 填充分类下拉框（如果有）
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
        populateSelect('filter-category', Array.from(categorySet).sort());
    }
    
    // 绑定事件监听器
    document.getElementById('filter-year').addEventListener('change', applyFilters);
    const categoryFilter = document.getElementById('filter-category');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
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
    const categoryFilter = document.getElementById('filter-category');
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    
    // 获取选中的任务类型
    const selectedTasks = Array.from(document.querySelectorAll('#filter-task-container input[type="checkbox"]:checked'))
        .map(cb => cb.value.toLowerCase());
    
    filteredKnowledgePoints = allKnowledgePoints.filter(kp => {
        // 年份筛选（如果知识点的任何论文匹配）
        if (yearFilter) {
            const hasMatchingYear = kp.allYears && kp.allYears.includes(parseInt(yearFilter));
            if (!hasMatchingYear) return false;
        }
        
        // 任务筛选（多选）- 知识点必须包含所有选中的任务
        if (selectedTasks.length > 0) {
            const kpTasks = kp.allTasks || [];
            const hasAllTasks = selectedTasks.every(selectedTask => 
                kpTasks.some(kt => kt === selectedTask)
            );
            if (!hasAllTasks) return false;
        }
        
        // 分类筛选
        if (categoryValue && kp.category !== categoryValue) return false;
        
        // 名称搜索（搜索标题、摘要、标签等）
        if (searchName) {
            const searchText = [
                kp.title || '',
                kp.summary || '',
                kp.insights || '',
                (kp.tags || []).join(' ')
            ].join(' ').toLowerCase();
            if (!searchText.includes(searchName)) return false;
        }
        
        return true;
    });
    
    // 按知识点标题的字符顺序排序
    filteredKnowledgePoints.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        return titleA.localeCompare(titleB, 'zh-CN');
    });
    
    // 更新计数
    document.getElementById('paper-count').innerHTML = `共 <strong>${filteredKnowledgePoints.length}</strong> 个知识点`;
    
    // 渲染表格
    renderTable();
}

// 重置筛选器
function resetFilters() {
    document.getElementById('filter-year').value = '';
    document.getElementById('search-name').value = '';
    const categoryFilter = document.getElementById('filter-category');
    if (categoryFilter) {
        categoryFilter.value = '';
    }
    
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
    
    if (filteredKnowledgePoints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">没有找到匹配的知识点</td></tr>';
        return;
    }
    
    filteredKnowledgePoints.forEach((kp, index) => {
        const row = document.createElement('tr');
        
        // 第一列：知识点标题 - 可点击跳转到详情页
        const titleCell = document.createElement('td');
        titleCell.className = 'paper-name-cell';
        const kpId = kp.id;
        titleCell.innerHTML = `
            <div class="paper-name">
                <a href="paper-detail.html?id=${kpId}" class="paper-name-link">
                    <strong>${kp.title || '未命名知识点'}</strong>
                    <i class="fas fa-external-link-alt link-icon"></i>
                </a>
            </div>
            <div class="paper-meta">
                ${kp.category ? `<span class="meta-tag"><i class="fas fa-folder"></i> ${kp.category}</span>` : ''}
                ${kp.allTasks && kp.allTasks.length > 0 ? `<span class="meta-tag"><i class="fas fa-tasks"></i> ${kp.allTasks.join(', ')}</span>` : ''}
                ${kp.papers && kp.papers.length > 0 ? `<span class="meta-tag"><i class="fas fa-book"></i> ${kp.papers.length} 篇论文</span>` : ''}
            </div>
        `;
        
        // 第二列：相关论文
        const papersCell = document.createElement('td');
        papersCell.className = 'paper-authors-cell';
        if (kp.papers && kp.papers.length > 0) {
            const papersHtml = kp.papers.slice(0, 3).map(paper => {
                const displayName = paper.shortName || paper.name;
                const year = paper.year ? ` (${paper.year})` : '';
                return `<div class="info-row">
                    <i class="fas fa-file-alt"></i>
                    <span>${displayName}${year}</span>
                </div>`;
            }).join('');
            const morePapers = kp.papers.length > 3 ? `<div class="info-row" style="color: var(--text-light); font-size: 0.85rem;">还有 ${kp.papers.length - 3} 篇论文...</div>` : '';
            papersCell.innerHTML = papersHtml + morePapers;
        } else {
            papersCell.innerHTML = '<span class="no-info">暂无相关论文</span>';
        }
        
        // 第三列：其他信息
        const infoCell = document.createElement('td');
        infoCell.className = 'paper-info-cell';
        const infoHtml = [];
        if (kp.summary) {
            infoHtml.push(`
                <div class="info-row">
                    <i class="fas fa-lightbulb"></i>
                    <strong>核心思想：</strong>${kp.summary.length > 100 ? kp.summary.substring(0, 100) + '...' : kp.summary}
                </div>
            `);
        }
        if (kp.insights) {
            infoHtml.push(`
                <div class="info-row">
                    <i class="fas fa-comment-dots"></i>
                    <strong>个人心得：</strong>${kp.insights.length > 100 ? kp.insights.substring(0, 100) + '...' : kp.insights}
                </div>
            `);
        }
        if (kp.tags && kp.tags.length > 0) {
            infoHtml.push(`
                <div class="info-row">
                    <i class="fas fa-tags"></i>
                    <strong>标签：</strong>${kp.tags.join(', ')}
                </div>
            `);
        }
        infoCell.innerHTML = infoHtml.length > 0 ? infoHtml.join('') : '<span class="no-info">暂无其他信息</span>';
        
        row.appendChild(titleCell);
        row.appendChild(papersCell);
        row.appendChild(infoCell);
        tbody.appendChild(row);
    });
}

// 页面加载时执行
window.addEventListener('DOMContentLoaded', () => {
    loadAllKnowledgePoints();
});
