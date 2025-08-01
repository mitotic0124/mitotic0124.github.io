// 文章系统
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在文章页面
    const articlesContainer = document.getElementById('articles-container');
    const articleModal = document.getElementById('article-modal');
    const modalContent = document.getElementById('modal-content');
    const modalTitle = document.getElementById('modal-title');
    const closeModal = document.getElementById('close-modal');
    
    if (articlesContainer) {
        loadArticles();
    }
    
    // 关闭模态框
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            articleModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
    }
    
    // 点击模态框外部关闭
    if (articleModal) {
        articleModal.addEventListener('click', function(e) {
            if (e.target === articleModal) {
                articleModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // 加载文章列表
    async function loadArticles() {
        try {
            const response = await fetch('article/articles.json');
            const articles = await response.json();
            
            articlesContainer.innerHTML = '';
            
            articles.forEach(article => {
                const articleCard = createArticleCard(article);
                articlesContainer.appendChild(articleCard);
            });
        } catch (error) {
            console.error('加载文章列表失败:', error);
            articlesContainer.innerHTML = '<p class="text-center text-gray-500 col-span-3">加载文章失败，请稍后再试。</p>';
        }
    }
    
    // 创建文章卡片
    function createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1';
        card.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer article-title" data-id="${article.id}">
                        ${article.title}
                    </h3>
                </div>
                <p class="text-gray-500 text-sm mb-2">
                    <i class="fa fa-calendar mr-2"></i>${article.date}
                    <span class="mx-2">•</span>
                    <i class="fa fa-user mr-2"></i>${article.author}
                </p>
                <p class="text-gray-700 mb-4 line-clamp-3">
                    ${article.summary}
                </p>
                <button class="read-more-btn text-primary font-medium hover:underline text-sm flex items-center" data-id="${article.id}" data-title="${article.title}">
                    阅读全文
                    <i class="fa fa-arrow-right ml-1 text-xs"></i>
                </button>
            </div>
        `;
        
        // 添加点击事件
        const titleElement = card.querySelector('.article-title');
        const readMoreBtn = card.querySelector('.read-more-btn');
        
        titleElement.addEventListener('click', () => openArticle(article));
        readMoreBtn.addEventListener('click', () => openArticle(article));
        
        return card;
    }
    
    // 打开文章详情
    async function openArticle(article) {
        try {
            // 显示加载状态
            modalTitle.textContent = article.title;
            modalContent.innerHTML = '<p class="text-center text-gray-500">加载中...</p>';
            articleModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // 获取文章内容
            const response = await fetch(article.filePath);
            const markdown = await response.text();
            
            // 渲染Markdown
            const html = renderMarkdown(markdown);
            modalContent.innerHTML = html;
            
            // 滚动到顶部
            modalContent.scrollTop = 0;
        } catch (error) {
            console.error('加载文章内容失败:', error);
            modalContent.innerHTML = '<p class="text-center text-red-500">加载文章内容失败，请稍后再试。</p>';
        }
    }
    
    // 渲染Markdown内容
    function renderMarkdown(markdown) {
        try {
            // 确保传入的是字符串
            if (typeof markdown !== 'string') {
                throw new Error('Markdown内容必须是字符串类型');
            }
            
            // 配置marked选项 - 兼容新版本
            if (typeof marked.setOptions === 'function') {
                marked.setOptions({
                    breaks: true,
                    gfm: true
                });
            }
            
            // 创建自定义渲染器
            const renderer = new marked.Renderer();
            
            // 标题渲染
            renderer.heading = function(text, level) {
                const fontSize = {
                    1: 'text-3xl',
                    2: 'text-2xl',
                    3: 'text-xl',
                    4: 'text-lg',
                    5: 'text-base',
                    6: 'text-sm'
                }[level] || 'text-base';
                
                return `<h${level} class="${fontSize} font-bold mt-6 mb-4 text-gray-900">${text}</h${level}>`;
            };
            
            // 代码块渲染
            renderer.code = function(code, infostring) {
                // 安全检查
                if (typeof code !== 'string') {
                    code = String(code);
                }
                
                // 移除代码块每行开头的公共缩进
                code = normalizeCodeIndentation(code);
                
                const lang = infostring || 'code';
                
                return `<pre class="bg-gray-800 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-gray-100 text-sm font-mono">${escapeHtml(code)}</code></pre>`;
};
            
            // 行内代码渲染
            renderer.codespan = function(text) {
                return `<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600">${escapeHtml(text)}</code>`;
            };
            
            // 链接渲染
            renderer.link = function(href, title, text) {
                const titleAttr = title ? `title="${escapeHtml(title)}"` : '';
                return `<a href="${href}" target="_blank" class="text-primary hover:underline" ${titleAttr}>${text}</a>`;
            };
            
            // 段落渲染
            renderer.paragraph = function(text) {
                return `<p class="mb-4 text-gray-700 leading-relaxed">${text}</p>`;
            };
            
            // 列表渲染
            renderer.list = function(body, ordered) {
                const tag = ordered ? 'ol' : 'ul';
                const className = ordered ? 'list-decimal' : 'list-disc';
                return `<${tag} class="${className} pl-5 mb-4 space-y-1">${body}</${tag}>`;
            };
            
            // 列表项渲染
            renderer.listitem = function(text) {
                return `<li class="pl-1">${text}</li>`;
            };
            
            // 引用块渲染
            renderer.blockquote = function(quote) {
                return `<blockquote class="border-l-4 border-primary bg-blue-50 pl-4 py-2 my-4">${quote}</blockquote>`;
            };
            
            // 表格渲染
            renderer.table = function(header, body) {
                return `
                    <div class="overflow-x-auto my-4">
                        <table class="min-w-full border border-gray-300">
                            <thead class="bg-gray-100">
                                <tr>${header}</tr>
                            </thead>
                            <tbody>${body}</tbody>
                        </table>
                    </div>
                `;
            };
            
            renderer.tablerow = function(content) {
                return `<tr class="border-b border-gray-300">${content}</tr>`;
            };
            
            renderer.tablecell = function(content, flags) {
                const tag = flags.header ? 'th' : 'td';
                const align = flags.align ? `text-${flags.align}` : '';
                const className = flags.header 
                    ? `px-4 py-2 font-semibold text-left ${align}` 
                    : `px-4 py-2 text-left ${align}`;
                return `<${tag} class="${className}">${content}</${tag}>`;
            };
            
            // 使用自定义渲染器
            if (typeof marked.use === 'function') {
                // 新版本marked.js
                marked.use({ renderer });
                return marked.parse(markdown);
            } else {
                // 旧版本marked.js
                return marked(markdown, { renderer });
            }
        } catch (error) {
            console.error('Markdown解析错误:', error);
            return `<p class="text-red-500">内容解析错误: ${error.message}</p><pre>${escapeHtml(markdown)}</pre>`;
        }
    }
    
    // 移除代码块的公共缩进
    function normalizeCodeIndentation(code) {
        const lines = code.split('\n');
        if (lines.length === 0) return code;

        // 计算所有行（包括空白行）的缩进，而非仅非空行
        const indents = lines.map(line => {
            const match = line.match(/^[\s\t]*/);
            return match ? match[0].length : 0;
        });
        const minIndent = Math.min(...indents); // 取所有行的最小缩进

        return lines.map(line => line.substring(minIndent)).join('\n');
    }

    
    // HTML转义函数
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    }
});

// 移动端菜单切换
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
