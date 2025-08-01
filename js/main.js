// 移动端菜单切换
document.getElementById('menu-toggle').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// 文章数据
const articles = [
    {
        id: 'data-visualization',
        title: '数据可视化实践指南',
        date: '2025-01-05',
        excerpt: '数据可视化是数据分析中的重要环节。通过图表和图形，我们可以更直观地理解数据中的模式、趋势和异常...',
        file: 'article/data-visualization.md'
    },
    {
        id: 'javascript-async',
        title: 'JavaScript 异步编程详解',
        date: '2025-01-03',
        excerpt: 'JavaScript异步编程是现代前端开发中的重要概念。本文将深入探讨回调函数、Promise、async/await等异步处理方式...',
        file: 'article/javascript-async.md'
    },
    {
        id: 'tailwind-tutorial',
        title: 'Tailwind CSS 使用教程',
        date: '2025-01-01',
        excerpt: 'Tailwind CSS 是一个功能类优先的 CSS 框架，它可以帮助我们快速构建现代化的网页界面...',
        file: 'article/tailwind-tutorial.md'
    }
];

// 加载文章列表
function loadArticles() {
    const articlesList = document.getElementById('articles-list');
    
    if (!articlesList) return;
    
    articlesList.innerHTML = '';
    
    articles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md';
        articleCard.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2 hover:text-primary transition-colors cursor-pointer article-title" data-file="${article.file}" data-title="${article.title}">
                    ${article.title}
                </h3>
                <p class="text-gray-500 text-sm mb-3">${article.date}</p>
                <p class="text-gray-700 mb-4 line-clamp-3">${article.excerpt}</p>
                <button class="text-primary hover:text-primary/80 font-medium text-sm article-read-more" data-file="${article.file}" data-title="${article.title}">
                    阅读全文 →
                </button>
            </div>
        `;
        articlesList.appendChild(articleCard);
    });
    
    // 为文章标题和阅读更多按钮添加点击事件
    document.querySelectorAll('.article-title, .article-read-more').forEach(button => {
        button.addEventListener('click', function() {
            const file = this.getAttribute('data-file');
            const title = this.getAttribute('data-title');
            loadArticleDetail(file, title);
        });
    });
}

// 加载文章详情
async function loadArticleDetail(file, title) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error('文章加载失败');
        }
        
        const content = await response.text();
        const modal = document.getElementById('article-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        modalTitle.textContent = title;
        modalContent.innerHTML = marked.parse(content);
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('加载文章失败:', error);
        alert('文章加载失败，请稍后重试');
    }
}

// 关闭模态框
function closeArticleModal() {
    const modal = document.getElementById('article-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// 事件监听
document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
    
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', closeArticleModal);
    }
    
    const modal = document.getElementById('article-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeArticleModal();
            }
        });
    }
});