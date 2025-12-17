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
  { path: '/', component: Download },
  { path: '/admin', component: AdminLogin },
  { path: '/admin-dashboard', component: AdminPanel, meta: { requiresAuth: true } },
  { path: '/api-doc', component: ApiTest }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
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
