# 图片数据绘制工具使用说明

## 功能概述

这个工具可以将包含经纬度信息的数据点绘制到指定大小的图片上，生成新的可视化图片。

## 数据格式

输入数据应该是一个数组，每个元素包含以下字段：

```javascript
[
  {
    latitude: 33, // 纬度
    longitude: 109, // 经度
    value: 18, // 数值（可选）
    color: "rgb(108, 225, 238)", // 颜色
  },
];
```

## 元数据格式

元数据文件包含图片的基本信息：

```javascript
{
  "screenshotInfo": {
    "size": {
      "width": 2560,
      "height": 1271
    },
    "centerCoordinates": {
      "latitude": 35.67167096040158,
      "longitude": 108.50006415215609
    },
    "cornerCoordinates": {
      "topLeft": { "latitude": 39.7894666287145, "longitude": 96.71692089053477 },
      "topRight": { "latitude": 39.7894666287145, "longitude": 120.20672049719124 },
      "bottomLeft": { "latitude": 30.75735275143306, "longitude": 96.71692089053477 },
      "bottomRight": { "latitude": 30.75735275143306, "longitude": 120.20672049719124 }
    }
  }
}
```

## 使用方法

### 1. 基本使用

```javascript
const fs = require("fs");
const sharp = require("sharp");

// 读取元数据
const metaFile = JSON.parse(
  fs.readFileSync(
    "./public/screenshot_metadata_2025-09-02T07-18-43.json",
    "utf8"
  )
);

// 准备数据
const data = [
  {
    latitude: 33,
    longitude: 109,
    value: 18,
    color: "rgb(108, 225, 238)",
  },
];

// 生成图片
canvasPngByLatlons(metaFile, data);
```

### 2. 函数参数

- `meta`: 元数据对象，包含图片尺寸和坐标信息
- `data`: 数据数组，每个元素包含经纬度和颜色信息

### 3. 输出

函数会生成一个 PNG 图片文件，保存在 `./public/` 目录下，文件名格式为 `output_时间戳.png`

## 坐标转换原理

函数会自动将经纬度坐标转换为图片像素坐标：

1. 计算图片覆盖的经纬度范围
2. 将每个数据点的经纬度转换为相对位置（0-1 之间）
3. 将相对位置转换为像素坐标
4. 在对应位置绘制彩色圆点

## 注意事项

1. 确保数据点的经纬度在图片覆盖范围内
2. 颜色格式支持 RGB 格式：`'rgb(r, g, b)'`
3. 数据点会以半透明圆形显示
4. 如果数据量很大，建议分批处理

## 依赖

- `sharp`: 用于图片处理
- `fs`: 用于文件读写

## 安装依赖

```bash
npm install sharp
```
