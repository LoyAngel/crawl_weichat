<template>
  <div class="demo-container">
    <!-- 演示卡片 -->
    <el-card class="demo-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>功能演示</span>
        </div>
      </template>
      
      <div class="demo-content">
        <el-alert
          title="演示说明"
          description="由于后端服务尚未实现，您可以查看前端界面的各种状态演示"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <el-space direction="vertical" size="large" style="width: 100%;">
          <!-- 模拟任务状态 -->
          <div class="demo-section">
            <h4>任务状态演示</h4>
            <el-space wrap>
              <el-button @click="simulateTask('pending')" type="info" size="small">
                等待状态
              </el-button>
              <el-button @click="simulateTask('downloading')" type="warning" size="small">
                下载中
              </el-button>
              <el-button @click="simulateTask('compressing')" type="warning" size="small">
                压缩中
              </el-button>
              <el-button @click="simulateTask('completed')" type="success" size="small">
                已完成
              </el-button>
              <el-button @click="simulateTask('failed')" type="danger" size="small">
                失败状态
              </el-button>
              <el-button @click="clearTask()" size="small">
                清除任务
              </el-button>
            </el-space>
          </div>

          <!-- 模拟进度 -->
          <div class="demo-section" v-if="showProgressDemo">
            <h4>进度演示</h4>
            <el-space direction="vertical" style="width: 100%;">
              <div>
                <span>下载进度:</span>
                <el-slider 
                  v-model="downloadProgress" 
                  :max="100"
                  @change="updateProgress"
                  style="margin-left: 10px;"
                />
              </div>
              <div>
                <span>压缩进度:</span>
                <el-slider 
                  v-model="compressProgress" 
                  :max="100"
                  @change="updateProgress"
                  style="margin-left: 10px;"
                />
              </div>
            </el-space>
          </div>

          <!-- 模拟历史记录 -->
          <div class="demo-section">
            <h4>历史记录演示</h4>
            <el-space wrap>
              <el-button @click="addMockHistory" type="primary" size="small">
                添加模拟记录
              </el-button>
              <el-button @click="clearHistory" size="small">
                清空历史
              </el-button>
            </el-space>
          </div>

          <!-- 通知演示 -->
          <div class="demo-section">
            <h4>通知演示</h4>
            <el-space wrap>
              <el-button @click="showSuccessNotification" type="success" size="small">
                成功通知
              </el-button>
              <el-button @click="showErrorNotification" type="danger" size="small">
                错误通知
              </el-button>
              <el-button @click="showWarningNotification" type="warning" size="small">
                警告通知
              </el-button>
            </el-space>
          </div>
        </el-space>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import type { CrawlTask, CrawlStatus } from '~/types/task';

// 使用状态管理
const { updateCurrentTask, addTaskToHistory, updateTaskHistory } = useTaskStore();

// 工具函数
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// 响应式数据
const downloadProgress = ref(0);
const compressProgress = ref(0);

// 计算属性
const showProgressDemo = computed(() => {
  return downloadProgress.value > 0 || compressProgress.value > 0;
});

/**
 * 模拟任务状态
 */
const simulateTask = (status: CrawlStatus) => {
  const mockTask: CrawlTask = {
    id: generateId(),
    url: 'https://mp.weixin.qq.com/s/example-demo-url',
    status: status,
    totalImages: 15,
    downloadedImages: status === 'completed' ? 15 : Math.floor(Math.random() * 15),
    progress: status === 'completed' ? 100 : Math.floor(Math.random() * 100),
    compressProgress: status === 'completed' ? 100 : (status === 'compressing' ? Math.floor(Math.random() * 100) : 0),
    createdAt: new Date().toISOString(),
    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    downloadUrl: status === 'completed' ? 'http://localhost:3000/download/demo.zip' : undefined,
    errorMessage: status === 'failed' ? '这是一个演示错误消息' : undefined
  };

  updateCurrentTask(mockTask);
  
  if (status === 'downloading') {
    downloadProgress.value = mockTask.progress;
  } else if (status === 'compressing') {
    compressProgress.value = mockTask.compressProgress;
  }
  
  ElMessage.success(`模拟${getStatusText(status)}状态`);
};

/**
 * 清除当前任务
 */
const clearTask = () => {
  updateCurrentTask(null);
  downloadProgress.value = 0;
  compressProgress.value = 0;
  ElMessage.info('已清除当前任务');
};

/**
 * 更新进度
 */
const updateProgress = () => {
  // 这里可以添加进度更新的逻辑
};

/**
 * 添加模拟历史记录
 */
const addMockHistory = () => {
  const statuses: CrawlStatus[] = ['completed', 'failed', 'pending'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  const mockTask: CrawlTask = {
    id: generateId(),
    url: `https://mp.weixin.qq.com/s/demo-${Date.now()}`,
    status: randomStatus,
    totalImages: Math.floor(Math.random() * 20) + 5,
    downloadedImages: randomStatus === 'completed' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 15),
    progress: randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 100),
    compressProgress: randomStatus === 'completed' ? 100 : 0,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: randomStatus === 'completed' ? new Date().toISOString() : undefined,
    downloadUrl: randomStatus === 'completed' ? `http://localhost:3000/download/${Date.now()}.zip` : undefined,
    errorMessage: randomStatus === 'failed' ? '模拟的错误消息' : undefined
  };
  addTaskToHistory(mockTask);
  ElMessage.success('已添加模拟历史记录');
};

/**
 * 清空历史记录
 */
const clearHistory = () => {
  updateTaskHistory([]);
  ElMessage.info('已清空历史记录');
};

/**
 * 显示成功通知
 */
const showSuccessNotification = () => {
  ElNotification({
    title: '任务完成',
    message: '成功下载了 15 张图片到压缩文件中',
    type: 'success',
    duration: 4000
  });
};

/**
 * 显示错误通知
 */
const showErrorNotification = () => {
  ElNotification({
    title: '任务失败',
    message: '网络连接超时，请检查网络设置后重试',
    type: 'error',
    duration: 4000
  });
};

/**
 * 显示警告通知
 */
const showWarningNotification = () => {
  ElNotification({
    title: '注意',
    message: '检测到部分图片下载失败，已跳过处理',
    type: 'warning',
    duration: 4000
  });
};

/**
 * 获取状态文本
 */
const getStatusText = (status: CrawlStatus): string => {
  const textMap: Record<CrawlStatus, string> = {
    'pending': '等待中',
    'downloading': '下载中',
    'compressing': '压缩中',
    'completed': '已完成',
    'failed': '失败'
  };
  return textMap[status] || '未知';
};
</script>

<style scoped>
.demo-container {
  margin-bottom: 20px;
}

.demo-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #409eff;
}

.demo-content {
  padding: 10px 0;
}

.demo-section {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.demo-section:last-child {
  border-bottom: none;
}

.demo-section h4 {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
}

:deep(.el-slider__runway) {
  margin: 16px 0;
}
</style>
