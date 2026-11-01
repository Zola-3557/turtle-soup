// frontend/js/api.js

/**
 * 1. 获取海龟汤列表（支持分类、搜索）
 * @param {string} category - 分类名称，如 "法考-刑法"，默认为空表示全部
 * @param {string} search - 搜索关键词，默认为空
 */
async function fetchSoups(category = '', search = '') {
    try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);

        const response = await fetch(`/api/soups?${params.toString()}`);
        if (!response.ok) throw new Error('网络请求失败');
        return await response.json();
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
}

/**
 * 2. 提交纠错反馈（对接你后端写好的 /api/submit 接口）
 */
async function submitFeedback() {
    const textarea = document.getElementById('feedback-text');
    const text = textarea ? textarea.value.trim() : '';
    
    if (!text) {
        alert('请描述一下遇到的错误哦！');
        return;
    }

    // 尝试获取当前页面的标题作为题目名称
    const titleEl = document.getElementById('soup-title'); 
    const soupTitle = titleEl ? titleEl.innerText : '未知题目';

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ soup_title: soupTitle, feedback: text })
        });
        
        const result = await response.json();
        alert(result.msg || '反馈提交成功！感谢您的建议。');
        
        // 提交成功后清空内容并关闭弹窗
        textarea.value = '';
        closeModal();
    } catch (error) {
        console.error('提交失败:', error);
        alert('提交失败，请检查网络或后端服务是否正常。');
    }
}

/**
 * 3. 打开纠错弹窗
 */
function openCorrectionModal() {
    const modal = document.getElementById('correction-modal');
    if (modal) modal.style.display = 'block';
}

/**
 * 4. 关闭纠错弹窗
 */
function closeModal() {
    const modal = document.getElementById('correction-modal');
    if (modal) modal.style.display = 'none';
}