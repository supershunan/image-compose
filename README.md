# 图片数据可视化工具

这个项目用于将经纬度数据点绘制到地图图片上，根据数值大小映射到不同的颜色级别。

## 功能说明

- 读取 `nc_data_filtered.json` 中的经纬度数据点
- 根据数值大小映射到预定义的颜色级别
- 将数据点绘制到 `screenshot_2025-09-02T07-18-43.png` 图片上
- 生成新的可视化图片

## 颜色映射规则

数据值范围与颜色对应关系：

- 10-15: 蓝色 (62, 160, 239)
- 15-20: 青色 (108, 225, 238)
- 20-25: 绿色 (96, 214, 63)
- 25-30: 深绿色 (70, 137, 37)
- 30-35: 黄色 (252, 251, 74)
- 35-40: 橙色 (223, 195, 73)
- 40-45: 橙红色 (239, 147, 47)
- 45-50: 红色 (231, 53, 31)
- 50-55: 深红色 (184, 43, 41)
- 55-60: 暗红色 (183, 36, 28)
- 60-65: 紫色 (236, 62, 237)
- 65-70: 深紫色 (132, 39, 179)
- 70+: 淡紫色 (174, 148, 237)

## 文件说明

### 输入文件

- `public/screenshot_2025-09-02T07-18-43.png`: 原始地图图片
- `public/screenshot_metadata_2025-09-02T07-18-43.json`: 图片元数据（包含边界坐标信息）
- `public/nc_data_filtered.json`: 经纬度数据文件

### 输出文件

- `public/simple_viewer.html`: 简单数据可视化查看器（推荐使用）
- `public/fixed_composed_image.png`: 修复的静态 PNG 图片文件
- `public/data_visualization.html`: 交互式 HTML 可视化文件
- `public/canvas_visualization.html`: Canvas 版本 HTML 可视化
- `public/static_composed_image.png`: 原始静态 PNG 图片文件（有问题）

## 使用方法

### 1. 交互式 HTML 可视化（推荐）

```bash
node image_compose_simple.js
```

然后在浏览器中打开 `public/data_visualization.html` 文件。

特点：

- 交互式控制（点大小、透明度、显示点数）
- 实时预览
- 完整的图例显示
- 性能优化

### 2. 静态 PNG 图片

```bash
node generate_static_image.js
```

生成 `public/static_composed_image.png` 文件。

### 3. Canvas 版本 HTML 可视化

```bash
node image_compose_simple.js
```

生成 `public/data_visualization.html` 文件，使用 Canvas API 进行绘制。

## 技术实现

### 坐标转换

使用线性插值将经纬度坐标转换为图片像素坐标：

```javascript
const latRatio =
  (lat - bottomRight.latitude) / (topLeft.latitude - bottomRight.latitude);
const lonRatio =
  (lon - topLeft.longitude) / (bottomRight.longitude - topLeft.longitude);
const x = Math.round(lonRatio * width);
const y = Math.round((1 - latRatio) * height);
```

### 颜色映射

根据数值大小确定颜色级别：

```javascript
function getColorLevel(value) {
  const levels = Object.keys(colorLevel)
    .map(Number)
    .sort((a, b) => a - b);
  for (let i = 0; i < levels.length; i++) {
    if (value <= levels[i]) {
      return levels[i];
    }
  }
  return 70; // 默认颜色
}
```

## 性能说明

- 原始数据包含约 188 万个数据点
- HTML 版本默认显示前 10,000 个点以提高性能
- 静态 PNG 版本限制为前 50,000 个点
- 可以通过调整参数来控制显示的点数

## 依赖项

- Node.js
- 内置模块：fs, path
- 可选：jimp, sharp（用于高级图片处理）

## 注意事项

1. 确保所有输入文件都在 `public` 目录下
2. 图片文件较大，处理时间可能较长
3. 建议使用 HTML 版本获得最佳的可视化效果
4. 静态 PNG 版本是简化实现，可能不如 HTML 版本清晰

## 故障排除

如果遇到问题：

1. 检查文件路径是否正确
2. 确保 JSON 文件格式正确
3. 检查图片文件是否存在
4. 查看控制台错误信息
