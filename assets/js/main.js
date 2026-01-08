// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    } else {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }
});

// 移动端菜单切换
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}

// 根据当前页面设置导航链接激活状态
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        const linkPage = linkHref.split('/').pop();
        
        // 检查是否是当前页面
        if (linkPage === currentPage || 
            (currentPage === '' && linkHref.includes('index.html')) ||
            (currentPage === 'index.html' && linkHref.includes('index.html'))) {
            link.classList.add('active');
        }
    });
}

// 动态显示当前年份
function setCurrentYear() {
    const yearElements = document.querySelectorAll('#current-year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// 页面加载时设置激活状态和年份
setActiveNavLink();
setCurrentYear();

// 点击导航链接时关闭移动端菜单
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        navMenu.classList.remove('active');
    });
});

// 页面加载动画
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
});

// 卡片进入视口动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 观察所有卡片
document.querySelectorAll('.project-card, .dataset-card, .paper-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});
