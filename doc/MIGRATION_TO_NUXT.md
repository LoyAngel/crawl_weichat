# 重构指南：从 Vue 3 + Vite 迁移到 Nuxt 3

> 本文档为一份详细的操作手册，旨在指导开发者将现有的 Vue 3 + Vite 前端项目，平滑地重构为一个功能完整的 Nuxt 3 一体化项目。

## 🎯 重构目标

- **架构统一**: 将前后端逻辑整合到单一的 Nuxt 3 项目中。
- **代码复用**: 最大限度地复用现有的 Vue 组件、工具函数和类型定义。
- **流程简化**: 简化开发、构建和部署流程。
- **功能对等**: 确保重构后的应用具备原计划中的所有功能。

---

## 🚀 重构流程详解

请严格按照以下步骤顺序执行，每个步骤都包含一个检查点，确保在进入下一步前当前步骤已正确完成。

### **阶段一：环境准备与项目初始化**

此阶段的目标是建立一个全新的、配置好基础依赖的 Nuxt 3 项目。

**步骤 1.1: 创建新的 Nuxt 3 项目**

在当前项目 `crawl_weichat` 的 **外部**（同级目录），执行以下命令创建一个新的 Nuxt 项目。这可以避免 git 仓库的混乱。

```powershell
# 确保你位于 d:\wangyuyang\programme\vue 目录下
pnpm dlx nuxi@latest init crawl-weichat-nuxt
```

**步骤 1.2: 进入新项目并安装核心依赖**

进入新创建的项目目录，并根据原项目的 `package.json` 和后端需求，安装所有必要的依赖。

```powershell
cd crawl-weichat-nuxt

# 1. 安装 Element Plus 的 Nuxt 模块
pnpm add -D @element-plus/nuxt

# 2. 安装前端运行时依赖
pnpm add element-plus axios dayjs uuid

# 3. 安装后端 (Server API) 需要的依赖
pnpm add adm-zip jsdom node-html-parser fs-extra

# 4. 安装后端开发时可能需要的类型定义
pnpm add -D @types/adm-zip @types/jsdom @types/fs-extra
```

**步骤 1.3: 配置 `nuxt.config.ts`**

编辑新项目根目录下的 `nuxt.config.ts` 文件，引入并配置 Element Plus。

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@element-plus/nuxt'
  ],
  elementPlus: {
    /**
     * 选项，例如：
     * importStyle: 'css' // 或者 'scss'
     */
  }
})
```

**✅ 检查点 1**:
1.  运行 `pnpm install`，确保所有依赖都已成功安装。
2.  运行 `pnpm run dev`，新创建的 Nuxt 项目应该能成功启动并在浏览器中看到欢迎页面。
3.  确认 `crawl-weichat-nuxt` 目录已创建，并且包含了 Nuxt 的标准项目结构。

---

### **阶段二：前端代码与资源迁移**

此阶段将原项目的前端代码和静态资源迁移到新 Nuxt 项目的对应目录中。

**步骤 2.1: 迁移静态资源**
- 将原项目 `public/` 目录下的所有文件（如 `vite.svg`）复制到新项目 `public/` 目录下。
- 将原项目 `src/assets/` 目录下的所有文件（如 `vue.svg`）复制到新项目 `assets/` 目录下。

**步骤 2.2: 迁移 Vue 组件**
- 将原项目 `src/components/` 目录下的所有 `.vue` 文件 (`CrawlWeChat.vue`, `DemoPanel.vue`, `HelpDialog.vue`, `SettingsPanel.vue`) 复制到新项目 `components/` 目录下。
- **注意**: `HelloWorld.vue` 是 Vite 默认组件，如果您的应用没有使用它，可以忽略此文件。

**步骤 2.3: 迁移工具函数、配置和常量**
- 将原项目 `src/utils/` 目录复制到新项目 `utils/` 目录下。
- 将原项目 `src/config/` 目录复制到新项目 `config/` 目录下。
- 将原项目 `src/constants/` 目录复制到新项目 `constants/` 目录下。

**步骤 2.4: 迁移并改造主应用文件**
- 删除新项目中的 `app.vue` 里的默认内容。
- 打开原项目的 `App.vue` 和 `src/components/CrawlWeChat.vue`。
- 将 `App.vue` 的模板结构和 `CrawlWeChat.vue` 的模板内容合并到新项目的 `app.vue` 中。同时，将 `CrawlWeChat.vue` 的 `<script setup>` 和 `<style>` 内容也一并迁移到 `app.vue`。
- **目标**: 让 `app.vue` 成为新的主应用入口，直接承载核心界面。

**✅ 检查点 2**:
1.  再次运行 `pnpm run dev`。
2.  此时浏览器应该能渲染出应用的基本 UI 界面。
3.  功能将是不可用的，并且控制台可能会因为缺少状态管理和数据请求逻辑而报错，这是正常的。

---

### **阶段三：状态与类型迁移**

此阶段负责将应用的状态管理逻辑和 TypeScript 类型定义迁移过来。

**步骤 3.1: 迁移状态管理 (Store)**
- 在新项目的根目录下创建 `composables/` 目录。
- 创建文件 `composables/useTaskStore.ts`。
- 将原项目 `src/store/index.ts` 中的逻辑，使用 Nuxt 的 `useState` API 进行重构。`useState` 可以创建跨组件共享的、对SSR友好的响应式状态。

**步骤 3.2: 迁移共享类型**
- 在新项目的根目录下创建 `types/` 目录。
- 将原项目 `src/api/types.ts` 文件移动到新项目的 `types/` 目录下，并可重命名为 `task.ts` 或其他更具体的名字。
- Nuxt 会自动扫描并加载此目录下的类型，无需手动导入，前后端均可使用。

**✅ 检查点 3**:
1.  在 `app.vue` 和其他组件中，尝试从 `useTaskStore` 中获取状态。
2.  检查 VS Code 等编辑器是否能自动提示从 `types/` 目录中导入的类型。

---

### **阶段四：后端 API 实现**

此阶段在新项目中实现所有后端逻辑。

**步骤 4.1: 创建 Server API 路由**
- 在 `server/api/` 目录下，根据 `doc/API_DOCS.md` 创建以下文件结构：
  - `server/api/crawl/start.post.ts`
  - `server/api/crawl/status/[taskId].get.ts`
  - `server/api/crawl/cancel/[taskId].post.ts`
  - `server/api/crawl/history.get.ts`

**步骤 4.2: 创建文件下载路由**
- 在 `server/` 目录下创建 `routes/` 目录。
- 创建文件 `server/routes/download/[filename].get.ts`。此路由用于处理文件流的直接响应。

**步骤 4.3: 实现后端业务逻辑**
- 参照 `doc/BACKEND_TODO.md.legacy` 中的规划，在上述创建的 `.ts` 文件中，使用 TypeScript 和 Node.js 库 (`axios`, `jsdom`, `adm-zip` 等) 完整实现爬取、下载、压缩、任务管理等所有后端功能。

**✅ 检查点 4**:
1.  保持 `pnpm run dev` 运行。
2.  使用 Postman 或其他 API 测试工具，向 `http://localhost:3000/api/crawl/start` 等地址发送请求，验证接口是否能按预期工作并返回正确的数据或错误。

---

### **阶段五：前后端整合与最终清理**

此阶段将前端的请求逻辑对接到新的 Server API，并完成收尾工作。

**步骤 5.1: 重构前端数据请求**
- 遍及所有 `.vue` 组件，将原来使用 `axios` 的地方，替换为 Nuxt 提供的 `$fetch` 或 `useFetch`。
- **示例**: `axios.post('/api/crawl/start', ...)`  ->  `await $fetch('/api/crawl/start', { method: 'POST', body: ... })`
- **优势**: 无需配置基础 URL，没有 CORS 跨域问题，且能与共享的 `types/` 目录完美配合，实现端到端的类型安全。

**步骤 5.2: 清理冗余代码**
- 删除原 `src/api/index.ts` 文件，其功能已被 `$fetch` 替代。
- 检查并移除组件中所有对组件的手动 `import`，Nuxt 会自动处理。
- 删除原项目根目录下的 `vite.config.ts`, `index.html` 等 Vite 专用文件，因为 Nuxt 有自己的构建体系。

**✅ 最终检查点**:
1.  在浏览器中完整地测试应用的所有功能：发起爬取、查看进度、取消任务、下载文件。
2.  确保没有控制台错误。
3.  确认整个应用流程顺畅，功能与重构前对等。
4.  将原 `crawl_weichat` 项目中的 `.git` 目录复制到 `crawl-weichat-nuxt` 中，以保留版本历史，然后删除旧项目。

---

恭喜！完成以上所有步骤后，您已成功将项目迁移至 Nuxt 3，拥有了一个更现代化、更高效的开发工作流。
