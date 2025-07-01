<template>
  <el-dialog
    v-model="visible"
    title="使用帮助"
    width="600px"
    :before-close="handleClose"
  >
    <div class="help-content">
      <!-- 使用步骤 -->
      <el-steps 
        :active="activeStep" 
        finish-status="success"
        align-center
        style="margin-bottom: 30px;"
      >
        <el-step title="复制链接" icon="Link" />
        <el-step title="开始爬取" icon="Download" />
        <el-step title="等待完成" icon="Clock" />
        <el-step title="下载文件" icon="FolderOpened" />
      </el-steps>

      <!-- 详细说明 -->
      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="🔗 如何获取微信公众号文章链接" name="1">
          <ol>
            <li>在微信中打开要下载图片的公众号文章</li>
            <li>点击右上角的"..."菜单</li>
            <li>选择"复制链接"</li>
            <li>将链接粘贴到本工具的输入框中</li>
          </ol>
          <el-alert
            title="注意"
            description="确保链接是以 https://mp.weixin.qq.com/s/ 开头的完整链接"
            type="warning"
            :closable="false"
            style="margin-top: 10px;"
          />
        </el-collapse-item>

        <el-collapse-item title="📸 支持的图片格式" name="2">
          <el-tag
            v-for="format in supportedFormats"
            :key="format"
            style="margin-right: 8px; margin-bottom: 8px;"
            type="info"
          >
            {{ format.toUpperCase() }}
          </el-tag>
          <p style="margin-top: 15px; color: #666;">
            工具会自动识别并下载文章中所有支持格式的图片
          </p>
        </el-collapse-item>

        <el-collapse-item title="⚙️ 功能特性" name="3">
          <ul>
            <li>✅ 批量下载文章中的所有图片</li>
            <li>✅ 实时显示下载进度</li>
            <li>✅ 自动压缩为ZIP文件</li>
            <li>✅ 任务历史记录</li>
            <li>✅ 断点续传支持</li>
            <li>✅ 多任务并发处理</li>
          </ul>
        </el-collapse-item>

        <el-collapse-item title="❓ 常见问题" name="4">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="下载失败怎么办？">
              检查网络连接，确认链接有效，可以尝试重新开始任务
            </el-descriptions-item>
            <el-descriptions-item label="支持哪些文章？">
              支持所有微信公众号发布的文章，包括原创和转载内容
            </el-descriptions-item>
            <el-descriptions-item label="下载速度慢？">
              受网络环境影响，图片较多时需要耐心等待
            </el-descriptions-item>
            <el-descriptions-item label="文件保存在哪里？">
              下载的ZIP文件会保存到浏览器默认下载目录
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <el-collapse-item title="⚠️ 免责声明" name="5">
          <el-alert
            title="重要提醒"
            type="warning"
            :closable="false"
          >
            <p>请合理使用本工具，遵守相关法律法规：</p>
            <ul style="margin: 10px 0 0 20px;">
              <li>仅用于个人学习和研究目的</li>
              <li>不得用于商业用途</li>
              <li>尊重原作者版权</li>
              <li>不得批量爬取或滥用</li>
            </ul>
          </el-alert>
        </el-collapse-item>
      </el-collapse>

      <!-- 快捷操作 -->
      <div class="quick-actions" style="margin-top: 30px;">
        <h4>快捷操作</h4>
        <el-space wrap>
          <el-button type="primary" @click="startDemo">
            <el-icon><VideoPlay /></el-icon>
            查看演示
          </el-button>
          <el-button @click="openSettings">
            <el-icon><Setting /></el-icon>
            打开设置
          </el-button>
          <el-button @click="viewHistory">
            <el-icon><Clock /></el-icon>
            查看历史
          </el-button>
        </el-space>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="visible = false">
          开始使用
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { 
  VideoPlay, 
  Setting, 
  Clock 
} from '@element-plus/icons-vue';

// 组件属性
interface Props {
  modelValue: boolean;
}

// 组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'openSettings'): void;
  (e: 'startDemo'): void;
  (e: 'viewHistory'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const visible = ref(false);
const activeStep = ref(0);
const activeCollapse = ref(['1']);

// 支持的图片格式
const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    // 打开对话框时启动步骤动画
    startStepAnimation();
  }
});

// 监听 visible 变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

/**
 * 关闭对话框
 */
const handleClose = () => {
  visible.value = false;
};

/**
 * 启动步骤动画
 */
const startStepAnimation = () => {
  activeStep.value = 0;
  const timer = setInterval(() => {
    if (activeStep.value < 3) {
      activeStep.value++;
    } else {
      clearInterval(timer);
    }
  }, 800);
};

/**
 * 开始演示
 */
const startDemo = () => {
  emit('startDemo');
  visible.value = false;
};

/**
 * 打开设置
 */
const openSettings = () => {
  emit('openSettings');
  visible.value = false;
};

/**
 * 查看历史
 */
const viewHistory = () => {
  emit('viewHistory');
  visible.value = false;
};
</script>

<style scoped>
.help-content {
  max-height: 70vh;
  overflow-y: auto;
}

.quick-actions h4 {
  margin: 0 0 15px 0;
  color: #409eff;
}

:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-collapse-item__header) {
  font-weight: bold;
  font-size: 14px;
}

:deep(.el-descriptions__cell) {
  padding: 12px;
}

ol, ul {
  padding-left: 20px;
  line-height: 1.6;
}

ol li, ul li {
  margin-bottom: 8px;
}
</style>
