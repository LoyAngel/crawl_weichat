// 接口类型定义

/**
 * 爬取任务状态
 */
export enum CrawlStatus {
  PENDING = 'pending',     // 等待开始
  DOWNLOADING = 'downloading', // 下载中
  COMPRESSING = 'compressing', // 压缩中
  COMPLETED = 'completed',     // 完成
  FAILED = 'failed'           // 失败
}

/**
 * 爬取任务信息
 */
export interface CrawlTask {
  id: string;              // 任务ID
  url: string;             // 爬取的URL
  status: CrawlStatus;     // 任务状态
  totalImages: number;     // 总图片数量
  downloadedImages: number; // 已下载图片数量
  progress: number;        // 下载进度 (0-100)
  compressProgress: number; // 压缩进度 (0-100)
  downloadUrl?: string;    // 压缩文件下载地址
  errorMessage?: string;   // 错误信息
  createdAt: string;       // 创建时间
  completedAt?: string;    // 完成时间
}

/**
 * 开始爬取请求参数
 */
export interface StartCrawlRequest {
  url: string;             // 要爬取的微信公众号文章URL
}

/**
 * 开始爬取响应
 */
export interface StartCrawlResponse {
  success: boolean;        // 是否成功
  taskId?: string;         // 任务ID
  message?: string;        // 响应消息
  error?: string;          // 错误信息
}

/**
 * 获取任务状态响应
 */
export interface GetTaskStatusResponse {
  success: boolean;        // 是否成功
  task?: CrawlTask;        // 任务信息
  error?: string;          // 错误信息
}

/**
 * API响应基础类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
