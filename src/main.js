import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import Download from './components/Download.vue'
import AdminLogin from './components/AdminLogin.vue'
import AdminPanel from './components/AdminPanel.vue'
import ApiTest from './components/ApiTest.vue'

const routes = [
  { 
    path: '/', 
    component: Download,
    meta: { title: '应用下载' }
  },
  { 
    path: '/admin', 
    component: AdminLogin,
    meta: { title: '管理员登录' }
  },
  { 
    path: '/admin-dashboard', 
    component: AdminPanel, 
    meta: { requiresAuth: true, title: '管理后台' }
  },
  { 
    path: '/api-doc', 
    component: ApiTest,
    meta: { title: 'API接口文档' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查权限
  if (to.meta.requiresAuth && !localStorage.getItem('adminToken')) {
    next('/admin')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
