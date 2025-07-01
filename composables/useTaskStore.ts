import type { CrawlTask } from '~/types/task';

/**
 * 全局状态管理 - 使用 Nuxt 的 useState
 */

// 当前活动任务
export const useCurrentTask = () => useState<CrawlTask | null>('currentTask', () => null);

// 任务历史列表
export const useTaskHistory = () => useState<CrawlTask[]>('taskHistory', () => []);

// 应用状态
export const useAppState = () => useState('appState', () => ({
  isLoading: false,
  isPolling: false,
  lastUpdateTime: null as Date | null,
  errorMessage: '',
  successMessage: ''
}));

// 用户偏好设置
export const useUserPreferences = () => useState('userPreferences', () => ({
  autoDownload: false,          // 是否自动下载完成的文件
  notifications: true,          // 是否开启通知
  maxConcurrentTasks: 3,        // 最大并发任务数
  compressionLevel: 6,          // 压缩级别
  theme: 'light'                // 主题
}));

/**
 * 任务状态管理 Composable
 */
export const useTaskStore = () => {
  const currentTask = useCurrentTask();
  const taskHistory = useTaskHistory();
  const appState = useAppState();
  const userPreferences = useUserPreferences();

  /**
   * 更新当前任务
   */
  const updateCurrentTask = (task: CrawlTask | null) => {
    currentTask.value = task;
    appState.value.lastUpdateTime = new Date();
  };

  /**
   * 添加任务到历史记录
   */
  const addTaskToHistory = (task: CrawlTask) => {
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
  const updateTaskHistory = (tasks: CrawlTask[]) => {
    taskHistory.value = tasks;
  };

  /**
   * 设置应用状态
   */
  const setAppLoading = (loading: boolean) => {
    appState.value.isLoading = loading;
  };

  const setPollingState = (polling: boolean) => {
    appState.value.isPolling = polling;
  };

  const setErrorMessage = (message: string) => {
    appState.value.errorMessage = message;
    setTimeout(() => {
      appState.value.errorMessage = '';
    }, 5000);
  };

  const setSuccessMessage = (message: string) => {
    appState.value.successMessage = message;
    setTimeout(() => {
      appState.value.successMessage = '';
    }, 3000);
  };

  /**
   * 重置所有状态
   */
  const resetAllState = () => {
    currentTask.value = null;
    taskHistory.value = [];
    appState.value.isLoading = false;
    appState.value.isPolling = false;
    appState.value.lastUpdateTime = null;
    appState.value.errorMessage = '';
    appState.value.successMessage = '';
  };

  /**
   * 保存用户偏好到本地存储
   */
  const saveUserPreferences = () => {
    if (process.client) {
      try {
        localStorage.setItem('crawl_weichat_preferences', JSON.stringify(userPreferences.value));
      } catch (error) {
        console.error('保存用户偏好失败:', error);
      }
    }
  };

  /**
   * 从本地存储加载用户偏好
   */
  const loadUserPreferences = () => {
    if (process.client) {
      try {
        const saved = localStorage.getItem('crawl_weichat_preferences');
        if (saved) {
          const preferences = JSON.parse(saved);
          Object.assign(userPreferences.value, preferences);
        }
      } catch (error) {
        console.error('加载用户偏好失败:', error);
      }
    }
  };

  return {
    // 状态
    currentTask: readonly(currentTask),
    taskHistory: readonly(taskHistory),
    appState: readonly(appState),
    userPreferences,
    
    // 方法
    updateCurrentTask,
    addTaskToHistory,
    updateTaskHistory,
    setAppLoading,
    setPollingState,
    setErrorMessage,
    setSuccessMessage,
    resetAllState,
    saveUserPreferences,
    loadUserPreferences
  };
};
