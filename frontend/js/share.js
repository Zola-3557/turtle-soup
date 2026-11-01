function shareSoup() {
    // 获取当前完整 URL (例如 http://127.0.0.1:5000/game.html?id=1)
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('链接已复制！快发给朋友一起烧脑吧！');
    }).catch(err => {
        prompt('请手动复制以下链接：', shareUrl);
    });
}