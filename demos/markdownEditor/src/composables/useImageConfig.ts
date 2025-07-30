import { ref } from 'vue'

/**
 * 图床配置类型
 */
export interface ImageConfig {
  type: 'local' | 'imgur' | 'custom'
  imgurClientId: string
  customApiUrl: string
}

/**
 * 图床配置composable
 */
export const useImageConfig = () => {
  const imageConfig = ref<ImageConfig>({
    type: 'local',
    imgurClientId: '',
    customApiUrl: ''
  })

  /**
   * 处理图片上传
   */
  const handleImageUpload = async (files: File[]): Promise<string> => {
    if (files.length === 0) {
      return JSON.stringify({
        msg: '没有文件',
        code: 1,
        data: {
          errFiles: [],
          succMap: {}
        }
      })
    }
    
    const file = files[0] // vditor的handler只处理单个文件
    try {
      let url = ''
      
      // 检查配置是否有效
      const config = imageConfig.value
      const hasValidImgurConfig = config.type === 'imgur' && config.imgurClientId.trim() !== ''
      const hasValidCustomConfig = config.type === 'custom' && config.customApiUrl.trim() !== ''
      
      if (config.type === 'local' || !hasValidImgurConfig && !hasValidCustomConfig) {
        // 使用base64
        url = await uploadToLocal(file)
      } else if (hasValidImgurConfig) {
        // 使用Imgur
        url = await uploadToImgur(file)
      } else if (hasValidCustomConfig) {
        // 使用自定义API
        url = await uploadToCustom(file)
      } else {
        // 默认回退到base64
        url = await uploadToLocal(file)
      }
      
      if (url) {
        // 返回符合vditor期望的格式
        return JSON.stringify({
          msg: '',
          code: 0,
          data: {
            errFiles: [],
            succMap: {
              [file.name]: url
            }
          }
        })
      } else {
        return JSON.stringify({
          msg: '上传失败',
          code: 1,
          data: {
            errFiles: [file.name],
            succMap: {}
          }
        })
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      // 上传失败时回退到base64
      try {
        const base64Url = await uploadToLocal(file)
        return JSON.stringify({
          msg: '',
          code: 0,
          data: {
            errFiles: [],
            succMap: {
              [file.name]: base64Url
            }
          }
        })
      } catch (base64Error) {
        console.error('Base64转换失败:', base64Error)
        return JSON.stringify({
          msg: 'Base64转换失败',
          code: 1,
          data: {
            errFiles: [file.name],
            succMap: {}
          }
        })
      }
    }
  }

  /**
   * 创建vditor兼容的upload handler
   */
  const createVditorUploadHandler = () => {
    return async (files: File[]): Promise<string> => {
      return await handleImageUpload(files)
    }
  }

  /**
   * 上传到本地（base64）
   */
  const uploadToLocal = (file: File): Promise<string> => {
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
   * 上传到Imgur
   */
  const uploadToImgur = async (file: File): Promise<string> => {
    // 由于禁止使用fetch，这里暂时返回base64
    // 实际项目中可以使用XMLHttpRequest或其他方式
    return await uploadToLocal(file)
  }

  /**
   * 上传到自定义API
   */
  const uploadToCustom = async (file: File): Promise<string> => {
    // 由于禁止使用fetch，这里暂时返回base64
    // 实际项目中可以使用XMLHttpRequest或其他方式
    return await uploadToLocal(file)
  }

  /**
   * 更新配置
   */
  const updateConfig = (config: Partial<ImageConfig>) => {
    imageConfig.value = { ...imageConfig.value, ...config }
  }

  /**
   * 重置配置
   */
  const resetConfig = () => {
    imageConfig.value = {
      type: 'local',
      imgurClientId: '',
      customApiUrl: ''
    }
  }

  return {
    imageConfig,
    handleImageUpload,
    createVditorUploadHandler,
    updateConfig,
    resetConfig
  }
} 