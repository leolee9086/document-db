<template>
  <div id="app">
    <header class="header">
      <h1>Markdown编辑器</h1>
      <Toolbar 
        :is-loading="isLoading" 
        :is-encrypted="isEncrypted"
        @import="handleImport"
        @export="handleExport"
        @save-with-data="handleSaveWithData"
        @save-without-data="handleSaveWithoutData"
        @toggle-encryption="handleToggleEncryption"
        @show-image-config="showImageConfig = true"
      />
      <div v-if="hasUnsavedChanges" class="unsaved-indicator">
        ⚠️ 有未保存的更改
      </div>
    </header>

    <!-- 图床配置对话框 -->
    <ImageConfigDialog
      :visible="showImageConfig"
      :config="imageConfig"
      @close="showImageConfig = false"
      @save="handleImageConfigSave"
    />

    <!-- 加密对话框 -->
    <EncryptionDialog
      :visible="showEncryptionDialog"
      :is-encrypted="isEncrypted"
      @close="showEncryptionDialog = false"
      @confirm="handleEncryptionConfirm"
    />

    <!-- 主编辑器区域 -->
    <main class="main-content">
      <div v-if="!isEncrypted" id="vditor" class="editor"></div>
      <div v-else class="encrypted-placeholder">
        <div class="encrypted-message">
          <h3>🔒 内容已加密</h3>
          <p>请输入密码以查看和编辑内容</p>
          <button @click="handleToggleEncryption" class="decrypt-btn">
            输入密码解密
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Toolbar from './components/Toolbar.vue'
import ImageConfigDialog from './components/ImageConfigDialog.vue'
import EncryptionDialog from './components/EncryptionDialog.vue'
import { useDocumentDB } from './composables/useDocumentDB'
import { useEditor } from './composables/useEditor'
import { useEncryption } from './composables/useEncryption'
import { useImageConfig } from './composables/useImageConfig'

// 状态管理
const isLoading = ref(false)
const showImageConfig = ref(false)
const showEncryptionDialog = ref(false)

// 使用composables
const {
  documentDB,
  isReady: isDBReady,
  hasUnsavedChanges,
  saveData,
  saveDataAndMarkUnsaved,
  getData,
  hasData,
  deleteData,
  saveAsHTMLWithData,
  saveAsHTMLWithoutData,
  markAsSaved
} = useDocumentDB()

const {
  vditor,
  isReady: isEditorReady,
  content,
  initEditor,
  setContent,
  getContent,
  clearContent,
  onContentChange,
  destroyEditor
} = useEditor()

const {
  isEncrypted,
  password,
  encryptContent,
  decryptContent,
  verifyPassword,
  setEncrypted,
  clearPassword,
  generateRandomPassword
} = useEncryption()

const {
  imageConfig,
  handleImageUpload,
  createVditorUploadHandler,
  updateConfig
} = useImageConfig()

// 初始化编辑器
const initEditorWithConfig = async () => {
  await initEditor('vditor', {
    uploadHandler: handleCustomUpload,
    onReady: () => {
      loadSavedContent()
      setupContentChangeListener()
    }
  })
}

// 自定义上传处理函数
const handleCustomUpload = async (files: File[]): Promise<string | null> => {
  try {
    for (const file of files) {
      const base64Url = await convertFileToBase64(file)
      if (base64Url) {
        // 直接插入图片到编辑器
        const imageMarkdown = `![${file.name}](${base64Url})`
        vditor.value?.insertValue(imageMarkdown)
      }
    }
    return null // 返回null表示成功
  } catch (error) {
    console.error('上传失败:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return '上传失败: ' + errorMessage // 返回错误信息
  }
}

// 转换文件为base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 加载保存的内容
const loadSavedContent = () => {
  if (!isDBReady.value) return
  
  try {
    const savedContent = getData('markdown-content')
    const savedImageConfig = getData('image-config')
    const encryptedContent = getData('encrypted-content')
    
    if (encryptedContent) {
      setEncrypted(true)
      // 不自动解密，需要用户输入密码
    } else if (savedContent) {
      setContent(savedContent)
    }
    
    // 加载图床配置
    if (savedImageConfig) {
      updateConfig(savedImageConfig)
    }
  } catch (error) {
    console.error('加载保存内容失败:', error)
  }
}

// 设置内容变化监听
const setupContentChangeListener = () => {
  if (!isEditorReady.value) return
  
  // 监听编辑器内容变化，实时保存数据
  const cleanup = onContentChange((newContent: string) => {
    if (!isEncrypted.value && isDBReady.value) {
      // 使用新的保存方法，避免临时状态持久化
      saveDataAndMarkUnsaved('markdown-content', newContent)
    }
  })
  
  // 在组件卸载时清理监听器
  onUnmounted(() => {
    if (cleanup) cleanup()
  })
}

// 保存内容到DocumentDB
const saveContent = () => {
  if (!isDBReady.value || !isEditorReady.value) return false
  
  try {
    const content = getContent()
    saveData('markdown-content', content)
    saveData('image-config', imageConfig.value)
    return true
  } catch (error) {
    console.error('保存内容失败:', error)
    return false
  }
}

// 处理导入文件
const handleImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md,.markdown,.txt'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setContent(content)
        hasUnsavedChanges.value = true
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 处理导出文件
const handleExport = () => {
  if (!isEditorReady.value) return
  
  const content = getContent()
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `markdown-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// 处理保存包含数据
const handleSaveWithData = async () => {
  try {
    isLoading.value = true
    saveContent()
    
    const success = await saveAsHTMLWithData()
    if (success) {
      markAsSaved()
      alert('包含数据的副本保存成功！')
    } else {
      alert('保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败')
  } finally {
    isLoading.value = false
  }
}

// 处理保存空编辑器
const handleSaveWithoutData = async () => {
  try {
    isLoading.value = true
    
    const success = await saveAsHTMLWithoutData()
    if (success) {
      alert('空编辑器保存成功！')
    } else {
      alert('保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败')
  } finally {
    isLoading.value = false
  }
}

// 处理切换加密
const handleToggleEncryption = () => {
  showEncryptionDialog.value = true
}

// 处理加密确认
const handleEncryptionConfirm = async (pwd: string) => {
  try {
    isLoading.value = true
    
    if (isEncrypted.value) {
      // 解密
      const encryptedContent = getData('encrypted-content')
      if (encryptedContent) {
        const decrypted = decryptContent(encryptedContent, pwd)
        deleteData('encrypted-content')
        setEncrypted(false)
        
        // 解密后重新初始化编辑器
        await nextTick()
        await initEditorWithConfig()
        
        // 设置解密后的内容
        setContent(decrypted)
        hasUnsavedChanges.value = true
        alert('解密成功')
      }
    } else {
      // 加密
      const content = getContent()
      if (!content) {
        alert('没有内容可加密')
        return
      }
      
      const encrypted = encryptContent(content, pwd)
      saveData('encrypted-content', encrypted)
      
      // 清理所有可能暴露内容的状态
      clearContent()
      deleteData('markdown-content') // 删除未加密的内容
      hasUnsavedChanges.value = false // 加密后没有未保存的更改
      setEncrypted(true)
      alert('加密成功')
    }
  } catch (error) {
    console.error('加密/解密失败:', error)
    alert(error instanceof Error ? error.message : '操作失败')
  } finally {
    isLoading.value = false
  }
}

// 处理图床配置保存
const handleImageConfigSave = (config: any) => {
  updateConfig(config)
  // 保存图床配置到DocumentDB
  saveData('image-config', config)
  // 标记为已保存，因为配置更改不需要显示未保存提示
}

// 监听内容变化
watch(content, () => {
  if (isEditorReady.value && !isEncrypted.value) {
    hasUnsavedChanges.value = true
  }
})

// 监听未保存状态
watch(hasUnsavedChanges, (hasChanges) => {
  if (hasChanges) {
    window.addEventListener('beforeunload', handleBeforeUnload)
  } else {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})

// 页面离开前提示
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// 生命周期
onMounted(async () => {
  await initEditorWithConfig()
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #f5f5f5;
  padding: 10px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.unsaved-indicator {
  color: #e74c3c;
  font-weight: bold;
  font-size: 14px;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

.editor {
  height: 100%;
}

.encrypted-placeholder {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
}

.encrypted-message {
  text-align: center;
  color: #555;
}

.encrypted-message h3 {
  color: #e74c3c;
  margin-bottom: 10px;
}

.encrypted-message p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.decrypt-btn {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.decrypt-btn:hover {
  background-color: #2980b9;
}
</style> 