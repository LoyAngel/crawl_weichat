/**
 * 应用常量配置
 */

// API相关配置
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000
};

// 轮询配置
export const POLLING_CONFIG = {
  INTERVAL: 2000,           // 轮询间隔（毫秒）
  MAX_RETRIES: 3,           // 最大重试次数
  RETRY_DELAY: 1000         // 重试延迟（毫秒）
};

// 任务状态常量
export const TASK_STATUS = {
  PENDING: 'pending',
  DOWNLOADING: 'downloading',
  COMPRESSING: 'compressing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

// 状态对应的标签类型
export const STATUS_TAG_TYPE = {
  [TASK_STATUS.PENDING]: 'info',
  [TASK_STATUS.DOWNLOADING]: 'warning',
  [TASK_STATUS.COMPRESSING]: 'warning',
  [TASK_STATUS.COMPLETED]: 'success',
  [TASK_STATUS.FAILED]: 'danger'
} as const;

// 状态对应的中文文本
export const STATUS_TEXT = {
  [TASK_STATUS.PENDING]: '等待中',
  [TASK_STATUS.DOWNLOADING]: '下载中',
  [TASK_STATUS.COMPRESSING]: '压缩中',
  [TASK_STATUS.COMPLETED]: '已完成',
  [TASK_STATUS.FAILED]: '失败'
} as const;

// 文件相关配置
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,    // 最大文件大小 100MB
  SUPPORTED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  DOWNLOAD_CHUNK_SIZE: 1024 * 1024,     // 下载块大小 1MB
  COMPRESSION_LEVEL: 6                   // 压缩级别 (0-9)
};

// UI相关配置
export const UI_CONFIG = {
  CARD_BORDER_RADIUS: '12px',
  BUTTON_BORDER_RADIUS: '8px',
  INPUT_BORDER_RADIUS: '8px',
  PROGRESS_STROKE_WIDTH: 20,
  TABLE_PAGE_SIZE: 10,
  NOTIFICATION_DURATION: 4000
};

// 验证规则
export const VALIDATION_RULES = {
  WECHAT_URL_PATTERN: /^https:\/\/mp\.weixin\.qq\.com\/s\/.+/,
  MIN_URL_LENGTH: 20,
  MAX_URL_LENGTH: 500
};

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  INVALID_URL: '请输入有效的微信公众号文章链接',
  TASK_NOT_FOUND: '任务不存在或已过期',
  DOWNLOAD_FAILED: '下载失败，请稍后重试',
  COMPRESSION_FAILED: '文件压缩失败',
  SERVER_ERROR: '服务器内部错误',
  UNKNOWN_ERROR: '未知错误，请联系管理员'
};

// 成功消息
export const SUCCESS_MESSAGES = {
  TASK_STARTED: '任务已开始',
  TASK_CANCELLED: '任务已取消',
  DOWNLOAD_STARTED: '开始下载文件',
  TASK_COMPLETED: '任务完成',
  REFRESH_SUCCESS: '刷新成功'
};

// 本地存储键名
export const STORAGE_KEYS = {
  TASK_HISTORY: 'crawl_weichat_history',
  USER_PREFERENCES: 'crawl_weichat_preferences',
  LAST_URL: 'crawl_weichat_last_url'
};

// 应用信息
export const APP_INFO = {
  NAME: '微信公众号图片爬取工具',
  VERSION: '1.0.0',
  AUTHOR: 'YourName',
  DESCRIPTION: '一键批量下载微信公众号文章中的所有图片'
};

// 主题配置
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#409eff',
  SUCCESS_COLOR: '#67c23a',
  WARNING_COLOR: '#e6a23c',
  DANGER_COLOR: '#f56c6c',
  INFO_COLOR: '#909399',
  BACKGROUND_GRADIENT: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
};
