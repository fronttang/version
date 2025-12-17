<template>
  <div class="content-panel">
    <div class="panel-header">
      <h2>应用信息</h2>
      <el-button type="primary" @click="saveAppInfo">保存</el-button>
    </div>
    <el-form :model="appInfo" label-width="100px">
      <el-form-item label="应用LOGO">
        <div class="logo-upload">
          <el-upload
            :action="'/api/admin/upload-logo'"
            name="logo"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :on-error="handleLogoError"
            accept="image/*"
          >
            <div class="logo-preview">
              <img v-if="appInfo.logo" :src="appInfo.logo" class="logo-image" />
              <div v-else class="logo-placeholder">
                <span>点击上传LOGO</span>
              </div>
            </div>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="应用名称">
        <el-input v-model="appInfo.name" />
      </el-form-item>
      <el-form-item label="版本号">
        <el-input v-model="appInfo.version" />
      </el-form-item>
      <el-form-item label="应用描述">
        <el-input v-model="appInfo.description" type="textarea" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { apiRequest } from '../utils/api'

export default {
  name: 'AppInfo',
  data() {
    return {
      appInfo: {
        name: '应用名称',
        version: '1.0.0',
        description: '应用描述信息',
        logo: ''
      }
    }
  },
  mounted() {
    this.loadAppInfo()
  },
  methods: {
    async loadAppInfo() {
      try {
        const response = await apiRequest('/api/admin/app-info')
        const data = await response.json()
        this.appInfo = data.appInfo
      } catch (error) {
        if (error.message !== 'Unauthorized') {
          ElMessage.error('加载应用信息失败')
        }
      }
    },
    
    async saveAppInfo() {
      try {
        const response = await apiRequest('/api/admin/save-app-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appInfo: this.appInfo })
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
    },
    
    handleLogoSuccess(response) {
      if (response.success) {
        this.appInfo.logo = response.logoUrl
        ElMessage.success('LOGO上传成功')
      } else {
        ElMessage.error('LOGO上传失败')
      }
    },
    
    handleLogoError() {
      ElMessage.error('LOGO上传失败')
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

.logo-upload {
  display: inline-block;
}

.logo-preview {
  width: 100px;
  height: 100px;
  border: 3px dashed #d1d5db;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.logo-preview:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.logo-placeholder {
  text-align: center;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}
</style>
