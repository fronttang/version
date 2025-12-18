const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, 'data')
const OLD_FILE = path.join(DATA_DIR, 'data.json')

console.log('开始数据迁移...')

if (!fs.existsSync(OLD_FILE)) {
  console.log('未找到 data.json 文件，无需迁移')
  process.exit(0)
}

try {
  const data = JSON.parse(fs.readFileSync(OLD_FILE, 'utf8'))
  
  // 拆分写入各文件
  if (data.appInfo) {
    fs.writeFileSync(path.join(DATA_DIR, 'app-info.json'), JSON.stringify(data.appInfo, null, 2))
    console.log('✓ app-info.json')
  }
  
  if (data.downloadLinks) {
    fs.writeFileSync(path.join(DATA_DIR, 'download-links.json'), JSON.stringify(data.downloadLinks, null, 2))
    console.log('✓ download-links.json')
  }
  
  if (data.apkVersions) {
    fs.writeFileSync(path.join(DATA_DIR, 'versions.json'), JSON.stringify(data.apkVersions, null, 2))
    console.log('✓ versions.json')
  }
  
  if (data.adminConfig) {
    fs.writeFileSync(path.join(DATA_DIR, 'admin-config.json'), JSON.stringify(data.adminConfig, null, 2))
    console.log('✓ admin-config.json')
  }
  
  // 备份原文件
  fs.renameSync(OLD_FILE, OLD_FILE + '.backup')
  console.log('✓ 原文件已备份为 data.json.backup')
  
  console.log('数据迁移完成！')
} catch (error) {
  console.error('迁移失败:', error)
  process.exit(1)
}
