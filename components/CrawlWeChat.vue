<template>
  <div class="crawl-container">    <!-- 头部标题 -->
    <el-header class="header">
      <h1 class="title">
        <el-icon><Picture /></el-icon>
        微信公众号图片爬取工具
      </h1>      <div class="header-actions">
        <el-tooltip content="帮助" placement="bottom">
          <el-button
            type="text"
            @click="showHelp = true"
            class="header-action-btn"
          >
            <el-icon size="18"><QuestionFilled /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="设置" placement="bottom">
          <el-button
            type="text"
            @click="showSettings = true"
            class="header-action-btn"
          >
            <el-icon size="18"><Setting /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-container class="main-container">
      <el-main>
        <!-- 演示面板 -->
        <DemoPanel />

        <!-- URL输入表单 -->
        <el-card class="form-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>输入微信公众号文章链接</span>
            </div>
          </template>
          
          <el-form 
            :model="form" 
            :rules="rules" 
            ref="formRef" 
            label-width="auto"
            @submit.prevent="handleSubmit"
          >
            <el-form-item label="文章URL" prop="url">
              <el-input
                v-model="form.url"
                placeholder="请输入微信公众号文章链接，例如：https://mp.weixin.qq.com/s/..."
                clearable
                :disabled="isProcessing"
                size="large"
              >
                <template #prepend>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleSubmit"
                :loading="isProcessing"
                size="large"
                style="width: 100%;"
              >
                <el-icon v-if="!isProcessing"><Download /></el-icon>
                {{ isProcessing ? '处理中...' : '开始爬取' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 任务进度区域 -->
        <el-card 
          v-if="currentTask" 
          class="progress-card" 
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>任务进度</span>
              <el-tag 
                :type="getStatusType(currentTask.status)"
                size="small"
              >
                {{ getStatusText(currentTask.status) }}
              </el-tag>
            </div>
          </template>

          <!-- 任务信息 -->
          <div class="task-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="任务ID">
                <el-tag type="info" size="small">{{ currentTask.id }}</el-tag>
              </el-descriptions-item>              <el-descriptions-item label="创建时间">
                {{ formatTimeDisplay(currentTask.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="文章URL" :span="2">
                <el-link 
                  :href="currentTask.url" 
                  target="_blank" 
                  type="primary"
                  style="word-break: break-all;"
                >
                  {{ currentTask.url }}
                </el-link>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 下载进度 -->
          <div v-if="currentTask.status === 'downloading'" class="progress-section">
            <h4>
              <el-icon><Download /></el-icon>
              图片下载进度
            </h4>
            <el-progress 
              :percentage="currentTask.progress" 
              :stroke-width="20"
              striped
              striped-flow
            >
              <template #default="{ percentage }">
                <span class="percentage-text">{{ percentage }}%</span>
              </template>
            </el-progress>
            <p class="progress-text">
              已下载 {{ currentTask.downloadedImages }} / {{ currentTask.totalImages }} 张图片
            </p>
          </div>

          <!-- 压缩进度 -->
          <div v-if="currentTask.status === 'compressing'" class="progress-section">
            <h4>
              <el-icon><FolderOpened /></el-icon>
              文件压缩进度
            </h4>
            <el-progress 
              :percentage="currentTask.compressProgress" 
              :stroke-width="20"
              status="success"
              striped
              striped-flow
            >
              <template #default="{ percentage }">
                <span class="percentage-text">{{ percentage }}%</span>
              </template>
            </el-progress>
            <p class="progress-text">正在压缩文件...</p>
          </div>

          <!-- 完成状态 -->
          <div v-if="currentTask.status === 'completed'" class="completion-section">
            <el-result
              icon="success"
              title="任务完成！"
              :sub-title="`成功下载 ${currentTask.totalImages} 张图片`"
            >
              <template #extra>
                <el-button 
                  type="primary" 
                  size="large"
                  @click="handleDownload"
                  v-if="currentTask.downloadUrl"
                >
                  <el-icon><Download /></el-icon>
                  下载压缩文件
                </el-button>
              </template>
            </el-result>
          </div>

          <!-- 错误状态 -->
          <div v-if="currentTask.status === 'failed'" class="error-section">
            <el-result
              icon="error"
              title="任务失败"
              :sub-title="currentTask.errorMessage || '未知错误'"
            >
              <template #extra>
                <el-button @click="resetTask">重新开始</el-button>
              </template>
            </el-result>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons" v-if="currentTask.status !== 'completed' && currentTask.status !== 'failed'">
            <el-button 
              type="danger" 
              @click="handleCancel"
              :loading="isCancelling"
            >
              <el-icon><Close /></el-icon>
              取消任务
            </el-button>
          </div>
        </el-card>

        <!-- 历史记录 -->
        <el-card class="history-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>历史记录</span>
              <el-button 
                type="text" 
                @click="loadHistory"
                :loading="isLoadingHistory"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>          <el-table 
            :data="taskHistory" 
            v-loading="isLoadingHistory"
            empty-text="暂无历史记录"
          >
            <el-table-column prop="id" label="任务ID" width="120">
              <template #default="{ row }">
                <el-tag type="info" size="small">{{ row.id }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="url" label="文章URL" min-width="200" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="totalImages" label="图片数量" width="100" />            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatTimeDisplay(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button 
                  v-if="row.status === 'completed' && row.downloadUrl"
                  type="primary" 
                  size="small"
                  @click="downloadHistoryFile(row)"
                >
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>        </el-card>
      </el-main>
    </el-container>    <!-- 设置面板 -->
    <SettingsPanel v-model="showSettings" />
    
    <!-- 帮助对话框 -->
    <HelpDialog 
      v-model="showHelp"
      @openSettings="showSettings = true"
      @startDemo="() => {}"
      @viewHistory="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { 
  Picture, 
  Link, 
  Download, 
  FolderOpened, 
  Close, 
  Refresh,
  Setting,
  QuestionFilled 
} from '@element-plus/icons-vue';
import { 
  startCrawl, 
  getTaskStatus, 
  downloadFile, 
  cancelTask, 
  getTaskHistory 
} from '../api';
import type { CrawlTask, CrawlStatus } from '../api/types';
import { formatTime, isValidWeChatUrl, calculatePercentage } from '../utils';
import { 
  TASK_STATUS, 
  STATUS_TAG_TYPE, 
  STATUS_TEXT, 
  POLLING_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '../constants';
import { 
  currentTask, 
  taskHistory, 
  updateCurrentTask, 
  updateTaskHistory,
  loadUserPreferences 
} from '../store';
import DemoPanel from './DemoPanel.vue';
import SettingsPanel from './SettingsPanel.vue';
import HelpDialog from './HelpDialog.vue';

// 表单数据
const form = reactive({
  url: ''
});

// 表单验证规则
const rules: FormRules = {
  url: [
    { required: true, message: '请输入文章URL', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!isValidWeChatUrl(value)) {
          callback(new Error(ERROR_MESSAGES.INVALID_URL));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

// 表单引用
const formRef = ref<FormInstance>();

// 状态管理
const isProcessing = ref(false);
const isCancelling = ref(false);
const isLoadingHistory = ref(false);
const showSettings = ref(false);
const showHelp = ref(false);
// 使用全局状态
// const currentTask 和 taskHistory 从 store 导入

// 轮询定时器
let pollingTimer: number | null = null;

// 状态类型映射
const getStatusType = (status: CrawlStatus): string => {
  return STATUS_TAG_TYPE[status] || 'info';
};

// 状态文本映射
const getStatusText = (status: CrawlStatus): string => {
  return STATUS_TEXT[status] || '未知';
};

// 格式化时间
const formatTimeDisplay = (time: string): string => {
  return formatTime(time);
};

// 开始轮询任务状态
const startPolling = (taskId: string) => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
  }
    pollingTimer = setInterval(async () => {    try {
      const response = await getTaskStatus(taskId);
      if (response.success && response.task) {
        updateCurrentTask(response.task);
        
        // 如果任务完成或失败，停止轮询
        if (response.task.status === TASK_STATUS.COMPLETED || response.task.status === TASK_STATUS.FAILED) {
          stopPolling();
          isProcessing.value = false;
          
          if (response.task.status === TASK_STATUS.COMPLETED) {
            ElNotification({
              title: '任务完成',
              message: `成功下载 ${response.task.totalImages} 张图片`,
              type: 'success'
            });
          } else {
            ElNotification({
              title: '任务失败',
              message: response.task.errorMessage || ERROR_MESSAGES.UNKNOWN_ERROR,
              type: 'error'
            });
          }
          
          // 刷新历史记录
          loadHistory();
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败:', error);
    }
  }, POLLING_CONFIG.INTERVAL);
};

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    isProcessing.value = true;
    
    try {
      const response = await startCrawl({ url: form.url });
        if (response.success && response.taskId) {
        ElMessage.success(SUCCESS_MESSAGES.TASK_STARTED);
          // 创建初始任务对象
        const newTask: CrawlTask = {
          id: response.taskId,
          url: form.url,
          status: TASK_STATUS.PENDING as CrawlStatus,
          totalImages: 0,
          downloadedImages: 0,
          progress: 0,
          compressProgress: 0,
          createdAt: new Date().toISOString()
        };
        
        updateCurrentTask(newTask);
        
        // 开始轮询
        startPolling(response.taskId);
      } else {
        ElMessage.error(response.error || ERROR_MESSAGES.UNKNOWN_ERROR);
        isProcessing.value = false;
      }
    } catch (error) {
      console.error('启动任务失败:', error);
      ElMessage.error('启动任务失败');
      isProcessing.value = false;
    }
  });
};

// 下载文件
const handleDownload = () => {
  if (currentTask.value?.downloadUrl) {
    const filename = `images_${currentTask.value.id}.zip`;
    downloadFile(currentTask.value.downloadUrl, filename);
    ElMessage.success('开始下载文件');
  }
};

// 取消任务
const handleCancel = async () => {
  if (!currentTask.value) return;
  
  isCancelling.value = true;
  
  try {
    const response = await cancelTask(currentTask.value.id);
    
    if (response.success) {
      ElMessage.success('任务已取消');
      stopPolling();
      resetTask();
    } else {
      ElMessage.error(response.error || '取消任务失败');
    }
  } catch (error) {
    console.error('取消任务失败:', error);
    ElMessage.error('取消任务失败');
  } finally {
    isCancelling.value = false;
  }
};

// 重置任务
const resetTask = () => {
  updateCurrentTask(null);
  isProcessing.value = false;
  isCancelling.value = false;
  stopPolling();
  form.url = '';
};

// 加载历史记录
const loadHistory = async () => {
  isLoadingHistory.value = true;
  
  try {
    const response = await getTaskHistory();
      if (response.success && response.data) {
      updateTaskHistory(response.data);
    } else {
      ElMessage.error(response.error || '加载历史记录失败');
    }
  } catch (error) {
    console.error('加载历史记录失败:', error);
    ElMessage.error('加载历史记录失败');
  } finally {
    isLoadingHistory.value = false;
  }
};

// 下载历史文件
const downloadHistoryFile = (task: CrawlTask) => {
  if (task.downloadUrl) {
    const filename = `images_${task.id}.zip`;
    downloadFile(task.downloadUrl, filename);
    ElMessage.success('开始下载文件');
  }
};

// 组件挂载时加载历史记录和用户偏好
onMounted(() => {
  loadHistory();
  loadUserPreferences();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.crawl-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.title {
  margin: 0;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-action-btn {
  color: #909399;
  transition: color 0.3s;
}

.header-action-btn:hover {
  color: #409eff;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-card,
.progress-card,
.history-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.task-info {
  margin-bottom: 20px;
}

.progress-section {
  margin: 20px 0;
}

.progress-section h4 {
  margin: 0 0 15px 0;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  margin: 10px 0 0 0;
  color: #666;
  text-align: center;
}

.percentage-text {
  color: #409eff;
  font-weight: bold;
}

.completion-section,
.error-section {
  margin: 20px 0;
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-progress-bar__outer) {
  border-radius: 10px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 10px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-descriptions__body .el-descriptions__cell) {
  padding: 12px;
}
</style>
