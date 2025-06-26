# 后端实现详细指南

> 本文档详细描述了微信公众号图片爬取工具后端服务的完整实现方案和开发流程

## 📋 项目概述

本项目采用**前后端分离架构**，需要实现一个独立的 Node.js + Express 后端服务，用于处理微信公众号文章图片的爬取、下载和压缩。前端已完成开发，API 接口规范请参考 `API_DOCS.md`。

## 🏗️ 架构决策：前后端分离

### 推荐项目结构
```
crawl_weichat/                    # 项目根目录
├── frontend/                     # 前端项目
│   ├── package.json              # 前端依赖
│   ├── vite.config.ts
│   ├── src/                      # 当前所有前端代码
│   └── ...
├── backend/                      # 后端项目
│   ├── package.json              # 后端依赖
│   ├── src/                      # 后端源码
│   └── ...
├── package.json                  # 根级工具脚本
├── doc/                          # 项目文档
└── README.md
```

### 分离的优势
- **独立部署**：前后端可分别部署到不同服务器
- **依赖隔离**：避免前端打包包含后端依赖
- **团队协作**：前后端开发互不干扰
- **技术栈独立**：便于后续技术升级

## 🗂️ 后端目录结构规划

```
backend/
├── src/
│   ├── app.ts                 # Express 应用主文件
│   ├── server.ts             # 服务器启动文件
│   ├── config/
│   │   ├── index.ts          # 配置管理
│   │   ├── database.ts       # 数据库配置（可选）
│   │   └── cors.ts           # CORS 配置
│   ├── controllers/
│   │   ├── crawlController.ts # 爬取控制器
│   │   └── downloadController.ts # 下载控制器
│   ├── services/
│   │   ├── crawlService.ts   # 爬取业务逻辑
│   │   ├── downloadService.ts # 下载服务
│   │   ├── compressionService.ts # 压缩服务
│   │   └── taskService.ts    # 任务管理服务
│   ├── utils/
│   │   ├── htmlParser.ts     # HTML 解析工具
│   │   ├── imageDownloader.ts # 图片下载工具
│   │   ├── fileUtils.ts      # 文件操作工具
│   │   ├── validator.ts      # 数据验证工具
│   │   └── logger.ts         # 日志工具
│   ├── types/
│   │   ├── task.ts           # 任务相关类型
│   │   ├── api.ts            # API 接口类型
│   │   └── config.ts         # 配置类型
│   ├── middlewares/
│   │   ├── errorHandler.ts   # 错误处理中间件
│   │   ├── requestLogger.ts  # 请求日志中间件
│   │   └── rateLimiter.ts    # 限流中间件
│   └── routes/
│       ├── index.ts          # 路由汇总
│       ├── crawl.ts          # 爬取相关路由
│       └── download.ts       # 下载相关路由
├── downloads/                # 临时下载目录
├── compressed/               # 压缩文件存储目录
├── logs/                     # 日志文件目录
├── tests/                    # 测试文件
├── package.json              # 后端依赖配置
├── tsconfig.json            # TypeScript 配置
├── nodemon.json             # 开发环境配置
└── .env.example             # 环境变量示例
```

## 🚀 开发流程详细步骤

### 阶段 1: 项目初始化 (预计时间: 1-2小时)

#### 1.1 创建后端项目结构
```bash
# 在项目根目录执行
mkdir backend
cd backend
npm init -y

# 同时重构前端到独立目录（如需要）
# mkdir frontend
# mv ../src ../frontend/
# mv ../package.json ../frontend/
# mv ../vite.config.ts ../frontend/
# ... 等前端文件
```

#### 1.2 安装核心依赖
```bash
# 核心框架和中间件
npm install express cors helmet morgan compression
npm install multer body-parser cookie-parser

# 工具库
npm install axios jsdom node-html-parser adm-zip
npm install uuid dayjs fs-extra

# 开发依赖
npm install -D @types/node @types/express @types/cors
npm install -D @types/multer @types/uuid @types/fs-extra
npm install -D typescript nodemon ts-node concurrently
npm install -D @types/morgan @types/compression
```

#### 1.3 配置 TypeScript
创建 `tsconfig.json`：
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### 1.4 配置开发环境
创建 `nodemon.json`：
```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "ts-node ./src/server.ts"
}
```

更新 `package.json` scripts：
```json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  }
}
```

### 根目录工具脚本配置

在项目根目录的 `package.json` 中配置管理脚本：
```json
{
  "name": "crawl-weichat-monorepo",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm test",
    "test:backend": "cd backend && npm test",
    "start": "npm run start:backend",
    "start:backend": "cd backend && npm start"
  },
  "devDependencies": {
    "concurrently": "^9.2.0"
  }
}
```

### 阶段 2: 基础架构搭建 (预计时间: 2-3小时)

#### 2.1 创建配置管理系统
实现 `src/config/index.ts`：
- 环境变量管理
- 端口配置 (默认 3000)
- CORS 配置
- 文件存储路径配置
- 任务队列配置

#### 2.2 搭建 Express 应用
实现 `src/app.ts`：
- Express 应用初始化
- 中间件配置 (CORS, JSON parser, 静态文件)
- 路由注册
- 错误处理中间件
- 404 处理

实现 `src/server.ts`：
- 服务器启动逻辑
- 优雅关闭处理
- 端口监听

#### 2.3 实现中间件
实现 `src/middlewares/errorHandler.ts`：
- 统一错误处理
- 错误日志记录
- 用户友好的错误响应

实现 `src/middlewares/requestLogger.ts`：
- 请求日志记录
- 响应时间统计

实现 `src/middlewares/rateLimiter.ts`：
- API 限流保护
- 防止滥用

#### 2.4 设置日志系统
实现 `src/utils/logger.ts`：
- 分级日志记录 (debug, info, warn, error)
- 文件日志输出
- 控制台日志格式化

### 阶段 3: 核心业务逻辑实现 (预计时间: 4-6小时)

#### 3.1 HTML 解析服务
实现 `src/utils/htmlParser.ts`：
- 使用 `jsdom` 或 `node-html-parser` 解析微信文章 HTML
- 提取文章中的所有图片 URL
- 处理不同的图片 URL 格式 (相对路径、绝对路径、CDN 链接等)
- 图片 URL 去重和验证

**核心实现示例**：
```typescript
import { parse } from 'node-html-parser';
import { URL } from 'url';

export class HtmlParser {
  /**
   * 从HTML中提取所有图片URL
   */
  static extractImageUrls(html: string, baseUrl: string): string[] {
    const root = parse(html);
    const imgElements = root.querySelectorAll('img');
    
    const imageUrls = imgElements
      .map(img => img.getAttribute('src'))
      .filter(src => src && this.isValidImageUrl(src))
      .map(src => this.resolveUrl(src!, baseUrl))
      .filter((url, index, array) => array.indexOf(url) === index); // 去重
    
    return imageUrls;
  }
  
  private static isValidImageUrl(url: string): boolean {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
    return imageExtensions.test(url) || url.includes('wx_fmt=');
  }
  
  private static resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    return new URL(url, baseUrl).href;
  }
}
```

#### 3.2 图片下载服务
实现 `src/utils/imageDownloader.ts`：
- 并发下载图片 (控制并发数，建议 5-10)
- 下载进度跟踪
- 失败重试机制 (最多 3 次)
- 图片格式验证
- 文件大小限制
- 超时处理

**核心实现示例**：
```typescript
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export class ImageDownloader {
  private maxConcurrent = 5;
  private retryCount = 3;
  private timeout = 30000;
  
  /**
   * 批量下载图片
   */
  async downloadImages(
    imageUrls: string[], 
    downloadDir: string,
    onProgress: (progress: number) => void
  ): Promise<string[]> {
    const downloadedFiles: string[] = [];
    let completed = 0;
    
    // 分批并发下载
    for (let i = 0; i < imageUrls.length; i += this.maxConcurrent) {
      const batch = imageUrls.slice(i, i + this.maxConcurrent);
      const promises = batch.map(async (url, index) => {
        try {
          const filename = await this.downloadSingleImage(url, downloadDir);
          if (filename) downloadedFiles.push(filename);
        } catch (error) {
          console.error(`下载失败: ${url}`, error);
        }
        completed++;
        onProgress(Math.round((completed / imageUrls.length) * 100));
      });
      
      await Promise.all(promises);
    }
    
    return downloadedFiles;
  }
  
  private async downloadSingleImage(url: string, dir: string): Promise<string | null> {
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        const response = await axios.get(url, {
          responseType: 'stream',
          timeout: this.timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const filename = this.generateFilename(url);
        const filepath = path.join(dir, filename);
        const writer = fs.createWriteStream(filepath);
        
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
          writer.on('finish', () => resolve(filename));
          writer.on('error', reject);
        });
      } catch (error) {
        if (attempt === this.retryCount - 1) throw error;
        await this.delay(1000 * (attempt + 1)); // 递增延迟
      }
    }
    return null;
  }
  
  private generateFilename(url: string): string {
    const urlObj = new URL(url);
    const timestamp = Date.now();
    const extension = path.extname(urlObj.pathname) || '.jpg';
    return `image_${timestamp}_${Math.random().toString(36).substring(7)}${extension}`;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 3.3 文件压缩服务
实现 `src/services/compressionService.ts`：
- 使用 `adm-zip` 创建 ZIP 文件
- 压缩进度跟踪
- 压缩级别配置
- 文件名去重处理

**核心实现示例**：
```typescript
import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import path from 'path';

export class CompressionService {
  /**
   * 压缩图片文件
   */
  async compressImages(
    imageFiles: string[],
    sourceDir: string,
    outputPath: string,
    onProgress: (progress: number) => void
  ): Promise<string> {
    const zip = new AdmZip();
    let processed = 0;
    
    for (const filename of imageFiles) {
      const filePath = path.join(sourceDir, filename);
      
      if (await fs.pathExists(filePath)) {
        const buffer = await fs.readFile(filePath);
        zip.addFile(filename, buffer);
      }
      
      processed++;
      onProgress(Math.round((processed / imageFiles.length) * 100));
    }
    
    // 写入ZIP文件
    zip.writeZip(outputPath);
    return outputPath;
  }
  
  /**
   * 获取压缩文件信息
   */
  async getCompressionInfo(zipPath: string) {
    const stats = await fs.stat(zipPath);
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    
    return {
      fileSize: stats.size,
      fileCount: entries.length,
      createdAt: stats.birthtime
    };
  }
}
```

#### 3.4 任务管理服务
实现 `src/services/taskService.ts`：
- 任务状态管理 (pending, downloading, compressing, completed, failed)
- 任务队列实现
- 任务进度更新
- 任务取消处理
- 任务历史记录管理

### 阶段 4: API 接口实现 (预计时间: 3-4小时)

> 详细的 API 规范请参考 `API_DOCS.md` 文档

#### 4.1 爬取控制器
实现 `src/controllers/crawlController.ts`：

**POST /api/crawl/start**
- 输入验证：检查微信文章 URL 格式
- 创建新任务：生成唯一 taskId
- 异步处理：启动爬取流程
- 返回任务信息

**GET /api/crawl/status/:taskId**
- 任务查询：根据 taskId 获取任务状态
- 进度信息：返回下载和压缩进度
- 错误处理：任务不存在的情况

**POST /api/crawl/cancel/:taskId**
- 任务取消：停止正在进行的任务
- 资源清理：删除临时文件
- 状态更新：更新任务状态为已取消

**GET /api/crawl/history**
- 历史查询：返回所有任务历史
- 分页支持：支持分页查询
- 排序：按创建时间倒序

#### 4.2 下载控制器
实现 `src/controllers/downloadController.ts`：

**GET /download/:filename**
- 文件验证：检查文件是否存在
- 安全检查：防止路径遍历攻击
- 流式下载：支持大文件下载
- 下载完成后清理：可选择是否删除文件

### 阶段 5: 核心爬取流程实现 (预计时间: 4-5小时)

#### 5.1 主爬取服务
实现 `src/services/crawlService.ts`：

```typescript
async function processCrawlTask(taskId: string, url: string) {
  try {
    // 1. 更新任务状态为 downloading
    await updateTaskStatus(taskId, 'downloading');
    
    // 2. 获取文章 HTML 内容
    const htmlContent = await fetchArticleHTML(url);
    
    // 3. 解析并提取图片 URL
    const imageUrls = await parseImageUrls(htmlContent);
    
    // 4. 创建任务专用下载目录
    const downloadDir = await createTaskDirectory(taskId);
    
    // 5. 并发下载图片
    const downloadedImages = await downloadImages(
      imageUrls, 
      downloadDir, 
      (progress) => updateDownloadProgress(taskId, progress)
    );
    
    // 6. 更新任务状态为 compressing
    await updateTaskStatus(taskId, 'compressing');
    
    // 7. 压缩图片文件
    const zipPath = await compressImages(
      downloadedImages, 
      taskId,
      (progress) => updateCompressionProgress(taskId, progress)
    );
    
    // 8. 更新任务状态为 completed
    await completeTask(taskId, zipPath, downloadedImages.length);
    
    // 9. 清理临时文件
    await cleanupTempFiles(downloadDir);
    
  } catch (error) {
    // 错误处理：更新任务状态为 failed
    await failTask(taskId, error.message);
    throw error;
  }
}
```

#### 5.2 HTML 内容获取
- 使用 `axios` 获取微信文章页面
- 处理可能的反爬措施
- 设置合适的 User-Agent
- 错误重试机制

#### 5.3 图片下载流程
- 验证图片 URL 有效性
- 处理不同域名的图片
- 实现下载进度回调
- 处理下载失败的图片
- 保存图片到本地并记录信息

#### 5.4 文件压缩流程
- 创建 ZIP 文件
- 添加图片到压缩包
- 实现压缩进度回调
- 生成下载链接

### 阶段 6: 路由和错误处理 (预计时间: 2-3小时)

#### 6.1 路由配置
实现 `src/routes/crawl.ts`：
- 定义所有爬取相关的路由
- 参数验证中间件
- 错误处理

实现 `src/routes/download.ts`：
- 文件下载路由
- 安全验证
- 流式传输

#### 6.2 数据验证
实现 `src/utils/validator.ts`：
- 微信 URL 格式验证
- 请求参数验证
- 文件安全检查

#### 6.3 错误处理完善
- 统一错误响应格式
- 不同类型错误的处理策略
- 用户友好的错误信息

### 阶段 7: 性能优化和安全加固 (预计时间: 2-3小时)

#### 7.1 性能优化
- 实现下载队列限制并发数
- 添加缓存机制（可选）
- 优化文件 I/O 操作
- 内存使用优化

#### 7.2 安全措施
- 输入验证和清理
- 文件路径安全检查
- 请求频率限制
- 文件大小限制

#### 7.3 资源管理
- 临时文件定期清理
- 内存泄漏防护
- 优雅关闭处理

### 阶段 8: 测试和调试 (预计时间: 3-4小时)

#### 8.1 单元测试
- 工具函数测试
- 服务层测试
- 控制器测试

#### 8.2 集成测试
- API 端到端测试
- 文件操作测试
- 错误场景测试

#### 8.3 手动测试
- 真实微信文章测试
- 异常情况测试
- 性能压力测试

## 📦 依赖包详细说明

### 核心依赖
- **express**: Web 框架
- **cors**: 跨域资源共享
- **axios**: HTTP 客户端，用于获取文章内容
- **jsdom**: HTML 解析，处理 DOM 操作
- **node-html-parser**: 轻量级 HTML 解析器
- **adm-zip**: ZIP 文件创建和操作
- **uuid**: 生成唯一任务 ID
- **fs-extra**: 增强的文件系统操作

### 开发依赖
- **typescript**: TypeScript 支持
- **nodemon**: 开发环境热重载
- **@types/***: TypeScript 类型定义

## 🔧 配置说明

### 环境变量配置
创建 `.env` 文件：
```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 文件存储配置
DOWNLOAD_DIR=./downloads
COMPRESSED_DIR=./compressed
TEMP_DIR=./temp

# 下载配置
MAX_CONCURRENT_DOWNLOADS=5
DOWNLOAD_TIMEOUT=30000
MAX_FILE_SIZE=10485760

# 任务配置
MAX_CONCURRENT_TASKS=3
TASK_TIMEOUT=300000
AUTO_CLEANUP_HOURS=24
```

### CORS 配置
允许前端域名的跨域请求：
```typescript
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite 开发服务器
    'http://localhost:4173', // Vite 预览服务器
    // 生产环境域名
  ],
  credentials: true
};
```

## 🚨 注意事项和风险点

### 1. 微信反爬机制
- 可能需要设置合适的请求头
- 考虑添加请求间隔
- 准备应对 IP 限制

### 2. 图片资源问题
- 某些图片可能需要特殊的访问权限
- 处理图片链接的有效期问题
- 考虑图片防盗链机制

### 3. 性能考虑
- 大量图片下载时的内存使用
- 并发控制避免过载
- 磁盘空间管理

### 4. 法律合规
- 确保使用符合微信服务条款
- 考虑版权问题
- 添加适当的免责声明

## 📋 开发检查清单

### 基础功能
- [ ] 项目结构创建
- [ ] 依赖安装和配置
- [ ] 基础 Express 应用搭建
- [ ] 中间件配置

### 核心功能
- [ ] 微信文章 HTML 获取
- [ ] 图片 URL 解析
- [ ] 图片并发下载
- [ ] 文件压缩功能
- [ ] 任务状态管理

### API 接口
- [ ] POST /api/crawl/start
- [ ] GET /api/crawl/status/:taskId
- [ ] POST /api/crawl/cancel/:taskId
- [ ] GET /api/crawl/history
- [ ] GET /download/:filename

### 质量保证
- [ ] 错误处理完善
- [ ] 日志记录系统
- [ ] 输入验证
- [ ] 安全措施
- [ ] 单元测试
- [ ] 集成测试

### 性能优化
- [ ] 并发控制
- [ ] 内存优化
- [ ] 文件清理机制
- [ ] 缓存策略（可选）

## 🔗 相关文档

- `API_DOCS.md` - 详细的 API 接口文档
- `PROJECT_SUMMARY.md` - 项目总体介绍和前端功能说明
- 前端代码 `src/api/types.ts` - TypeScript 类型定义参考

## 📈 后续扩展建议

1. **数据库集成**: 使用 SQLite 或 MongoDB 持久化任务数据
2. **任务队列**: 使用 Redis 或 Bull 实现更robust的任务队列
3. **缓存层**: 添加 Redis 缓存提高性能
4. **监控系统**: 集成 APM 工具监控服务状态
5. **容器化**: 添加 Docker 配置便于部署
6. **API 文档**: 使用 Swagger 生成交互式 API 文档

---

*预计总开发时间: 20-30 小时*
*建议分阶段实现，先完成核心功能再逐步优化*
