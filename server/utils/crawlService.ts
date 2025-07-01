import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import type { CrawlTask } from '~/types/task';
import { taskManager } from './taskManager';
import { CrawlStatus } from '~/types/task';

/**
 * 爬虫工具类
 */
export class CrawlService {
  private baseDir = 'downloads';
  private compressedDir = 'compressed';

  constructor() {
    this.ensureDirectories();
  }

  /**
   * 确保目录存在
   */
  private ensureDirectories() {
    [this.baseDir, this.compressedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 验证微信公众号文章URL
   */
  private isValidWeChatUrl(url: string): boolean {
    const regex = /^https:\/\/mp\.weixin\.qq\.com\/s\/.*/;
    return regex.test(url);
  }

  /**
   * 获取网页HTML内容
   */
  private async fetchPageHtml(url: string): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });
    return response.data;
  }

  /**
   * 解析HTML并提取图片URL
   */
  private extractImageUrls(html: string): string[] {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const imageUrls: string[] = [];
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const dataSrc = img.getAttribute('data-src');
      const src = img.getAttribute('src');
      
      // 优先使用 data-src，然后使用 src
      const imageUrl = dataSrc || src;
      
      if (imageUrl && this.isValidImageUrl(imageUrl)) {
        imageUrls.push(imageUrl);
      }
    });
    
    // 去重
    return [...new Set(imageUrls)];
  }

  /**
   * 验证是否为有效的图片URL
   */
  private isValidImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];
    const hasValidExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    // 检查是否为微信图片URL或其他有效图片URL
    const isWeChatImage = url.includes('mmbiz.qpic.cn') || url.includes('mmbiz.qq.com');
    
    return hasValidExtension || isWeChatImage;
  }

  /**
   * 下载单个图片
   */
  private async downloadImage(imageUrl: string, taskDir: string, index: number): Promise<string> {
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // 获取文件扩展名
    const urlParts = imageUrl.split('.');
    let extension = 'jpg'; // 默认扩展名
    
    if (urlParts.length > 1) {
      const lastPart = urlParts[urlParts.length - 1].toLowerCase();
      if (['jpg', 'jpeg', 'png', 'bmp', 'webp'].includes(lastPart)) {
        extension = lastPart;
      }
    }

    const filename = `${index}.${extension}`;
    const filepath = path.join(taskDir, filename);
    
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filepath));
      writer.on('error', reject);
    });
  }

  /**
   * 压缩文件夹
   */
  private async compressFolder(taskDir: string, taskId: string): Promise<string> {
    const zip = new AdmZip();
    const files = fs.readdirSync(taskDir);
    
    let processedFiles = 0;
    const totalFiles = files.length;
    
    for (const file of files) {
      const filePath = path.join(taskDir, file);
      zip.addLocalFile(filePath);
      
      processedFiles++;
      const progress = Math.round((processedFiles / totalFiles) * 100);
      
      // 更新压缩进度
      taskManager.updateTask(taskId, {
        compressProgress: progress
      });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + 
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    const zipFilename = `${timestamp}.zip`;
    const zipPath = path.join(this.compressedDir, zipFilename);
    
    zip.writeZip(zipPath);
    
    return zipFilename;
  }

  /**
   * 开始爬取任务
   */
  async startCrawl(taskId: string): Promise<void> {
    const task = taskManager.getTask(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    if (!this.isValidWeChatUrl(task.url)) {
      throw new Error('URL格式不正确，请提供有效的微信公众号文章链接');
    }

    try {
      // 标记任务为运行中
      taskManager.markTaskAsRunning(taskId);
      
      // 更新任务状态
      taskManager.updateTask(taskId, {
        status: CrawlStatus.DOWNLOADING
      });

      // 获取网页内容
      const html = await this.fetchPageHtml(task.url);
      
      // 解析图片URL
      const imageUrls = this.extractImageUrls(html);
      
      if (imageUrls.length === 0) {
        throw new Error('未找到任何图片');
      }

      // 创建任务目录
      const taskDir = path.join(this.baseDir, taskId);
      if (!fs.existsSync(taskDir)) {
        fs.mkdirSync(taskDir, { recursive: true });
      }

      // 更新总图片数量
      taskManager.updateTask(taskId, {
        totalImages: imageUrls.length
      });

      // 下载图片
      let downloadedCount = 0;
      const downloadPromises = imageUrls.map(async (imageUrl, index) => {
        try {
          if (!taskManager.isTaskRunning(taskId)) {
            return; // 任务已被取消
          }
          
          await this.downloadImage(imageUrl, taskDir, index);
          downloadedCount++;
          
          const progress = Math.round((downloadedCount / imageUrls.length) * 100);
          taskManager.updateTask(taskId, {
            downloadedImages: downloadedCount,
            progress
          });
          
        } catch (error) {
          console.error(`下载图片失败 (${index}):`, error);
          // 继续下载其他图片
        }
      });

      await Promise.all(downloadPromises);

      // 检查任务是否被取消
      if (!taskManager.isTaskRunning(taskId)) {
        // 清理文件
        if (fs.existsSync(taskDir)) {
          fs.rmSync(taskDir, { recursive: true });
        }
        return;
      }

      // 压缩文件
      taskManager.updateTask(taskId, {
        status: CrawlStatus.COMPRESSING,
        compressProgress: 0
      });

      const zipFilename = await this.compressFolder(taskDir, taskId);

      // 完成任务
      taskManager.updateTask(taskId, {
        status: CrawlStatus.COMPLETED,
        compressProgress: 100,
        downloadUrl: `/download/${zipFilename}`,
        completedAt: new Date().toISOString()
      });

      // 清理临时文件
      if (fs.existsSync(taskDir)) {
        fs.rmSync(taskDir, { recursive: true });
      }

    } catch (error) {
      // 更新任务为失败状态
      taskManager.updateTask(taskId, {
        status: CrawlStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : '未知错误'
      });
      
      // 清理临时文件
      const taskDir = path.join(this.baseDir, taskId);
      if (fs.existsSync(taskDir)) {
        fs.rmSync(taskDir, { recursive: true });
      }
    } finally {
      // 标记任务为不再运行
      taskManager.markTaskAsNotRunning(taskId);
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = taskManager.getTask(taskId);
    if (!task) {
      return false;
    }

    // 标记任务为不再运行
    taskManager.markTaskAsNotRunning(taskId);
    
    // 更新任务状态
    taskManager.updateTask(taskId, {
      status: CrawlStatus.FAILED,
      errorMessage: '任务已被用户取消'
    });

    // 清理临时文件
    const taskDir = path.join(this.baseDir, taskId);
    if (fs.existsSync(taskDir)) {
      fs.rmSync(taskDir, { recursive: true });
    }

    return true;
  }
}

// 全局爬虫服务实例
export const crawlService = new CrawlService();
