const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

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

// 创建SVG覆盖层
function createSVGOverlay(dataPoints, imageBounds, imageSize) {
  const svgWidth = imageSize.width;
  const svgHeight = imageSize.height;

  const circles = dataPoints
    .map((point) => {
      const pixel = geoToPixel(
        point.latitude,
        point.longitude,
        imageBounds,
        imageSize
      );
      const level = getColorLevel(point.value);
      const color = colorLevel[level];

      return `<circle cx="${pixel.x}" cy="${pixel.y}" r="2" fill="rgb(${color[0]}, ${color[1]}, ${color[2]})" opacity="0.7"/>`;
    })
    .join("");

  return `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
    ${circles}
  </svg>`;
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

    // 过滤在图片范围内的数据点（为了性能，只取前10000个点）
    const filteredPoints = data[0].data_points
      .filter((point) => {
        const { latitude, longitude } = point;
        return (
          latitude >= imageBounds.bottomLeft.latitude &&
          latitude <= imageBounds.topLeft.latitude &&
          longitude >= imageBounds.topLeft.longitude &&
          longitude <= imageBounds.bottomRight.longitude
        );
      })
      .slice(0, 10000); // 限制点数以提高性能

    console.log(
      `在图片范围内的数据点: ${filteredPoints.length} (限制为前10000个)`
    );

    // 创建SVG覆盖层
    const svgOverlay = createSVGOverlay(filteredPoints, imageBounds, imageSize);

    // 使用Sharp合成图片
    const imagePath = path.join(
      __dirname,
      "public",
      "screenshot_2025-09-02T07-18-43.png"
    );
    const outputPath = path.join(__dirname, "public", "composed_image.png");

    await sharp(imagePath)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toFile(outputPath);

    console.log(`新图片已保存到: ${outputPath}`);
  } catch (error) {
    console.error("处理过程中出现错误:", error);
  }
}

// 运行程序
composeImage();
