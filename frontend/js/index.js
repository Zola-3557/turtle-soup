// frontend/js/index.js

// 页面加载完成后立即执行
document.addEventListener('DOMContentLoaded', async () => {
    await loadSoups(); // 加载所有数据
    setupCategoryListeners(); // 设置分类按钮点击事件
});

// 获取并渲染数据的方法
async function loadSoups(category = '') {
    const listContainer = document.getElementById('soup-list');
    if (!listContainer) return; // 如果页面没有这个容器，直接结束

    listContainer.innerHTML = '<p>正在加载海龟汤...</p>'; // 加载中提示

    try {
        // 调用你后端跑通的接口
        const url = category ? `/api/soups?category=${encodeURIComponent(category)}` : '/api/soups';
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('网络请求失败');
        
        const soups = await response.json();
        renderCards(soups, listContainer);
    } catch (error) {
        console.error('加载失败:', error);
        listContainer.innerHTML = '<p>加载失败，请检查后端是否开启。</p>';
    }
}

// 生成卡片的逻辑
function renderCards(soups, container) {
    container.innerHTML = ''; // 清空当前内容

    if (soups.length === 0) {
        container.innerHTML = '<p>该分类下暂时还没有海龟汤哦。</p>';
        return;
    }

    soups.forEach(soup => {
        const card = document.createElement('div');
        card.className = 'soup-card';
        
        // 截取汤面的前 50 个字作为简介
        const brief = soup.face ? soup.face.substring(0, 50) + '...' : '暂无简介';

        // 点击卡片跳转到 game.html 并带上 ID
        card.innerHTML = `
            <h3>${soup.title}</h3>
            <p>${brief}</p>
            <button class="action-btn">查看详情</button>
        `;
        
        // 点击卡片跳转
        card.addEventListener('click', () => {
            window.location.href = `game.html?id=${soup.id}`;
        });

        container.appendChild(card);
    });
}

// 绑定分类按钮和下拉框的事件
function setupCategoryListeners() {
    // ==========================================
    // 1. 监听下拉框 (针对 <select id="category-select">)
    // ==========================================
    const selectBox = document.getElementById('category-select');
    if (selectBox) {
        selectBox.addEventListener('change', (e) => {
            const category = e.target.value; // 获取选中的分类
            loadSoups(category);             // 刷新列表
            
            // 更新 URL 方便分享
            const newUrl = category ? `?category=${encodeURIComponent(category)}` : '/';
            window.history.pushState({}, '', newUrl);
        });
    }

    // ==========================================
    // 2. 监听分类按钮 (保留你原有的逻辑)
    // ==========================================
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            loadSoups(category);
            
            const newUrl = category ? `?category=${encodeURIComponent(category)}` : '/';
            window.history.pushState({}, '', newUrl);
        });
    });
}