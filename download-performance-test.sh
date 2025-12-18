#!/bin/bash

echo "=== APK 下载性能测试 ==="

# 测试文件（假设有一个测试APK）
TEST_URL="http://localhost/downloads/test.apk"
DOWNLOAD_API_URL="http://localhost/download/1"

echo "1. 测试直接文件下载（Nginx）..."
if command -v curl &> /dev/null; then
    echo "使用 curl 测试..."
    time curl -o /dev/null -s -w "下载速度: %{speed_download} bytes/sec\n总时间: %{time_total}s\n" "$TEST_URL"
else
    echo "curl 未安装，跳过测试"
fi

echo -e "\n2. 测试 API 下载路由..."
if command -v curl &> /dev/null; then
    time curl -o /dev/null -s -w "下载速度: %{speed_download} bytes/sec\n总时间: %{time_total}s\n" "$DOWNLOAD_API_URL"
fi

echo -e "\n3. 测试断点续传..."
if command -v curl &> /dev/null; then
    echo "测试部分下载（前1024字节）..."
    curl -r 0-1023 -o /dev/null -s -w "状态码: %{http_code}\n" "$DOWNLOAD_API_URL"
fi

echo -e "\n4. 测试缓存..."
if command -v curl &> /dev/null; then
    echo "第一次请求..."
    curl -I -s "$TEST_URL" | grep -E "(Cache-Control|ETag|Last-Modified)"
    echo "第二次请求（应该返回304）..."
    ETAG=$(curl -I -s "$TEST_URL" | grep -i etag | cut -d' ' -f2-)
    curl -I -s -H "If-None-Match: $ETAG" "$TEST_URL" | head -1
fi

echo -e "\n=== 性能测试完成 ==="

echo -e "\n优化建议："
echo "1. 如果直接文件下载比API下载快，建议使用 /downloads/ 路径"
echo "2. 如果需要下载统计，使用 /download/:id 路径"
echo "3. 确保启用了 gzip 压缩和缓存"
echo "4. 考虑使用 CDN 进一步提升速度"