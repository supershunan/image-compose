const fs = require("fs");
const sharp = require("sharp");
const onlinePNG = "./public/2560-2/SX001.png";
const offlinePNG = "./public/2560-2/SX002.png";

/** 雷达回波颜色条 */
const colorLevel = {
  10: "rgb(62, 160, 239)",
  15: "rgb(108, 225, 238)",
  20: "rgb(96, 214, 63)",
  25: "rgb(70, 137, 37)",
  30: "rgb(252, 251, 74)",
  35: "rgb(223, 195, 73)",
  40: "rgb(239, 147, 47)",
  45: "rgb(231, 53, 31)",
  50: "rgb(184, 43, 41)",
  55: "rgb(183, 36, 28)",
  60: "rgb(236, 62, 237)",
  65: "rgb(132, 39, 179)",
  70: "rgb(174, 148, 237)",
};

/** 雨量监测和临近预报颜色条 */
const rainColorLevel = {
  0.5: "rgb(172, 246, 159)",
  10: "rgb(56, 195, 60)",
  25: "rgb(99, 180, 255)",
  50: "rgb(8, 0, 231)",
  100: "rgb(214, 8, 221)",
  250: "rgb(235, 4, 26)",
};

/** 雷达位置坐标 */
const locationData = [
  {
    name: "金堆",
    code: "SA000000000M",
    longitude: 109.868611,
    latitude: 34.29277,
    onlineStatus: 0,
    pngUrl: onlinePNG,
    offlinePngUrl: offlinePNG,
  },
  {
    name: "蓝田",
    code: "SA000000001M",
    longitude: 109.351903,
    latitude: 34.083714,
    onlineStatus: 1,
    pngUrl: onlinePNG,
    offlinePngUrl: offlinePNG,
  },
  {
    name: "佛坪",
    code: "SX001",
    longitude: 108.014916,
    latitude: 33.281029,
    onlineStatus: 0,
    pngUrl: onlinePNG,
    offlinePngUrl: offlinePNG,
  },
  {
    name: "镇巴",
    code: "SX002",
    longitude: 108.015888,
    latitude: 32.51594,
    onlineStatus: 1,
    pngUrl: onlinePNG,
    offlinePngUrl: offlinePNG,
  },
];

/** 产品类型 */
const productType = {
  /** 雷达回波 */
  radar: "radar",
  /** 临近预报 */
  nearTermForecast: "nearTermForecast",
  /** 雨量监测 */
  rainfallMonitoring: "rainfallMonitoring",
};

/** 颜色条图片 */
const colorBarPng = {
  [productType.radar]: "./public/color/radar-color.png",
  [productType.nearTermForecast]: "./public/color/rain-color.png",
  [productType.rainfallMonitoring]: "./public/color/rain2-color.png",
};

/** 读取 nc 的 json 数据 */
function readncJSON2ncdatasParse() {
  const files = fs.readdirSync("./public/nc2json");
  return files.map((file) => {
    const readFile = fs.readFileSync(`./public/nc2json/${file}`, "utf8");
    return JSON.parse(readFile);
  });
}

/**
 * 读取 meta 的 json 数据, 获取到低图的基础信息，包括图片的尺寸，四角坐标等
 * @param {string} metaFile
 * @returns {object} meta
 */
function readMetaFile(metaFile) {
  const readFile = fs.readFileSync(metaFile, "utf8");
  return JSON.parse(readFile);
}

/**
 * 根据 nc 的值获取颜色
 * @param {number} ncvalue
 * @param {radar | rain} type
 * @returns {string} rgba(r,g,b,a)
 */
function getColorByNCValue(ncvalue, type) {
  if (type === productType.radar) {
    const keys = Object.keys(colorLevel);
    for (let i = 0; i < keys.length; i++) {
      const key1 = keys[i];
      const key2 = keys[i + 1];

      if (ncvalue >= key1 && !key2) {
        return colorLevel[key1];
      }

      if (ncvalue >= key1 && key2 && ncvalue < key2) {
        return colorLevel[key1];
      }
    }
  } else if (type === productType.rainfallMonitoring) {
    const keys = Object.keys(rainColorLevel);
    for (let i = 0; i < keys.length; i++) {
      const key1 = keys[i];
      const key2 = keys[i + 1];

      if (ncvalue >= key1 && !key2) {
        return rainColorLevel[key1];
      }
      if (ncvalue >= key1 && key2 && ncvalue < key2) {
        return rainColorLevel[key1];
      }
    }
  } else if (type === productType.nearTermForecast) {
    const keys = Object.keys(rainColorLevel);
    for (let i = 0; i < keys.length; i++) {
      const key1 = keys[i];
      const key2 = keys[i + 1];

      if (ncvalue >= key1 && !key2) {
        return rainColorLevel[key1];
      }
      if (ncvalue >= key1 && key2 && ncvalue < key2) {
        return rainColorLevel[key1];
      }
    }
  }

  return "rgba(0,0,0,0)";
}

/**
 * 根据 nc 的值添加颜色
 * @param {object[]} ncdatas
 * @param {radar | rain} type
 * @returns {object[]} ncdatas
 */
function ncdatasAddcolorkey(ncdatas, type = productType.radar) {
  const newData = [];

  ncdatas.forEach((ncdata) => {
    const data = ncdata[0].data_points.map((point) => {
      return {
        ...point,
        color: getColorByNCValue(point.value, type),
      };
    });

    for (let i = 0; i < data.length; i++) {
      newData.push(data[i]);
    }
  });

  return newData;
}

/**
 * 根据 nc 的值绘制图片
 * @param {object} meta 图片头信息
 * @param {{ latitude: number, longitude: number, value: number, color: string }[]} ncdatas
 * @param {string} basePNG
 * @returns {Promise<Buffer>}
 */
function canvasPNGBynccolordatas(meta, ncdatas, basePNG) {
  const { size, centerCoordinates, cornerCoordinates } = meta.screenshotInfo;
  const { width, height } = size;
  const { topLeft, bottomRight, topRight, bottomLeft } = cornerCoordinates;

  // 图片四个角坐标对应的经纬度
  const { latitude: topLeftLatitude, longitude: topLeftLongitude } = topLeft;
  const { latitude: bottomRightLatitude, longitude: bottomRightLongitude } =
    bottomRight;
  const { latitude: topRightLatitude, longitude: topRightLongitude } = topRight;
  const { latitude: bottomLeftLatitude, longitude: bottomLeftLongitude } =
    bottomLeft;

  // 计算经纬度范围
  const minLat = Math.min(
    topLeftLatitude,
    bottomLeftLatitude,
    topRightLatitude,
    bottomRightLatitude
  );
  const maxLat = Math.max(
    topLeftLatitude,
    bottomLeftLatitude,
    topRightLatitude,
    bottomRightLatitude
  );
  const minLon = Math.min(
    topLeftLongitude,
    bottomLeftLongitude,
    topRightLongitude,
    bottomRightLongitude
  );
  const maxLon = Math.max(
    topLeftLongitude,
    bottomLeftLongitude,
    topRightLongitude,
    bottomRightLongitude
  );

  /**
   * 经纬度到像素坐标的转换函数
   * @param {number} lat
   * @param {number} lon
   * @returns {object} {x, y}
   */
  function latLonToPixel(lat, lon) {
    // 计算在图片中的相对位置
    const latRatio = (lat - minLat) / (maxLat - minLat);
    const lonRatio = (lon - minLon) / (maxLon - minLon);

    // 转换为像素坐标
    const x = Math.round(lonRatio * width);
    const y = Math.round((1 - latRatio) * height); // 注意Y轴是反向的

    return { x, y };
  }

  /**
   * 颜色字符串转RGB数组
   * @param {string} colorStr
   * @returns {number[]} [r,g,b,a]
   */
  function colorToRGB(colorStr) {
    const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), 255];
    }
    return [0, 0, 0, 0];
  }

  return new Promise(async (resolve, reject) => {
    try {
      const originalImage = sharp(basePNG);

      // 获取图片原始像素值
      const { data: pixelData } = await originalImage
        .raw()
        .toBuffer({ resolveWithObject: true });

      // 统计数据点分布
      let totalPoints = 0;
      let inRangePoints = 0;
      let outOfRangePoints = 0;

      ncdatas.forEach(async (point) => {
        const { latitude: pointLat, longitude: pointLon, value, color } = point;
        totalPoints++;

        // 检查点是否在图片的经纬度范围内
        if (
          pointLat >= minLat &&
          pointLat <= maxLat &&
          pointLon >= minLon &&
          pointLon <= maxLon
        ) {
          inRangePoints++;
          const pixelPos = latLonToPixel(pointLat, pointLon);
          const rgb = colorToRGB(color);

          // 如果是透明色 不绘制
          if (rgb[3] === 0) {
            return;
          }

          // 绘制 3x3 的像素点
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const x = pixelPos.x + dx;
              const y = pixelPos.y + dy;

              if (x >= 0 && x < width && y >= 0 && y < height) {
                const index = (y * width + x) * 4;
                pixelData[index] = rgb[0]; // R
                pixelData[index + 1] = rgb[1]; // G
                pixelData[index + 2] = rgb[2]; // B
                pixelData[index + 3] = rgb[3]; // A
              }
            }
          }
        } else {
          outOfRangePoints++;
        }
      });

      console.log(
        `数据点统计: 总计 ${totalPoints} 个，范围内 ${inRangePoints} 个，范围外 ${outOfRangePoints} 个`
      );
      console.log(
        `图片经纬度范围: 纬度 [${minLat.toFixed(6)}, ${maxLat.toFixed(
          6
        )}], 经度 [${minLon.toFixed(6)}, ${maxLon.toFixed(6)}]`
      );

      const buffer = await sharp(pixelData, {
        raw: {
          width: width,
          height: height,
          channels: 4,
        },
      })
        .png()
        .toBuffer();

      resolve(buffer);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

/**
 * 添加颜色条到图片
 * @param {object} meta 图片头信息
 * @param {Buffer} newImage 图片
 * @param {string} colorBarPng 颜色条图片
 * @returns {Promise<Buffer>}
 */
function addColorBarPngToNewImage(meta, newImage, colorBarPng) {
  return new Promise(async (resolve, reject) => {
    try {
      const { size } = meta.screenshotInfo;
      const { width, height } = size;

      // 读取颜色图片
      const colorImage = sharp(colorBarPng);
      const colorInfo = await colorImage.metadata();

      // 计算颜色图片的缩放尺寸（保持宽高比）
      const maxColorWidth = 1000;
      const maxColorHeight = 300;

      let colorWidth = colorInfo.width;
      let colorHeight = colorInfo.height;

      // 按比例缩放
      if (colorWidth > maxColorWidth) {
        const ratio = maxColorWidth / colorWidth;
        colorWidth = maxColorWidth;
        colorHeight = Math.round(colorHeight * ratio);
      }

      if (colorHeight > maxColorHeight) {
        const ratio = maxColorHeight / colorHeight;
        colorHeight = maxColorHeight;
        colorWidth = Math.round(colorWidth * ratio);
      }

      // 缩放颜色图片
      const resizedColorImage = await colorImage
        .resize(colorWidth, colorHeight)
        .png()
        .toBuffer();

      // 计算颜色图片在右下角的位置
      const margin = 30; // 边距
      const colorX = width - colorWidth - margin;
      const colorY = height - colorHeight - margin;

      // 创建合成图片
      const compositeBuffer = await sharp(newImage)
        .composite([
          {
            input: resizedColorImage,
            top: colorY,
            left: colorX,
          },
        ])
        .png()
        .toBuffer();

      resolve(compositeBuffer);
    } catch (error) {
      console.error("添加颜色条时出错:", error);
      reject(error);
    }
  });
}

/**
 * 添加位置图片到图片
 * @param {object} meta 图片头信息
 * @param {Buffer} newImage 图片
 * @param {{ latitude: number, longitude: number, pngUrl: string }[]} locationData
 * @returns {Promise<Buffer>}
 */
function addLocationPngToNewImage(meta, newImage, locationData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { size, centerCoordinates, cornerCoordinates } =
        meta.screenshotInfo;
      const { width, height } = size;
      const { topLeft, bottomRight, topRight, bottomLeft } = cornerCoordinates;

      // 图片四个角坐标对应的经纬度
      const { latitude: topLeftLatitude, longitude: topLeftLongitude } =
        topLeft;
      const { latitude: bottomRightLatitude, longitude: bottomRightLongitude } =
        bottomRight;
      const { latitude: topRightLatitude, longitude: topRightLongitude } =
        topRight;
      const { latitude: bottomLeftLatitude, longitude: bottomLeftLongitude } =
        bottomLeft;

      // 计算经纬度范围
      const minLat = Math.min(
        topLeftLatitude,
        bottomLeftLatitude,
        topRightLatitude,
        bottomRightLatitude
      );
      const maxLat = Math.max(
        topLeftLatitude,
        bottomLeftLatitude,
        topRightLatitude,
        bottomRightLatitude
      );
      const minLon = Math.min(
        topLeftLongitude,
        bottomLeftLongitude,
        topRightLongitude,
        bottomRightLongitude
      );
      const maxLon = Math.max(
        topLeftLongitude,
        bottomLeftLongitude,
        topRightLongitude,
        bottomRightLongitude
      );

      // 经纬度到像素坐标的转换函数
      function latLonToPixel(lat, lon) {
        // 计算在图片中的相对位置
        const latRatio = (lat - minLat) / (maxLat - minLat);
        const lonRatio = (lon - minLon) / (maxLon - minLon);

        // 转换为像素坐标
        const x = Math.round(lonRatio * width);
        const y = Math.round((1 - latRatio) * height); // 注意Y轴是反向的

        return { x, y };
      }

      // 读取原始截图图片
      const originalImage = sharp(newImage);

      // 创建合成图片
      let compositeImage = originalImage;

      // 收集所有需要合成的图标
      const compositeItems = [];

      // 处理每个位置图片
      for (const location of locationData) {
        const {
          latitude: locationLat,
          longitude: locationLon,
          pngUrl,
          offlinePngUrl,
          onlineStatus,
        } = location;

        // 检查位置是否在图片范围内
        if (
          locationLat >= minLat &&
          locationLat <= maxLat &&
          locationLon >= minLon &&
          locationLon <= maxLon
        ) {
          const { x, y } = latLonToPixel(locationLat, locationLon);

          try {
            // 读取位置图标
            const locationIcon = sharp(onlineStatus ? pngUrl : offlinePngUrl);
            const iconInfo = await locationIcon.metadata();

            // 设置图标大小（放大）
            const iconSize = 30; // 图标大小

            // 缩放图标
            const resizedIcon = await locationIcon
              .resize(iconSize, iconSize)
              .png()
              .toBuffer();

            // 计算图标位置（居中显示）
            const iconX = x - iconSize / 2;
            const iconY = y - iconSize / 2;

            // 添加到合成列表
            compositeItems.push({
              input: resizedIcon,
              top: Math.max(0, iconY),
              left: Math.max(0, iconX),
            });

            console.log(
              `位置图标已添加到坐标: (${locationLat}, ${locationLon}) -> 像素位置: (${x}, ${y})`
            );
          } catch (iconError) {
            console.error(
              `处理图标 ${onlineStatus ? pngUrl : offlinePngUrl} 时出错:`,
              iconError
            );
          }
        } else {
          console.log(
            `位置 (${locationLat}, ${locationLon}) 超出图片范围，跳过`
          );
        }
      }

      // 一次性合成所有图标
      if (compositeItems.length > 0) {
        compositeImage = compositeImage.composite(compositeItems);
      }

      const finalBuffer = await compositeImage.png().toBuffer();
      resolve(finalBuffer);
    } catch (error) {
      console.error("添加位置图片时出错:", error);
      reject(error);
    }
  });
}

async function main() {
  try {
    const currentProductType = productType.nearTermForecast;
    const meta = readMetaFile(
      "./public/2560-2/screenshot_metadata_2025-09-03T07-14-05.json"
    );
    const ncdatas = readncJSON2ncdatasParse();

    const newData = ncdatasAddcolorkey(ncdatas, currentProductType);

    const buffer1 = await canvasPNGBynccolordatas(
      meta,
      newData,
      "./public/2560-2/screenshot_2025-09-03T07-14-05.png"
    );

    const buffer2 = await addColorBarPngToNewImage(
      meta,
      buffer1,
      colorBarPng[currentProductType]
    );

    const buffer3 = await addLocationPngToNewImage(meta, buffer2, locationData);

    const timestamp = Date.now();
    fs.writeFileSync(
      `./public/result/screenshot_${currentProductType}_${timestamp}.png`,
      buffer3
    );

    console.log(
      `图片已保存到: ./public/result/screenshot_${currentProductType}_${timestamp}.png`
    );
  } catch (error) {
    console.error("生成图片失败:", error);
  }
}

main();
