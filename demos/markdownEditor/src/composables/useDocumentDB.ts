import { ref, onMounted } from 'vue'
import { DocumentDB } from '../../../../src/document-db'

export const useDocumentDB = () => {
  const documentDB = ref<DocumentDB | null>(null)
  const isReady = ref(false)
  const hasUnsavedChanges = ref(false)

  /**
   * 初始化DocumentDB - 使用预先准备好的实例
   */
  const initDocumentDB = () => {
    const preInitializedDB = (window as any).__markdownEditorDB
    if (!preInitializedDB) {
      throw new Error('DocumentDB预初始化失败')
    }
    documentDB.value = preInitializedDB
    isReady.value = true
  }

  /**
   * 保存数据
   */
  const saveData = (key: string, value: any) => {
    if (!documentDB.value) return false
    try {
      documentDB.value.setData(key, value)
      // 不立即标记为未保存，让调用方决定
      return true
    } catch (error) {
      console.error('保存数据失败:', error)
      return false
    }
  }

  /**
   * 保存数据并标记为未保存状态
   */
  const saveDataAndMarkUnsaved = (key: string, value: any) => {
    const success = saveData(key, value)
    if (success) {
      hasUnsavedChanges.value = true
    }
    return success
  }

  /**
   * 获取数据
   */
  const getData = (key: string) => {
    if (!documentDB.value) return null
    try {
      return documentDB.value.getData(key)
    } catch (error) {
      console.error('获取数据失败:', error)
      return null
    }
  }

  /**
   * 检查数据是否存在
   */
  const hasData = (key: string) => {
    if (!documentDB.value) return false
    try {
      return documentDB.value.hasData(key)
    } catch (error) {
      console.error('检查数据失败:', error)
      return false
    }
  }

  /**
   * 删除数据
   */
  const deleteData = (key: string) => {
    if (!documentDB.value) return false
    try {
      documentDB.value.deleteData(key)
      hasUnsavedChanges.value = true
      return true
    } catch (error) {
      console.error('删除数据失败:', error)
      return false
    }
  }

  /**
   * 列出所有数据键
   */
  const listDataKeys = () => {
    if (!documentDB.value) return []
    try {
      return documentDB.value.listDataKeys()
    } catch (error) {
      console.error('列出数据键失败:', error)
      return []
    }
  }

  /**
   * 清空所有数据
   */
  const clearData = () => {
    if (!documentDB.value) return false
    try {
      documentDB.value.clearData()
      hasUnsavedChanges.value = true
      return true
    } catch (error) {
      console.error('清空数据失败:', error)
      return false
    }
  }

  /**
   * 生成完整的单文件HTML（包含数据）
   */
  const saveAsHTMLWithData = async (filename?: string) => {
    if (!documentDB.value) return false
    
    try {
      // 获取预先准备好的原始HTML模板
      const originalHTML = getOriginalHTMLTemplate()
      
      // 创建新的document
      const parser = new DOMParser()
      const newDoc = parser.parseFromString(originalHTML, 'text/html')
      
      // 创建新的DocumentDB实例
      const newDB = new DocumentDB(newDoc, 'markdown-editor-db')
      
      // 复制当前数据到新的DocumentDB
      const dataKeys = listDataKeys()
      for (const key of dataKeys) {
        const value = getData(key)
        if (value !== null) {
          newDB.setData(key, value)
        }
      }
      
      // 使用新的DocumentDB保存HTML
      const result = await newDB.saveAsHTML({
        filename: filename || `markdown-editor-with-data-${Date.now()}.html`,
        includeDBRoot: true,
        customStyles: `
          body { margin: 0; padding: 0; }
          #app { height: 100vh; }
          .header { background: #f5f5f5; padding: 10px; border-bottom: 1px solid #ddd; }
          .main-content { height: calc(100vh - 80px); }
          .editor { height: 100%; }
        `
      })
      
      if (result) {
        hasUnsavedChanges.value = false
      }
      return result
    } catch (error) {
      console.error('保存包含数据的HTML失败:', error)
      return false
    }
  }

  /**
   * 生成完整的单文件HTML（不包含数据）
   */
  const saveAsHTMLWithoutData = async (filename?: string) => {
    try {
      // 获取预先准备好的原始HTML模板
      const originalHTML = getOriginalHTMLTemplate()
      
      // 创建新的document
      const parser = new DOMParser()
      const newDoc = parser.parseFromString(originalHTML, 'text/html')
      
      // 创建空的DocumentDB实例
      const newDB = new DocumentDB(newDoc, 'markdown-editor-db')
      
      // 使用DocumentDB的saveAsHTML方法生成完整HTML
      const result = await newDB.saveAsHTML({
        filename: filename || `markdown-editor-empty-${Date.now()}.html`,
        includeDBRoot: true,
        customStyles: `
          body { margin: 0; padding: 0; }
          #app { height: 100vh; }
          .header { background: #f5f5f5; padding: 10px; border-bottom: 1px solid #ddd; }
          .main-content { height: calc(100vh - 80px); }
          .editor { height: 100%; }
        `
      })
      
      return result
    } catch (error) {
      console.error('保存空HTML失败:', error)
      return false
    }
  }

  /**
   * 获取原始HTML模板
   */
  const getOriginalHTMLTemplate = (): string => {
    // 使用预先准备好的原始HTML模板
    const template = (window as any).__markdownEditorTemplate
    if (!template) {
      throw new Error('原始HTML模板未找到')
    }
    return template
  }

  /**
   * 标记为已保存
   */
  const markAsSaved = () => {
    hasUnsavedChanges.value = false
  }

  onMounted(() => {
    initDocumentDB()
  })

  return {
    documentDB,
    isReady,
    hasUnsavedChanges,
    saveData,
    saveDataAndMarkUnsaved,
    getData,
    hasData,
    deleteData,
    listDataKeys,
    clearData,
    saveAsHTMLWithData,
    saveAsHTMLWithoutData,
    markAsSaved
  }
} 