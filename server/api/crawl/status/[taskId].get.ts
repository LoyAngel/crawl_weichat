import type { GetTaskStatusResponse } from '~/types/task';
import { taskManager } from '~/server/utils/taskManager';

export default defineEventHandler(async (event) => {
  try {
    const taskId = getRouterParam(event, 'taskId');
    
    if (!taskId) {
      return {
        success: false,
        error: '请提供任务ID'
      } as GetTaskStatusResponse;
    }

    const task = taskManager.getTask(taskId);
    
    if (!task) {
      return {
        success: false,
        error: '任务不存在'
      } as GetTaskStatusResponse;
    }

    return {
      success: true,
      task
    } as GetTaskStatusResponse;

  } catch (error) {
    console.error('获取任务状态失败:', error);
    return {
      success: false,
      error: '服务器内部错误'
    } as GetTaskStatusResponse;
  }
});
