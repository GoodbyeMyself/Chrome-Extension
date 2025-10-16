# Chrome Extensions Collection

🚀 一个精选的 Chrome 浏览器插件合集，提供实用的浏览器增强功能。

## 📦 插件列表

### 1. Chrome Copy Tools - 智能复制工具

双击网页元素即可复制文案，支持历史管理和禁用元素扫描。[详细文档 →](chrome-copy-tools/README.md)

**核心功能：**
- 🖱️ 双击复制任意元素文案
- 📋 自动记录复制历史
- 🔍 扫描禁用表单元素
- ⚙️ 个性化设置

---

## 🎯 项目结构

```
Chrome-Extension/
├── chrome-copy-tools/          # 智能复制工具
├── test/                       # 测试文件
└── README.md                   # 本文件
```

## 🛠️ 技术栈

- **Manifest V3**: 最新的 Chrome 扩展程序规范
- **Service Worker**: 后台处理和数据管理
- **Content Scripts**: 网页内容交互
- **Chrome Storage API**: 数据持久化
- **Offscreen Documents**: 剪贴板操作支持
- **Modern JavaScript**: ES6+ 语法

## 📚 开发指南

### 环境要求

- Chrome 浏览器 88+ (推荐最新版本)
- 基础的 HTML、CSS、JavaScript 知识
- 了解 Chrome Extension API

### 通用安装方法

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd Chrome-Extension
   ```

2. **安装插件**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择对应的插件文件夹（如 `chrome-copy-tools`）

3. **开始使用**
   - 插件安装成功后会在浏览器工具栏显示图标
   - 点击图标查看功能和设置
   - 查看各插件的 README 了解详细用法

### 调试方法

**Content Script 调试：**
- 在网页中按 `F12` 打开开发者工具
- 在 Console 标签查看日志

**Background Script 调试：**
- 访问 `chrome://extensions/`
- 找到对应插件，点击"Service Worker"链接
- 查看后台脚本的日志和错误

**Popup 调试：**
- 右键点击插件图标
- 选择"检查弹出内容"
- 在打开的开发者工具中调试


## 📖 学习资源

### 官方文档
- [Chrome Extension 开发文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension API 参考](https://developer.chrome.com/docs/extensions/reference/)

### 社区资源
- [Chrome Extension 示例代码](https://github.com/GoogleChrome/chrome-extensions-samples)
- [Awesome Chrome Extensions](https://github.com/fregante/Awesome-WebExtensions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-chrome-extension)

## 🤝 贡献指南

欢迎贡献新的插件或改进现有插件！

### 添加新插件

1. 在项目根目录创建新文件夹（使用小写字母和连字符命名）
2. 遵循以下基本结构：
   ```
   your-extension/
   ├── manifest.json       # 必需
   ├── background.js       # 如需要
   ├── content.js          # 如需要
   ├── popup.html/js/css   # 如需要
   ├── icons/              # 必需（16、48、128px）
   └── README.md           # 必需
   ```
3. 编写详细的 README 文档
4. 在根目录 README 中添加插件介绍
5. 提交 Pull Request

### 改进现有插件

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## ⚠️ 注意事项

### Manifest V3 要求
- 所有插件必须使用 Manifest V3
- 不允许使用远程代码执行
- 不能使用内联脚本
- Background Pages 改用 Service Worker

### 代码规范
- 使用清晰的变量和函数命名
- 添加必要的注释
- 处理可能的错误情况
- 提供良好的用户反馈

## 🌟 Star History

如果这个项目对你有帮助，欢迎给个 Star ⭐

---

**维护状态**: ✅ 积极维护中
