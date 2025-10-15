// Chrome Copy Tools - Popup Script

class PopupController {
    constructor() {
        this.settings = {};
        this.history = [];
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadData();
        this.updateUI();
    }

    bindEvents() {
        // 开关切换
        const enableToggle = document.getElementById('enableToggle');
        enableToggle.addEventListener('change', this.handleToggle.bind(this));

        // 清空历史
        const clearHistoryBtn = document.getElementById('clearHistory');
        clearHistoryBtn.addEventListener('click', this.clearHistory.bind(this));

        // 设置按钮
        const settingsBtn = document.getElementById('settingsBtn');
        settingsBtn.addEventListener('click', this.showSettings.bind(this));

        // 关闭设置
        const closeSettingsBtn = document.getElementById('closeSettings');
        closeSettingsBtn.addEventListener('click', this.hideSettings.bind(this));

        // 保存设置
        const saveSettingsBtn = document.getElementById('saveSettings');
        saveSettingsBtn.addEventListener('click', this.saveSettings.bind(this));

        // 历史记录点击
        const historyList = document.getElementById('historyList');
        historyList.addEventListener('click', this.handleHistoryClick.bind(this));

        // 扫描按钮
        const scanBtn = document.getElementById('scanBtn');
        scanBtn.addEventListener('click', this.handleScan.bind(this));

        // Tab 切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', this.handleTabSwitch.bind(this));
        });
    }

    handleTabSwitch(event) {
        const clickedTab = event.currentTarget;
        const targetTab = clickedTab.dataset.tab;

        // 更新 tab 按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('tab-active');
        });
        clickedTab.classList.add('tab-active');

        // 更新 tab 内容显示
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('tab-pane-active');
        });
        const targetPane = document.querySelector(`[data-pane="${targetTab}"]`);
        if (targetPane) {
            targetPane.classList.add('tab-pane-active');
        }
    }

    async loadData() {
        try {
            // 获取设置
            const settingsResult = await this.sendMessage({ action: 'getSettings' });
            if (settingsResult.settings) {
                this.settings = settingsResult.settings;
            } else {
                // 如果没有设置，使用默认值
                this.settings = {
                    enabled: true,
                    showTooltip: true,
                    soundEnabled: false,
                    maxHistorySize: 50
                };
            }

            // 获取历史记录
            const historyResult = await this.sendMessage({ action: 'getCopyHistory' });
            if (historyResult.history) {
                this.history = historyResult.history;
            }

        } catch (error) {
            // 使用默认设置
            this.settings = {
                enabled: true,
                showTooltip: true,
                soundEnabled: false,
                maxHistorySize: 50
            };
        }
    }

    updateUI() {
        // 更新开关状态
        const enableToggle = document.getElementById('enableToggle');
        enableToggle.checked = this.settings.enabled;

        // 更新历史记录列表
        this.updateHistoryList();

        // 更新设置面板
        this.updateSettingsPanel();
    }

    updateHistoryList() {
        const historyList = document.getElementById('historyList');

        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="empty-state">暂无复制记录</div>';
            return;
        }

        // 显示所有历史记录，不限制条数，通过CSS控制显示区域高度
        const historyHTML = this.history.map(item => {
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
        <div class="history-item" data-text="${this.escapeHtml(item.text)}">
          <div class="history-text">${this.escapeHtml(item.text)}</div>
          <div class="history-meta">
            <span>${item.elementTag || 'Unknown'}</span>
            <span>${timeString}</span>
          </div>
        </div>
      `;
        }).join('');

        historyList.innerHTML = historyHTML;
    }

    updateSettingsPanel() {
        document.getElementById('showTooltipSetting').checked = this.settings.showTooltip;
        document.getElementById('soundEnabledSetting').checked = this.settings.soundEnabled;
        document.getElementById('maxHistorySetting').value = this.settings.maxHistorySize;
    }

    async handleToggle(event) {
        const enabled = event.target.checked;

        try {
            // 更新本地设置
            this.settings.enabled = enabled;

            // 保存到background
            await this.sendMessage({
                action: 'saveSettings',
                settings: this.settings
            });

            // 发送消息到当前标签页的content script
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                try {
                    await this.sendMessageToTab(tab.id, {
                        action: 'toggle',
                        enabled: enabled
                    });
                } catch (tabError) {
                    // 如果标签页没有content script，忽略错误
                }
            }

            // 更新UI
            this.updateUI();

        } catch (error) {
            // 恢复开关状态
            event.target.checked = !enabled;
            this.showNotification('状态切换失败', true);
        }
    }

    async clearHistory() {
        if (confirm('确定要清空所有复制记录吗？')) {
            try {
                await this.sendMessage({ action: 'clearHistory' });
                this.history = [];
                this.updateUI();
            } catch (error) {
                // Silent fail
            }
        }
    }

    showSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.classList.remove('settings-panel-hidden');
    }

    hideSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.classList.add('settings-panel-hidden');
    }

    async saveSettings() {
        const newSettings = {
            ...this.settings,
            showTooltip: document.getElementById('showTooltipSetting').checked,
            soundEnabled: document.getElementById('soundEnabledSetting').checked,
            maxHistorySize: parseInt(document.getElementById('maxHistorySetting').value)
        };

        try {
            await this.sendMessage({
                action: 'saveSettings',
                settings: newSettings
            });

            this.settings = newSettings;
            this.hideSettings();

            // 显示保存成功提示
            this.showNotification('设置已保存');
        } catch (error) {
            this.showNotification('保存失败', true);
        }
    }

    async handleHistoryClick(event) {
        const historyItem = event.target.closest('.history-item');
        if (historyItem) {
            const text = historyItem.dataset.text;
            if (text) {
                try {
                    await navigator.clipboard.writeText(text);
                    this.showNotification('已重新复制到剪贴板');
                } catch (error) {
                    this.showNotification('复制失败', true);
                }
            }
        }
    }

    showNotification(message, isError = false) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: ${isError ? '#f44336' : '#4CAF50'};
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 13px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

        document.body.appendChild(notification);

        // 自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    sendMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }

    sendMessageToTab(tabId, message) {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async handleScan() {
        const scanBtn = document.getElementById('scanBtn');
        const scanResults = document.getElementById('scanResults');

        try {
            // 禁用按钮，显示加载状态
            scanBtn.disabled = true;
            scanBtn.textContent = '🔍 扫描中...';

            // 获取当前活动标签页
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !tab.id) {
                throw new Error('无法获取当前标签页');
            }

            // 向content script发送扫描消息
            const response = await this.sendMessageToTab(tab.id, {
                action: 'scanDisabledElements'
            });

            if (response && response.success && response.data) {
                this.displayScanResults(response.data);
            } else {
                throw new Error('扫描失败或无响应');
            }

        } catch (error) {
            console.error('扫描错误:', error);
            this.showNotification('扫描失败，请确保页面已加载扩展', true);
            scanResults.classList.add('scan-results-hidden');
        } finally {
            // 恢复按钮状态
            scanBtn.disabled = false;
            scanBtn.textContent = '🔍 开始扫描';
        }
    }

    displayScanResults(result) {
        const scanResults = document.getElementById('scanResults');

        if (!result || !result.elements || result.elements.length === 0) {
            scanResults.innerHTML = `
                <div class="scan-empty">
                    ✅ 未找到禁用元素
                </div>
            `;
            scanResults.classList.remove('scan-results-hidden');
            this.showNotification('扫描完成，未找到禁用元素');
            return;
        }

        // 显示统计信息和元素列表
        let html = `
            <div class="scan-header">
                <div class="scan-stat">找到 <strong>${result.total}</strong> 个禁用元素</div>
                <button class="close-scan-btn">✕</button>
            </div>
            <div class="scan-list">
        `;

        result.elements.forEach((el, index) => {
            const visibleBadge = el.isVisible
                ? '<span class="badge badge-visible">可见</span>'
                : '<span class="badge badge-hidden">隐藏</span>';

            html += `
                <div class="scan-item" data-text="${this.escapeHtml(el.text)}">
                    <div class="scan-item-header">
                        <span class="scan-tag">&lt;${el.tagName}&gt;</span>
                        ${visibleBadge}
                    </div>
                    <div class="scan-text">${this.escapeHtml(el.text)}</div>
                    <div class="scan-meta">
                        ${el.id ? `ID: ${el.id} | ` : ''}
                        ${el.type ? `Type: ${el.type} | ` : ''}
                        原因: ${el.disabledBy}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        scanResults.innerHTML = html;
        scanResults.classList.remove('scan-results-hidden');

        // 绑定关闭按钮事件
        const closeBtn = scanResults.querySelector('.close-scan-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                scanResults.classList.add('scan-results-hidden');
            });
        }

        // 为扫描结果项添加点击复制功能
        scanResults.querySelectorAll('.scan-item').forEach(item => {
            item.addEventListener('click', async () => {
                const text = item.dataset.text;
                if (text) {
                    try {
                        await navigator.clipboard.writeText(text);
                        this.showNotification('已复制到剪贴板');
                        item.style.background = 'rgba(52, 199, 89, 0.1)';
                        setTimeout(() => {
                            item.style.background = '';
                        }, 300);
                    } catch (error) {
                        this.showNotification('复制失败', true);
                    }
                }
            });
        });

        this.showNotification(`扫描完成！找到 ${result.total} 个禁用元素`);
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// 初始化popup控制器
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});
