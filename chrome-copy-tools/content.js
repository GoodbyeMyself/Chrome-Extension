// Chrome Copy Tools - Content Script
class ChromeCopyTools {
    constructor() {
        this.isEnabled = true;
        this.lastClickedElement = null;
        this.clickTimeout = null;
        this.lastClickTime = null; // 添加用于跟踪双击的时间戳
        this.init();
    }

    async init() {
        // 从存储中获取启用状态
        await this.loadSettings();

        // 监听双击事件 - 使用捕获阶段确保能捕获到被禁用元素的事件
        document.addEventListener('dblclick', this.handleDoubleClick.bind(this), true);

        // 为被禁用的元素添加额外的事件监听
        document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);

        // 添加视觉反馈样式
        this.addStyles();

        // 监听来自popup的消息
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'toggle') {
                this.isEnabled = request.enabled;
                this.saveEnabledState();
                sendResponse({ success: true });
            } else if (request.action === 'getStatus') {
                sendResponse({ enabled: this.isEnabled });
            }
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get('settings');
            if (result.settings && result.settings.enabled !== undefined) {
                this.isEnabled = result.settings.enabled;
            } else {
                // 默认启用状态
                this.isEnabled = true;
                this.saveEnabledState();
            }
        } catch (error) {
            this.isEnabled = true;
        }
    }

    async saveEnabledState() {
        try {
            const result = await chrome.storage.local.get('settings');
            const settings = result.settings || {};
            settings.enabled = this.isEnabled;
            await chrome.storage.local.set({ settings });
        } catch (error) {
            // Silent fail
        }
    }

    handleMouseDown(event) {
        // 只处理被禁用的元素
        const element = event.target;
        const isDisabled = element.disabled ||
            element.getAttribute('disabled') !== null ||
            element.hasAttribute('disabled') ||
            (element.closest && element.closest('[disabled]'));

        if (!isDisabled) {
            return; // 非禁用元素由正常的双击事件处理
        }

        // 检测双击逻辑
        const now = Date.now();
        const timeSinceLastClick = now - (this.lastClickTime || 0);

        // 如果是同一个元素且在双击时间窗口内（通常是500ms）
        if (this.lastClickedElement === element && timeSinceLastClick < 500) {
            // 模拟双击事件
            this.handleDoubleClick({
                target: element,
                preventDefault: () => { },
                stopPropagation: () => { }
            });

            // 重置点击状态
            this.lastClickedElement = null;
            this.lastClickTime = null;
        } else {
            // 记录这次点击
            this.lastClickedElement = element;
            this.lastClickTime = now;
        }
    }

    handleDoubleClick(event) {
        const element = event.target;

        if (!this.isEnabled) {
            return;
        }

        // 不阻止默认行为，保持页面正常交互
        // event.preventDefault();
        // event.stopPropagation();

        const text = this.extractText(element);

        if (text.trim()) {
            // 静默复制，不显示任何反馈
            this.copyToClipboard(text, element);
        }
    }

    extractText(element) {
        // 优先获取元素的文本内容
        let text = '';

        // 如果是输入框，获取其值（包括被禁用的）
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            text = element.value;

            // 如果是被禁用的输入框且没有值，尝试获取其他属性
            if (!text && element.disabled) {
                text = element.placeholder || element.defaultValue || element.getAttribute('data-value') || '';
            }
        }
        // 如果是选择框（包括被禁用的）
        else if (element.tagName === 'SELECT') {
            // 获取当前选中的选项文本
            const selectedOption = element.options[element.selectedIndex];
            if (selectedOption) {
                text = selectedOption.text || selectedOption.value;
            }

            // 如果是被禁用的选择框且没有选中项，尝试获取第一个选项
            if (!text && element.disabled && element.options.length > 0) {
                text = element.options[0].text || element.options[0].value || '';
            }
        }
        // 如果是按钮（包括被禁用的）
        else if (element.tagName === 'BUTTON') {
            text = element.innerText || element.textContent || element.value || '';

            // 如果是被禁用的按钮且没有文本，尝试获取其他属性
            if (!text && element.disabled) {
                text = element.getAttribute('aria-label') || element.title || '';
            }
        }
        // 如果是图片，获取alt属性
        else if (element.tagName === 'IMG') {
            text = element.alt || element.title || '';
        }
        // 处理其他可能被禁用的表单元素
        else if (['FIELDSET', 'OPTGROUP', 'OPTION'].includes(element.tagName)) {
            text = element.innerText || element.textContent || element.label || '';

            if (!text && element.disabled) {
                text = element.getAttribute('aria-label') || element.title || '';
            }
        }
        // 其他元素获取文本内容
        else {
            // 获取直接文本内容，排除子元素
            text = this.getDirectTextContent(element);

            // 如果没有直接文本，获取所有文本内容
            if (!text.trim()) {
                text = element.innerText || element.textContent || '';
            }

            // 如果仍然没有文本，且元素可能被禁用，尝试获取其他属性
            if (!text.trim() && (element.disabled || element.getAttribute('disabled') !== null)) {
                text = element.getAttribute('aria-label') ||
                    element.title ||
                    element.getAttribute('data-text') ||
                    element.getAttribute('alt') || '';
            }
        }

        return text.trim();
    }

    getDirectTextContent(element) {
        let text = '';
        for (let node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            }
        }
        return text;
    }

    async copyToClipboard(text, element) {
        try {
            // 优先使用background script处理剪贴板操作
            const response = await chrome.runtime.sendMessage({
                action: 'copyToClipboard',
                text: text,
                elementTag: element.tagName,
                timestamp: Date.now()
            });

            if (response && response.success) {
                return;
            }

            // 降级方案1：尝试现代剪贴板API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);

                // 记录复制历史
                chrome.runtime.sendMessage({
                    action: 'recordCopy',
                    text: text,
                    elementTag: element.tagName,
                    timestamp: Date.now()
                });
                return;
            }

            // 降级方案2：使用传统方法
            const success = this.fallbackCopyToClipboard(text);
            if (success) {
                // 记录复制历史
                chrome.runtime.sendMessage({
                    action: 'recordCopy',
                    text: text,
                    elementTag: element.tagName,
                    timestamp: Date.now()
                });
            }

        } catch (err) {
            // 静默失败，不显示任何错误提示
        }
    }

    fallbackCopyToClipboard(text) {
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
        } catch (err) {
            return false;
        }
    }

    // 静默复制 - 移除所有视觉反馈
    showCopyFeedback(element) {
        // 静默模式：不显示任何视觉反馈
    }

    showErrorFeedback(element) {
        // 静默模式：不显示任何错误反馈
    }

    addStyles() {
        // 静默模式：不添加任何样式
    }
}

// 初始化插件
async function initializeExtension() {
    try {
        const copyTools = new ChromeCopyTools();

        // 添加全局调试信息
        window.chromeCopyTools = copyTools;

        return copyTools;
    } catch (error) {
        // Silent fail
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}
