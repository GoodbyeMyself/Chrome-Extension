// Chrome Copy Tools - Offscreen Script
// 处理剪贴板操作

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyToClipboard') {
    handleCopyToClipboard(request.text)
      .then(() => {
        console.log('Offscreen: 剪贴板写入成功');
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Offscreen: 剪贴板写入失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // 保持消息通道开放
    return true;
  }
});

async function handleCopyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      return fallbackCopyToClipboard(text);
    }
  } catch (error) {
    console.error('Offscreen clipboard error:', error);
    return fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return success;
  } catch (error) {
    console.error('Fallback copy failed:', error);
    return false;
  }
}

console.log('Chrome Copy Tools: Offscreen script loaded');
