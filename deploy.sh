#!/bin/bash

# CentOS服务器部署脚本

echo "开始安装Git和Docker环境..."

# 更新系统
sudo yum update -y

# 安装Git
echo "安装Git..."
sudo yum install -y git

# 安装Docker
echo "安装Docker..."
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 启动Docker服务
echo "启动Docker服务..."
sudo systemctl start docker
sudo systemctl enable docker

# 安装Docker Compose
echo "安装Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到docker组（可选，避免每次使用sudo）
sudo usermod -aG docker $USER

echo "安装完成！"
echo "请运行以下命令验证安装："
echo "git --version"
echo "docker --version"
echo "docker-compose --version"

echo ""
echo "部署应用："
echo "1. 克隆代码: git clone <your-git-repo-url>"
echo "2. 进入目录: cd version"
echo "3. 启动应用: docker-compose up -d"
echo ""
echo "注意：如果添加了用户到docker组，需要重新登录或运行 newgrp docker"
