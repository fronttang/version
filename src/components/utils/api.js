import { ElMessage } from 'element-plus'

// 通用的API请求方法，自动处理401错误
export async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      ...options.headers
    }
  }
  
  const response = await fetch(url, { ...options, ...defaultOptions })
  
  if (response.status === 401) {
    localStorage.removeItem('adminToken')
    // 直接使用window.location跳转，避免循环依赖
    window.location.href = '/admin'
    ElMessage.error('登录已过期，请重新登录')
    throw new Error('Unauthorized')
  }
  
  return response
}
