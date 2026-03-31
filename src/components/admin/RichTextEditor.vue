<template>
  <div class="rich-text-editor">
    <div class="toolbar">
      <el-button-group>
        <el-button @click="formatBlock('<h1>')">H1</el-button>
        <el-button @click="formatBlock('<h2>')">H2</el-button>
        <el-button @click="formatBlock('<p>')">P</el-button>
      </el-button-group>

      <el-select
        class="font-size-select"
        placeholder="字号"
        @change="applyFontSize"
      >
        <el-option
          v-for="option in fontSizeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <el-button-group>
        <el-button @click="applyCommand('bold')"><strong>B</strong></el-button>
        <el-button @click="applyCommand('italic')"><em>I</em></el-button>
        <el-button @click="applyCommand('underline')"><u>U</u></el-button>
      </el-button-group>

      <el-button-group>
        <el-button @click="applyCommand('insertUnorderedList')">List</el-button>
        <el-button @click="applyCommand('insertOrderedList')">Number</el-button>
      </el-button-group>

      <el-button-group>
        <el-button @click="createLink">Link</el-button>
        <el-button @click="applyCommand('unlink')">Unlink</el-button>
      </el-button-group>
    </div>

    <div
      ref="editor"
      class="editor-content"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="handleInput"
      @blur="saveSelection"
      @keyup="saveSelection"
      @mouseup="saveSelection"
      @focus="saveSelection"
    ></div>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'RichTextEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      savedRange: null,
      fontSizeOptions: [
        { label: '12px', value: '12px' },
        { label: '14px', value: '14px' },
        { label: '16px', value: '16px' },
        { label: '18px', value: '18px' },
        { label: '20px', value: '20px' },
        { label: '24px', value: '24px' },
        { label: '28px', value: '28px' },
        { label: '32px', value: '32px' }
      ]
    }
  },
  mounted() {
    this.syncContent(this.modelValue)
  },
  watch: {
    modelValue(value) {
      this.syncContent(value)
    }
  },
  methods: {
    syncContent(value) {
      const editor = this.$refs.editor
      if (!editor) {
        return
      }

      if (editor.innerHTML !== value) {
        editor.innerHTML = value || ''
        this.normalizeLinks()
        this.normalizeFontSizes()
      }
    },
    handleInput() {
      this.normalizeLinks()
      this.normalizeFontSizes()
      this.$emit('update:modelValue', this.$refs.editor.innerHTML)
    },
    saveSelection() {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        return
      }

      const range = selection.getRangeAt(0)
      if (this.$refs.editor.contains(range.commonAncestorContainer)) {
        this.savedRange = range.cloneRange()
      }
    },
    restoreSelection() {
      const selection = window.getSelection()
      if (!selection || !this.savedRange) {
        return
      }

      selection.removeAllRanges()
      selection.addRange(this.savedRange)
    },
    focusEditor() {
      this.$refs.editor.focus()
      this.saveSelection()
    },
    applyCommand(command, value = null) {
      this.restoreSelection()
      document.execCommand(command, false, value)
      this.focusEditor()
      this.handleInput()
    },
    formatBlock(tag) {
      this.applyCommand('formatBlock', tag)
    },
    applyFontSize(fontSize) {
      if (!fontSize) {
        return
      }

      this.restoreSelection()
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        ElMessage.warning('请先选中文本')
        return
      }

      const range = selection.getRangeAt(0)
      if (!this.$refs.editor.contains(range.commonAncestorContainer) || range.collapsed) {
        ElMessage.warning('请先选中文本')
        return
      }

      const content = range.extractContents()
      const span = document.createElement('span')
      span.style.fontSize = fontSize
      span.appendChild(content)
      range.insertNode(span)

      range.selectNodeContents(span)
      selection.removeAllRanges()
      selection.addRange(range)
      this.saveSelection()
      this.focusEditor()
      this.handleInput()
    },
    normalizeLinks() {
      const editor = this.$refs.editor
      if (!editor) {
        return
      }

      editor.querySelectorAll('a').forEach((link) => {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      })
    },
    normalizeFontSizes(fontSize = null) {
      const editor = this.$refs.editor
      if (!editor) {
        return
      }

      editor.querySelectorAll('font[size]').forEach((fontTag) => {
        const span = document.createElement('span')
        span.style.fontSize = fontSize || this.mapFontSize(fontTag.getAttribute('size'))
        span.innerHTML = fontTag.innerHTML
        fontTag.replaceWith(span)
      })
    },
    mapFontSize(size) {
      const fontSizeMap = {
        '1': '10px',
        '2': '12px',
        '3': '14px',
        '4': '16px',
        '5': '18px',
        '6': '24px',
        '7': '32px'
      }

      return fontSizeMap[size] || '16px'
    },
    escapeHtml(value) {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },
    async createLink() {
      try {
        const { value } = await ElMessageBox.prompt('请输入链接地址', '插入链接', {
          inputPlaceholder: 'https://example.com',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })

        if (!value) {
          return
        }

        this.restoreSelection()
        const selection = window.getSelection()
        if (selection && selection.toString()) {
          document.execCommand('createLink', false, value)
        } else {
          document.execCommand(
            'insertHTML',
            false,
            `<a href="${this.escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(value)}</a>`
          )
        }

        this.focusEditor()
        this.handleInput()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
          ElMessage.error('插入链接失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
}

.font-size-select {
  width: 110px;
}

.editor-content {
  min-height: 360px;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  line-height: 1.75;
  color: #303133;
  outline: none;
  background: white;
}

.editor-content:empty::before {
  content: attr(data-placeholder);
  color: #9ca3af;
}

.editor-content :deep(h1),
.editor-content :deep(h2),
.editor-content :deep(p),
.editor-content :deep(ul),
.editor-content :deep(ol) {
  margin-bottom: 16px;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  padding-left: 24px;
}

.editor-content :deep(a) {
  color: #2563eb;
}
</style>
