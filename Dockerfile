FROM node:18-alpine

# 安装必要的工具用于健康检查
RUN apk add --no-cache wget

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
