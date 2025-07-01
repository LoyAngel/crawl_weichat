import type { ApiResponse, CrawlTask } from '~/types/task';
import { taskManager } from '~/server/utils/taskManager';

export default defineEventHandler(async (event) => {
  try {
    const tasks = taskManager.getAllTasks();
    
    return {
      success: true,
      data: tasks
    } as ApiResponse<CrawlTask[]>;

  } catch (error) {
    console.error('获取任务历史失败:', error);
    return {
      success: false,
      error: '服务器内部错误'
    } as ApiResponse<CrawlTask[]>;
  }
});
