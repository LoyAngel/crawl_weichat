import type { ApiResponse } from '~/types/task';
import { taskManager } from '~/server/utils/taskManager';
import { crawlService } from '~/server/utils/crawlService';

export default defineEventHandler(async (event) => {
  try {
    const taskId = getRouterParam(event, 'taskId');
    
    if (!taskId) {
      return {
        success: false,
        error: '请提供任务ID'
      } as ApiResponse;
    }

    const task = taskManager.getTask(taskId);
    
    if (!task) {
      return {
        success: false,
        error: '任务不存在'
      } as ApiResponse;
    }

    if (task.status === 'completed' || task.status === 'failed') {
      return {
        success: false,
        error: '任务已完成或已失败，无法取消'
      } as ApiResponse;
    }

    // 取消任务
    const cancelled = await crawlService.cancelTask(taskId);
    
    if (cancelled) {
      return {
        success: true,
        message: '任务已取消'
      } as ApiResponse;
    } else {
      return {
        success: false,
        error: '取消任务失败'
      } as ApiResponse;
    }

  } catch (error) {
    console.error('取消任务失败:', error);
    return {
      success: false,
      error: '服务器内部错误'
    } as ApiResponse;
  }
});
