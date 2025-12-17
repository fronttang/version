<template>
  <div class="content-panel">
    <div class="panel-header">
      <h2>账号设置</h2>
      <el-button type="primary" @click="saveAdminConfig">保存</el-button>
    </div>
    <el-form :model="adminConfig" label-width="100px">
      <el-form-item label="用户名">
        <el-input v-model="adminConfig.username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="adminConfig.password" type="password" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { apiRequest } from '../utils/api'

export default {
  name: 'AccountSettings',
  data() {
    return {
      adminConfig: {
        username: 'admin',
        password: 'admin123'
      }
    }
  },
  mounted() {
    this.loadAdminConfig()
  },
  methods: {
    async loadAdminConfig() {
      try {
        const response = await apiRequest('/api/admin/config')
        const data = await response.json()
        this.adminConfig = data.adminConfig
      } catch (error) {
        if (error.message !== 'Unauthorized') {
          ElMessage.error('加载管理员配置失败')
        }
      }
    },
    
    async saveAdminConfig() {
      try {
        const response = await apiRequest('/api/admin/save-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminConfig: this.adminConfig })
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
