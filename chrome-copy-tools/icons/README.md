# 图标文件说明

由于无法直接生成图像文件，请手动创建以下尺寸的图标文件：

## 需要的图标文件

1. `icon16.png` - 16x16 像素
2. `icon32.png` - 32x32 像素  
3. `icon48.png` - 48x48 像素
4. `icon128.png` - 128x128 像素

## 图标设计建议

- 使用简洁的复制/剪贴板相关图标
- 主色调建议使用绿色 (#4CAF50) 体现"复制成功"的概念
- 背景透明或白色
- 图标应该清晰易识别

## 临时解决方案

在开发测试阶段，您可以：
1. 使用在线图标生成器创建简单图标
2. 从免费图标库下载合适的图标（如 Feather Icons, Material Icons）
3. 使用图像编辑软件创建简单的文字图标

## SVG 参考

可以基于以下SVG代码创建图标：

```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="16" fill="#4CAF50"/>
  <rect x="24" y="32" width="56" height="64" rx="4" fill="white" stroke="#333" stroke-width="2"/>
  <rect x="48" y="24" width="56" height="64" rx="4" fill="white" stroke="#333" stroke-width="2"/>
  <text x="64" y="70" text-anchor="middle" fill="#333" font-family="Arial" font-size="24" font-weight="bold">📋</text>
</svg>
```
