#!/bin/bash

echo "=== Docker Compose 故障排除 ==="

echo "1. 检查容器状态..."
docker compose ps

echo -e "\n2. 检查应用容器日志..."
docker compose logs app --tail=50

echo -e "\n3. 检查 nginx 容器日志..."
docker compose logs nginx --tail=20

echo -e "\n4. 测试 nginx 配置..."
docker compose exec nginx nginx -t 2>/dev/null || echo "Nginx 配置测试失败"

echo -e "\n5. 检查应用健康状态..."
docker compose exec app wget --quiet --tries=1 --spider http://localhost:3001/api/public && echo "应用健康检查通过" || echo "应用健康检查失败"

echo -e "\n6. 检查网络连接..."
docker compose exec nginx wget --quiet --tries=1 --spider http://app:3001/api/public && echo "Nginx 到应用连接正常" || echo "Nginx 到应用连接失败"

echo -e "\n7. 检查端口监听..."
docker compose exec app netstat -tlnp | grep :3001 || echo "端口 3001 未监听"

echo -e "\n=== 故障排除完成 ==="