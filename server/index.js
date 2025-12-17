const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3001

// 增加请求体大小限制
app.use(express.json({ limit: '200mb' }))
app.use(express.urlencoded({ limit: '200mb', extended: true }))
app.use(cors())
app.use('/downloads', express.static(path.join(__dirname, '../downloads')))

// 数据文件路径
const DATA_FILE = path.join(__dirname, '../data/data.json')

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
    // 确保数据目录存在
    const dataDir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
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

const upload = multer({ 
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB
  }
})

// 单独的LOGO上传配置
const logoUpload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
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

// 存储当前有效的token
let currentToken = null

// 生成UUID格式的token
function generateToken() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 权限校验中间件
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null
  
  if (!token || token !== currentToken) {
    return res.status(401).json({ success: false, message: '未授权访问' })
  }
  
  next()
}

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
app.get('/api/admin/app-info', requireAuth, (req, res) => {
  const data = readData()
  res.json({ appInfo: data.appInfo })
})

// 获取下载链接
app.get('/api/admin/download-links', requireAuth, (req, res) => {
  const data = readData()
  res.json({ downloadLinks: data.downloadLinks })
})

// 获取APK版本列表（分页）
app.get('/api/admin/apk-versions', requireAuth, (req, res) => {
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
    // 生成新的token
    currentToken = generateToken()
    res.json({ success: true, token: currentToken })
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误' })
  }
})

// 管理员登出
app.post('/api/admin/logout', requireAuth, (req, res) => {
  currentToken = null
  res.json({ success: true, message: '已退出登录' })
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
app.post('/api/admin/upload', requireAuth, upload.single('apk'), (req, res) => {
  const { version, versionCode, client, forceUpdate, updateContent } = req.body
  if (!version || !versionCode || !client) {
    return res.status(400).json({ success: false, message: '请填写完整信息' })
  }
  
  const data = readData()
  
  // 确保apkVersions数组存在
  if (!data.apkVersions) {
    data.apkVersions = []
  }
  
  let downloadUrl = ''
  let downloadLink = ''
  let filename = ''
  let originalName = ''
  let fileSize = 0
  
  // 如果有文件上传
  if (req.file) {
    downloadUrl = `/downloads/${req.file.filename}`
    downloadLink = `/download/${Date.now()}`
    filename = req.file.filename
    originalName = req.file.originalname
    fileSize = req.file.size
  }
  
  // 添加到版本列表
  const newVersion = {
    id: Date.now(),
    version,
    versionCode: parseInt(versionCode),
    client,
    forceUpdate: forceUpdate === 'true',
    updateContent: updateContent || '',
    filename,
    originalName,
    downloadUrl,
    uploadTime: new Date().toISOString(),
    fileSize
  }
  
  if (downloadLink) {
    newVersion.downloadLink = downloadLink
  }
  
  data.apkVersions.unshift(newVersion)
  
  // 更新当前APK下载链接为最新Android版本（仅当有文件时）
  if (client === 'Android' && downloadLink) {
    data.downloadLinks.androidApk = downloadLink
  }
  
  writeData(data)
  
  res.json({ 
    success: true, 
    version: newVersion
  })
})

// 更新版本信息
app.post('/api/admin/update-version', requireAuth, (req, res) => {
  const { id, version, versionCode, client, forceUpdate, updateContent } = req.body
  const data = readData()
  
  if (!data.apkVersions) {
    return res.status(404).json({ success: false, message: '版本不存在' })
  }
  
  const versionIndex = data.apkVersions.findIndex(v => v.id === id)
  if (versionIndex === -1) {
    return res.status(404).json({ success: false, message: '版本不存在' })
  }
  
  // 更新版本信息
  data.apkVersions[versionIndex] = {
    ...data.apkVersions[versionIndex],
    version,
    versionCode: parseInt(versionCode),
    client,
    forceUpdate: forceUpdate === true || forceUpdate === 'true',
    updateContent: updateContent || ''
  }
  
  writeData(data)
  res.json({ success: true })
})

// APP版本检查API
app.get('/api/app/version-check', (req, res) => {
  const { client } = req.query
  
  if (!client || !['Android', 'iOS'].includes(client)) {
    return res.status(400).json({ success: false, message: '客户端参数错误' })
  }
  
  const data = readData()
  const versions = data.apkVersions || []
  
  // 获取指定客户端的最新版本
  const clientVersions = versions.filter(v => v.client === client)
  if (clientVersions.length === 0) {
    return res.status(404).json({ success: false, message: '暂无版本信息' })
  }
  
  // 按版本代码排序，获取最新版本
  const latestVersion = clientVersions.sort((a, b) => b.versionCode - a.versionCode)[0]
  
  res.json({
    success: true,
    data: {
      version: latestVersion.version,
      versionCode: latestVersion.versionCode,
      client: latestVersion.client,
      forceUpdate: latestVersion.forceUpdate,
      updateContent: latestVersion.updateContent,
      downloadUrl: latestVersion.downloadLink || latestVersion.downloadUrl,
      fileSize: latestVersion.fileSize,
      uploadTime: latestVersion.uploadTime
    }
  })
})

// 设置当前APK版本
app.post('/api/admin/set-current-apk', requireAuth, (req, res) => {
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
app.delete('/api/admin/apk-version/:id', requireAuth, (req, res) => {
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
  
  // 前端路由fallback
  app.get('*', (req, res) => {
    // 如果是API请求，返回404
    if (req.path.startsWith('/api/') || req.path.startsWith('/download/')) {
      return res.status(404).json({ error: 'Not found' })
    }
    // 其他路由返回index.html
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
