# SSL证书配置

## 启用HTTPS

1. 将SSL证书文件放入此目录：
   - `cert.pem` - 证书文件
   - `key.pem` - 私钥文件

2. 编辑 `nginx.conf` 文件：
   - 取消注释HTTPS server块
   - 启用HTTP到HTTPS的重定向

3. 重启服务：
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## 获取免费SSL证书

可以使用Let's Encrypt获取免费SSL证书：

```bash
# 安装certbot
sudo yum install -y certbot

# 获取证书（替换your-domain.com为你的域名）
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
sudo chown $USER:$USER ./ssl/*.pem
```
