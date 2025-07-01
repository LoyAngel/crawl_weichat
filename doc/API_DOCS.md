# 微信公众号图片爬取工具 - API 接口文档

## 基础信息

- 基础URL: `http://localhost:3000/api`
- 请求格式: JSON
- 响应格式: JSON

## 接口列表

### 1. 开始爬取任务

**接口地址:** `POST /crawl/start`

**请求参数:**
```json
{
  "url": "https://mp.weixin.qq.com/s/..."  // 微信公众号文章URL
}
```

**响应格式:**
```json
{
  "success": true,           // 是否成功
  "taskId": "task_123456",   // 任务ID（UUID格式）
  "message": "任务已开始"     // 响应消息
}
```

**错误响应:**
```json
{
  "success": false,
  "error": "URL格式不正确"    // 错误信息
}
```

---

### 2. 获取任务状态

**接口地址:** `GET /crawl/status/:taskId`

**路径参数:**
- `taskId`: 任务ID

**响应格式:**
```json
{
  "success": true,
  "task": {
    "id": "task_123456",                    // 任务ID
    "url": "https://mp.weixin.qq.com/s/...", // 原始URL
    "status": "downloading",                 // 任务状态: pending, downloading, compressing, completed, failed
    "totalImages": 15,                       // 总图片数量
    "downloadedImages": 8,                   // 已下载图片数量
    "progress": 53,                          // 下载进度 (0-100)
    "compressProgress": 0,                   // 压缩进度 (0-100)
    "downloadUrl": "",                       // 压缩文件下载地址 (completed状态时提供)
    "errorMessage": "",                      // 错误信息 (failed状态时提供)
    "createdAt": "2025-06-26T10:30:00.000Z", // 创建时间
    "completedAt": ""                        // 完成时间 (completed状态时提供)
  }
}
```

---

### 3. 取消任务

**接口地址:** `POST /crawl/cancel/:taskId`

**路径参数:**
- `taskId`: 任务ID

**响应格式:**
```json
{
  "success": true,
  "message": "任务已取消"
}
```

---

### 4. 获取任务历史

**接口地址:** `GET /crawl/history`

**响应格式:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_123456",
      "url": "https://mp.weixin.qq.com/s/...",
      "status": "completed",
      "totalImages": 15,
      "downloadedImages": 15,
      "progress": 100,
      "compressProgress": 100,
      "downloadUrl": "http://localhost:3000/download/20250626103000.zip",
      "createdAt": "2025-06-26T10:30:00.000Z",
      "completedAt": "2025-06-26T10:35:00.000Z"
    }
  ]
}
```

---

### 5. 下载压缩文件

**接口地址:** `GET /download/:filename`

**路径参数:**
- `filename`: 压缩文件名（如：20250626103000.zip）

**响应:** 文件流下载

---

## 任务状态说明

- `pending`: 等待开始
- `downloading`: 图片下载中
- `compressing`: 文件压缩中
- `completed`: 任务完成
- `failed`: 任务失败

## 文件存储结构

```
downloads/
  ├── task_123456/          # 按任务ID创建文件夹
  │   ├── 0.jpg
  │   ├── 1.png
  │   └── ...
  └── ...

compressed/
  ├── 20250626103000.zip    # 压缩文件，命名格式：时间戳.zip
  └── ...
```

## 实现要点

1. **图片爬取逻辑:**
   - 使用类似 crawl_weichat.py 的方式解析HTML
   - 提取所有 img 标签的 data-src 属性
   - 支持常见图片格式：jpg, png, jpeg, bmp

2. **任务管理:**
   - 使用UUID生成唯一任务ID
   - 支持任务状态实时更新
   - 提供任务取消功能

3. **进度追踪:**
   - 下载进度：已下载图片数 / 总图片数 * 100
   - 压缩进度：需要在压缩过程中更新

4. **文件处理:**
   - 下载图片到 downloads/taskId/ 目录
   - 压缩完成后移动到 compressed/ 目录
   - 压缩文件命名：时间戳.zip

5. **错误处理:**
   - 网络请求失败
   - URL格式错误
   - 图片下载失败
   - 文件系统错误

6. **并发控制:**
   - 限制同时运行的任务数量
   - 图片下载并发控制
