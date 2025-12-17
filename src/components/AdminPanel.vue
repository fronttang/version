<template>
  <div class="admin-panel">
    <div class="header">
      <h1>管理后台</h1>
      <el-button @click="logout" type="danger">退出登录</el-button>
    </div>
    
    <div class="main-content">
      <div class="sidebar">
        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
          class="sidebar-menu"
        >
          <el-menu-item index="app">
            <span>应用信息</span>
          </el-menu-item>
          <el-menu-item index="links">
            <span>下载链接设置</span>
          </el-menu-item>
          <el-menu-item index="upload">
            <span>版本管理</span>
          </el-menu-item>
          <el-menu-item index="account">
            <span>账号设置</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="content-area">
        <component :is="currentComponent" v-if="currentComponent" />
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { defineAsyncComponent } from 'vue'
import { apiRequest } from './utils/api'

export default {
  name: 'AdminPanel',
  data() {
    return {
      activeMenu: 'app',
      currentComponent: null,
      componentMap: {
        app: () => import('./admin/AppInfo.vue'),
        links: () => import('./admin/DownloadLinks.vue'),
        upload: () => import('./admin/VersionManagement.vue'),
        account: () => import('./admin/AccountSettings.vue')
      }
    }
  },
  mounted() {
    // 恢复上次访问的栏目
    const lastMenu = localStorage.getItem('lastActiveMenu')
    if (lastMenu && this.componentMap[lastMenu]) {
      this.activeMenu = lastMenu
    }
    this.loadComponent(this.activeMenu)
  },
  methods: {
    async loadComponent(menuKey) {
      try {
        const componentLoader = this.componentMap[menuKey]
        if (componentLoader) {
          this.currentComponent = defineAsyncComponent(componentLoader)
        }
      } catch (error) {
        ElMessage.error('加载页面失败')
      }
    },
    
    handleMenuSelect(key) {
      this.activeMenu = key
      // 保存当前选择的栏目
      localStorage.setItem('lastActiveMenu', key)
      this.loadComponent(key)
    },
    
    async logout() {
      try {
        await apiRequest('/api/admin/logout', {
          method: 'POST'
        })
      } catch (error) {
        // 忽略网络错误，继续退出
      }
      
      localStorage.removeItem('adminToken')
      // 保留lastActiveMenu，不清除
      this.$router.push('/')
      ElMessage.success('已退出登录')
    }
  }
}
</script>

<style scoped>
.admin-panel {
  min-height: 100vh;
  background: #f4f4f4;
}

.header {
  background: #393D49;
  padding: 20px 30px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.header h1 {
  font-size: 20px;
  margin: 0;
  color: white;
  font-weight: 600;
}

.main-content {
  display: flex;
  height: calc(100vh - 80px);
}

.sidebar {
  width: 200px;
  background: #2F4056;
  box-shadow: 2px 0 6px rgba(0,0,0,0.1);
}

.sidebar-menu {
  border-right: none;
  height: 100%;
  background: #2F4056;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  color: #bfcbd9;
  font-weight: 400;
  border-bottom: 1px solid #263445;
  margin: 0;
  transition: all 0.3s;
  border-radius: 0;
}

.sidebar-menu .el-menu-item:hover {
  background: #48576a;
  color: #ffffff;
}

.sidebar-menu .el-menu-item.is-active {
  background: #409EFF;
  color: white;
  border-right: 3px solid #36a3f7;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: white;
}
</style>
