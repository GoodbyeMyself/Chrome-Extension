# Chrome Copy Tools

一个功能强大的Chrome浏览器插件，支持双击页面元素复制文案到剪贴板，并提供禁用元素扫描功能。

## 🎯 核心功能

### 1. 双击静默复制
- 🖱️ **双击复制**: 双击页面上任意元素即可复制其文案
- 🤫 **静默模式**: 无任何视觉反馈，不影响页面正常使用
- 📋 **智能识别**: 自动识别文本、输入框值、图片alt属性等内容
- ⚡ **即时响应**: 复制操作即时完成，无延迟

### 2. 复制历史管理
- 📊 **历史记录**: 后台自动记录所有复制内容
- 🔄 **重新复制**: 点击历史记录可快速重新复制
- 📜 **滚动查看**: 支持滚动查看所有历史记录
- 🗑️ **清空历史**: 一键清空所有历史记录

### 3. 禁用元素扫描（新功能！）
- 🔍 **自动扫描**: 一键扫描页面所有被禁用的表单元素
- 📝 **内容提取**: 提取禁用元素的文本、值、placeholder等
- 📊 **详细信息**: 显示元素类型、位置、可见性、XPath等
- 💡 **多种调用**: 支持弹窗、控制台、测试页面三种调用方式
- 🎯 **精准定位**: 提供元素的详细定位信息

### 4. 个性化设置
- ⚙️ **历史记录数量**: 自定义保存的历史记录条数（10-100条）
- 🎵 **提示音开关**: 可选择启用或禁用复制提示音
- 🎯 **功能开关**: 随时启用或禁用插件的复制功能
- 💾 **自动保存**: 设置自动保存，跨浏览器会话持久化

### 5. 用户体验优化
- 🎨 **现代化界面**: Tab页签设计，功能分区清晰
- 📱 **响应式布局**: 弹窗界面适配不同尺寸
- 🔔 **实时反馈**: 操作成功后显示友好提示
- 🎭 **动画效果**: 平滑的交互动画，提升使用体验

## 安装方法

1. 下载或克隆此项目到本地
2. 打开Chrome浏览器，进入扩展程序管理页面 (`chrome://extensions/`)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹 `chrome-copy-tools`
6. 插件安装完成！

## 使用方法

### 基础使用

1. 安装插件后，双击任意网页元素即可静默复制其文案
2. 复制过程完全静默，不会显示任何提示或动画
3. 点击插件图标可查看复制历史和调整设置
4. 可通过插件弹窗中的开关来启用/禁用功能
5. 在弹窗中点击历史记录可重新复制该内容
6. 通过设置面板可调整历史记录数量、提示音等功能

### 禁用元素扫描功能

新增功能可以自动扫描页面上所有被禁用的元素并提取文本：

**使用方式 1: 通过插件弹窗（推荐）**
1. 点击浏览器工具栏上的扩展图标
2. 切换到 "🔍 扫描禁用" Tab 页签
3. 点击 "🔍 开始扫描" 按钮
4. 查看扫描结果，点击任意结果可复制其文本

**使用方式 2: 控制台调用**
```javascript
// 打开开发者工具 (F12)，在控制台执行：
const result = window.chromeCopyTools.scanDisabledElements();
console.log('找到', result.total, '个禁用元素');
console.table(result.elements);
```

**使用方式 3: 测试页面**
- 打开测试页面 `test/chrome-copy-tools.html`
- 点击 "🔍 扫描禁用元素" 按钮
- 查看详细的扫描结果

更多使用示例和技术细节，请查看：
- [禁用元素扫描器文档](DISABLED_ELEMENTS_SCANNER.md)
- [使用示例](USAGE_EXAMPLES.md)

## 支持的内容类型

- 普通文本内容
- 输入框和文本域的值（包括被禁用的输入框）
- 选择框的选中选项（包括被禁用的选择框）
- 按钮文本（包括被禁用的按钮）
- 图片的alt属性
- 链接文本
- 标题和标签文本
- 被禁用表单元素的placeholder、默认值等属性

## 静默模式特性

- ✅ **无视觉干扰**: 不添加边框、动画或提示气泡
- ✅ **保持原生体验**: 不阻止页面默认的双击行为
- ✅ **后台运行**: 静默记录复制历史
- ✅ **控制台日志**: 仅在开发者工具中显示调试信息
- ✅ **被禁用元素支持**: 自动检测和处理被禁用的表单元素

## 项目结构

```
chrome-copy-tools/
├── manifest.json          # 插件配置文件 (Manifest V3)
├── content.js             # 内容脚本 - 主要功能实现
├── content.css            # 内容样式 (静默模式)
├── background.js          # 后台脚本 - 数据管理和Service Worker
├── popup.html             # 弹窗界面
├── popup.css              # 弹窗样式
├── popup.js               # 弹窗逻辑和设置管理
├── offscreen.html         # 离屏文档 (用于剪贴板操作)
├── offscreen.js           # 离屏脚本 - 处理剪贴板API
├── icons/                 # 插件图标文件夹
│   ├── icon16.png         # 16x16 图标
│   ├── icon32.png         # 32x32 图标
│   ├── icon48.png         # 48x48 图标
│   ├── icon128.png        # 128x128 图标
│   └── README.md          # 图标说明文档
└── README.md              # 项目说明文档
```

## 技术实现

### 核心技术栈

- **Manifest V3**: 使用最新的Chrome扩展程序规范
- **Content Scripts**: 在网页中注入脚本实现双击监听和文本提取
- **Service Worker**: 后台处理数据存储和消息通信
- **Offscreen Document**: 处理剪贴板操作，解决Manifest V3限制
- **Chrome Storage API**: 持久化存储设置和历史记录
- **Clipboard API**: 现代剪贴板操作，兼容降级方案
- **DOM Traversal**: 深度遍历DOM树实现禁用元素扫描
- **权限管理**: 最小权限原则，仅申请必要权限

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   Chrome Extension                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐    ┌──────────────┐   ┌─────────────┐ │
│  │   Popup     │◄───┤   Background │───►│  Offscreen  │ │
│  │   (UI)      │    │  (Service    │   │  (Clipboard)│ │
│  │             │    │   Worker)    │   │             │ │
│  └─────────────┘    └──────────────┘   └─────────────┘ │
│         │                   │                           │
│         │                   ▼                           │
│         │           ┌──────────────┐                    │
│         └──────────►│   Storage    │                    │
│                     │     API      │                    │
│                     └──────────────┘                    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                      Web Page                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Content Script (content.js)            │   │
│  │  • 双击事件监听                                  │   │
│  │  • 文本提取逻辑                                  │   │
│  │  • 禁用元素扫描                                  │   │
│  │  • DOM 遍历与分析                                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 开发说明

### 主要文件说明

本插件使用Chrome Extension Manifest V3开发，文件结构清晰：

| 文件 | 说明 | 技术要点 |
|------|------|----------|
| `manifest.json` | 插件配置文件 | Manifest V3规范、权限声明、脚本注册 |
| `content.js` | 内容脚本 | 双击监听、文本提取、DOM遍历、元素扫描 |
| `content.css` | 内容样式 | 静默模式样式（当前为空，预留扩展） |
| `background.js` | 后台脚本 | Service Worker、数据管理、消息通信 |
| `popup.html` | 弹窗界面 | Tab页签布局、历史列表、扫描结果展示 |
| `popup.css` | 弹窗样式 | 现代化UI、响应式设计、动画效果 |
| `popup.js` | 弹窗逻辑 | 设置管理、历史展示、扫描调用 |
| `offscreen.html` | 离屏文档 | 剪贴板操作的承载页面 |
| `offscreen.js` | 离屏脚本 | Clipboard API调用、降级方案 |
| `icons/` | 图标资源 | 16px、32px、48px、128px多尺寸 |

### 核心功能模块

#### 1. 双击监听模块 (`content.js`)
```javascript
// 监听双击事件
document.addEventListener('dblclick', async (event) => {
  // 获取点击元素
  // 提取文本内容
  // 发送到后台进行复制
});
```

#### 2. 文本提取模块 (`content.js`)
- 支持普通文本、输入框、选择框、按钮等元素
- 智能处理被禁用的表单元素
- 提取alt、title、placeholder等属性

#### 3. 剪贴板操作模块 (`offscreen.js`)
```javascript
// Manifest V3 要求使用 Offscreen Document
await navigator.clipboard.writeText(text);
```

#### 4. 历史管理模块 (`background.js`)
- 使用 Chrome Storage API 持久化存储
- 支持设置最大历史记录数量
- 自动清理超出限制的旧记录

#### 5. 禁用元素扫描模块 (`content.js`)
```javascript
// 深度遍历 DOM 树
function traverseDOM(node, results) {
  // 检查是否为禁用元素
  // 提取元素信息
  // 递归遍历子节点
}
```

#### 6. 设置系统模块 (`popup.js`)
- 启用/禁用功能开关
- 历史记录数量设置（10-100条）
- 提示音开关
- 设置实时同步

---

## 🚀 Chrome 插件开发流程

### 一、准备阶段

#### 1. 环境准备
- ✅ 安装 Chrome 浏览器（最新版本）
- ✅ 准备代码编辑器（VS Code 推荐）
- ✅ 了解 HTML、CSS、JavaScript 基础
- ✅ 熟悉 Chrome DevTools 调试工具

#### 2. 学习资源
- 📚 [Chrome Extension 官方文档](https://developer.chrome.com/docs/extensions/)
- 📚 [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- 📚 [Chrome Extension API 参考](https://developer.chrome.com/docs/extensions/reference/)

### 二、开发阶段

#### 1. 创建基础结构

**必需文件：**
```
your-extension/
├── manifest.json          # 必需：插件配置文件
├── background.js          # 可选：后台脚本（Service Worker）
├── content.js             # 可选：内容脚本
├── popup.html             # 可选：弹窗页面
├── popup.js               # 可选：弹窗脚本
└── icons/                 # 推荐：图标文件
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

#### 2. 编写 manifest.json

这是插件的核心配置文件，示例：

```json
{
  "manifest_version": 3,
  "name": "Your Extension Name",
  "version": "1.0.0",
  "description": "Extension description",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

#### 3. 开发功能模块

**Content Script (内容脚本)**
- 运行在网页环境中
- 可访问和修改 DOM
- 可监听页面事件
- 需要通过消息通信与 Background Script 交互

**Background Script (后台脚本)**
- Manifest V3 使用 Service Worker
- 处理长期运行的任务
- 管理扩展状态
- 处理跨标签页通信

**Popup (弹窗页面)**
- 用户界面入口
- 显示设置和信息
- 与 Background Script 通信

#### 4. 调试方法

**加载未打包的扩展：**
1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择插件文件夹

**调试技巧：**
- **Content Script**: 在网页中按 F12，查看 Console
- **Background Script**: 在 `chrome://extensions/` 点击"Service Worker"查看
- **Popup**: 右键点击插件图标 → 检查弹出内容
- **错误查看**: 在 `chrome://extensions/` 查看错误提示

### 三、测试阶段

#### 1. 功能测试
- ✅ 测试所有功能是否正常工作
- ✅ 测试不同网页的兼容性
- ✅ 测试权限申请是否合理
- ✅ 测试性能影响

#### 2. 兼容性测试
- ✅ 测试不同 Chrome 版本
- ✅ 测试不同操作系统（Windows、Mac、Linux）
- ✅ 测试与其他扩展的兼容性

#### 3. 安全测试
- ✅ 检查是否有安全漏洞
- ✅ 验证数据存储安全性
- ✅ 确认权限使用最小化原则

### 四、发布阶段

#### 1. 准备发布材料
- 📝 编写详细的使用说明
- 🎨 准备宣传图片和截图
- 📄 准备隐私政策（如需要）
- ✅ 完成最终测试

#### 2. 打包扩展
```bash
# 方法1: 手动打包
# 在 chrome://extensions/ 点击"打包扩展程序"

# 方法2: 使用 zip 命令
zip -r extension.zip your-extension/ -x "*.git*"
```

#### 3. Chrome Web Store 发布
1. 注册 [Chrome Web Store 开发者账号](https://chrome.google.com/webstore/devconsole)（需支付 $5 注册费）
2. 上传 .zip 文件
3. 填写商店信息（名称、描述、截图等）
4. 提交审核
5. 等待审核通过（通常 1-3 天）

---

## ⚠️ 开发注意事项

### 1. Manifest V3 重要变更

#### ❌ 不再支持的功能
- **Background Pages** → 改用 Service Worker
- **executeScript 动态代码** → 改用预注册的脚本
- **webRequest blocking** → 改用 declarativeNetRequest
- **远程代码执行** → 所有代码必须打包在扩展内

#### ✅ 必须遵守的规则
```javascript
// ❌ 错误：不能使用内联脚本
<button onclick="handleClick()">Click</button>

// ✅ 正确：使用事件监听
document.getElementById('btn').addEventListener('click', handleClick);

// ❌ 错误：不能使用 eval
eval('console.log("test")');

// ✅ 正确：直接执行代码
console.log("test");
```

### 2. 权限管理

#### 最小权限原则
只申请必需的权限，避免用户担心隐私问题。

**常用权限说明：**
| 权限 | 说明 | 使用场景 |
|------|------|----------|
| `storage` | 数据存储 | 保存设置和历史记录 |
| `activeTab` | 当前标签页访问 | 操作当前页面内容 |
| `tabs` | 标签页信息 | 获取标签页URL等信息 |
| `clipboardWrite` | 写入剪贴板 | 复制文本到剪贴板 |
| `scripting` | 动态脚本注入 | 动态执行代码 |
| `offscreen` | 离屏文档 | 在后台使用DOM API |

#### 权限申请示例
```json
{
  "permissions": [
    "storage",        // 必需：存储数据
    "offscreen"       // 必需：剪贴板操作
  ],
  "host_permissions": [
    "<all_urls>"      // 谨慎使用：访问所有网站
  ]
}
```

### 3. 性能优化

#### Content Script 优化
```javascript
// ❌ 避免：频繁操作 DOM
setInterval(() => {
  document.querySelectorAll('.item').forEach(/* ... */);
}, 100);

// ✅ 推荐：使用事件委托
document.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    // 处理点击
  }
});
```

#### Service Worker 优化
```javascript
// Service Worker 可能随时休眠，避免依赖全局状态
// ❌ 避免
let globalState = {};

// ✅ 推荐：使用 chrome.storage
chrome.storage.local.get(['state'], (result) => {
  // 使用 result.state
});
```

### 4. 消息通信

#### Content Script ↔ Background
```javascript
// Content Script 发送消息
chrome.runtime.sendMessage({
  action: 'copyText',
  text: 'Hello'
}, (response) => {
  console.log(response);
});

// Background 接收消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyText') {
    // 处理消息
    sendResponse({ success: true });
  }
  return true; // 异步响应时必须返回 true
});
```

### 5. 调试技巧

#### 常见问题排查
1. **Service Worker 未激活**
   - 检查 manifest.json 配置
   - 查看 chrome://extensions/ 错误提示
   - 重新加载扩展

2. **Content Script 未注入**
   - 检查 matches 配置
   - 确认页面是否符合匹配规则
   - 检查控制台错误

3. **消息通信失败**
   - 确认 sendResponse 是否正确调用
   - 异步操作时返回 true
   - 检查消息格式

4. **权限不足**
   - 检查 manifest.json 权限声明
   - 重新加载扩展使权限生效

### 6. 安全最佳实践

#### 内容安全策略 (CSP)
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

#### 数据验证
```javascript
// ✅ 始终验证外部输入
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 验证消息来源
  if (!sender.tab) return;
  
  // 验证消息格式
  if (typeof request.text !== 'string') return;
  
  // 处理消息
  handleMessage(request);
});
```

#### 敏感数据处理
```javascript
// ✅ 使用 chrome.storage.local（本地存储）
// ❌ 避免使用 chrome.storage.sync（同步敏感数据）
chrome.storage.local.set({ token: 'sensitive_data' });
```

### 7. 用户体验优化

#### 友好的错误提示
```javascript
try {
  await navigator.clipboard.writeText(text);
} catch (error) {
  // 提供降级方案
  fallbackCopy(text);
  // 友好提示
  showNotification('复制成功（使用备用方法）');
}
```

#### 性能监控
```javascript
// 监控操作耗时
const start = performance.now();
await performTask();
const duration = performance.now() - start;
console.log(`操作耗时: ${duration}ms`);
```

### 8. 发布前检查清单

- [ ] 所有功能正常工作
- [ ] 没有控制台错误
- [ ] 权限申请合理（最小化原则）
- [ ] 代码符合 Manifest V3 规范
- [ ] 图标准备齐全（16、48、128px）
- [ ] README 文档完善
- [ ] 隐私政策准备（如需要）
- [ ] 多浏览器/系统测试通过
- [ ] 性能影响可接受
- [ ] 安全审查完成

### 9. 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `Uncaught (in promise)` | 未捕获的 Promise 错误 | 添加 try-catch 或 .catch() |
| `Extension context invalidated` | 扩展被重新加载 | 添加错误处理，提示用户刷新 |
| `Cannot read property of undefined` | 对象属性不存在 | 使用可选链 `?.` 或先检查 |
| `Port error: Could not establish connection` | 接收方不存在 | 检查消息接收方是否注册监听器 |
| `Service worker stopped` | Service Worker 休眠 | 避免依赖全局状态，使用 Storage |

### 10. 推荐的开发工具

- **代码编辑器**: Visual Studio Code
  - 插件推荐: ESLint, Prettier, Chrome Extension Tools
- **调试工具**: Chrome DevTools
- **图标制作**: Figma, Adobe Illustrator, Canva
- **版本控制**: Git + GitHub
- **文档编写**: Markdown
- **打包工具**: Web-ext (Mozilla 提供，支持 Chrome)

---

## 📚 参考资源

### 官方文档
- [Chrome Extension 开发文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 文档](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [Chrome Web Store 发布指南](https://developer.chrome.com/docs/webstore/publish/)

### 社区资源
- [Stack Overflow - Chrome Extension Tag](https://stackoverflow.com/questions/tagged/google-chrome-extension)
- [Chrome Extension 示例](https://github.com/GoogleChrome/chrome-extensions-samples)
- [Awesome Chrome Extensions](https://github.com/fregante/Awesome-WebExtensions)

### 本项目相关
- [项目 GitHub](https://github.com/yourusername/chrome-copy-tools)
- [问题反馈](https://github.com/yourusername/chrome-copy-tools/issues)
- [功能建议](https://github.com/yourusername/chrome-copy-tools/discussions)

## 许可证

MIT License

## 📋 更新日志

### v1.1.0 (当前版本) - 2024-10
#### ✨ 新增功能
- **禁用元素扫描功能**
  - 自动扫描禁用的表单元素（input, select, textarea, button）
  - 提取禁用元素的文本内容、值、placeholder等
  - 支持多种禁用类型检测（disabled、aria-disabled、readonly）
  - 提供详细的元素信息（类型、位置、可见性、XPath路径等）
  - 三种调用方式：Popup 弹窗、控制台命令、测试页面
  
- **Tab 页签界面设计**
  - "📋 最近复制" 和 "🔍 扫描禁用" 采用 Tab 切换
  - 优化弹窗空间利用，避免高度溢出
  - 更清晰的功能分区和视觉层次
  - 响应式布局适配

- **文档完善**
  - 添加完整的开发流程说明
  - 详细的 Manifest V3 注意事项
  - 权限管理最佳实践
  - 调试技巧和常见问题解决方案

#### 🔧 优化改进
- 优化弹窗界面样式和交互动画
- 改进扫描结果展示格式
- 增强错误处理和用户反馈

### v1.0.0 - 2024-09
#### ✅ 初始版本发布
- **核心功能**
  - 双击任意元素复制文案功能
  - 静默复制模式（无视觉反馈）
  - 智能文本提取算法
  - 支持被禁用元素的复制

- **历史管理**
  - 复制历史记录功能
  - 历史记录重复制
  - 可自定义历史记录数量（10-100条）
  - 一键清空历史

- **设置系统**
  - 功能启用/禁用开关
  - 提示音开关
  - 设置持久化存储

- **技术实现**
  - 完整的 Manifest V3 规范实现
  - Service Worker 后台处理
  - Offscreen Document 剪贴板操作
  - 多种剪贴板操作降级方案
  - 完善的权限管理
  - 现代化的 UI 设计

### 🔮 计划功能 (Roadmap)

#### v1.2.0 (计划中)
- 🔄 **快捷键支持**
  - 自定义快捷键触发复制
  - 快捷键打开弹窗
  - 快捷键切换启用状态

- 🔄 **导出功能**
  - 导出历史记录为 JSON/CSV
  - 导出扫描结果
  - 批量操作支持

#### v1.3.0 (规划中)
- 🔄 **高级功能**
  - 自定义复制格式（Markdown、HTML等）
  - 网站白名单/黑名单
  - 更多文本提取规则
  - 正则表达式过滤

- 🔄 **用户体验**
  - 复制成功动画提示（可选）
  - 主题切换（亮色/暗色）
  - 多语言支持

#### 未来版本
- 📊 统计分析功能
- 🔗 云同步支持
- 🤖 AI 智能提取
- 🎨 自定义样式主题
