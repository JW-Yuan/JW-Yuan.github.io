// 项目页面专用 JavaScript
// 配置从根目录 config.js 中的 SITE_CONFIG 读取

// 从配置文件读取项目配置
const PROJECTS_CONFIG = SITE_CONFIG.projects;
const PROJECTS_MODE = PROJECTS_CONFIG.mode;
const GITHUB_USERNAME = PROJECTS_CONFIG.githubUsername;
const MANUAL_REPOS = PROJECTS_CONFIG.manualRepos;

// 语言颜色映射
const languageColors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'C#': '#239120',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#ffac45',
    'Kotlin': '#A97BFF',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Vue': '#4fc08d',
    'React': '#61dafb',
    'Shell': '#89e051',
    'Dockerfile': '#384d54',
    'Jupyter Notebook': '#DA5B0B',
    'MATLAB': '#e16737',
    'R': '#198CE7',
    'Scala': '#c22d40',
    'Perl': '#0298c3',
    'Lua': '#000080',
    'Clojure': '#db5855',
    'Haskell': '#5e5086',
    'Erlang': '#B83998',
    'Elixir': '#6e4a7e',
    'OCaml': '#3be133',
    'F#': '#b845fc',
    'Dart': '#00b4ab',
    'Objective-C': '#438eff',
    'PowerShell': '#012456',
    'TeX': '#3D6117',
    'Vim script': '#199f4b',
    'Makefile': '#427819',
    'CMake': '#064F8C',
    'Assembly': '#6E4C13',
    'Other': '#6e4a7e'
};

// 根据语言获取图标
function getLanguageIcon(language) {
    const iconMap = {
        'JavaScript': 'fab fa-js',
        'TypeScript': 'fab fa-js-square',
        'Python': 'fab fa-python',
        'Java': 'fab fa-java',
        'C++': 'fas fa-code',
        'C': 'fas fa-code',
        'C#': 'fab fa-microsoft',
        'Go': 'fab fa-go',
        'Rust': 'fab fa-rust',
        'PHP': 'fab fa-php',
        'Ruby': 'fab fa-ruby',
        'Swift': 'fab fa-swift',
        'Kotlin': 'fab fa-android',
        'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt',
        'Vue': 'fab fa-vuejs',
        'React': 'fab fa-react',
        'Shell': 'fas fa-terminal',
        'Jupyter Notebook': 'fab fa-python',
        'MATLAB': 'fas fa-chart-line',
        'R': 'fab fa-r-project',
        'Dockerfile': 'fab fa-docker',
        'Other': 'fas fa-code'
    };
    return iconMap[language] || 'fas fa-code';
}

// 获取语言颜色
function getLanguageColor(language) {
    return languageColors[language] || languageColors['Other'];
}

// 从 URL 中提取 owner/repo
function extractRepoInfo(url) {
    // 支持多种格式：
    // - https://github.com/owner/repo
    // - owner/repo
    // - github.com/owner/repo
    const patterns = [
        /github\.com\/([^\/]+)\/([^\/\?#]+)/,
        /^([^\/]+)\/([^\/\?#]+)$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return {
                owner: match[1],
                repo: match[2].replace(/\.git$/, '')
            };
        }
    }
    return null;
}

// 创建项目卡片
function createProjectCard(repo) {
    const language = repo.language || 'Other';
    const iconClass = getLanguageIcon(language);
    const languageColor = getLanguageColor(language);
    
    // 处理描述
    let description = repo.description || '暂无描述';
    if (description.length > 120) {
        description = description.substring(0, 120) + '...';
    }
    
    // 获取主题标签（从 topics 或根据语言推断）
    const topics = repo.topics || [];
    const tags = topics.slice(0, 3); // 最多显示3个标签
    if (language && !tags.includes(language)) {
        tags.unshift(language);
    }
    
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
        <div class="project-icon" style="background: linear-gradient(135deg, ${languageColor}, ${languageColor}dd);">
            <i class="${iconClass}"></i>
        </div>
        <h3 class="project-title">${repo.name}</h3>
        <p class="project-description">${description}</p>
        <div class="project-tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="project-links">
            <a href="${repo.html_url}" target="_blank" class="project-link">
                <i class="fab fa-github"></i> GitHub
            </a>
            ${repo.homepage ? `
                <a href="${repo.homepage}" target="_blank" class="project-link">
                    <i class="fas fa-external-link-alt"></i> Demo
                </a>
            ` : ''}
        </div>
        <div class="project-stats">
            ${language ? `
                <span>
                    <span class="project-language" style="background-color: ${languageColor};"></span>
                    ${language}
                </span>
            ` : ''}
            <span><i class="fas fa-star"></i> ${repo.stargazers_count || 0}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count || 0}</span>
            <span><i class="far fa-calendar"></i> ${new Date(repo.updated_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })}</span>
        </div>
    `;
    return card;
}

// 显示项目卡片
function displayProjects(repos) {
    const projectsGrid = document.getElementById('projects-grid');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    if (repos.length === 0) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.innerHTML = '<i class="fas fa-info-circle"></i><p class="error-text">暂无项目</p>';
        return;
    }
    
    // 清空并显示项目网格
    projectsGrid.innerHTML = '';
    loading.style.display = 'none';
    error.style.display = 'none';
    projectsGrid.style.display = 'grid';
    
    // 创建项目卡片
    repos.forEach((repo, index) => {
        const card = createProjectCard(repo);
        // 设置初始状态用于动画
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        projectsGrid.appendChild(card);
        
        // 触发卡片动画
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// 加载 GitHub 项目（自动模式）
async function loadGitHubProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=all`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const repos = await response.json();
        
        // 过滤掉 fork 的仓库（可选，如果需要显示 fork 的仓库，可以移除这行）
        const filteredRepos = repos.filter(repo => !repo.fork || repo.stargazers_count > 0);
        
        // 按更新时间排序
        filteredRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        displayProjects(filteredRepos);
        
    } catch (error) {
        console.error('加载 GitHub 项目失败:', error);
        const loading = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
    }
}

// 加载手动指定的项目
async function loadManualProjects() {
    if (MANUAL_REPOS.length === 0) {
        displayProjects([]);
        return;
    }
    
    try {
        const loading = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        
        // 解析所有仓库信息
        const repoInfos = MANUAL_REPOS.map(url => extractRepoInfo(url)).filter(info => info !== null);
        
        if (repoInfos.length === 0) {
            loading.style.display = 'none';
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p class="error-text">仓库 URL 格式不正确</p>';
            return;
        }
        
        // 并行获取所有仓库信息
        const repoPromises = repoInfos.map(async ({ owner, repo }) => {
            try {
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${owner}/${repo}`);
                }
                return await response.json();
            } catch (error) {
                console.error(`获取仓库 ${owner}/${repo} 失败:`, error);
                return null;
            }
        });
        
        const repos = await Promise.all(repoPromises);
        const validRepos = repos.filter(repo => repo !== null);
        
        // 按更新时间排序
        validRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        displayProjects(validRepos);
        
    } catch (error) {
        console.error('加载手动指定项目失败:', error);
        const loading = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
    }
}

// 页面加载时根据配置选择模式
window.addEventListener('DOMContentLoaded', () => {
    if (PROJECTS_MODE === 'manual') {
        loadManualProjects();
    } else {
        // 默认使用自动模式
        loadGitHubProjects();
    }
});
