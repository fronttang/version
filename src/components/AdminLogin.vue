<template>
  <div class="login-page">
    <div class="login-form">
      <h2>管理员登录</h2>
      <el-form @submit.prevent="login">
        <el-form-item>
          <el-input 
            v-model="username" 
            placeholder="用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input 
            v-model="password" 
            type="password" 
            placeholder="密码"
            @keyup.enter="login"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

export default {
  name: 'AdminLogin',
  components: {
    User,
    Lock
  },
  data() {
    return {
      username: '',
      password: ''
    }
  },
  
  mounted() {
    // 禁用页面滚动
    document.body.style.overflow = 'hidden'
  },
  
  beforeUnmount() {
    // 恢复页面滚动
    document.body.style.overflow = ''
  },
  
  methods: {
    async login() {
      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          localStorage.setItem('adminToken', result.token)
          this.$router.push('/admin-dashboard')
          ElMessage.success('登录成功')
        } else {
          ElMessage.error(result.message || '登录失败')
        }
      } catch (error) {
        ElMessage.error('网络错误')
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

:deep(.el-input__inner) {
  height: 45px;
  line-height: 45px;
}

:deep(.el-input__wrapper) {
  padding: 0 15px;
}
</style>
