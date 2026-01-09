// 数据集页面专用 JavaScript

// 从配置读取数据集路径
const DATASETS_CONFIG = SITE_CONFIG.datasets || {};
// 根据当前页面位置确定路径
// 如果在 templates 文件夹中，使用 ../datasets/；如果在根目录，使用 datasets/
const currentPath = window.location.pathname || window.location.href;
const isInTemplates = currentPath.includes('templates/') || currentPath.includes('/templates/');
const DATASETS_BASE_PATH = isInTemplates ? '../datasets/' : 'datasets/';
// 索引文件现在在 datasets 文件夹中，是列表格式，使用下划线前缀使其排在前面
const DATASETS_INDEX_PATH = `${DATASETS_BASE_PATH}_datasets.json`;

// 调试信息
console.log('数据集路径配置:', {
    currentPath: currentPath,
    isInTemplates: isInTemplates,
    DATASETS_BASE_PATH: DATASETS_BASE_PATH,
    DATASETS_INDEX_PATH: DATASETS_INDEX_PATH
});

// 存储所有数据集
let allDatasets = [];
let filteredDatasets = [];

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

// 加载所有数据集（从 _datasets.json 列表格式）
async function loadDatasetsList() {
    try {
        console.log('正在加载数据集列表:', DATASETS_INDEX_PATH);
        const response = await fetch(DATASETS_INDEX_PATH);
        if (!response.ok) {
            console.error('加载数据集列表失败:', {
                status: response.status,
                statusText: response.statusText,
                url: DATASETS_INDEX_PATH
            });
            throw new Error(`Failed to load datasets: ${response.status} - ${response.statusText}`);
        }
        const datasetsList = await response.json();
        
        if (!Array.isArray(datasetsList)) {
            throw new Error('_datasets.json 格式错误：应该是数组格式');
        }
        
        console.log('成功加载数据集列表，找到', datasetsList.length, '个数据集');
        
        // 处理每个数据集
        return datasetsList.map(dataset => {
            // 确保 id 字段存在
            if (!dataset.id) {
                console.warn('数据集缺少 id 字段:', dataset);
                return null;
            }
            // 解析任务类型（支持数组和字符串格式）
            dataset.tasks = parseTasks(dataset.task);
            // 如果 task 是数组，转换为字符串用于显示
            if (Array.isArray(dataset.task)) {
                dataset.task = dataset.task.join(' + ');
            }
            return dataset;
        }).filter(ds => ds !== null);
    } catch (error) {
        console.error('加载数据集列表失败:', error);
        throw error;
    }
}

// 加载所有数据集
async function loadAllDatasets() {
    try {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const container = document.getElementById('datasets-table-container');
        
        // 检查是否在本地文件系统
        if (window.location.protocol === 'file:') {
            throw new Error('本地文件系统不支持 fetch API。请使用本地服务器（如 Live Server）或部署到 GitHub Pages 后访问。');
        }
        
        loading.style.display = 'block';
        error.style.display = 'none';
        container.style.display = 'none';
        
        // 直接加载数据集列表（列表格式，包含所有信息）
        allDatasets = await loadDatasetsList();
        
        if (allDatasets.length === 0) {
            throw new Error('没有成功加载任何数据集');
        }
        
        // 按数据集名称的字符顺序排序
        allDatasets.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB, 'zh-CN');
        });
        
        // 初始化筛选器
        initializeFilters();
        
        loading.style.display = 'none';
        error.style.display = 'none';
        container.style.display = 'block';
        
        // 应用筛选（显示所有数据集）
        applyFilters();
        
    } catch (e) {
        console.error('加载所有数据集失败:', e);
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const container = document.getElementById('datasets-table-container');
        loading.style.display = 'none';
        error.style.display = 'block';
        error.querySelector('.error-text').textContent = `加载失败: ${e.message}`;
        container.style.display = 'none';
    }
}

// 初始化筛选器
function initializeFilters() {
    // 收集所有唯一值
    const organsSet = new Set();
    const stainingSet = new Set();
    const taskSet = new Set();
    const yearSet = new Set();
    
    allDatasets.forEach(dataset => {
        if (dataset.organs) organsSet.add(dataset.organs);
        if (dataset.staining) stainingSet.add(dataset.staining);
        if (dataset.tasks && dataset.tasks.length > 0) {
            dataset.tasks.forEach(task => taskSet.add(task));
        }
        if (dataset.year) yearSet.add(dataset.year);
    });
    
    // 填充下拉选择框
    populateSelect('filter-organs', Array.from(organsSet).sort());
    populateSelect('filter-staining', Array.from(stainingSet).sort());
    populateSelect('filter-year', Array.from(yearSet).sort().reverse());
    
    // 初始化任务类型多选
    initializeTaskFilter(Array.from(taskSet).sort());
}

// 初始化任务类型多选下拉菜单
function initializeTaskFilter(tasks) {
    const container = document.getElementById('filter-task-container');
    const toggle = document.getElementById('filter-task-toggle');
    const selectedText = document.getElementById('filter-task-selected');
    
    container.innerHTML = '';
    
    tasks.forEach(task => {
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
    const organsFilter = document.getElementById('filter-organs').value;
    const stainingFilter = document.getElementById('filter-staining').value;
    const yearFilter = document.getElementById('filter-year').value;
    const searchName = document.getElementById('search-name').value.toLowerCase().trim();
    
    // 获取选中的任务类型
    const selectedTasks = Array.from(document.querySelectorAll('#filter-task-container input[type="checkbox"]:checked'))
        .map(cb => cb.value.toLowerCase());
    
    filteredDatasets = allDatasets.filter(dataset => {
        // 器官筛选
        if (organsFilter && dataset.organs !== organsFilter) return false;
        
        // 染色筛选
        if (stainingFilter && dataset.staining !== stainingFilter) return false;
        
        // 任务筛选（多选）- 数据集必须包含所有选中的任务
        if (selectedTasks.length > 0) {
            const datasetTasks = dataset.tasks || [];
            const hasAllTasks = selectedTasks.every(selectedTask => 
                datasetTasks.some(dt => dt === selectedTask)
            );
            if (!hasAllTasks) return false;
        }
        
        // 年份筛选
        if (yearFilter && String(dataset.year) !== yearFilter) return false;
        
        // 名称搜索
        if (searchName && !dataset.name.toLowerCase().includes(searchName)) return false;
        
        return true;
    });
    
    // 按数据集名称的字符顺序排序
    filteredDatasets.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB, 'zh-CN');
    });
    
    // 更新计数
    document.getElementById('dataset-count').innerHTML = `共 <strong>${filteredDatasets.length}</strong> 个数据集`;
    
    // 渲染表格
    renderTable();
}

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('datasets-tbody');
    tbody.innerHTML = '';
    
    if (filteredDatasets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">没有找到匹配的数据集</td></tr>';
        return;
    }
    
    filteredDatasets.forEach((dataset, index) => {
        const row = document.createElement('tr');
        
        // 第一列：数据集名称 (年份) - 可点击跳转到详情页
        const nameCell = document.createElement('td');
        nameCell.className = 'dataset-name-cell';
        const datasetId = dataset.id || dataset.name.toLowerCase().replace(/\s+/g, '-');
        nameCell.innerHTML = `
            <div class="dataset-name">
                <a href="dataset-detail.html?id=${datasetId}" class="dataset-name-link">
                    <strong>${dataset.name}</strong>
                    ${dataset.year ? `<span class="dataset-year">(${dataset.year})</span>` : ''}
                    <i class="fas fa-external-link-alt link-icon"></i>
                </a>
            </div>
            <div class="dataset-meta">
                ${dataset.organs ? `<span class="meta-tag"><i class="fas fa-lungs"></i> ${dataset.organs}</span>` : ''}
                ${dataset.staining ? `<span class="meta-tag"><i class="fas fa-palette"></i> ${dataset.staining}</span>` : ''}
                ${dataset.task ? `<span class="meta-tag"><i class="fas fa-tasks"></i> ${Array.isArray(dataset.task) ? dataset.task.join(' + ') : dataset.task}</span>` : ''}
            </div>
        `;
        
        // 第二列：文献/数据链接
        const linksCell = document.createElement('td');
        linksCell.className = 'dataset-links-cell';
        const linksHtml = [];
        if (dataset.links) {
            if (dataset.links.data) {
                linksHtml.push(`<a href="${dataset.links.data}" target="_blank" class="link-btn"><i class="fas fa-database"></i> 数据</a>`);
            }
            if (dataset.links.paper) {
                linksHtml.push(`<a href="${dataset.links.paper}" target="_blank" class="link-btn"><i class="fas fa-file-pdf"></i> 论文</a>`);
            }
            if (dataset.links.github) {
                linksHtml.push(`<a href="${dataset.links.github}" target="_blank" class="link-btn"><i class="fab fa-github"></i> GitHub</a>`);
            }
        }
        linksCell.innerHTML = linksHtml.length > 0 ? linksHtml.join(' ') : '<span class="no-link">暂无链接</span>';
        
        // 第三列：其他信息
        const infoCell = document.createElement('td');
        infoCell.className = 'dataset-info-cell';
        const infoItems = [];
        if (dataset.size) {
            infoItems.push(`<div class="info-row"><i class="fas fa-hdd"></i> <strong>大小:</strong> ${dataset.size}</div>`);
        }
        if (dataset.data) {
            infoItems.push(`<div class="info-row"><i class="fas fa-file"></i> <strong>数据:</strong> ${dataset.data}</div>`);
        }
        if (dataset.type) {
            infoItems.push(`<div class="info-row"><i class="fas fa-image"></i> <strong>类型:</strong> ${dataset.type}</div>`);
        }
        if (dataset.other) {
            infoItems.push(`<div class="info-row"><i class="fas fa-info-circle"></i> <strong>其他:</strong> ${dataset.other}</div>`);
        }
        if (dataset.description) {
            infoItems.push(`<div class="info-row description"><i class="fas fa-align-left"></i> ${dataset.description}</div>`);
        }
        infoCell.innerHTML = infoItems.length > 0 ? infoItems.join('') : '<span class="no-info">暂无信息</span>';
        
        row.appendChild(nameCell);
        row.appendChild(linksCell);
        row.appendChild(infoCell);
        tbody.appendChild(row);
    });
}

// 重置筛选
function resetFilters() {
    document.getElementById('filter-organs').value = '';
    document.getElementById('filter-staining').value = '';
    document.getElementById('filter-year').value = '';
    document.getElementById('search-name').value = '';
    
    // 取消所有任务类型选择
    document.querySelectorAll('#filter-task-container input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // 更新显示文本
    updateTaskFilterDisplay();
    
    // 关闭下拉菜单
    const toggle = document.getElementById('filter-task-toggle');
    const container = document.getElementById('filter-task-container');
    toggle.classList.remove('active');
    container.classList.remove('show');
    
    applyFilters();
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 加载数据集
    loadAllDatasets();
    
    // 筛选器事件
    document.getElementById('filter-organs').addEventListener('change', applyFilters);
    document.getElementById('filter-staining').addEventListener('change', applyFilters);
    document.getElementById('filter-year').addEventListener('change', applyFilters);
    document.getElementById('search-name').addEventListener('input', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
});
