# 前后端分离重构方案

> 将当前单体项目重构为前后端分离架构的详细指南

## 📋 重构目标

将当前混合的项目结构重构为清晰的前后端分离架构，实现：
- 前端和后端独立开发和部署
- 依赖管理分离
- 构建流程优化
- 团队协作效率提升

## 🔄 重构前后对比

### 重构前（当前结构）
```
crawl_weichat/
├── package.json              # 混合依赖（前端+后端+工具）
├── src/                      # 前端源码
├── vite.config.ts           # 前端构建配置
├── tsconfig.json            # TypeScript 配置
└── ...
```

**问题**：
- 前后端依赖混合在一个 `package.json` 中
- 无法独立部署
- 构建时会包含无关依赖
- 团队开发时可能互相干扰

### 重构后（推荐结构）
```
crawl_weichat/                # 项目根目录
├── package.json              # 根级工具脚本
├── frontend/                 # 前端项目
│   ├── package.json          # 前端专用依赖
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── src/                  # 前端源码
│   └── dist/                 # 前端构建产物
├── backend/                  # 后端项目
│   ├── package.json          # 后端专用依赖
│   ├── tsconfig.json
│   ├── src/                  # 后端源码
│   ├── dist/                 # 后端构建产物
│   ├── downloads/            # 下载目录
│   └── compressed/           # 压缩文件目录
├── shared/                   # 共享类型定义（可选）
│   ├── package.json
│   └── types/
├── doc/                      # 项目文档
└── README.md
```

## 🚀 重构步骤详解

### 步骤 1: 备份当前项目
```bash
# 创建备份分支
git checkout -b backup-before-refactor
git add .
git commit -m "备份重构前的项目状态"

# 回到主分支开始重构
git checkout main
```

### 步骤 2: 创建新的目录结构
```powershell
# 在项目根目录执行
mkdir frontend
mkdir backend
mkdir shared
```

### 步骤 3: 移动前端文件
```powershell
# 移动前端相关文件到 frontend 目录
Move-Item -Path "src" -Destination "frontend/src"
Move-Item -Path "public" -Destination "frontend/public"
Move-Item -Path "index.html" -Destination "frontend/index.html"
Move-Item -Path "vite.config.ts" -Destination "frontend/vite.config.ts"
Move-Item -Path "tsconfig.json" -Destination "frontend/tsconfig.json"
Move-Item -Path "tsconfig.app.json" -Destination "frontend/tsconfig.app.json"
Move-Item -Path "tsconfig.node.json" -Destination "frontend/tsconfig.node.json"
```

### 步骤 4: 重新组织 package.json

#### 4.1 创建前端 package.json
```powershell
cd frontend
```

创建 `frontend/package.json`：
```json
{
  "name": "crawl-weichat-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src/**/*.{ts,vue}",
    "format": "prettier --write src/**/*.{ts,vue}"
  },
  "dependencies": {
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.10.0",
    "element-plus": "^2.10.2",
    "vue": "^3.5.17"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "@vue/tsconfig": "^0.7.0",
    "typescript": "~5.8.3",
    "vite": "^7.0.0",
    "vue-tsc": "^2.2.10",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

#### 4.2 创建后端 package.json
```powershell
cd ../backend
npm init -y
```

修改 `backend/package.json`：
```json
{
  "name": "crawl-weichat-backend",
  "version": "1.0.0",
  "description": "微信公众号图片爬取工具后端服务",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "axios": "^1.10.0",
    "jsdom": "^26.1.0",
    "node-html-parser": "^7.0.1",
    "adm-zip": "^0.5.16",
    "multer": "^2.0.1",
    "uuid": "^9.0.0",
    "fs-extra": "^11.0.0",
    "dayjs": "^1.11.0",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "@types/node": "^24.0.4",
    "@types/express": "^5.0.3",
    "@types/cors": "^2.8.19",
    "@types/multer": "^1.4.13",
    "@types/uuid": "^9.0.0",
    "@types/fs-extra": "^11.0.0",
    "@types/morgan": "^1.9.0",
    "@types/compression": "^1.7.0",
    "typescript": "~5.8.3",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

#### 4.3 更新根目录 package.json
```powershell
cd ..
```

修改根目录 `package.json`：
```json
{
  "name": "crawl-weichat-monorepo",
  "private": true,
  "version": "1.0.0",
  "description": "微信公众号图片爬取工具 - 前后端分离版本",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "clean:all": "npm run clean:frontend && npm run clean:backend",
    "clean:frontend": "cd frontend && rm -rf node_modules dist",
    "clean:backend": "cd backend && rm -rf node_modules dist",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm test",
    "test:backend": "cd backend && npm test",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:backend": "cd backend && npm run lint",
    "format": "npm run format:frontend && npm run format:backend",
    "format:frontend": "cd frontend && npm run format",
    "format:backend": "cd backend && npm run format",
    "start": "npm run start:backend",
    "start:backend": "cd backend && npm start",
    "preview": "cd frontend && npm run preview"
  },
  "devDependencies": {
    "concurrently": "^9.2.0"
  },
  "workspaces": [
    "frontend",
    "backend",
    "shared"
  ]
}
```

### 步骤 5: 创建共享类型定义（可选）

创建 `shared/package.json`：
```json
{
  "name": "crawl-weichat-shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "~5.8.3"
  }
}
```

### 步骤 6: 更新配置文件

#### 6.1 前端 TypeScript 配置
更新 `frontend/tsconfig.json`：
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": [
    "env.d.ts",
    "src/**/*",
    "src/**/*.vue"
  ],
  "exclude": [
    "src/**/__tests__/*"
  ],
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/types/*"]
    }
  }
}
```

#### 6.2 后端 TypeScript 配置
创建 `backend/tsconfig.json`：
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 步骤 7: 更新前端 API 配置

修改前端的 API 基础地址配置，确保指向后端服务：

`frontend/src/config/index.ts`：
```typescript
const development = {
  API_BASE_URL: 'http://localhost:3000/api',
  NODE_ENV: 'development',
  DEBUG: true,
  LOG_LEVEL: 'debug'
};

const production = {
  API_BASE_URL: '/api',  // 生产环境通过代理
  NODE_ENV: 'production',
  DEBUG: false,
  LOG_LEVEL: 'error'
};
```

### 步骤 8: 安装依赖

```powershell
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install

# 返回根目录
cd ..
```

### 步骤 9: 更新 .gitignore

更新项目根目录的 `.gitignore`：
```gitignore
# 依赖
node_modules/
frontend/node_modules/
backend/node_modules/
shared/node_modules/

# 构建产物
frontend/dist/
backend/dist/
shared/dist/

# 日志
backend/logs/
*.log

# 环境变量
.env
.env.local
.env.*.local
frontend/.env
backend/.env

# 临时文件
backend/downloads/
backend/compressed/
backend/temp/

# 编辑器
.vscode/
.idea/
*.swp
*.swo

# 操作系统
.DS_Store
Thumbs.db

# TypeScript
*.tsbuildinfo
```

## 🔧 开发工作流

### 日常开发
```bash
# 同时启动前后端开发服务器
npm run dev

# 单独启动前端
npm run dev:frontend

# 单独启动后端
npm run dev:backend
```

### 构建和部署
```bash
# 构建所有项目
npm run build

# 单独构建前端
npm run build:frontend

# 单独构建后端
npm run build:backend
```

### 测试
```bash
# 运行所有测试
npm run test

# 代码格式化
npm run format

# 代码检查
npm run lint
```

## 📋 重构后验证清单

- [ ] 前端项目在 `frontend/` 目录下独立运行
- [ ] 后端项目在 `backend/` 目录下独立配置
- [ ] 根目录脚本 `npm run dev` 可以同时启动前后端
- [ ] 前端可以正常访问 (http://localhost:5173)
- [ ] 后端 API 地址配置正确 (http://localhost:3000/api)
- [ ] 依赖安装正常，没有冲突
- [ ] TypeScript 编译正常
- [ ] Git 提交历史保持完整

## 🎯 重构收益

1. **清晰的项目结构**：前后端职责分明
2. **独立的依赖管理**：避免依赖冲突和冗余
3. **灵活的部署方案**：可分别部署到不同环境
4. **高效的团队协作**：前后端开发互不干扰
5. **优化的构建体积**：前端打包不包含后端依赖
6. **便于扩展**：未来可轻松添加新的服务模块

## ⚠️ 注意事项

1. **API 地址配置**：确保前端正确配置后端 API 地址
2. **CORS 设置**：后端需要正确配置跨域访问
3. **环境变量**：前后端分别管理各自的环境变量
4. **类型共享**：如需共享类型定义，可使用 `shared/` 目录
5. **版本控制**：重构后注意提交代码和标记版本

---

*重构完成后，项目将具备现代化的前后端分离架构，为后续开发和部署奠定良好基础。*
