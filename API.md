# APP接口文档

## 概述

本文档描述了应用版本管理系统为移动APP提供的API接口，用于版本检查和更新功能。

## 基础信息

- **Base URL**: `https://your-domain.com`
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

## 接口列表

### 1. 版本检查接口

检查指定客户端的最新版本信息。

#### 请求信息

- **URL**: `/api/app/version-check`
- **Method**: `GET`
- **参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| client | string | 是 | 客户端类型，可选值：`Android`、`iOS` |

#### 请求示例

```bash
# Android版本检查
GET /api/app/version-check?client=Android

# iOS版本检查
GET /api/app/version-check?client=iOS
```

#### 响应格式

**成功响应 (200)**:

```json
{
  "success": true,
  "data": {
    "version": "1.0.1",
    "versionCode": 101,
    "client": "Android",
    "forceUpdate": false,
    "updateContent": "1. 修复了登录问题\n2. 优化了界面显示\n3. 提升了性能",
    "downloadUrl": "/download/1734422400000",
    "fileSize": 12345678,
    "uploadTime": "2025-12-17T06:00:00.000Z"
  }
}
```

**错误响应**:

```json
{
  "success": false,
  "message": "客户端参数错误"
}
```

```json
{
  "success": false,
  "message": "暂无版本信息"
}
```

#### 响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| data | object | 版本信息对象（成功时返回） |
| data.version | string | 版本号，如 "1.0.1" |
| data.versionCode | number | 版本代码，用于版本比较 |
| data.client | string | 客户端类型 |
| data.forceUpdate | boolean | 是否强制更新 |
| data.updateContent | string | 更新内容描述 |
| data.downloadUrl | string | 下载链接 |
| data.fileSize | number | 文件大小（字节） |
| data.uploadTime | string | 上传时间（ISO格式） |
| message | string | 错误信息（失败时返回） |

## 使用示例

### Android集成示例

```java
// Java/Kotlin示例
public class VersionChecker {
    private static final String BASE_URL = "https://your-domain.com";
    
    public void checkVersion() {
        String url = BASE_URL + "/api/app/version-check?client=Android";
        
        // 使用OkHttp或其他HTTP库发送请求
        Request request = new Request.Builder()
            .url(url)
            .build();
            
        // 处理响应
        // ...
    }
}
```

### iOS集成示例

```swift
// Swift示例
class VersionChecker {
    private let baseURL = "https://your-domain.com"
    
    func checkVersion() {
        let urlString = "\(baseURL)/api/app/version-check?client=iOS"
        guard let url = URL(string: urlString) else { return }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            // 处理响应
            // ...
        }.resume()
    }
}
```

### JavaScript示例

```javascript
// JavaScript示例
async function checkVersion(client) {
    try {
        const response = await fetch(`/api/app/version-check?client=${client}`);
        const data = await response.json();
        
        if (data.success) {
            console.log('最新版本:', data.data.version);
            console.log('是否强制更新:', data.data.forceUpdate);
            console.log('更新内容:', data.data.updateContent);
            
            if (data.data.forceUpdate) {
                // 强制更新逻辑
                window.location.href = data.data.downloadUrl;
            }
        } else {
            console.error('检查版本失败:', data.message);
        }
    } catch (error) {
        console.error('网络错误:', error);
    }
}

// 使用示例
checkVersion('Android');
```

## 版本比较逻辑

建议使用 `versionCode` 字段进行版本比较：

```javascript
// 版本比较示例
function needUpdate(currentVersionCode, latestVersionCode) {
    return currentVersionCode < latestVersionCode;
}

// 使用示例
const currentVersion = 100;  // 当前APP版本代码
const latestVersion = 101;   // 服务器返回的最新版本代码

if (needUpdate(currentVersion, latestVersion)) {
    // 需要更新
    if (data.forceUpdate) {
        // 强制更新
        showForceUpdateDialog();
    } else {
        // 可选更新
        showOptionalUpdateDialog();
    }
}
```

## 错误码说明

| HTTP状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 404 | 暂无版本信息 |
| 500 | 服务器内部错误 |

## 注意事项

1. **客户端参数**: 必须传递正确的客户端类型（`Android` 或 `iOS`），区分大小写
2. **版本比较**: 建议使用 `versionCode` 进行数字比较，而不是字符串比较 `version`
3. **强制更新**: 当 `forceUpdate` 为 `true` 时，应阻止用户继续使用旧版本
4. **下载链接**: `downloadUrl` 可能为相对路径，需要拼接完整域名
5. **缓存策略**: 建议适当缓存版本检查结果，避免频繁请求
6. **网络异常**: 请妥善处理网络异常情况，提供友好的用户提示

## 更新日志

- **v1.0.0**: 初始版本，支持基础版本检查
- **v1.1.0**: 添加强制更新和更新内容字段
- **v1.2.0**: 支持iOS平台版本检查
