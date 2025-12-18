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
    // 移动端优化 - 不需要禁用滚动，因为已经在全局处理了
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
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 100%;
  padding: 20px;
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

/* 移动端优化 */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
    align-items: flex-start;
    padding-top: max(20px, env(safe-area-inset-top, 20px));
    padding-bottom: max(20px, env(safe-area-inset-bottom, 20px));
  }
  
  .login-form {
    padding: 30px 24px;
    margin: auto 0;
  }
  
  h2 {
    font-size: 24px;
    margin-bottom: 24px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .login-page {
    align-items: flex-start;
    padding: 12px;
  }
  
  .login-form {
    padding: 24px 20px;
    margin: 0;
  }
  
  h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }
}
</style>
