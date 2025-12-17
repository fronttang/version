# 应用版本管理系统

一个功能完整的Vue应用版本管理系统，支持多平台版本管理、文件上传下载、权限控制等功能。

## 功能特性

### 前端下载页面
- 响应式设计，适配移动端和桌面端
- 支持Google Play、App Store、Android APK三种下载方式
- 自定义应用LOGO上传显示
- 自动获取最新Android版本下载链接

### 后台管理系统
- 现代化管理界面，参考RuoYi设计风格
- **应用信息管理**：应用名称、版本、描述、LOGO上传
- **下载链接设置**：Google Play、App Store链接配置
- **版本管理**：
  - 支持Android/iOS双平台版本管理
  - 版本号、版本代码、强制更新标志
  - 更新内容描述
  - 文件上传（iOS可选）
  - 版本编辑、删除、设为当前版本
  - 列表分页显示
- **账号设置**：管理员用户名密码修改

### 安全特性
- 登录验证保护管理后台
- API接口权限校验
- 数据存储在服务端，前端无法直接访问
- 文件上传安全检查

### 技术特性
- 前后端分离架构
- RESTful API设计
- Docker容器化部署
- Nginx反向代理
- 支持HTTP/HTTPS
- 服务端分页
- 文件唯一命名避免冲突

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器（前后端同时启动）
npm run dev
```

### Docker部署

```bash
# 构建并启动
docker-compose up -d

# 或者单独构建
docker build -t app-version-manager .
docker run -p 80:3001 -v ./downloads:/app/downloads app-version-manager
```

### 服务器部署

1. 安装Git和Docker环境：
```bash
chmod +x deploy.sh
./deploy.sh
```

2. 克隆代码并启动：
```bash
git clone <your-git-repo-url>
cd version
docker-compose up -d
```

## 使用说明

### 前端访问
- 主页：`http://your-domain/`
- 显示应用信息和三个下载按钮
- 自动适配移动端显示

### 后台管理
- 管理入口：`http://your-domain/admin`
- 默认账号：admin / admin123
- 功能模块：
  - 应用信息：基本信息和LOGO管理
  - 下载链接设置：各平台商店链接
  - 版本管理：多平台版本发布管理
  - 账号设置：管理员账号修改

### APP集成
- 版本检查API：`/api/app/version-check?client=Android`
- 详细接口文档见：[API文档](./API.md)

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/
│   │   ├── Download.vue    # 前端下载页面
│   │   ├── AdminLogin.vue  # 管理员登录
│   │   └── AdminPanel.vue  # 管理后台
│   ├── App.vue
│   └── main.js
├── server/                 # 后端源码
│   └── index.js           # Express服务器
├── data/                  # 数据存储目录
│   └── data.json         # 应用数据文件
├── downloads/            # 文件上传目录
├── ssl/                  # SSL证书目录
├── nginx.conf           # Nginx配置
├── docker-compose.yml   # Docker编排
├── Dockerfile          # Docker镜像
└── deploy.sh          # 服务器部署脚本
```

## API接口

### 公共接口
- `GET /api/public` - 获取公共数据（应用信息和下载链接）
- `GET /api/app/version-check` - APP版本检查接口

### 管理接口（需要权限验证）
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/app-info` - 获取应用信息
- `POST /api/admin/save-app-info` - 保存应用信息
- `GET /api/admin/download-links` - 获取下载链接
- `POST /api/admin/save-download-links` - 保存下载链接
- `GET /api/admin/apk-versions` - 获取版本列表（分页）
- `POST /api/admin/upload` - 上传版本文件
- `POST /api/admin/update-version` - 更新版本信息
- `POST /api/admin/set-current-apk` - 设置当前版本
- `DELETE /api/admin/apk-version/:id` - 删除版本
- `POST /api/admin/upload-logo` - 上传应用LOGO
- `GET /api/admin/config` - 获取管理员配置
- `POST /api/admin/save-config` - 保存管理员配置

### 文件下载
- `GET /download/:id` - 通过版本ID下载文件（使用原始文件名）

## 数据存储

- 应用配置数据：`./data/data.json`
- 上传文件：`./downloads/`
- SSL证书：`./ssl/`（可选）

数据文件结构：
```json
{
  "appInfo": {
    "name": "应用名称",
    "version": "1.0.0", 
    "description": "应用描述",
    "logo": "/downloads/logo.png"
  },
  "downloadLinks": {
    "googlePlay": "https://play.google.com/...",
    "appStore": "https://apps.apple.com/...",
    "androidApk": "/download/123456"
  },
  "apkVersions": [
    {
      "id": 123456,
      "version": "1.0.1",
      "versionCode": 101,
      "client": "Android",
      "forceUpdate": false,
      "updateContent": "修复了一些问题",
      "filename": "123456_app.apk",
      "originalName": "app.apk",
      "downloadUrl": "/downloads/123456_app.apk",
      "downloadLink": "/download/123456",
      "uploadTime": "2025-12-17T06:00:00.000Z",
      "fileSize": 12345678
    }
  ],
  "adminConfig": {
    "username": "admin",
    "password": "admin123"
  }
}
```

## 安全说明

- 管理后台需要登录验证
- 所有管理API接口都有权限校验
- 数据存储在服务端，前端无法直接访问
- 文件上传有类型和大小限制
- 生产环境建议：
  - 修改默认管理员密码
  - 配置HTTPS证书
  - 设置防火墙规则
  - 定期备份数据文件

## 版本更新

- v1.0.0：基础版本管理功能
- v1.1.0：添加多平台支持、权限校验
- v1.2.0：优化界面设计、添加移动端适配

## 技术栈

- **前端**：Vue 3 + Element Plus + Vite
- **后端**：Node.js + Express + Multer
- **部署**：Docker + Nginx
- **存储**：JSON文件存储
