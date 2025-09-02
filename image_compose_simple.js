const fs = require("fs");
const path = require("path");

// 颜色级别映射
const colorLevel = {
  10: [62, 160, 239],
  15: [108, 225, 238],
  20: [96, 214, 63],
  25: [70, 137, 37],
  30: [252, 251, 74],
  35: [223, 195, 73],
  40: [239, 147, 47],
  45: [231, 53, 31],
  50: [184, 43, 41],
  55: [183, 36, 28],
  60: [236, 62, 237],
  65: [132, 39, 179],
  70: [174, 148, 237],
};

// 根据数值获取对应的颜色级别
function getColorLevel(value) {
  const levels = Object.keys(colorLevel)
    .map(Number)
    .sort((a, b) => a - b);

  for (let i = 0; i < levels.length; i++) {
    if (value <= levels[i]) {
      return levels[i];
    }
  }

  // 如果值大于70，返回70的颜色
  return 70;
}

// 将经纬度坐标转换为图片像素坐标
function geoToPixel(lat, lon, imageBounds, imageSize) {
  const { width, height } = imageSize;
  const { topLeft, bottomRight } = imageBounds;

  // 计算经纬度在图片范围内的比例
  const latRatio =
    (lat - bottomRight.latitude) / (topLeft.latitude - bottomRight.latitude);
  const lonRatio =
    (lon - topLeft.longitude) / (bottomRight.longitude - topLeft.longitude);

  // 转换为像素坐标
  const x = Math.round(lonRatio * width);
  const y = Math.round((1 - latRatio) * height);

  return { x, y };
}

// 简单的PNG处理函数（这里我们创建一个简化的实现）
function createOverlayImage(
  originalImagePath,
  outputPath,
  dataPoints,
  imageBounds,
  imageSize
) {
  console.log("由于PNG处理复杂，我们将创建一个数据可视化脚本...");

  // 创建一个简单的HTML文件来可视化数据
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>数据可视化</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; }
        .image-container { position: relative; display: inline-block; }
        .data-point {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            pointer-events: none;
        }
        .legend {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>数据可视化结果</h1>
        <div class="image-container">
            <img src="screenshot_2025-09-02T07-18-43.png" alt="原始图片" style="max-width: 100%; height: auto;">
            ${dataPoints
              .map((point) => {
                const pixel = geoToPixel(
                  point.latitude,
                  point.longitude,
                  imageBounds,
                  imageSize
                );
                const level = getColorLevel(point.value);
                const color = colorLevel[level];
                return `<div class="data-point" style="left: ${pixel.x}px; top: ${pixel.y}px; background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div>`;
              })
              .join("")}
        </div>
        <div class="legend">
            ${Object.entries(colorLevel)
              .map(
                ([level, color]) =>
                  `<div class="legend-item">
                <div class="legend-color" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div>
                <span>${level}</span>
              </div>`
              )
              .join("")}
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, htmlContent);
  console.log(`HTML可视化文件已保存到: ${outputPath}`);
}

async function composeImage() {
  try {
    console.log("开始处理图片...");

    // 读取元数据文件
    const metadataPath = path.join(
      __dirname,
      "public",
      "screenshot_metadata_2025-09-02T07-18-43.json"
    );
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

    // 读取数据文件
    const dataPath = path.join(__dirname, "public", "nc_data_filtered.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // 获取图片边界信息
    const imageBounds = metadata.screenshotInfo.cornerCoordinates;
    const imageSize = metadata.screenshotInfo.size;

    console.log("开始处理数据点...");
    console.log(`图片尺寸: ${imageSize.width} x ${imageSize.height}`);
    console.log(`数据点数量: ${data[0].data_points.length}`);

    // 过滤在图片范围内的数据点
    const filteredPoints = data[0].data_points.filter((point) => {
      const { latitude, longitude } = point;
      return (
        latitude >= imageBounds.bottomLeft.latitude &&
        latitude <= imageBounds.topLeft.latitude &&
        longitude >= imageBounds.topLeft.longitude &&
        longitude <= imageBounds.bottomRight.longitude
      );
    });

    console.log(`在图片范围内的数据点: ${filteredPoints.length}`);

    // 创建HTML可视化文件
    const outputPath = path.join(
      __dirname,
      "public",
      "data_visualization.html"
    );
    createOverlayImage(
      path.join(__dirname, "public", "screenshot_2025-09-02T07-18-43.png"),
      outputPath,
      filteredPoints,
      imageBounds,
      imageSize
    );

    console.log("处理完成！");
    console.log("请打开 public/data_visualization.html 文件查看结果");
  } catch (error) {
    console.error("处理过程中出现错误:", error);
  }
}

// 运行程序
composeImage();
