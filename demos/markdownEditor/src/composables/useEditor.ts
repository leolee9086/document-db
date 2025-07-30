import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

/**
 * 编辑器composable
 * 管理vditor实例和内容
 */
export const useEditor = () => {
  const vditor = ref<Vditor | null>(null)
  const isReady = ref(false)
  const content = ref('')

  /**
   * 初始化编辑器
   */
  const initEditor = async (containerId: string, options?: any) => {
    await nextTick()
    
    try {
      vditor.value = new Vditor(containerId, {
        height: 'calc(100vh - 120px)',
        mode: 'ir',
        toolbar: [
          'emoji', 'headings', 'bold', 'italic', 'strike', 'link', 
          '|', 'list', 'ordered-list', 'check', 'outdent', 'indent',
          '|', 'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after',
          '|', 'upload', 'table',
          '|', 'undo', 'redo',
          '|', 'edit-mode', 'content-theme', 'code-theme', 'export',
          '|', 'fullscreen', 'preview'
        ],
        upload: {
          handler: options?.uploadHandler || handleCustomUpload,
          accept: 'image/*'
        },
        cache: {
          enable: false
        },
        preview: {
          delay: 1000
        },
        counter: {
          enable: true
        },
        theme: 'classic',
        icon: 'material',
        after: () => {
          isReady.value = true
          if (options?.onReady) {
            options.onReady()
          }
        }
      })
    } catch (error) {
      console.error('编辑器初始化失败:', error)
    }
  }

  /**
   * 自定义上传处理
   */
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

  /**
   * 转换文件为base64
   */
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

  /**
   * 设置内容
   */
  const setContent = (value: string) => {
    if (vditor.value && isReady.value) {
      vditor.value.setValue(value)
      content.value = value
    }
  }

  /**
   * 获取内容
   */
  const getContent = (): string => {
    if (vditor.value && isReady.value) {
      content.value = vditor.value.getValue()
      return content.value
    }
    return content.value
  }

  /**
   * 清空内容
   */
  const clearContent = () => {
    if (vditor.value && isReady.value) {
      vditor.value.setValue('')
      content.value = ''
    }
  }

  /**
   * 监听内容变化
   */
  const onContentChange = (callback: (content: string) => void) => {
    if (vditor.value && isReady.value) {
      // 使用定时器监听内容变化
      let lastContent = vditor.value.getValue()
      const checkContent = () => {
        if (vditor.value && isReady.value) {
          const currentContent = vditor.value.getValue()
          if (currentContent !== lastContent) {
            lastContent = currentContent
            content.value = currentContent
            callback(currentContent)
          }
        }
      }
      
      // 每500ms检查一次内容变化
      const interval = setInterval(checkContent, 500)
      
      // 返回清理函数
      return () => {
        clearInterval(interval)
      }
    }
  }

  /**
   * 销毁编辑器
   */
  const destroyEditor = () => {
    if (vditor.value) {
      vditor.value.destroy()
      vditor.value = null
      isReady.value = false
    }
  }

  onUnmounted(() => {
    destroyEditor()
  })

  return {
    vditor,
    isReady,
    content,
    initEditor,
    setContent,
    getContent,
    clearContent,
    onContentChange,
    destroyEditor
  }
} 