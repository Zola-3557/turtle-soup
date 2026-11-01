// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    loadGameDetail();
});

// 1. 从 URL 获取 id 并加载数据
async function loadGameDetail() {
    // 获取 URL 参数，比如 game.html?id=1
    const urlParams = new URLSearchParams(window.location.search);
    const soupId = parseInt(urlParams.get('id'));

    if (!soupId) {
        alert('缺少题目 ID，即将返回首页');
        window.location.href = 'index.html';
        return;
    }

    try {
        // 目前后端是获取全部数据，我们在前端过滤出对应的 id
        // (如果你以后做大了，建议在后端加一个 /api/soups/<id> 接口直接拿单条)
        const response = await fetch('/api/soups');
        const allSoups = await response.json();
        
        // 找到对应的题目
        const soup = allSoups.find(item => item.id === soupId);

        if (!soup) {
            document.getElementById('soup-title').innerText = '题目不存在';
            return;
        }

        // 在 loadGameDetail 函数里，找到 renderDetail(soup); 这一行
        console.log("在控制台打印 soup 对象：", soup); 
        console.log("在控制台打印 truth 值：", soup.truth);
renderDetail(soup);
        // 2. 渲染数据到页面上
        renderDetail(soup);
    } catch (error) {
        console.error('加载失败:', error);
        document.getElementById('soup-title').innerText = '加载失败，请检查网络或后端服务';
    }
}

// 3. 渲染页面函数
function renderDetail(soup) {
    document.title = `${soup.title} - 法考海龟汤`;
    document.getElementById('soup-title').innerText = soup.title;
    document.getElementById('soup-category').innerText = `分类：${soup.category}`;
    document.getElementById('soup-face').innerText = soup.face;
    document.getElementById('soup-truth').innerText = soup.truth;

     // 渲染线索数组（折叠版）
    const cluesContainer = document.getElementById('soup-clues');
    cluesContainer.innerHTML = ''; // 先清空容器，防止重复添加

    if (soup.clues && soup.clues.length > 0) {
        // 使用 HTML5 的 details 标签实现原生折叠
        let cluesHTML = `
            <details style="margin-top: 15px; cursor: pointer; background: #f9f9f9; padding: 10px; border-radius: 5px;">
                <summary style="font-weight: bold; color: #2980b9; outline: none;">🔍 点击展开线索</summary>
                <ul style="margin-top: 10px; padding-left: 20px; color: #333;">
        `;
        
        // 循环添加每条线索
        soup.clues.forEach((clue, index) => {
            cluesHTML += `<li>线索 ${index + 1}: ${clue}</li>`;
        });
        
        cluesHTML += `</ul></details>`;
        cluesContainer.innerHTML = cluesHTML;
    } else {
        cluesContainer.innerHTML = '<p style="color:#999;">本题暂无提示线索</p>';
    }
}

// 4. 切换汤底显示/隐藏
function toggleTruth() {
    const truthArea = document.getElementById('truth-area');
    const btn = document.getElementById('btn-toggle-truth');
    
    if (truthArea.style.display === 'none') {
        truthArea.style.display = 'block';
        btn.innerText = '🙈 隐藏汤底';
        btn.classList.add('active');
    } else {
        truthArea.style.display = 'none';
        btn.innerText = '🔍 查看汤底';
        btn.classList.remove('active');
    }
}