<template>
  <div class="privacy-page">
    <div class="container">
      <div v-if="privacyPolicy.content" class="policy-content" v-html="privacyPolicy.content" />
      <div v-else class="empty-state">
        Privacy policy content is not available yet.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy',
  data() {
    return {
      appInfo: {
        name: ''
      },
      privacyPolicy: {
        content: ''
      }
    }
  },
  async mounted() {
    await this.loadData()
    document.title = this.appInfo.name
      ? `${this.appInfo.name} - Privacy Policy`
      : 'Privacy Policy'
  },
  methods: {
    async loadData() {
      try {
        const response = await fetch('/api/public')
        const data = await response.json()
        this.appInfo = data.appInfo || { name: '' }
        this.privacyPolicy = data.privacyPolicy || { content: '' }
      } catch (error) {
        console.error('加载隐私政策失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
  padding: 24px;
  background: #f5f5f5;
}

.container {
  max-width: 860px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  border: 1px solid #e5e5e5;
}

.policy-content {
  color: #374151;
  line-height: 1.85;
}

.policy-content :deep(h1),
.policy-content :deep(h2),
.policy-content :deep(h3) {
  color: #111827;
  margin: 24px 0 16px;
}

.policy-content :deep(p),
.policy-content :deep(ul),
.policy-content :deep(ol) {
  margin-bottom: 16px;
}

.policy-content :deep(ul),
.policy-content :deep(ol) {
  padding-left: 24px;
}

.policy-content :deep(a) {
  color: #2563eb;
}

.empty-state {
  color: #6b7280;
  font-size: 16px;
}

@media (max-width: 480px) {
  .privacy-page {
    padding: 16px;
  }

  .container {
    padding: 28px 20px;
    border-radius: 20px;
  }
}
</style>
