// 网站配置文件
// 所有配置集中在这里管理

const SITE_CONFIG = {
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
    }
};

