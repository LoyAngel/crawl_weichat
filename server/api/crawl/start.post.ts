import type { StartCrawlRequest, StartCrawlResponse } from '~/types/task';
import { taskManager } from '~/server/utils/taskManager';
import { crawlService } from '~/server/utils/crawlService';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<StartCrawlRequest>(event);
    
    if (!body.url) {
      return {
        success: false,
        error: '请提供文章URL'
      } as StartCrawlResponse;
    }

    // 验证URL格式
    const urlRegex = /^https:\/\/mp\.weixin\.qq\.com\/s\/.*/;
    if (!urlRegex.test(body.url)) {
      return {
        success: false,
        error: 'URL格式不正确，请提供有效的微信公众号文章链接'
      } as StartCrawlResponse;
    }

    // 检查运行中的任务数量
    if (taskManager.getRunningTasksCount() >= 3) {
      return {
        success: false,
        error: '当前运行的任务过多，请等待其他任务完成'
      } as StartCrawlResponse;
    }

    // 创建新任务
    const task = taskManager.createTask(body.url);

    // 异步开始爬取（不等待完成）
    crawlService.startCrawl(task.id).catch(error => {
      console.error(`任务 ${task.id} 执行失败:`, error);
    });

    return {
      success: true,
      taskId: task.id,
      message: '任务已开始'
    } as StartCrawlResponse;

  } catch (error) {
    console.error('开始爬取任务失败:', error);
    return {
      success: false,
      error: '服务器内部错误'
    } as StartCrawlResponse;
  }
});
