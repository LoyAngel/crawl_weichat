import { v4 as uuidv4 } from 'uuid';
import type { CrawlTask, CrawlStatus } from '~/types/task';

/**
 * 任务管理器 - 内存存储
 */
class TaskManager {
  private tasks: Map<string, CrawlTask> = new Map();
  private runningTasks: Set<string> = new Set();

  /**
   * 创建新任务
   */
  createTask(url: string): CrawlTask {
    const taskId = uuidv4();
    const task: CrawlTask = {
      id: taskId,
      url,
      status: 'pending' as CrawlStatus,
      totalImages: 0,
      downloadedImages: 0,
      progress: 0,
      compressProgress: 0,
      createdAt: new Date().toISOString()
    };

    this.tasks.set(taskId, task);
    return task;
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): CrawlTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 更新任务
   */
  updateTask(taskId: string, updates: Partial<CrawlTask>): CrawlTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  /**
   * 获取所有任务历史
   */
  getAllTasks(): CrawlTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * 删除任务
   */
  deleteTask(taskId: string): boolean {
    this.runningTasks.delete(taskId);
    return this.tasks.delete(taskId);
  }

  /**
   * 标记任务为运行中
   */
  markTaskAsRunning(taskId: string): void {
    this.runningTasks.add(taskId);
  }

  /**
   * 标记任务为不再运行
   */
  markTaskAsNotRunning(taskId: string): void {
    this.runningTasks.delete(taskId);
  }

  /**
   * 检查任务是否正在运行
   */
  isTaskRunning(taskId: string): boolean {
    return this.runningTasks.has(taskId);
  }

  /**
   * 获取运行中的任务数量
   */
  getRunningTasksCount(): number {
    return this.runningTasks.size;
  }
}

// 全局任务管理器实例
export const taskManager = new TaskManager();
