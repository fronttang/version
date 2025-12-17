import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import Download from './components/Download.vue'
import AdminLogin from './components/AdminLogin.vue'
import AdminPanel from './components/AdminPanel.vue'

const routes = [
  { path: '/', component: Download },
  { path: '/admin', component: AdminLogin },
  { path: '/admin-dashboard', component: AdminPanel, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      next('/admin')
      return
    }
    
    // 验证token有效性
    try {
      const response = await fetch('/api/admin/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        next()
      } else {
        localStorage.removeItem('adminToken')
        next('/admin')
      }
    } catch (error) {
      localStorage.removeItem('adminToken')
      next('/admin')
    }
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
