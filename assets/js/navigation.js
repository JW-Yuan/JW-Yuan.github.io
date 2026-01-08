// 导航栏渲染 JavaScript
// 从 config.js 读取配置并动态生成导航栏

// 渲染导航栏
function renderNavigation(currentPath) {
    const navMenus = document.querySelectorAll('.nav-menu');
    const navLogos = document.querySelectorAll('.nav-logo a');
    
    // 渲染 Logo
    if (navLogos.length > 0 && SITE_CONFIG.site) {
        navLogos.forEach(logo => {
            logo.textContent = SITE_CONFIG.site.name;
            // 根据当前页面确定 logo 链接路径
            const logoPath = currentPath.includes('templates/') ? '../index.html' : 'index.html';
            logo.href = logoPath;
        });
    }
    
    // 渲染导航菜单
    if (navMenus.length > 0 && SITE_CONFIG.navigation) {
        navMenus.forEach(navMenu => {
            navMenu.innerHTML = '';
            
            SITE_CONFIG.navigation.forEach(navItem => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                
                // 确定链接路径
                // 判断当前页面是否在 templates 文件夹中
                const pathParts = window.location.pathname.split('/').filter(p => p);
                const isCurrentInTemplates = pathParts.includes('templates');
                
                let href = navItem.path;
                
                // 如果是完整 URL，直接使用
                if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
                    // 保持原样
                } else if (isCurrentInTemplates) {
                    // 当前在 templates 文件夹中
                    if (navItem.path === 'index.html') {
                        // 访问首页，需要返回上一级
                        href = '../index.html';
                    } else if (navItem.path.startsWith('templates/')) {
                        // 配置中的路径是 templates/xxx.html
                        // 从 templates 文件夹访问，只需要文件名（去掉 templates/ 前缀）
                        href = navItem.path.replace(/^templates\//, '');
                    } else {
                        // 其他情况保持原样
                        href = navItem.path;
                    }
                } else {
                    // 当前在根目录
                    if (navItem.path.startsWith('../')) {
                        // 移除 ../
                        href = navItem.path.replace(/^\.\.\//, '');
                    } else {
                        // 保持配置中的路径（如 templates/datasets.html）
                        href = navItem.path;
                    }
                }
                
                // 防止路径重复（安全措施）
                href = href.replace(/templates\/templates\//g, 'templates/');
                
                a.href = href;
                a.className = 'nav-link';
                
                // 判断是否为当前页面
                const currentPage = currentPath.split('/').pop() || 'index.html';
                const navPage = navItem.path.split('/').pop();
                
                // 检查是否为当前页面
                if (currentPage === navPage || 
                    (currentPage === 'index.html' && (navPage === 'index.html' || navItem.path.includes('index.html'))) ||
                    (currentPath.includes(navItem.path) && navItem.path !== 'index.html')) {
                    a.classList.add('active');
                }
                
                // 添加图标（如果有）
                if (navItem.icon) {
                    a.innerHTML = `<i class="${navItem.icon}"></i> ${navItem.name}`;
                } else {
                    a.textContent = navItem.name;
                }
                
                li.appendChild(a);
                navMenu.appendChild(li);
            });
        });
    }
}

// 页面加载时渲染导航栏
document.addEventListener('DOMContentLoaded', () => {
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    renderNavigation(currentPath);
});

