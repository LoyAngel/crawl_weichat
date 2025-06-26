import { config } from '../config';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * 日志工具类
 */
class Logger {
  private level: LogLevel;

  constructor() {
    this.level = this.getLogLevel();
  }

  /**
   * 根据配置获取日志级别
   */
  private getLogLevel(): LogLevel {
    switch (config.LOG_LEVEL) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    return `${prefix} ${message}`;
  }

  /**
   * 输出日志
   */
  private log(level: LogLevel, levelName: string, message: string, ...args: any[]) {
    if (level < this.level) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, ...args);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]) {
    this.log(LogLevel.INFO, 'INFO', message, ...args);
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]) {
    this.log(LogLevel.WARN, 'WARN', message, ...args);
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]) {
    this.log(LogLevel.ERROR, 'ERROR', message, ...args);
  }

  /**
   * API请求日志
   */
  apiRequest(method: string, url: string, data?: any) {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, data);
  }

  /**
   * API响应日志
   */
  apiResponse(method: string, url: string, status: number, data?: any) {
    this.debug(`API Response: ${method.toUpperCase()} ${url} [${status}]`, data);
  }

  /**
   * API错误日志
   */
  apiError(method: string, url: string, error: any) {
    this.error(`API Error: ${method.toUpperCase()} ${url}`, error);
  }

  /**
   * 任务状态变更日志
   */
  taskStatusChange(taskId: string, oldStatus: string, newStatus: string) {
    this.info(`Task ${taskId} status changed: ${oldStatus} -> ${newStatus}`);
  }

  /**
   * 用户操作日志
   */
  userAction(action: string, details?: any) {
    this.info(`User action: ${action}`, details);
  }
}

// 导出单例实例
export const logger = new Logger();

// 导出便捷方法
export const { debug, info, warn, error } = logger;
