import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  try {
    const filename = getRouterParam(event, 'filename');
    
    if (!filename) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供文件名'
      });
    }

    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的文件名'
      });
    }

    const compressedDir = 'compressed';
    const filePath = path.join(compressedDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw createError({
        statusCode: 404,
        statusMessage: '文件不存在'
      });
    }

    // 检查文件扩展名
    if (!filename.toLowerCase().endsWith('.zip')) {
      throw createError({
        statusCode: 400,
        statusMessage: '只支持下载ZIP文件'
      });
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(filePath);
    
    // 设置响应头
    setHeader(event, 'Content-Type', 'application/zip');
    setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`);
    setHeader(event, 'Content-Length', fileBuffer.length.toString());
    
    return fileBuffer;

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('文件下载失败:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    });
  }
});
