<template>
  <div class="content-panel">
    <div class="panel-header">
      <h2>隐私政策</h2>
      <el-button type="primary" @click="savePrivacyPolicy">保存</el-button>
    </div>

    <el-form label-width="120px">
      <el-form-item label="页面内容">
        <RichTextEditor
          v-model="privacyPolicy.content"
          placeholder="请输入隐私政策内容"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { apiRequest } from '../utils/api'
import RichTextEditor from './RichTextEditor.vue'

export default {
  name: 'PrivacyPolicyAdmin',
  components: {
    RichTextEditor
  },
  data() {
    return {
      privacyPolicy: {
        content: ''
      }
    }
  },
  mounted() {
    this.loadPrivacyPolicy()
  },
  methods: {
    async loadPrivacyPolicy() {
      try {
        const response = await apiRequest('/api/admin/privacy-policy')
        const data = await response.json()
        this.privacyPolicy = data.privacyPolicy || { content: '' }
      } catch (error) {
        if (error.message !== 'Unauthorized') {
          ElMessage.error('加载隐私政策失败')
        }
      }
    },
    async savePrivacyPolicy() {
      try {
        const response = await apiRequest('/api/admin/save-privacy-policy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ privacyPolicy: this.privacyPolicy })
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
