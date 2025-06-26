import { ref, reactive } from 'vue';
import type { CrawlTask } from '../api/types';

/**
 * 全局状态管理
 */

// 当前活动任务
export const currentTask = ref<CrawlTask | null>(null);

// 任务历史列表
export const taskHistory = ref<CrawlTask[]>([]);

// 应用状态
export const appState = reactive({
  isLoading: false,
  isPolling: false,
  lastUpdateTime: null as Date | null,
  errorMessage: '',
  successMessage: ''
});

// 用户偏好设置
export const userPreferences = reactive({
  autoDownload: false,          // 是否自动下载完成的文件
  notifications: true,          // 是否开启通知
  maxConcurrentTasks: 3,        // 最大并发任务数
  compressionLevel: 6,          // 压缩级别
  theme: 'light'                // 主题
});

/**
 * 更新当前任务
 */
export const updateCurrentTask = (task: CrawlTask | null) => {
  currentTask.value = task;
  appState.lastUpdateTime = new Date();
};

/**
 * 添加任务到历史记录
 */
export const addTaskToHistory = (task: CrawlTask) => {
  const existingIndex = taskHistory.value.findIndex(t => t.id === task.id);
  if (existingIndex >= 0) {
    taskHistory.value[existingIndex] = task;
  } else {
    taskHistory.value.unshift(task);
  }
  
  // 只保留最近50个任务
  if (taskHistory.value.length > 50) {
    taskHistory.value = taskHistory.value.slice(0, 50);
  }
};

/**
 * 更新任务历史列表
 */
export const updateTaskHistory = (tasks: CrawlTask[]) => {
  taskHistory.value = tasks;
};

/**
 * 设置应用状态
 */
export const setAppLoading = (loading: boolean) => {
  appState.isLoading = loading;
};

export const setPollingState = (polling: boolean) => {
  appState.isPolling = polling;
};

export const setErrorMessage = (message: string) => {
  appState.errorMessage = message;
  setTimeout(() => {
    appState.errorMessage = '';
  }, 5000);
};

export const setSuccessMessage = (message: string) => {
  appState.successMessage = message;
  setTimeout(() => {
    appState.successMessage = '';
  }, 3000);
};

/**
 * 重置所有状态
 */
export const resetAllState = () => {
  currentTask.value = null;
  taskHistory.value = [];
  appState.isLoading = false;
  appState.isPolling = false;
  appState.lastUpdateTime = null;
  appState.errorMessage = '';
  appState.successMessage = '';
};

/**
 * 保存用户偏好到本地存储
 */
export const saveUserPreferences = () => {
  try {
    localStorage.setItem('crawl_weichat_preferences', JSON.stringify(userPreferences));
  } catch (error) {
    console.error('保存用户偏好失败:', error);
  }
};

/**
 * 从本地存储加载用户偏好
 */
export const loadUserPreferences = () => {
  try {
    const saved = localStorage.getItem('crawl_weichat_preferences');
    if (saved) {
      const preferences = JSON.parse(saved);
      Object.assign(userPreferences, preferences);
    }
  } catch (error) {
    console.error('加载用户偏好失败:', error);
  }
};
