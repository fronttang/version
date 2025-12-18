# 性能优化建议

## 已实施的优化

### Nginx 优化
1. **连接优化**
   - 增加 worker_connections 到 2048
   - 启用 epoll 和 multi_accept
   - 启用 HTTP/1.1 连接复用

2. **缓存策略**
   - 静态资源长期缓存（30天）
   - API 分类缓存（公共API 5分钟，版本检查 2分钟）
   - 页面短期缓存（10分钟）

3. **压缩优化**
   - 启用 Gzip 压缩
   - 优化压缩级别和文件类型

4. **缓冲区优化**
   - 针对不同类型请求优化缓冲区大小
   - 大文件下载关闭缓冲

### Docker 优化
1. **资源限制**
   - 设置内存限制和预留
   - 防止资源过度使用

2. **健康检查**
   - 应用和 Nginx 健康监控
   - 自动重启故障服务

## 建议的进一步优化

### 1. 应用层优化

#### Node.js 应用优化
```javascript
// 在 server/index.js 中添加以下优化

// 1. 启用压缩中间件
const compression = require('compression');
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// 2. 添加响应时间监控
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// 3. 优化静态文件服务
app.use('/downloads', express.static(path.join(__dirname, '../downloads'), {
  maxAge: '30d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    }
  }
}));
```

#### 数据库优化（如果使用）
```javascript
// 如果后续使用数据库，建议：
// 1. 连接池配置
// 2. 查询优化
// 3. 索引优化
// 4. 缓存层（Redis）
```

### 2. 前端优化

#### 构建优化
```javascript
// vite.config.js 优化
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['element-plus']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
```

### 3. 监控和日志

#### 添加性能监控
```bash
# 安装监控工具
npm install --save express-status-monitor
```

#### 日志优化
```javascript
// 使用结构化日志
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 4. 系统级优化

#### 操作系统优化
```bash
# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 优化网络参数
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" >> /etc/sysctl.conf
```

#### Docker 优化
```yaml
# 在 docker-compose.yml 中添加
services:
  app:
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    sysctls:
      - net.core.somaxconn=1024
```

### 5. CDN 和缓存

#### 使用 CDN
```nginx
# 如果使用 CDN，在 nginx.conf 中添加
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
    # CDN 回源配置
    add_header X-Cache-Status "CDN";
    expires 1y;
}
```

#### Redis 缓存
```javascript
// 添加 Redis 缓存层
const redis = require('redis');
const client = redis.createClient();

// 缓存中间件
const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

### 6. 安全优化

#### 添加安全头
```nginx
# 在 nginx.conf 中添加安全头
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

#### 限流配置
```nginx
# 添加限流
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;
    
    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
        }
        
        location /api/admin/upload {
            limit_req zone=upload burst=3 nodelay;
        }
    }
}
```

## 性能测试

### 使用工具测试
```bash
# 安装测试工具
npm install -g autocannon

# 测试 API 性能
autocannon -c 100 -d 30 http://localhost/api/public

# 测试静态资源
autocannon -c 50 -d 30 http://localhost/downloads/logo.png
```

### 监控指标
1. **响应时间**: < 200ms (API), < 100ms (静态资源)
2. **吞吐量**: > 1000 req/s
3. **错误率**: < 0.1%
4. **内存使用**: < 512MB
5. **CPU 使用**: < 80%

## 部署建议

### 生产环境
1. 使用 PM2 管理 Node.js 进程
2. 配置日志轮转
3. 设置监控告警
4. 定期备份数据
5. 使用 HTTPS

### 扩展性
1. 水平扩展: 多个应用实例 + 负载均衡
2. 垂直扩展: 增加服务器资源
3. 数据库分离: 使用专门的数据库服务器
4. 文件存储: 使用对象存储服务