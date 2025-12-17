<template>
  <div class="swagger-ui">
    <!-- Header -->
    <div class="swagger-header">
      <div class="container">
        <h1 class="swagger-title">接口文档</h1>
        <div class="swagger-info">
          <span class="version-badge">v1.0.0</span>
          <span class="base-url">Base URL: {{ baseUrl }}</span>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- API列表 -->
      <div class="api-section">
        <h2 class="section-title">API接口</h2>
        
        <!-- 版本检查接口 -->
        <div class="api-item">
          <div class="api-header" @click="toggleExpand('version-check')">
            <div class="api-method-path">
              <span class="method-badge get">GET</span>
              <span class="api-path">/api/app/version-check</span>
            </div>
            <div class="api-summary">检查应用版本更新</div>
            <div class="expand-icon" :class="{ expanded: expandedApis['version-check'] }">▼</div>
          </div>
          
          <div v-show="expandedApis['version-check']" class="api-details">
            <div class="api-description">
              <p>获取指定客户端平台的最新版本信息，用于APP版本更新检查。</p>
            </div>

            <!-- Parameters -->
            <div class="parameters-section">
              <h4>Parameters</h4>
              <div class="parameter-item">
                <div class="param-header">
                  <span class="param-name">client</span>
                  <span class="param-type">string</span>
                  <span class="param-required">required</span>
                  <span class="param-location">query</span>
                </div>
                <div class="param-description">
                  客户端类型，支持的值：<code>Android</code>、<code>iOS</code>
                </div>
              </div>
            </div>

            <!-- Responses -->
            <div class="responses-section">
              <h4>Responses</h4>
              
              <!-- 200 Success -->
              <div class="response-item">
                <div class="response-header">
                  <span class="response-code success">200</span>
                  <span class="response-description">成功返回版本信息</span>
                </div>
                <div class="response-body">
                  <div class="response-schema">
                    <h5>Response Schema</h5>
                    <table class="schema-table">
                      <thead>
                        <tr>
                          <th>字段名</th>
                          <th>类型</th>
                          <th>说明</th>
                          <th>示例值</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>success</code></td>
                          <td><span class="type-badge">boolean</span></td>
                          <td>请求是否成功</td>
                          <td><code>true</code></td>
                        </tr>
                        <tr>
                          <td><code>data</code></td>
                          <td><span class="type-badge">object</span></td>
                          <td>版本信息对象</td>
                          <td>-</td>
                        </tr>
                        <tr>
                          <td><code>data.version</code></td>
                          <td><span class="type-badge">string</span></td>
                          <td>版本号</td>
                          <td><code>"1.0.1"</code></td>
                        </tr>
                        <tr>
                          <td><code>data.versionCode</code></td>
                          <td><span class="type-badge">number</span></td>
                          <td>版本代码，用于版本比较</td>
                          <td><code>101</code></td>
                        </tr>
                        <tr>
                          <td><code>data.client</code></td>
                          <td><span class="type-badge">string</span></td>
                          <td>客户端类型</td>
                          <td><code>"Android"</code></td>
                        </tr>
                        <tr>
                          <td><code>data.forceUpdate</code></td>
                          <td><span class="type-badge">boolean</span></td>
                          <td>是否强制更新</td>
                          <td><code>false</code></td>
                        </tr>
                        <tr>
                          <td><code>data.updateContent</code></td>
                          <td><span class="type-badge">string</span></td>
                          <td>更新内容描述</td>
                          <td><code>"修复了一些问题"</code></td>
                        </tr>
                        <tr>
                          <td><code>data.downloadUrl</code></td>
                          <td><span class="type-badge">string</span></td>
                          <td>下载链接</td>
                          <td><code>"/download/123456"</code></td>
                        </tr>
                        <tr>
                          <td><code>data.fileSize</code></td>
                          <td><span class="type-badge">number</span></td>
                          <td>文件大小（字节）</td>
                          <td><code>12345678</code></td>
                        </tr>
                        <tr>
                          <td><code>data.uploadTime</code></td>
                          <td><span class="type-badge">string</span></td>
                          <td>上传时间（ISO格式）</td>
                          <td><code>"2025-12-17T06:00:00.000Z"</code></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="response-example">
                    <h5>Example Response</h5>
                    <pre class="example-code">{{successExample}}</pre>
                  </div>
                </div>
              </div>

              <!-- 400 Error -->
              <div class="response-item">
                <div class="response-header">
                  <span class="response-code error">400</span>
                  <span class="response-description">请求参数错误</span>
                </div>
                <div class="response-body">
                  <div class="response-example">
                    <h5>Example Response</h5>
                    <pre class="example-code">{{errorExample}}</pre>
                  </div>
                </div>
              </div>

              <!-- 404 Error -->
              <div class="response-item">
                <div class="response-header">
                  <span class="response-code error">404</span>
                  <span class="response-description">暂无版本信息</span>
                </div>
                <div class="response-body">
                  <div class="response-example">
                    <h5>Example Response</h5>
                    <pre class="example-code">{{notFoundExample}}</pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Try it out -->
            <div class="try-section">
              <h4>Try it out</h4>
              <div class="try-form">
                <div class="form-group">
                  <label>client <span class="required">*</span></label>
                  <select v-model="selectedClient" class="form-control">
                    <option value="Android">Android</option>
                    <option value="iOS">iOS</option>
                  </select>
                </div>
                
                <button @click="executeRequest" :disabled="loading" class="execute-btn">
                  {{ loading ? 'Executing...' : 'Execute' }}
                </button>
              </div>

              <!-- Request URL -->
              <div v-if="requestUrl" class="request-section">
                <h5>Request URL</h5>
                <div class="request-url">{{ requestUrl }}</div>
              </div>

              <!-- Response -->
              <div v-if="response || error" class="response-section">
                <h5>Response</h5>
                <div v-if="response" class="response-result">
                  <div class="response-status" :class="response.success ? 'success' : 'error'">
                    {{ response.success ? '200 OK' : '400 Bad Request' }}
                  </div>
                  <pre class="response-json">{{ JSON.stringify(response, null, 2) }}</pre>
                </div>
                <div v-if="error" class="error-result">
                  <div class="response-status error">Network Error</div>
                  <div class="error-message">{{ error }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Models -->
      <div class="models-section">
        <h2 class="section-title">Models</h2>
        
        <div class="model-item">
          <div class="model-header" @click="toggleModel('VersionInfo')">
            <span class="model-name">VersionInfo</span>
            <div class="expand-icon" :class="{ expanded: expandedModels['VersionInfo'] }">▼</div>
          </div>
          <div v-show="expandedModels['VersionInfo']" class="model-details">
            <pre class="model-schema">{{versionInfoModel}}</pre>
          </div>
        </div>

        <div class="model-item">
          <div class="model-header" @click="toggleModel('ErrorResponse')">
            <span class="model-name">ErrorResponse</span>
            <div class="expand-icon" :class="{ expanded: expandedModels['ErrorResponse'] }">▼</div>
          </div>
          <div v-show="expandedModels['ErrorResponse']" class="model-details">
            <pre class="model-schema">{{errorResponseModel}}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SwaggerApiDoc',
  data() {
    return {
      baseUrl: window.location.origin,
      selectedClient: 'Android',
      loading: false,
      response: null,
      error: null,
      requestUrl: '',
      expandedApis: {
        'version-check': true
      },
      expandedModels: {},
      successSchema: `{
  "success": boolean,
  "data": {
    "version": string,
    "versionCode": number,
    "client": string,
    "forceUpdate": boolean,
    "updateContent": string,
    "downloadUrl": string,
    "fileSize": number,
    "uploadTime": string
  }
}`,
      successExample: `{
  "success": true,
  "data": {
    "version": "1.0.1",
    "versionCode": 101,
    "client": "Android",
    "forceUpdate": false,
    "updateContent": "1. 修复了登录问题\\n2. 优化了界面显示",
    "downloadUrl": "/download/1734422400000",
    "fileSize": 12345678,
    "uploadTime": "2025-12-17T06:00:00.000Z"
  }
}`,
      errorExample: `{
  "success": false,
  "message": "客户端参数错误"
}`,
      notFoundExample: `{
  "success": false,
  "message": "暂无版本信息"
}`,
      versionInfoModel: `{
  "version": {
    "type": "string",
    "description": "版本号",
    "example": "1.0.1"
  },
  "versionCode": {
    "type": "number",
    "description": "版本代码，用于版本比较",
    "example": 101
  },
  "client": {
    "type": "string",
    "description": "客户端类型",
    "enum": ["Android", "iOS"]
  },
  "forceUpdate": {
    "type": "boolean",
    "description": "是否强制更新"
  },
  "updateContent": {
    "type": "string",
    "description": "更新内容描述"
  },
  "downloadUrl": {
    "type": "string",
    "description": "下载链接"
  },
  "fileSize": {
    "type": "number",
    "description": "文件大小（字节）"
  },
  "uploadTime": {
    "type": "string",
    "format": "date-time",
    "description": "上传时间"
  }
}`,
      errorResponseModel: `{
  "success": {
    "type": "boolean",
    "description": "请求是否成功",
    "example": false
  },
  "message": {
    "type": "string",
    "description": "错误信息",
    "example": "客户端参数错误"
  }
}`
    }
  },
  methods: {
    toggleExpand(apiId) {
      this.expandedApis[apiId] = !this.expandedApis[apiId]
    },
    
    toggleModel(modelName) {
      this.expandedModels[modelName] = !this.expandedModels[modelName]
    },
    
    async executeRequest() {
      this.loading = true
      this.response = null
      this.error = null
      this.requestUrl = `${this.baseUrl}/api/app/version-check?client=${this.selectedClient}`
      
      try {
        const response = await fetch(`/api/app/version-check?client=${this.selectedClient}`)
        const data = await response.json()
        this.response = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.swagger-ui {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #fafafa;
  min-height: 100vh;
}

.swagger-header {
  background: #1f2937;
  color: white;
  padding: 20px 0;
}

.swagger-title {
  font-size: 28px;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.swagger-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.version-badge {
  background: #10b981;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.base-url {
  color: #d1d5db;
  font-family: monospace;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 24px;
  margin: 30px 0 20px 0;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
}

.api-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.api-header {
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.api-header:hover {
  background: #f3f4f6;
}

.api-method-path {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
}

.method-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 50px;
  text-align: center;
}

.method-badge.get {
  background: #dbeafe;
  color: #1d4ed8;
}

.api-path {
  font-family: monospace;
  font-size: 14px;
  color: #1f2937;
}

.api-summary {
  flex: 1;
  color: #6b7280;
}

.expand-icon {
  transition: transform 0.2s;
  color: #9ca3af;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.api-details {
  padding: 20px;
}

.api-description {
  margin-bottom: 24px;
  color: #4b5563;
  line-height: 1.6;
}

.parameters-section, .responses-section, .try-section {
  margin-bottom: 24px;
}

.parameters-section h4, .responses-section h4, .try-section h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #1f2937;
}

.parameter-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.param-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.param-name {
  font-weight: 600;
  color: #1f2937;
}

.param-type {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #6b7280;
}

.param-required {
  background: #fef2f2;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.param-location {
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.param-description {
  color: #6b7280;
  font-size: 14px;
}

.response-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
  overflow: hidden;
}

.response-header {
  padding: 12px 16px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  gap: 12px;
}

.response-code {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  min-width: 50px;
  text-align: center;
}

.response-code.success {
  background: #dcfce7;
  color: #166534;
}

.response-code.error {
  background: #fef2f2;
  color: #dc2626;
}

.response-description {
  color: #4b5563;
}

.response-body {
  padding: 16px;
}

.response-body h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #374151;
}

.schema-code, .example-code {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  margin: 0;
  overflow-x: auto;
}

.schema-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.schema-table th {
  background: #f9fafb;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.schema-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.schema-table tr:last-child td {
  border-bottom: none;
}

.type-badge {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.try-form {
  background: #f9fafb;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #dc2626;
}

.form-control {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.execute-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.execute-btn:hover:not(:disabled) {
  background: #2563eb;
}

.execute-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.request-section, .response-section {
  margin-top: 16px;
}

.request-section h5, .response-section h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #374151;
}

.request-url {
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}

.response-result, .error-result {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.response-status {
  padding: 8px 12px;
  font-weight: 600;
  font-size: 12px;
}

.response-status.success {
  background: #dcfce7;
  color: #166534;
}

.response-status.error {
  background: #fef2f2;
  color: #dc2626;
}

.response-json {
  background: #f8fafc;
  padding: 12px;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  overflow-x: auto;
}

.error-message {
  padding: 12px;
  color: #dc2626;
}

.models-section {
  margin-top: 40px;
}

.model-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.model-header {
  padding: 12px 16px;
  background: #f9fafb;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-header:hover {
  background: #f3f4f6;
}

.model-name {
  font-weight: 600;
  color: #1f2937;
}

.model-details {
  padding: 16px;
}

.model-schema {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  margin: 0;
  overflow-x: auto;
}

code {
  background: #f1f5f9;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #0f172a;
}
</style>
