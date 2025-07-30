import { ref } from 'vue'
import CryptoJS from 'crypto-js'

/**
 * 加密composable
 * 使用AES-256-CBC加密算法处理文档的加密和解密功能
 */
export const useEncryption = () => {
  const isEncrypted = ref(false)
  const password = ref('')

  /**
   * 生成密钥和IV
   * 使用PBKDF2从密码派生密钥
   */
  const deriveKeyAndIV = (password: string, salt: string) => {
    // 使用PBKDF2派生密钥
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32, // 256位密钥
      iterations: 10000
    })
    
    // 生成IV
    const iv = CryptoJS.enc.Hex.parse(salt)
    
    return { key, iv }
  }

  /**
   * AES加密函数
   * 使用AES-256-CBC模式加密数据
   */
  const encryptData = (data: string, pwd: string): string => {
    try {
      if (!pwd) {
        throw new Error('密码不能为空')
      }

      // 生成随机盐值
      const salt = CryptoJS.lib.WordArray.random(16).toString()
      
      // 派生密钥和IV
      const { key, iv } = deriveKeyAndIV(pwd, salt)
      
      // 使用AES-256-CBC加密
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      
      // 组合盐值和加密数据
      const result = salt + ':' + encrypted.toString()
      return result
    } catch (error) {
      throw new Error(`加密失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * AES解密函数
   * 使用AES-256-CBC模式解密数据
   */
  const decryptData = (encryptedData: string, pwd: string): string => {
    try {
      if (!pwd) {
        throw new Error('密码不能为空')
      }

      // 分离盐值和加密数据
      const parts = encryptedData.split(':')
      if (parts.length !== 2) {
        throw new Error('加密数据格式错误')
      }

      const [salt, encrypted] = parts
      
      // 派生密钥和IV
      const { key, iv } = deriveKeyAndIV(pwd, salt)
      
      // 使用AES-256-CBC解密
      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      
      // 转换为字符串
      const result = decrypted.toString(CryptoJS.enc.Utf8)
      
      if (!result) {
        throw new Error('密码不正确或数据已损坏')
      }
      
      return result
    } catch (error) {
      throw new Error(`解密失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 加密内容
   */
  const encryptContent = (content: string, pwd: string): string => {
    if (!content) {
      throw new Error('内容不能为空')
    }
    return encryptData(content, pwd)
  }

  /**
   * 解密内容
   */
  const decryptContent = (encryptedContent: string, pwd: string): string => {
    if (!encryptedContent) {
      throw new Error('加密内容不能为空')
    }
    return decryptData(encryptedContent, pwd)
  }

  /**
   * 验证密码是否正确
   */
  const verifyPassword = (encryptedContent: string, pwd: string): boolean => {
    try {
      decryptData(encryptedContent, pwd)
      return true
    } catch {
      return false
    }
  }

  /**
   * 设置加密状态
   */
  const setEncrypted = (encrypted: boolean) => {
    isEncrypted.value = encrypted
  }

  /**
   * 清空密码
   */
  const clearPassword = () => {
    password.value = ''
  }

  /**
   * 生成随机密码
   */
  const generateRandomPassword = (length: number = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  return {
    isEncrypted,
    password,
    encryptContent,
    decryptContent,
    verifyPassword,
    setEncrypted,
    clearPassword,
    generateRandomPassword
  }
} 