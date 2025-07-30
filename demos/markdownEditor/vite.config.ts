import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  build: {
    outDir: '../../dist', // 将构建输出到项目根目录的 dist 文件夹
    rollupOptions: {
      output: {
        // 生成单文件
        format: 'iife',
        // 内联所有资源
        inlineDynamicImports: true
      }
    },
    // 内联所有资源
    assetsInlineLimit: Infinity,
    // 不生成sourcemap
    sourcemap: false
  },
  // 内联所有依赖
  optimizeDeps: {
    include: ['vue', 'vditor', 'crypto-js']
  }
}) 