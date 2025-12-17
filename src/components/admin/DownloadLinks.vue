<template>
  <div class="content-panel">
    <div class="panel-header">
      <h2>下载链接设置</h2>
      <el-button type="primary" @click="saveDownloadLinks">保存</el-button>
    </div>
    <el-form :model="downloadLinks" label-width="120px">
      <el-form-item label="Google Play">
        <el-input v-model="downloadLinks.googlePlay" placeholder="https://play.google.com/..." />
      </el-form-item>
      <el-form-item label="App Store">
        <el-input v-model="downloadLinks.appStore" placeholder="https://apps.apple.com/..." />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { apiRequest } from '../utils/api'

export default {
  name: 'DownloadLinks',
  data() {
    return {
      downloadLinks: {
        googlePlay: '',
        appStore: '',
        androidApk: ''
      }
    }
  },
  mounted() {
    this.loadDownloadLinks()
  },
  methods: {
    async loadDownloadLinks() {
      try {
        const response = await apiRequest('/api/admin/download-links')
        const data = await response.json()
        this.downloadLinks = data.downloadLinks
      } catch (error) {
        if (error.message !== 'Unauthorized') {
          ElMessage.error('加载下载链接失败')
        }
      }
    },
    
    async saveDownloadLinks() {
      try {
        const response = await apiRequest('/api/admin/save-download-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ downloadLinks: this.downloadLinks })
        })
        const result = await response.json()
        if (result.success) {
          ElMessage.success('保存成功')
        } else {
          ElMessage.error('保存失败')
        }
      } catch (error) {
        if (error.message !== 'Unauthorized') {
          ElMessage.error('网络错误')
        }
      }
    }
  }
}
</script>

<style scoped>
.content-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  padding: 32px;
  backdrop-filter: blur(10px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
}

.panel-header h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}
</style>
