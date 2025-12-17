const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/downloads', express.static(path.join(__dirname, '../downloads')))

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data.json')

// 初始化数据
const initData = {
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
  apkVersions: [],
  adminConfig: {
    username: 'admin',
    password: 'admin123'
  }
}

// 读取数据
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    }
  } catch (error) {
    console.error('读取数据失败:', error)
  }
  return initData
}

// 写入数据
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('写入数据失败:', error)
    return false
  }
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../downloads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳_原文件名
    const timestamp = Date.now()
    const originalName = file.originalname
    const ext = path.extname(originalName)
    const nameWithoutExt = path.basename(originalName, ext)
    const uniqueName = `${timestamp}_${nameWithoutExt}${ext}`
    cb(null, uniqueName)
  }
})

const upload = multer({ storage })

// 单独的LOGO上传配置
const logoUpload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只支持图片文件'))
    }
  }
})

// 文件下载路由
app.get('/download/:id', (req, res) => {
  const versionId = parseInt(req.params.id)
  const data = readData()
  
  if (!data.apkVersions) {
    return res.status(404).json({ success: false, message: '版本不存在' })
  }
  
  const version = data.apkVersions.find(v => v.id === versionId)
  if (!version) {
    return res.status(404).json({ success: false, message: '版本不存在' })
  }
  
  const filePath = path.join(__dirname, '../downloads', version.filename)
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: '文件不存在' })
  }
  
  // 设置正确的Content-Type和下载文件名
  res.setHeader('Content-Type', 'application/vnd.android.package-archive')
  res.setHeader('Content-Disposition', `attachment; filename="${version.originalName}"`)
  res.sendFile(filePath)
})

// API路由
// 获取公共数据（前端下载页使用）
app.get('/api/public', (req, res) => {
  const data = readData()
  res.json({
    appInfo: data.appInfo,
    downloadLinks: data.downloadLinks
  })
})

// 获取应用信息
app.get('/api/admin/app-info', (req, res) => {
  const data = readData()
  res.json({ appInfo: data.appInfo })
})

// 获取下载链接
app.get('/api/admin/download-links', (req, res) => {
  const data = readData()
  res.json({ downloadLinks: data.downloadLinks })
})

// 获取APK版本列表（分页）
app.get('/api/admin/apk-versions', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 10
  const data = readData()
  
  const versions = data.apkVersions || []
  const total = versions.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedVersions = versions.slice(start, end)
  
  res.json({
    versions: paginatedVersions,
    total,
    page,
    pageSize
  })
})

// 获取管理员配置
app.get('/api/admin/config', (req, res) => {
  const data = readData()
  res.json({ adminConfig: data.adminConfig })
})

// 保存应用信息
app.post('/api/admin/save-app-info', (req, res) => {
  const data = readData()
  data.appInfo = req.body.appInfo
  const success = writeData(data)
  res.json({ success })
})

// 保存下载链接
app.post('/api/admin/save-download-links', (req, res) => {
  const data = readData()
  data.downloadLinks = { ...data.downloadLinks, ...req.body.downloadLinks }
  const success = writeData(data)
  res.json({ success })
})

// 保存管理员配置
app.post('/api/admin/save-config', (req, res) => {
  const data = readData()
  data.adminConfig = req.body.adminConfig
  const success = writeData(data)
  res.json({ success })
})

// 管理员登录
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body
  const data = readData()
  
  if (username === data.adminConfig.username && password === data.adminConfig.password) {
    res.json({ success: true, token: 'admin-token' })
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误' })
  }
})

// 获取管理数据
app.get('/api/admin/data', (req, res) => {
  const data = readData()
  res.json(data)
})

// 保存管理数据
app.post('/api/admin/save', (req, res) => {
  const success = writeData(req.body)
  if (success) {
    res.json({ success: true })
  } else {
    res.status(500).json({ success: false, message: '保存失败' })
  }
})

// LOGO上传
app.post('/api/admin/upload-logo', logoUpload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有文件上传' })
  }
  
  const data = readData()
  const logoUrl = `/downloads/${req.file.filename}`
  
  // 删除旧LOGO文件
  if (data.appInfo.logo) {
    try {
      const oldLogoPath = path.join(__dirname, '../downloads', path.basename(data.appInfo.logo))
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath)
      }
    } catch (error) {
      console.error('删除旧LOGO失败:', error)
    }
  }
  
  data.appInfo.logo = logoUrl
  writeData(data)
  
  res.json({ 
    success: true, 
    logoUrl 
  })
})

// APK文件上传
app.post('/api/admin/upload', upload.single('apk'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有文件上传' })
  }
  
  const { version } = req.body
  if (!version) {
    return res.status(400).json({ success: false, message: '请填写版本号' })
  }
  
  const data = readData()
  
  // 确保apkVersions数组存在
  if (!data.apkVersions) {
    data.apkVersions = []
  }
  
  const downloadUrl = `/downloads/${req.file.filename}`
  
  // 添加到版本列表
  const newVersion = {
    id: Date.now(),
    version,
    filename: req.file.filename,
    originalName: req.file.originalname,
    downloadUrl,
    uploadTime: new Date().toISOString(),
    fileSize: req.file.size
  }
  
  const downloadLink = `/download/${newVersion.id}`
  newVersion.downloadLink = downloadLink
  
  data.apkVersions.unshift(newVersion)
  
  // 更新当前APK下载链接为最新版本
  data.downloadLinks.androidApk = downloadLink
  
  writeData(data)
  
  res.json({ 
    success: true, 
    version: newVersion
  })
})

// 设置当前APK版本
app.post('/api/admin/set-current-apk', (req, res) => {
  const { versionId } = req.body
  const data = readData()
  
  if (!data.apkVersions) {
    data.apkVersions = []
  }
  
  const version = data.apkVersions.find(v => v.id === versionId)
  if (!version) {
    return res.status(404).json({ success: false, message: '版本不存在' })
  }
  
  data.downloadLinks.androidApk = version.downloadLink || version.downloadUrl
  writeData(data)
  
  res.json({ success: true })
})

// 删除APK版本
app.delete('/api/admin/apk-version/:id', (req, res) => {
  const versionId = parseInt(req.params.id)
  const data = readData()
  
  if (!data.apkVersions) {
    data.apkVersions = []
  }
  
  const versionIndex = data.apkVersions.findIndex(v => v.id === versionId)
  if (versionIndex === -1) {
    return res.status(404).json({ success: false, message: '版本不存在' })
  }
  
  const version = data.apkVersions[versionIndex]
  
  // 删除文件
  try {
    const filePath = path.join(__dirname, '../downloads', version.filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.error('删除文件失败:', error)
  }
  
  // 从列表中移除
  data.apkVersions.splice(versionIndex, 1)
  
  // 如果删除的是当前版本，清空当前下载链接
  if (data.downloadLinks.androidApk === version.downloadUrl || 
      data.downloadLinks.androidApk === version.downloadLink) {
    data.downloadLinks.androidApk = ''
  }
  
  writeData(data)
  
  res.json({ success: true })
})

// 重置数据
app.post('/api/admin/reset', (req, res) => {
  const success = writeData(initData)
  if (success) {
    res.json({ success: true })
  } else {
    res.status(500).json({ success: false, message: '重置失败' })
  }
})

// 生产环境下提供静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
