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
        <!-- 应用信息 -->
        <div v-show="activeMenu === 'app'" class="content-panel">
          <div class="panel-header">
            <h2>应用信息</h2>
            <el-button type="primary" @click="saveAppInfo">保存</el-button>
          </div>
          <el-form :model="appInfo" label-width="100px">
            <el-form-item label="应用LOGO">
              <div class="logo-upload">
                <el-upload
                  :action="'/api/admin/upload-logo'"
                  name="logo"
                  :show-file-list="false"
                  :on-success="handleLogoSuccess"
                  :on-error="handleLogoError"
                  accept="image/*"
                >
                  <div class="logo-preview">
                    <img v-if="appInfo.logo" :src="appInfo.logo" class="logo-image" />
                    <div v-else class="logo-placeholder">
                      <span>点击上传LOGO</span>
                    </div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
            <el-form-item label="应用名称">
              <el-input v-model="appInfo.name" />
            </el-form-item>
            <el-form-item label="版本号">
              <el-input v-model="appInfo.version" />
            </el-form-item>
            <el-form-item label="应用描述">
              <el-input v-model="appInfo.description" type="textarea" />
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 下载链接设置 -->
        <div v-show="activeMenu === 'links'" class="content-panel">
          <div class="panel-header">
            <h2>下载链接设置</h2>
            <el-button type="primary" @click="saveDownloadLinks">保存</el-button>
          </div>
          <el-form :model="downloadLinks" label-width="120px">
            <el-form-item label="Google Play">
              <el-input v-model="downloadLinks.googlePlay" placeholder="https://play.google.com/..." />
            </el-form-item>
            <el-form-item label="App Store">
              <el-input v-model="downloadLinks.appStore" placeholder="https://apps.apple.com/..." />
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 版本管理 -->
        <div v-show="activeMenu === 'upload'" class="content-panel">
          <div class="panel-header">
            <h2>版本管理</h2>
            <el-button type="primary" @click="showUploadDialog = true">添加版本</el-button>
          </div>
          
          <el-table :data="paginatedVersions" style="width: 100%">
            <el-table-column prop="client" label="客户端" width="80" />
            <el-table-column prop="version" label="版本号" width="100" />
            <el-table-column prop="versionCode" label="版本代码" width="100" />
            <el-table-column prop="originalName" label="文件名">
              <template #default="scope">
                <a 
                  v-if="scope.row.originalName"
                  href="javascript:void(0)" 
                  @click="downloadApk(scope.row)"
                  class="download-link"
                >
                  {{ scope.row.originalName }}
                </a>
                <span v-else class="no-file">无文件</span>
              </template>
            </el-table-column>
            <el-table-column prop="forceUpdate" label="强制更新" width="120">
              <template #default="scope">
                <el-switch 
                  v-model="scope.row.forceUpdate" 
                  @change="updateForceUpdate(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.uploadTime) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag v-if="downloadLinks.androidApk === scope.row.downloadUrl || downloadLinks.androidApk === scope.row.downloadLink" type="success">
                  当前版本
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250">
              <template #default="scope">
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="editVersion(scope.row)"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="downloadLinks.androidApk !== scope.row.downloadUrl && downloadLinks.androidApk !== scope.row.downloadLink"
                  size="small" 
                  type="success" 
                  @click="setCurrentVersion(scope.row.id)"
                >
                  设为当前
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteVersion(scope.row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-pagination
            v-if="totalVersions > pageSize"
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="totalVersions"
            layout="prev, pager, next, total"
            style="margin-top: 20px; text-align: center;"
          />
        </div>
        
        <!-- 账号设置 -->
        <div v-show="activeMenu === 'account'" class="content-panel">
          <div class="panel-header">
            <h2>账号设置</h2>
            <el-button type="primary" @click="saveAdminConfig">保存</el-button>
          </div>
          <el-form :model="adminConfig" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="adminConfig.username" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="adminConfig.password" type="password" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    
    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="添加版本" width="600px">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="客户端" required>
          <el-select v-model="uploadForm.client" placeholder="请选择客户端">
            <el-option label="Android" value="Android" />
            <el-option label="iOS" value="iOS" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号" required>
          <el-input v-model="uploadForm.version" placeholder="例如: 1.0.1" />
        </el-form-item>
        <el-form-item label="版本代码" required>
          <el-input v-model="uploadForm.versionCode" placeholder="例如: 101" type="number" />
        </el-form-item>
        <el-form-item label="强制更新">
          <el-switch v-model="uploadForm.forceUpdate" />
        </el-form-item>
        <el-form-item label="更新内容">
          <el-input v-model="uploadForm.updateContent" type="textarea" :rows="4" placeholder="请输入更新内容" />
        </el-form-item>
        <el-form-item label="APK文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileSelect"
            :file-list="fileList"
            accept=".apk"
            :limit="1"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
          <div class="form-tip">iOS版本可不上传文件</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="uploadApk" :loading="uploading">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑版本" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="客户端">
          <el-select v-model="editForm.client">
            <el-option label="Android" value="Android" />
            <el-option label="iOS" value="iOS" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号">
          <el-input v-model="editForm.version" />
        </el-form-item>
        <el-form-item label="版本代码">
          <el-input v-model="editForm.versionCode" type="number" />
        </el-form-item>
        <el-form-item label="强制更新">
          <el-switch v-model="editForm.forceUpdate" />
        </el-form-item>
        <el-form-item label="更新内容">
          <el-input v-model="editForm.updateContent" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="重新上传文件">
          <el-upload
            ref="editUploadRef"
            :auto-upload="false"
            :on-change="handleEditFileSelect"
            :file-list="editFileList"
            accept=".apk"
            :limit="1"
          >
            <el-button type="primary">选择新文件</el-button>
          </el-upload>
          <div class="form-tip">不选择文件则保持原文件不变</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateVersion" :loading="updating">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'

export default {
  name: 'AdminPanel',
  data() {
    return {
      activeMenu: 'app',
      appInfo: {
        name: '应用名称',
        version: '1.0.0',
        description: '应用描述信息',
        logo: ''
      },
      downloadLinks: {
        googlePlay: '',
        appStore: '',
        androidApk: ''
      },
      adminConfig: {
        username: 'admin',
        password: 'admin123'
      },
      apkVersions: [],
      totalVersions: 0,
      uploadForm: {
        version: '',
        versionCode: '',
        client: 'Android',
        forceUpdate: false,
        updateContent: ''
      },
      showUploadDialog: false,
      showEditDialog: false,
      editForm: {},
      editFileList: [],
      selectedEditFile: null,
      updating: false,
      uploading: false,
      fileList: [],
      selectedFile: null,
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    paginatedVersions() {
      return this.apkVersions
    }
  },
  mounted() {
    // 根据当前菜单加载对应数据
    this.loadCurrentMenuData()
  },
  methods: {
    async loadCurrentMenuData() {
      switch (this.activeMenu) {
        case 'app':
          await this.loadAppInfo()
          break
        case 'links':
          await this.loadDownloadLinks()
          break
        case 'upload':
          await this.loadApkVersions()
          break
        case 'account':
          await this.loadAdminConfig()
          break
      }
    },
    
    async loadAppInfo() {
      try {
        const response = await fetch('/api/admin/app-info', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
        const data = await response.json()
        this.appInfo = data.appInfo
      } catch (error) {
        ElMessage.error('加载应用信息失败')
      }
    },
    
    async loadDownloadLinks() {
      try {
        const response = await fetch('/api/admin/download-links', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
        const data = await response.json()
        this.downloadLinks = data.downloadLinks
      } catch (error) {
        ElMessage.error('加载下载链接失败')
      }
    },
    
    async loadApkVersions() {
      try {
        const response = await fetch(`/api/admin/apk-versions?page=${this.currentPage}&pageSize=${this.pageSize}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
        const data = await response.json()
        this.apkVersions = data.versions
        this.totalVersions = data.total
      } catch (error) {
        ElMessage.error('加载APK版本失败')
      }
    },
    
    async loadAdminConfig() {
      try {
        const response = await fetch('/api/admin/config', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
        const data = await response.json()
        this.adminConfig = data.adminConfig
      } catch (error) {
        ElMessage.error('加载管理员配置失败')
      }
    },
    
    handleMenuSelect(key) {
      this.activeMenu = key
      this.loadCurrentMenuData()
    },
    
    async saveAppInfo() {
      try {
        const response = await fetch('/api/admin/save-app-info', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ appInfo: this.appInfo })
        })
        const result = await response.json()
        if (result.success) {
          ElMessage.success('保存成功')
        } else {
          ElMessage.error('保存失败')
        }
      } catch (error) {
        ElMessage.error('网络错误')
      }
    },
    
    async saveDownloadLinks() {
      try {
        const response = await fetch('/api/admin/save-download-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ downloadLinks: this.downloadLinks })
        })
        const result = await response.json()
        if (result.success) {
          ElMessage.success('保存成功')
        } else {
          ElMessage.error('保存失败')
        }
      } catch (error) {
        ElMessage.error('网络错误')
      }
    },
    
    async saveAdminConfig() {
      try {
        const response = await fetch('/api/admin/save-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminConfig: this.adminConfig })
        })
        const result = await response.json()
        if (result.success) {
          ElMessage.success('保存成功')
        } else {
          ElMessage.error('保存失败')
        }
      } catch (error) {
        ElMessage.error('网络错误')
      }
    },
    
    handleLogoSuccess(response) {
      if (response.success) {
        this.appInfo.logo = response.logoUrl
        ElMessage.success('LOGO上传成功')
      } else {
        ElMessage.error('LOGO上传失败')
      }
    },
    
    handleLogoError() {
      ElMessage.error('LOGO上传失败')
    },
    
    downloadApk(version) {
      if (!version.downloadLink && !version.downloadUrl) {
        ElMessage.warning('该版本没有文件可下载')
        return
      }
      
      const downloadUrl = version.downloadLink || version.downloadUrl
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = version.originalName || version.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    
    async updateForceUpdate(version) {
      try {
        const response = await fetch('/api/admin/update-version', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: version.id,
            version: version.version,
            versionCode: version.versionCode,
            client: version.client,
            forceUpdate: version.forceUpdate,
            updateContent: version.updateContent
          })
        })
        
        const result = await response.json()
        if (result.success) {
          ElMessage.success('强制更新状态已更新')
        } else {
          ElMessage.error('更新失败')
          // 恢复原状态
          version.forceUpdate = !version.forceUpdate
        }
      } catch (error) {
        ElMessage.error('网络错误')
        version.forceUpdate = !version.forceUpdate
      }
    },
    
    editVersion(version) {
      this.editForm = { ...version }
      this.editFileList = []
      this.selectedEditFile = null
      this.showEditDialog = true
    },
    
    handleEditFileSelect(file) {
      this.selectedEditFile = file.raw
      this.editFileList = [file]
    },
    
    async updateVersion() {
      this.updating = true
      
      try {
        if (this.selectedEditFile) {
          // 如果选择了新文件，先上传文件
          const formData = new FormData()
          formData.append('apk', this.selectedEditFile)
          formData.append('version', this.editForm.version)
          formData.append('versionCode', this.editForm.versionCode)
          formData.append('client', this.editForm.client)
          formData.append('forceUpdate', this.editForm.forceUpdate)
          formData.append('updateContent', this.editForm.updateContent)
          
          // 先删除旧版本
          await fetch(`/api/admin/apk-version/${this.editForm.id}`, {
            method: 'DELETE'
          })
          
          // 上传新版本
          const response = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData
          })
          
          const result = await response.json()
          if (!result.success) {
            throw new Error(result.message || '上传失败')
          }
        } else {
          // 只更新版本信息
          const response = await fetch('/api/admin/update-version', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.editForm)
          })
          
          const result = await response.json()
          if (!result.success) {
            throw new Error('更新失败')
          }
        }
        
        this.showEditDialog = false
        this.editFileList = []
        this.selectedEditFile = null
        await this.loadApkVersions()
        await this.loadDownloadLinks()
        ElMessage.success('版本更新成功')
      } catch (error) {
        ElMessage.error(error.message || '网络错误')
      } finally {
        this.updating = false
      }
    },
    
    handleFileSelect(file) {
      this.selectedFile = file.raw
      this.fileList = [file]
    },
    
    async uploadApk() {
      if (!this.uploadForm.version.trim() || !this.uploadForm.versionCode || !this.uploadForm.client) {
        ElMessage.error('请填写完整信息')
        return
      }
      
      this.uploading = true
      
      try {
        const formData = new FormData()
        if (this.selectedFile) {
          formData.append('apk', this.selectedFile)
        }
        formData.append('version', this.uploadForm.version)
        formData.append('versionCode', this.uploadForm.versionCode)
        formData.append('client', this.uploadForm.client)
        formData.append('forceUpdate', this.uploadForm.forceUpdate)
        formData.append('updateContent', this.uploadForm.updateContent)
        
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (result.success) {
          this.showUploadDialog = false
          this.uploadForm = {
            version: '',
            versionCode: '',
            client: 'Android',
            forceUpdate: false,
            updateContent: ''
          }
          this.fileList = []
          this.selectedFile = null
          this.currentPage = 1
          await this.loadApkVersions()
          await this.loadDownloadLinks()
          ElMessage.success(`版本添加成功`)
        } else {
          ElMessage.error(result.message || '添加失败')
        }
      } catch (error) {
        ElMessage.error('网络错误')
      } finally {
        this.uploading = false
      }
    },
    
    handlePageChange(page) {
      this.currentPage = page
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadApkVersions()
    },
    
    async setCurrentVersion(versionId) {
      try {
        const response = await fetch('/api/admin/set-current-apk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ versionId })
        })
        
        const result = await response.json()
        if (result.success) {
          await this.loadDownloadLinks()
          ElMessage.success('已设置为当前版本')
        } else {
          ElMessage.error('设置失败')
        }
      } catch (error) {
        ElMessage.error('网络错误')
      }
    },
    
    async deleteVersion(versionId) {
      try {
        await this.$confirm('确定要删除这个版本吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/admin/apk-version/${versionId}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        if (result.success) {
          await this.loadApkVersions()
          await this.loadDownloadLinks()
          ElMessage.success('删除成功')
        } else {
          ElMessage.error('删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('网络错误')
        }
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    formatTime(timeString) {
      return new Date(timeString).toLocaleString('zh-CN')
    },
    
    logout() {
      localStorage.removeItem('adminToken')
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

.content-panel {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 0 6px rgba(0,0,0,0.04);
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e6ebf5;
}

.panel-header h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  font-style: italic;
}

.download-link {
  color: #409EFF;
  text-decoration: none;
  cursor: pointer;
  font-weight: 400;
  transition: all 0.3s;
}

.download-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.logo-upload {
  display: inline-block;
}

.logo-preview {
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.logo-preview:hover {
  border-color: #409EFF;
  background: #f5f7fa;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.logo-placeholder {
  text-align: center;
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}

.no-file {
  color: #909399;
  font-style: italic;
}

/* 表格样式 */
.el-table {
  border: 1px solid #ebeef5;
}

.el-table th {
  background: #fafafa;
  color: #606266;
  font-weight: 500;
}

.el-table td {
  border-bottom: 1px solid #ebeef5;
}

.el-table--border .el-table__cell {
  border-right: 1px solid #ebeef5;
}

.el-table .el-table__row:hover > td {
  background: #f5f7fa;
}

/* 分页样式 */
.el-pagination {
  margin-top: 20px;
  text-align: center;
}

.el-pagination .el-pager li {
  background: #f4f4f5;
  color: #606266;
  border: 1px solid #dcdfe6;
  margin: 0 2px;
}

.el-pagination .el-pager li:hover {
  color: #409eff;
}

.el-pagination .el-pager li.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.el-pagination .btn-prev,
.el-pagination .btn-next {
  background: #f4f4f5;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.el-pagination .btn-prev:hover,
.el-pagination .btn-next:hover {
  color: #409eff;
}
</style>
