<template>
  <el-drawer
    v-model="visible"
    title="设置"
    direction="rtl"
    size="400px"
  >
    <div class="settings-content">
      <!-- 下载设置 -->
      <el-divider content-position="left">
        <el-icon><Setting /></el-icon>
        下载设置
      </el-divider>
      
      <el-form :model="settings" label-width="120px">
        <el-form-item label="自动下载">
          <el-switch
            v-model="settings.autoDownload"
            @change="saveSettings"
            active-text="开启"
            inactive-text="关闭"
          />
          <div class="form-item-desc">
            任务完成后自动下载压缩文件
          </div>
        </el-form-item>

        <el-form-item label="最大并发任务">
          <el-input-number
            v-model="settings.maxConcurrentTasks"
            :min="1"
            :max="10"
            @change="saveSettings"
          />
          <div class="form-item-desc">
            同时运行的最大任务数量
          </div>
        </el-form-item>

        <el-form-item label="压缩级别">
          <el-slider
            v-model="settings.compressionLevel"
            :min="0"
            :max="9"
            :marks="compressionMarks"
            @change="saveSettings"
          />
          <div class="form-item-desc">
            压缩级别越高文件越小，但耗时更长
          </div>
        </el-form-item>
      </el-form>

      <!-- 通知设置 -->
      <el-divider content-position="left">
        <el-icon><Bell /></el-icon>
        通知设置
      </el-divider>

      <el-form :model="settings" label-width="120px">
        <el-form-item label="系统通知">
          <el-switch
            v-model="settings.notifications"
            @change="saveSettings"
            active-text="开启"
            inactive-text="关闭"
          />
          <div class="form-item-desc">
            任务完成或失败时显示通知
          </div>
        </el-form-item>
      </el-form>

      <!-- 界面设置 -->
      <el-divider content-position="left">
        <el-icon><Monitor /></el-icon>
        界面设置
      </el-divider>

      <el-form :model="settings" label-width="120px">
        <el-form-item label="主题">
          <el-radio-group v-model="settings.theme" @change="saveSettings">
            <el-radio label="light">浅色</el-radio>
            <el-radio label="dark">深色</el-radio>
            <el-radio label="auto">跟随系统</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- 数据管理 -->
      <el-divider content-position="left">
        <el-icon><FolderOpened /></el-icon>
        数据管理
      </el-divider>

      <el-space direction="vertical" style="width: 100%;">
        <el-button type="primary" @click="exportData" style="width: 100%;">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        
        <el-upload
          class="upload-demo"
          action="#"
          :before-upload="importData"
          :show-file-list="false"
          accept=".json"
        >
          <el-button type="success" style="width: 100%;">
            <el-icon><Upload /></el-icon>
            导入数据
          </el-button>
        </el-upload>

        <el-popconfirm
          title="确定要清除所有数据吗？此操作不可恢复！"
          @confirm="clearAllData"
        >
          <template #reference>
            <el-button type="danger" style="width: 100%;">
              <el-icon><Delete /></el-icon>
              清除所有数据
            </el-button>
          </template>
        </el-popconfirm>
      </el-space>

      <!-- 关于信息 -->
      <el-divider content-position="left">
        <el-icon><InfoFilled /></el-icon>
        关于
      </el-divider>

      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="应用名称">
          微信公众号图片爬取工具
        </el-descriptions-item>
        <el-descriptions-item label="版本">
          v1.0.0
        </el-descriptions-item>
        <el-descriptions-item label="技术栈">
          Vue 3 + Element Plus + TypeScript
        </el-descriptions-item>
        <el-descriptions-item label="作者">
          YourName
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Setting,
  Bell,
  Monitor,
  FolderOpened,
  Download,
  Upload,
  Delete,
  InfoFilled
} from '@element-plus/icons-vue';
// Use the new task store composable
const { userPreferences, saveUserPreferences, resetAllState } = useTaskStore();

// 组件属性
interface Props {
  modelValue: boolean;
}

// 组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const visible = ref(false);
const settings = reactive({ ...userPreferences });

// 压缩级别标记
const compressionMarks = {
  0: '最快',
  3: '平衡',
  6: '标准',
  9: '最小'
};

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
});

// 监听 visible 变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

/**
 * 保存设置
 */
const saveSettings = () => {
  Object.assign(userPreferences, settings);
  saveUserPreferences();
  ElMessage.success('设置已保存');
};

/**
 * 导出数据
 */
const exportData = () => {
  try {
    const data = {
      preferences: userPreferences,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crawl_weichat_data_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出数据失败:', error);
    ElMessage.error('导出数据失败');
  }
};

/**
 * 导入数据
 */
const importData = (file: File) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      
      if (data.preferences) {
        Object.assign(userPreferences, data.preferences);
        Object.assign(settings, data.preferences);
        saveUserPreferences();
        ElMessage.success('数据导入成功');
      } else {
        ElMessage.error('数据格式不正确');
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      ElMessage.error('导入数据失败，请检查文件格式');
    }
  };

  reader.readAsText(file);
  return false; // 阻止默认上传行为
};

/**
 * 清除所有数据
 */
const clearAllData = () => {
  try {
    // 清除本地存储
    localStorage.removeItem('crawl_weichat_preferences');
    localStorage.removeItem('crawl_weichat_history');
    localStorage.removeItem('crawl_weichat_last_url');
    
    // 重置状态
    resetAllState();
    
    // 重置设置为默认值
    Object.assign(settings, {
      autoDownload: false,
      notifications: true,
      maxConcurrentTasks: 3,
      compressionLevel: 6,
      theme: 'light'
    });
    
    Object.assign(userPreferences, settings);
    
    ElMessage.success('所有数据已清除');
  } catch (error) {
    console.error('清除数据失败:', error);
    ElMessage.error('清除数据失败');
  }
};
</script>

<style scoped>
.settings-content {
  padding: 20px;
}

.form-item-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.upload-demo {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-divider__text) {
  background-color: #f5f7fa;
  padding: 0 16px;
  font-weight: bold;
  color: #409eff;
}

:deep(.el-descriptions__cell) {
  padding: 8px 12px;
}

:deep(.el-slider__marks-text) {
  font-size: 10px;
}
</style>
