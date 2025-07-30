import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist/types',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    }),
  ],
  build: {
    lib: {
      entry: 'src/document-db.ts', // 你的入口文件
      name: 'DocumentDB', // 你的库名称
      fileName: (format) => `document-db.${format}.js`,
      formats: ['es', 'umd'], // 同时输出 ESM 和 UMD 格式
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: [],
      output: {
        // 在 UMD/IIFE 构建中，全局变量名
        globals: {},
      },
    },
  },
});