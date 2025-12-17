<template>
  <div class="download-page">
    <div class="container">
      <div class="app-info">
        <div class="app-icon">
          <img v-if="appInfo.logo" :src="appInfo.logo" class="logo-image" />
          <span v-else>📱</span>
        </div>
        <h1>{{ appInfo.name }}</h1>
        <p class="version">{{ appInfo.version }}</p>
        <p class="description">{{ appInfo.description }}</p>
      </div>
      
      <div class="download-buttons">
        <a 
          v-if="downloadLinks.googlePlay" 
          :href="downloadLinks.googlePlay" 
          class="download-btn google-play"
          target="_blank"
        >
          <div class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
            </svg>
          </div>
          <div class="btn-text">
            <div class="btn-title">Google Play</div>
            <div class="btn-subtitle">Android 官方商店</div>
          </div>
        </a>
        
        <a 
          v-if="downloadLinks.appStore" 
          :href="downloadLinks.appStore" 
          class="download-btn app-store"
          target="_blank"
        >
          <div class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.19 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
            </svg>
          </div>
          <div class="btn-text">
            <div class="btn-title">App Store</div>
            <div class="btn-subtitle">iOS 官方商店</div>
          </div>
        </a>
        
        <a 
          v-if="downloadLinks.androidApk" 
          :href="downloadLinks.androidApk" 
          class="download-btn android-apk"
          download
        >
          <div class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="m16 10-4 4-4-4"/>
            </svg>
          </div>
          <div class="btn-text">
            <div class="btn-title">Android APK</div>
            <div class="btn-subtitle">直接下载安装包</div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Download',
  data() {
    return {
      appInfo: {
        name: '应用名称',
        version: '1.0.0',
        description: '应用描述信息'
      },
      downloadLinks: {
        googlePlay: '',
        appStore: '',
        androidApk: ''
      }
    }
  },
  async mounted() {
    await this.loadData()
    // 动态设置页面标题
    if (this.appInfo.name) {
      document.title = `${this.appInfo.name} - 应用下载`
    }
  },
  methods: {
    async loadData() {
      try {
        const response = await fetch('/api/public')
        const data = await response.json()
        this.appInfo = data.appInfo
        this.downloadLinks = data.downloadLinks
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.download-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.container {
  background: white;
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  text-align: center;
  max-width: 400px;
  width: 100%;
  border: 1px solid #e5e5e5;
}

.app-info {
  margin-bottom: 40px;
}

.app-icon {
  margin-bottom: 24px;
}

.app-icon span {
  font-size: 80px;
}

.app-icon .logo-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 700;
}

.version {
  color: #666;
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: 500;
}

.description {
  color: #888;
  font-size: 16px;
  line-height: 1.6;
}

.download-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.download-btn {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-height: 72px;
}

.download-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.download-btn:active {
  transform: translateY(-2px);
}

.google-play {
  background: linear-gradient(135deg, #4285f4, #34a853);
}

.app-store {
  background: linear-gradient(135deg, #000, #333);
}

.android-apk {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
}

.btn-icon {
  font-size: 28px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
}

.btn-text {
  text-align: left;
  flex: 1;
}

.btn-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.btn-subtitle {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 400;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .download-page {
    padding: 16px;
  }
  
  .container {
    padding: 24px 20px;
    border-radius: 20px;
  }
  
  h1 {
    font-size: 28px;
  }
  
  .version {
    font-size: 16px;
  }
  
  .description {
    font-size: 14px;
  }
  
  .download-btn {
    padding: 18px 20px;
    min-height: 68px;
  }
  
  .btn-icon {
    font-size: 24px;
    margin-right: 16px;
  }
  
  .btn-title {
    font-size: 16px;
  }
  
  .btn-subtitle {
    font-size: 13px;
  }
}

/* 大屏幕优化 */
@media (min-width: 768px) {
  .container {
    max-width: 480px;
    padding: 40px 32px;
  }
  
  .download-buttons {
    gap: 20px;
  }
  
  .download-btn {
    padding: 24px 28px;
    min-height: 80px;
  }
}
</style>
