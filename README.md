# 微信公众号图片爬取工具

一个基于 **前后端分离架构** 的微信公众号文章图片批量下载工具，采用 Vue 3 + Element Plus 前端和 Node.js + Express 后端。

## ✨ 功能特性

- 🚀 输入微信公众号文章链接，一键爬取所有图片
- 📊 实时显示下载进度和任务状态
- 🗜️ 自动压缩下载的图片为ZIP文件
- 📱 响应式设计，支持移动端访问
- 📋 任务历史记录管理
- ⏸️ 支持任务取消功能
- 🔄 前后端分离，独立部署

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 + TypeScript
- **UI库**: Element Plus
- **构建工具**: Vite
- **HTTP客户端**: Axios
- **状态管理**: Composition API

### 后端
- **运行时**: Node.js
- **框架**: Express
- **HTML解析**: jsdom / node-html-parser
- **文件处理**: adm-zip, fs-extra
- **HTTP客户端**: axios

## 📁 项目结构

```
crawl_weichat/                    # 项目根目录
├── frontend/                     # 前端项目
│   ├── src/
│   │   ├── api/                  # API接口层
│   │   ├── components/           # Vue组件
│   │   ├── store/                # 状态管理
│   │   └── utils/                # 工具函数
│   ├── package.json              # 前端依赖
│   └── vite.config.ts            # 构建配置
├── backend/                      # 后端项目
│   ├── src/
│   │   ├── controllers/          # 控制器
│   │   ├── services/             # 业务逻辑
│   │   ├── utils/                # 工具函数
│   │   └── routes/               # 路由配置
│   ├── package.json              # 后端依赖
│   └── downloads/                # 图片下载目录
├── doc/                          # 项目文档
│   ├── API_DOCS.md              # API接口文档
│   ├── BACKEND_TODO.md          # 后端开发指南
│   └── REFACTOR_GUIDE.md        # 重构指南
├── package.json                  # 根级工具脚本
└── README.md                     # 项目说明
```

## 🚀 快速开始

### 前提条件
- Node.js >= 16
- npm 或 pnpm

### 当前版本（前端已完成）
```bash
# 1. 克隆项目
git clone <repository-url>
cd crawl_weichat

# 2. 安装依赖
npm install
# 或
pnpm install

# 3. 启动前端开发服务器
npm run dev
```

### 前后端分离版本（推荐，需要重构）
> 详细重构步骤请参考 `doc/REFACTOR_GUIDE.md`

```bash
# 1. 按照重构指南重构项目结构
# 2. 安装所有依赖
npm run install:all

# 3. 同时启动前后端
npm run dev

# 或分别启动
npm run dev:frontend    # 前端: http://localhost:5173
npm run dev:backend     # 后端: http://localhost:3000
```

## 📋 使用方法

1. 打开应用，进入主界面
2. 在输入框中粘贴微信公众号文章链接
3. 点击"开始爬取"按钮
4. 等待图片下载和压缩完成
5. 点击"下载压缩文件"获取ZIP文件

## 📚 项目文档

- 📖 [API接口文档](./doc/API_DOCS.md) - 详细的后端API规范
- 🛠️ [后端开发指南](./doc/BACKEND_TODO.md) - 后端实现的完整流程
- 🔄 [重构指南](./doc/REFACTOR_GUIDE.md) - 前后端分离重构方案
- 📋 [项目总结](./doc/PROJECT_SUMMARY.md) - 项目功能和架构总览

## 🎯 开发状态

### ✅ 已完成
- [x] 前端界面设计和实现
- [x] Vue 3 + TypeScript + Element Plus 架构
- [x] API接口类型定义
- [x] 全局状态管理
- [x] 用户界面和交互逻辑
- [x] 演示和设置面板
- [x] 完整的文档体系

### 🚧 进行中
- [ ] 前后端分离重构（可选）
- [ ] 后端服务器实现

### 📋 待实现
- [ ] 微信文章HTML解析
- [ ] 图片爬取和下载逻辑
- [ ] 文件压缩功能
- [ ] 任务队列管理
- [ ] 错误处理和重试机制
- [ ] 性能优化和部署配置

## 💡 界面预览

### 主界面特性
- 🎨 简洁现代的URL输入表单
- 📊 实时进度显示（下载/压缩）
- 📋 任务状态管理和历史记录
- 🛠️ 丰富的设置和帮助功能

### 核心功能
- ⚡ 响应式设计，支持移动端
- 🔔 智能通知系统
- 📈 进度可视化
- 🎯 一键下载和任务管理

## ⚠️ 注意事项

1. **URL格式**: 请确保输入有效的微信公众号文章链接
2. **网络稳定**: 爬取过程中请保持网络连接稳定
3. **时间耗时**: 大量图片下载可能需要较长时间
4. **合规使用**: 请遵守相关网站的使用条款和版权规定
5. **浏览器兼容**: 建议使用现代浏览器以获得最佳体验

## 🚀 部署建议

### 开发环境
- 前端: Vite开发服务器 (端口 5173)
- 后端: Express服务器 (端口 3000)

### 生产环境
- 前端: 静态文件部署 (Nginx/Apache/CDN)
- 后端: Node.js服务器 (PM2/Docker)
- 反向代理: 处理跨域和API路由

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License
