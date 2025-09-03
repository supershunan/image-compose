const fs = require("fs");
const sharp = require("sharp");

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

const locationData = [
  {
    name: "金堆",
    code: "SA000000000M",
    longitude: 109.868611,
    latitude: 34.29277,
    pngUrl: "./public/2560-2/SX001.png",
  },
  {
    name: "蓝田",
    code: "SA000000001M",
    longitude: 109.351903,
    latitude: 34.083714,
    pngUrl: "./public/2560-2/SX001.png",
  },
  {
    name: "佛坪",
    code: "SX001",
    longitude: 108.014916,
    latitude: 33.281029,
    pngUrl: "./public/2560-2/SX001.png",
  },
  {
    name: "镇巴",
    code: "SX002",
    longitude: 108.015888,
    latitude: 32.51594,
    pngUrl: "./public/2560-2/SX002.png",
  },
];

// const readFile = fs.readFileSync(
//   "./public/SX002_20250903104500_CR_filtered.json",
//   "utf8"
// );
// const data = JSON.parse(readFile);

// const newData = data[0].data_points.map((point) => {
//   if (point.value >= 10 && point.value < 15) {
//     point.color = colorLevel[10];
//   } else if (point.value >= 15 && point.value < 20) {
//     point.color = colorLevel[15];
//   } else if (point.value >= 20 && point.value < 25) {
//     point.color = colorLevel[20];
//   } else if (point.value >= 25 && point.value < 30) {
//     point.color = colorLevel[25];
//   } else if (point.value >= 30 && point.value < 35) {
//     point.color = colorLevel[30];
//   } else if (point.value >= 35 && point.value < 40) {
//     point.color = colorLevel[35];
//   } else if (point.value >= 40 && point.value < 45) {
//     point.color = colorLevel[40];
//   } else if (point.value >= 45 && point.value < 50) {
//     point.color = colorLevel[45];
//   } else if (point.value >= 50 && point.value < 55) {
//     point.color = colorLevel[50];
//   } else if (point.value >= 55 && point.value < 60) {
//     point.color = colorLevel[55];
//   } else if (point.value >= 60 && point.value < 65) {
//     point.color = colorLevel[60];
//   } else if (point.value >= 65 && point.value < 70) {
//     point.color = colorLevel[65];
//   } else if (point.value >= 70) {
//     point.color = colorLevel[70];
//   } else {
//     point.color = "rgba(0,0,0,0)";
//   }
//   return point;
// });

const ncdatas = readJSON2Array();
const newData = ncdatas2ColorData(ncdatas);
const readMetaFile = fs.readFileSync(
  "./public/2560-2/screenshot_metadata_2025-09-03T07-14-05.json",
  "utf8"
);
const metaFile = JSON.parse(readMetaFile);
(async () => {
  try {
    // 使用测试数据
    // await canvasPngByLatlons(metaFile, newData);
    // 直接在截图上绘制数据点
    const resultBuffer = await canvasPNGByLatlonsAndScreenShot(
      metaFile,
      newData,
      "./public/2560-2/screenshot_2025-09-03T07-14-05.png",
      locationData
    );

    // 添加颜色条
    // const finalBuffer = await addColorBarPngToScreenShot(
    //   metaFile,
    //   resultBuffer,
    //   "./public/color/radar-color.png"
    // );

    // // 保存最终图片
    // const timestamp = Date.now();
    // const outputPath = `./public/screenshot_with_colorbar_${timestamp}.png`;
    // fs.writeFileSync(outputPath, finalBuffer);
    // console.log(`带颜色条的图片已保存到: ${outputPath}`);

    // 或者使用合并方式（可选）
    // await mergeImages(
    //   "./public/screenshot_2025-09-02T13-49-20.png",
    //   "./public/output_1756827296910.png"
    // );
  } catch (error) {
    console.error("执行失败:", error);
  }
})();

function readJSON2Array() {
  const files = [
    "./public/nc2json/SA000000001M_20250903105000_CR_filtered.json",
    "./public/nc2json/SX001_20250903105012_CR_filtered.json",
    "./public/nc2json/SX002_20250903105000_CR_filtered.json",
  ];

  return files.map((file) => {
    const readFile = fs.readFileSync(file, "utf8");
    return JSON.parse(readFile);
  });
}

function ncdatas2ColorData(ncdatas) {
  const newData = [];

  ncdatas.forEach((ncdata) => {
    const data = ncdata[0].data_points.map((point) => {
      if (point.value >= 10 && point.value < 15) {
        point.color = colorLevel[10];
      } else if (point.value >= 15 && point.value < 20) {
        point.color = colorLevel[15];
      } else if (point.value >= 20 && point.value < 25) {
        point.color = colorLevel[20];
      } else if (point.value >= 25 && point.value < 30) {
        point.color = colorLevel[25];
      } else if (point.value >= 30 && point.value < 35) {
        point.color = colorLevel[30];
      } else if (point.value >= 35 && point.value < 40) {
        point.color = colorLevel[35];
      } else if (point.value >= 40 && point.value < 45) {
        point.color = colorLevel[40];
      } else if (point.value >= 45 && point.value < 50) {
        point.color = colorLevel[45];
      } else if (point.value >= 50 && point.value < 55) {
        point.color = colorLevel[50];
      } else if (point.value >= 55 && point.value < 60) {
        point.color = colorLevel[55];
      } else if (point.value >= 60 && point.value < 65) {
        point.color = colorLevel[60];
      } else if (point.value >= 65 && point.value < 70) {
        point.color = colorLevel[65];
      } else if (point.value >= 70) {
        point.color = colorLevel[70];
      } else {
        point.color = "rgba(0,0,0,0)";
      }
      return point;
    });

    for (let i = 0; i < data.length; i++) {
      newData.push(data[i]);
    }
  });

  return newData;
}

/**
 * 根据经纬度绘制图片
 * @param {object} meta 截图信息
 * @param {{ latitude: number, longitude: number, value: number, color: string }[]} data 数据点
 * @returns
 */
async function canvasPngByLatlons(meta, data) {
  const { size, centerCoordinates, cornerCoordinates } = meta.screenshotInfo;

  // 图片大小
  const { width, height } = size;

  // 图片中心坐标
  const { latitude, longitude } = centerCoordinates;

  // 图片四个角坐标
  const { topLeft, bottomRight, topRight, bottomLeft } = cornerCoordinates;

  // 图片四个角坐标对应的经纬度
  const { latitude: topLeftLatitude, longitude: topLeftLongitude } = topLeft;
  const { latitude: bottomRightLatitude, longitude: bottomRightLongitude } =
    bottomRight;
  const { latitude: topRightLatitude, longitude: topRightLongitude } = topRight;
  const { latitude: bottomLeftLatitude, longitude: bottomLeftLongitude } =
    bottomLeft;

  // 计算经纬度范围
  const minLat = Math.min(topLeftLatitude, bottomLeftLatitude);
  const maxLat = Math.max(topLeftLatitude, bottomLeftLatitude);
  const minLon = Math.min(topLeftLongitude, bottomLeftLongitude);
  const maxLon = Math.max(topRightLongitude, bottomRightLongitude);

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

  // 颜色字符串转RGB数组
  function colorToRGB(colorStr) {
    const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), 255];
    }
    return [0, 0, 0, 0]; // 默认透明
  }

  try {
    // 创建空白图片
    const image = sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // 透明背景
      },
    });

    // 获取图片的原始像素数据
    const { data: pixelData } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 绘制数据点
    data.forEach((point) => {
      const { latitude: pointLat, longitude: pointLon, value, color } = point;

      // 检查点是否在图片范围内
      if (
        pointLat >= minLat &&
        pointLat <= maxLat &&
        pointLon >= minLon &&
        pointLon <= maxLon
      ) {
        const pixelPos = latLonToPixel(pointLat, pointLon);
        const rgb = colorToRGB(color);

        // 绘制3x3的像素点
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
      }
    });

    // 将修改后的像素数据转换回图片
    const buffer = await sharp(pixelData, {
      raw: {
        width: width,
        height: height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    // 保存图片
    const outputPath = `./public/output_${Date.now()}.png`;
    fs.writeFileSync(outputPath, buffer);

    console.log(`图片已保存到: ${outputPath}`);

    return buffer;
  } catch (error) {
    console.error("生成图片时出错:", error);
    throw error;
  }
}

/**
 * 合并图片
 * @param {string} image1 图片1
 * @param {string} image2 图片2
 */
async function mergeImages(image1, image2) {
  try {
    const buffer = await sharp(image1)
      .composite([{ input: image2 }])
      .png()
      .toBuffer();
    fs.writeFileSync("./public/merged_image.png", buffer);
    console.log("图片合并完成: ./public/merged_image.png");
  } catch (error) {
    console.error("合并图片时出错:", error);
    throw error;
  }
}

/**
 * 根据经纬度绘制图片并叠加到截图上
 * @param {object} meta 截图信息
 * @param {{ latitude: number, longitude: number, value: number, color: string }[]} data 数据点
 * @param {string} png 截图图片
 * @param {{ latitude: number, longitude: number, pngUrl: string }[]} locationData 位置数据
 */
function canvasPNGByLatlonsAndScreenShot(meta, data, png, locationData) {
  const { size, centerCoordinates, cornerCoordinates } = meta.screenshotInfo;
  const { width, height } = size;
  const { latitude, longitude } = centerCoordinates;
  const { topLeft, bottomRight, topRight, bottomLeft } = cornerCoordinates;

  // 图片四个角坐标对应的经纬度
  const { latitude: topLeftLatitude, longitude: topLeftLongitude } = topLeft;
  const { latitude: bottomRightLatitude, longitude: bottomRightLongitude } =
    bottomRight;
  const { latitude: topRightLatitude, longitude: topRightLongitude } = topRight;
  const { latitude: bottomLeftLatitude, longitude: bottomLeftLongitude } =
    bottomLeft;

  // 计算经纬度范围 - 修复：考虑所有四个角的坐标
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

  // 颜色字符串转RGB数组
  function colorToRGB(colorStr) {
    const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), 255];
    }
    return [0, 0, 0, 0];
  }

  return new Promise(async (resolve, reject) => {
    try {
      // 读取原始截图图片
      const originalImage = sharp(png);

      // 获取图片的原始像素数据
      const { data: pixelData } = await originalImage
        .raw()
        .toBuffer({ resolveWithObject: true });

      // 统计数据点分布
      let totalPoints = 0;
      let inRangePoints = 0;
      let outOfRangePoints = 0;

      // 绘制数据点 - 使用图片的经纬度范围
      data.forEach((point) => {
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

          // 如果是透明色，跳过绘制
          if (rgb[3] === 0) {
            return;
          }

          // 绘制3x3的像素点
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

      // 将修改后的像素数据转换回图片
      const buffer = await sharp(pixelData, {
        raw: {
          width: width,
          height: height,
          channels: 4,
        },
      })
        .png()
        .toBuffer();

      // 添加颜色条
      const finalBuffer = await addColorBarPngToScreenShot(
        meta,
        buffer,
        "./public/color/radar-color.png"
      );

      // 添加位置图标
      try {
        const finalWithIcons = await addLocationPngToScreenShot(
          meta,
          finalBuffer,
          locationData
        );

        const timestamp = Date.now();
        const outputPath = `./public/result/screenshot_with_icons_${timestamp}.png`;
        fs.writeFileSync(outputPath, finalWithIcons);
        console.log(`带位置图标的图片已保存到: ${outputPath}`);
      } catch (iconError) {
        console.error("添加位置图标时出错:", iconError);

        // 如果添加图标失败，至少保存带颜色条的图片
        const timestamp = Date.now();
        const outputPath = `./public/result/screenshot_with_colorbar_${timestamp}.png`;
        fs.writeFileSync(outputPath, finalBuffer);
        console.log(`带颜色条的图片已保存到: ${outputPath}`);
      }
      console.log(`图片尺寸: ${width}x${height} 像素`);
      console.log(
        `图片角坐标范围: 纬度 [${minLat.toFixed(6)}, ${maxLat.toFixed(
          6
        )}], 经度 [${minLon.toFixed(6)}, ${maxLon.toFixed(6)}]`
      );

      resolve(buffer);
    } catch (error) {
      console.error("在截图上绘制数据时出错:", error);
      reject(error);
    }
  });
}

function addColorBarPngToScreenShot(meta, png, colorPng) {
  return new Promise(async (resolve, reject) => {
    try {
      const { size } = meta.screenshotInfo;
      const { width, height } = size;

      // 读取颜色图片
      const colorImage = sharp(colorPng);
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
      const compositeBuffer = await sharp(png)
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
 *
 * @param {*} meta
 * @param {*} png
 * @param {{latitude: number, longitude: number, pngUrl: string}[]} locationData
 * @returns
 */
function addLocationPngToScreenShot(meta, png, locationData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { size, centerCoordinates, cornerCoordinates } =
        meta.screenshotInfo;
      const { width, height } = size;
      const { latitude, longitude } = centerCoordinates;
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

      // 计算经纬度范围 - 修复：考虑所有四个角的坐标
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
      const originalImage = sharp(png);

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
            const locationIcon = sharp(pngUrl);
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
            console.error(`处理图标 ${pngUrl} 时出错:`, iconError);
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

      // 输出最终图片
      const finalBuffer = await compositeImage.png().toBuffer();
      resolve(finalBuffer);
    } catch (error) {
      console.error("添加位置图片时出错:", error);
      reject(error);
    }
  });
}
