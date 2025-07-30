import { createApp } from 'vue'
import App from './App.vue'
import { DocumentDB } from '../../../src/document-db'

// 1. 在Vue应用初始化之前，先保存原始的HTML模板
const originalHTML = document.documentElement.outerHTML

// 2. 创建DocumentDB实例，使用当前页面的document
const documentDB = new DocumentDB(document, 'markdown-editor-db')

// 3. 将DB和原始HTML模板挂载到全局，供App使用
;(window as any).__markdownEditorDB = documentDB
;(window as any).__markdownEditorTemplate = originalHTML

// 4. 初始化Vue应用
const app = createApp(App)
app.mount('#app') 