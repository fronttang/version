# 应用版本管理系统

一个简单的Vue应用，用于管理移动应用的版本和下载链接。

## 功能特性

- 前端下载页面：提供Google Play、App Store、Android APK三种下载方式
- 后台管理系统：管理应用信息、下载链接、APK上传
- 登录验证：可配置的管理员账号密码
- 服务端数据存储：使用JSON文件存储，数据安全可靠
- Docker部署：一键部署

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
docker run -p 3000:3001 -v ./downloads:/app/downloads app-version-manager
```

## 使用说明

### 前端访问
- 主页：`http://localhost:3000/`
- 显示三个下载按钮，根据后台配置显示相应链接

### 后台管理
- 管理入口：`http://localhost:3000/admin`
- 默认账号：admin / admin123
- 功能：
  - 应用信息管理
  - 下载链接设置
  - APK文件上传
  - 管理员账号修改

### 数据存储
- 所有配置数据存储在服务端 `server/data.json` 文件中
- APK文件存储在 `./downloads` 目录
- 支持数据重置功能

## 项目结构

```
├── src/
│   ├── components/
│   │   ├── Download.vue      # 前端下载页面
│   │   ├── AdminLogin.vue    # 管理员登录
│   │   └── AdminPanel.vue    # 管理后台
│   ├── App.vue
│   └── main.js
├── server/
│   ├── index.js             # 后端服务器
│   └── data.json            # 数据存储文件
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## API接口

- `GET /api/public` - 获取公共数据（应用信息和下载链接）
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/data` - 获取管理数据
- `POST /api/admin/save` - 保存管理数据
- `POST /api/admin/upload` - 上传APK文件
- `POST /api/admin/reset` - 重置数据

## 安全说明

- 支持自定义管理员账号密码
- 数据存储在服务端，前端无法直接访问
- 生产环境建议修改默认密码
- 建议配置HTTPS和防火墙规则
