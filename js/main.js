a// 移动端菜单切换
document.getElementById('menu-toggle').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// 动态获取文章列表
async function fetchArticles() {
    try {
        // 获取文章目录下的所有文件
        const response = await fetch('article/list.json');
        
        // 如果存在list.json配置文件，则使用它
        if (response.ok) {
            const articles = await response.json();
            return articles;
        } else {
            // 否则使用默认的文章列表
            return [
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
        }
    } catch (error) {
        console.error('获取文章列表失败:', error);
        // 出错时返回默认列表
        return [
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
    }
}

// 加载文章列表
async function loadArticles() {
    const articlesList = document.getElementById('articles-list');
    
    if (!articlesList) return;
    
    // 获取文章数据
    const articles = await fetchArticles();
    
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

// 配置marked.js以获得更好的渲染效果
function configureMarked() {
    // 自定义渲染器
    const renderer = new marked.Renderer();
    
    // 为代码块添加更好的样式支持
    renderer.code = function(code, infostring, escaped) {
        const lang = (infostring || '').match(/\S*/)[0];
        
        if (this.options.highlight) {
            const out = this.options.highlight(code, lang);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }
        }

        if (!lang) {
            return '<pre class="bg-gray-800 rounded-lg p-4 overflow-x-auto"><code class="text-gray-100">' +
                   (escaped ? code : escape(code, true)) +
                   '</code></pre>';
        }

        return '<pre class="bg-gray-800 rounded-lg p-4 overflow-x-auto"><code class="' + 
               this.options.langPrefix + 
               escape(lang, true) + 
               ' text-gray-100">' +
               (escaped ? code : escape(code, true)) +
               '</code></pre>\n';
    };
    
    // 为表格添加样式
    renderer.table = function(header, body) {
        return '<div class="overflow-x-auto"><table class="min-w-full border border-gray-300">' +
               '<thead class="bg-gray-100">' +
               header +
               '</thead>' +
               '<tbody>' +
               body +
               '</tbody>' +
               '</table></div>';
    };
    
    renderer.tablecell = function(content, flags) {
        const type = flags.header ? 'th' : 'td';
        const tag = flags.header ? 
            '<' + type + ' class="px-4 py-2 text-left font-semibold text-gray-700 border-b">' : 
            '<' + type + ' class="px-4 py-2 border-b">';
        return tag + content + '</' + type + '>\n';
    };
    
    renderer.heading = function(text, level) {
        return '<h' + level + ' class="text-' + (7 - level) + 'xl font-bold mt-6 mb-4 text-gray-900">' + 
               text + '</' + level + '>\n';
    };
    
    renderer.paragraph = function(text) {
        return '<p class="mb-4 text-gray-700 leading-relaxed">' + text + '</p>\n';
    };
    
    renderer.list = function(body, ordered) {
        const type = ordered ? 'ol' : 'ul';
        const className = ordered ? 'list-decimal' : 'list-disc';
        return '<' + type + ' class="' + className + ' pl-5 mb-4 text-gray-700 space-y-2">' + body + '</' + type + '>\n';
    };
    
    renderer.listitem = function(text) {
        return '<li class="pl-2">' + text + '</li>\n';
    };
    
    renderer.link = function(href, title, text) {
        if (href === null) {
            return text;
        }
        let out = '<a href="' + escape(href) + '" class="text-primary hover:underline"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
    };
    
    renderer.blockquote = function(quote) {
        return '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 bg-blue-50">' + 
               quote + '</blockquote>\n';
    };

    // 配置marked选项
    marked.setOptions({
        renderer: renderer,
        highlight: function(code, lang) {
            // 简单的代码高亮实现
            return code.replace(/(&lt;\/?[^&gt;]+&gt;)/g, '<span class="text-secondary">$1</span>');
        },
        langPrefix: 'language-',
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
    });
}

// 加载文章详情
async function loadArticleDetail(file, title) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error('文章加载失败');
        }
        
        // 配置渲染器
        configureMarked();
        
        const content = await response.text();
        const modal = document.getElementById('article-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        modalTitle.textContent = title;
        modalContent.innerHTML = marked.parse(content);
        
        // 添加一些额外的样式处理
        // 为所有图片添加圆角和阴影
        modalContent.querySelectorAll('img').forEach(img => {
            img.classList.add('rounded-lg', 'shadow-md', 'my-4');
        });
        
        // 为所有标题添加锚点
        modalContent.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(header => {
            header.classList.add('scroll-mt-20'); // 为锚点跳转留出空间
        });
        
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
