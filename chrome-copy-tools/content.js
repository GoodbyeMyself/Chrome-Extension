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

        // 监听 dblclick
        document.addEventListener('dblclick', this.handleDoubleClick.bind(this), true);

        // 监听来自popup的消息
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'toggle') {
                this.isEnabled = request.enabled;
                this.saveEnabledState();
                sendResponse({ success: true });
            } else if (request.action === 'getStatus') {
                sendResponse({ enabled: this.isEnabled });
            } else if (request.action === 'scanDisabledElements') {
                const result = this.scanDisabledElements();
                sendResponse({ success: true, data: result });
            }
            return true; // 保持消息通道开放以支持异步响应
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

    /**
     * 扫描页面上所有被禁用的表单元素并提取其文本内容
     * 只扫描 input, select, textarea 三种表单元素
     * @returns {Object} 包含所有禁用元素信息的对象
     */
    scanDisabledElements() {
        const disabledElements = [];
        
        // 只检查表单相关的元素：input, select, textarea
        const selectors = [
            'input[disabled]',
            'textarea[disabled]',
            'select[disabled]',
            // 也包含 ARIA 禁用的表单元素
            'input[aria-disabled="true"]',
            'textarea[aria-disabled="true"]',
            'select[aria-disabled="true"]'
        ];

        // 使用 Set 来避免重复元素
        const uniqueElements = new Set();

        // 查找所有匹配的元素
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => uniqueElements.add(element));
            } catch (e) {
                // 忽略无效选择器
            }
        });

        // 遍历所有唯一的禁用元素
        uniqueElements.forEach((element, index) => {
            const elementInfo = this.extractDisabledElementInfo(element, index);
            if (elementInfo) {
                disabledElements.push(elementInfo);
            }
        });

        return {
            total: disabledElements.length,
            elements: disabledElements,
            timestamp: Date.now(),
            url: window.location.href
        };
    }

    /**
     * 提取禁用元素的详细信息
     * @param {HTMLElement} element - 要提取信息的元素
     * @param {number} index - 元素在列表中的索引
     * @returns {Object|null} 元素信息对象，如果没有有效文本则返回 null
     */
    extractDisabledElementInfo(element, index) {
        const text = this.extractText(element);
        
        // 只返回包含文本的元素
        if (!text) {
            return null;
        }

        // 计算元素的 XPath（用于定位）
        const xpath = this.getElementXPath(element);

        // 获取元素的位置信息
        const rect = element.getBoundingClientRect();

        return {
            index: index,
            tagName: element.tagName.toLowerCase(),
            text: text,
            id: element.id || null,
            className: element.className || null,
            name: element.name || null,
            type: element.type || null,
            placeholder: element.placeholder || null,
            value: element.value || null,
            title: element.title || null,
            ariaLabel: element.getAttribute('aria-label') || null,
            xpath: xpath,
            position: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            },
            isVisible: this.isElementVisible(element),
            disabledBy: this.getDisabledReason(element)
        };
    }

    /**
     * 获取元素的 XPath
     * @param {HTMLElement} element - 要获取 XPath 的元素
     * @returns {string} 元素的 XPath
     */
    getElementXPath(element) {
        if (element.id) {
            return `//*[@id="${element.id}"]`;
        }

        const parts = [];
        while (element && element.nodeType === Node.ELEMENT_NODE) {
            let index = 0;
            let sibling = element.previousSibling;

            while (sibling) {
                if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
                    index++;
                }
                sibling = sibling.previousSibling;
            }

            const tagName = element.nodeName.toLowerCase();
            const pathIndex = index > 0 ? `[${index + 1}]` : '';
            parts.unshift(`${tagName}${pathIndex}`);

            element = element.parentNode;
        }

        return parts.length ? `/${parts.join('/')}` : '';
    }

    /**
     * 检查元素是否可见
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 元素是否可见
     */
    isElementVisible(element) {
        if (!element) return false;

        const style = window.getComputedStyle(element);
        
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0' &&
               element.offsetWidth > 0 &&
               element.offsetHeight > 0;
    }

    /**
     * 获取元素被禁用的原因
     * @param {HTMLElement} element - 要检查的元素
     * @returns {string} 禁用原因
     */
    getDisabledReason(element) {
        if (element.hasAttribute('disabled')) {
            return 'disabled attribute';
        }
        if (element.getAttribute('aria-disabled') === 'true') {
            return 'aria-disabled';
        }
        
        // 检查是否被父级 fieldset 禁用
        let parent = element.parentElement;
        while (parent) {
            if (parent.tagName === 'FIELDSET' && parent.hasAttribute('disabled')) {
                return 'disabled by parent fieldset';
            }
            parent = parent.parentElement;
        }

        return 'unknown';
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
