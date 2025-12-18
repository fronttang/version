<template>
  <div class="content-panel">
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
          <el-tag v-if="scope.row.isCurrent || (downloadLinks.androidApk && (downloadLinks.androidApk === scope.row.downloadUrl || downloadLinks.androidApk === scope.row.downloadLink))" type="success">
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
            v-if="!scope.row.isCurrent && !(downloadLinks.androidApk && (downloadLinks.androidApk === scope.row.downloadUrl || downloadLinks.androidApk === scope.row.downloadLink))"
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
    
    <!-- 上传对话框 -->
    <el-dialog 
      v-model="showUploadDialog" 
      title="添加版本" 
      width="600px"
      :close-on-click-modal="false"
      append-to-body
    >
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
    <el-dialog 
      v-model="showEditDialog" 
      title="编辑版本" 
      width="600px"
      :close-on-click-modal="false"
      append-to-body
    >
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
import { apiRequest } from '../utils/api'

export default {
  name: 'VersionManagement',
  data() {
    return {
      apkVersions: [],
      totalVersions: 0,
      downloadLinks: { androidApk: '' },
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
    this.loadApkVersions()
    this.loadDownloadLinks()
  },
  methods: {
    async loadApkVersions() {
      try {
        const response = await apiRequest(`/api/admin/apk-versions?page=${this.currentPage}&pageSize=${this.pageSize}`)
        const data = await response.json()
        this.apkVersions = data.versions
        this.totalVersions = data.total
      } catch (error) {
        if (error.message !== 'Unauthorized') {
          ElMessage.error('加载APK版本失败')
        }
      }
    },
    
    async loadDownloadLinks() {
      try {
        const response = await apiRequest('/api/admin/download-links')
        const data = await response.json()
        this.downloadLinks = data.downloadLinks
      } catch (error) {
        // 静默失败
      }
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
        const response = await apiRequest('/api/admin/update-version', {
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
        
        const response = await apiRequest('/api/admin/upload', {
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
    
    async updateVersion() {
      this.updating = true
      
      try {
        if (this.selectedEditFile) {
          await apiRequest(`/api/admin/apk-version/${this.editForm.id}`, {
            method: 'DELETE'
          })
          
          const formData = new FormData()
          formData.append('apk', this.selectedEditFile)
          formData.append('version', this.editForm.version)
          formData.append('versionCode', this.editForm.versionCode)
          formData.append('client', this.editForm.client)
          formData.append('forceUpdate', this.editForm.forceUpdate)
          formData.append('updateContent', this.editForm.updateContent)
          
          const response = await apiRequest('/api/admin/upload', {
            method: 'POST',
            body: formData
          })
          
          const result = await response.json()
          if (!result.success) {
            throw new Error(result.message || '上传失败')
          }
        } else {
          const response = await apiRequest('/api/admin/update-version', {
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
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadApkVersions()
    },
    
    async setCurrentVersion(versionId) {
      try {
        const response = await apiRequest('/api/admin/set-current-apk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ versionId })
        })
        
        const result = await response.json()
        if (result.success) {
          await this.loadApkVersions()
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
        
        const response = await apiRequest(`/api/admin/apk-version/${versionId}`, {
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
    
    formatTime(timeString) {
      return new Date(timeString).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.content-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  padding: 32px;
  backdrop-filter: blur(10px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
}

.panel-header h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.download-link {
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.download-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.no-file {
  color: #909399;
  font-style: italic;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  font-style: italic;
}

/* 弹窗样式优化 */
:deep(.el-dialog) {
  max-height: 90vh;
}

:deep(.el-dialog__body) {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-textarea__inner) {
  resize: vertical;
  min-height: 80px;
}
</style>
