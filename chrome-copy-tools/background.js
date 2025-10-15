// Chrome Copy Tools - Background Script (Service Worker)

class BackgroundService {
    constructor() {
        this.copyHistory = [];
        this.maxHistorySize = 50;
        this.init();
    }

    init() {
        // 监听来自content script的消息
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // 保持消息通道开放
        });

        // 监听插件安装事件
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.onInstall();
            } else if (details.reason === 'update') {
                this.onUpdate();
            }
        });

        // 监听标签页更新
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.onTabComplete(tabId, tab);
            }
        });
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'copyToClipboard':
                this.handleCopyToClipboard(request, sender, sendResponse);
                break;

            case 'recordCopy':
                this.recordCopyAction(request, sender);
                sendResponse({ success: true });
                break;

            case 'getCopyHistory':
                sendResponse({ history: this.copyHistory });
                break;

            case 'clearHistory':
                this.copyHistory = [];
                this.saveData();
                // 移除徽章更新功能
                // this.updateAllTabsBadge();
                sendResponse({ success: true });
                break;

            case 'getSettings':
                this.getSettings(sendResponse);
                break;

            case 'saveSettings':
                this.saveSettings(request.settings, sendResponse);
                break;

            default:
                sendResponse({ error: 'Unknown action' });
        }
    }

    async handleCopyToClipboard(request, sender, sendResponse) {
        try {
            // 创建或获取offscreen document
            await this.ensureOffscreenDocument();

            // 发送消息到offscreen document进行剪贴板操作
            const response = await chrome.runtime.sendMessage({
                action: 'copyToClipboard',
                text: request.text
            });

            if (response && response.success) {
                // 记录复制历史
                this.recordCopyAction(request, sender);

                // 静默模式：不显示徽章反馈

                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: 'Offscreen copy failed' });
            }
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    async ensureOffscreenDocument() {
        try {
            // 检查是否已存在offscreen document
            const existingContexts = await chrome.runtime.getContexts({
                contextTypes: ['OFFSCREEN_DOCUMENT']
            });

            if (existingContexts.length > 0) {
                return; // 已存在
            }

            // 创建offscreen document
            await chrome.offscreen.createDocument({
                url: chrome.runtime.getURL('offscreen.html'),
                reasons: ['CLIPBOARD'],
                justification: 'Need to copy text to clipboard'
            });
        } catch (error) {
            throw error;
        }
    }

    recordCopyAction(request, sender) {
        const copyRecord = {
            id: Date.now(),
            text: request.text,
            elementTag: request.elementTag,
            timestamp: request.timestamp,
            url: sender.tab?.url || '',
            title: sender.tab?.title || '',
            favicon: sender.tab?.favIconUrl || ''
        };

        // 添加到历史记录
        this.copyHistory.unshift(copyRecord);

        // 限制历史记录数量
        if (this.copyHistory.length > this.maxHistorySize) {
            this.copyHistory = this.copyHistory.slice(0, this.maxHistorySize);
        }

        // 保存数据
        this.saveData();

        // 移除徽章更新功能 - 不再在图标上显示复制数量
        // this.updateBadge(sender.tab?.id);
        // this.updateBadge();
    }

    async saveData() {
        try {
            await chrome.storage.local.set({
                copyHistory: this.copyHistory,
                lastUpdated: Date.now()
            });
        } catch (error) {
            // Silent fail
        }
    }

    async loadData() {
        try {
            const result = await chrome.storage.local.get(['copyHistory', 'settings']);
            this.copyHistory = result.copyHistory || [];
            return result;
        } catch (error) {
            return {};
        }
    }

    async getSettings(sendResponse) {
        try {
            const result = await chrome.storage.local.get('settings');
            const defaultSettings = {
                enabled: true,
                showTooltip: true,
                soundEnabled: false,
                maxHistorySize: 50
            };

            const settings = { ...defaultSettings, ...result.settings };
            sendResponse({ settings });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async saveSettings(settings, sendResponse) {
        try {
            await chrome.storage.local.set({ settings });

            // 更新最大历史记录数量
            if (settings.maxHistorySize !== this.maxHistorySize) {
                this.maxHistorySize = settings.maxHistorySize;
                if (this.copyHistory.length > this.maxHistorySize) {
                    this.copyHistory = this.copyHistory.slice(0, this.maxHistorySize);
                    await this.saveData();
                }
            }

            sendResponse({ success: true });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    // 徽章功能已禁用 - 如需重新启用，取消注释以下方法
    /*
    async updateAllTabsBadge() {
      try {
        // 获取所有标签页
        const tabs = await chrome.tabs.query({});
        
        // 更新每个标签页的徽章
        tabs.forEach(tab => {
          if (tab.id) {
            this.updateBadge(tab.id);
          }
        });
        
        // 同时更新全局徽章
        this.updateBadge();
      } catch (error) {
        // 降级方案：只更新全局徽章
        this.updateBadge();
      }
    }
  
    updateBadge(tabId) {
      const count = this.copyHistory.length;
      const badgeText = count > 0 ? count.toString() : '';
      
      if (tabId) {
        // 更新指定标签页的徽章
        chrome.action.setBadgeText({
          text: badgeText,
          tabId: tabId
        });
        
        chrome.action.setBadgeBackgroundColor({
          color: '#4CAF50',
          tabId: tabId
        });
      } else {
        // 更新所有标签页的徽章
        chrome.action.setBadgeText({
          text: badgeText
        });
        
        chrome.action.setBadgeBackgroundColor({
          color: '#4CAF50'
        });
      }
    }
    */

    // 清除徽章显示
    clearBadge() {
        try {
            // 清除全局徽章文本
            chrome.action.setBadgeText({ text: '' });
        } catch (error) {
            // Silent fail
        }
    }

    onInstall() {
        // 设置默认设置
        this.saveSettings({
            enabled: true,
            showTooltip: true,
            soundEnabled: false,
            maxHistorySize: 50
        }, () => { });
    }

    onUpdate() {
        // 加载现有数据
        this.loadData();
    }

    onTabComplete(tabId, tab) {
        // 移除徽章更新功能
        // this.updateBadge(tabId);
    }
}

// 初始化背景服务
const backgroundService = new BackgroundService();

// 加载历史数据
backgroundService.loadData().then(() => {
    // 清除可能存在的徽章显示
    backgroundService.clearBadge();
    // 移除徽章更新功能
    // backgroundService.updateAllTabsBadge();
});
