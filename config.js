// 网站配置文件
// 所有配置集中在这里管理

const SITE_CONFIG = {
    // 网站基本信息
    site: {
        name: 'Jwwwwn',  // 网站名称（显示在导航栏 Logo）
        title: "YJW's Homepage"  // 网站标题
    },
    
    // 导航栏配置
    navigation: [
        {
            name: '首页',
            path: 'index.html',
            icon: 'fas fa-home'
        },
        {
            name: '项目',
            path: 'templates/projects.html',
            icon: 'fas fa-code'
        },
        {
            name: '数据集',
            path: 'templates/datasets.html',
            icon: 'fas fa-database'
        },
        {
            name: '论文心得',
            path: 'templates/papers.html',
            icon: 'fas fa-book'
        }
    ],
    
    // 项目展示模式配置
    projects: {
        // 模式：'auto' (自动获取所有公开仓库) 或 'manual' (手动指定仓库)
        mode: 'manual',
        
        // GitHub 用户名（自动模式使用）
        githubUsername: 'JW-Yuan',
        
        // 手动指定的仓库 URL 列表（手动模式使用）
        // 格式：可以是完整的 GitHub URL 或 owner/repo 格式
        manualRepos: [
            'https://github.com/JW-Yuan/Multimodal-Question-Answering-System-for-Elderly.git',
            'https://github.com/hajkeoadf/Campus-Food-Map.git',
        ]
    },
    
    // 数据集配置
    datasets: {
        // 数据集文件夹路径（相对于网站根目录）
        basePath: 'datasets/',
        // 每个数据集文件夹内的文件命名
        files: {
            info: 'info.json',      // 概述信息 JSON 文件
            detail: 'detail.md',    // 详细信息 Markdown 文件
            script: 'process.py',  // 处理脚本 Python 文件（可选）
            images: 'img/'          // 可视化图片文件夹
        }
    },
    
    // 论文配置
    papers: {
        // 论文文件夹路径（相对于网站根目录）
        basePath: 'papers/',
        // 每个论文文件夹内的文件命名
        files: {
            info: 'info.json',      // 概述信息 JSON 文件
            detail: 'detail.md'     // 详细信息 Markdown 文件
        }
    }
};

