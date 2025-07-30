# Markdown编辑器Demo

一个基于Vue 3和vditor的单文件markdown编辑器，使用DocumentDB在页面内保存数据。

## 特性

- ✅ 完全自包含，无外部依赖
- ✅ 支持导入导出markdown文件
- ✅ 支持配置图床（本地存储、Imgur、自定义API）
- ✅ 使用DocumentDB保存数据
- ✅ 支持保存包含数据或不包含数据的副本
- ✅ 使用Vue 3作为UI框架
- ✅ 支持AES-256-CBC加密选项
- ✅ 未保存状态提示

## 快速开始

### 开发模式

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 构建生产版本

```bash
# 构建单文件版本
pnpm build

# 预览构建结果
pnpm preview
```

## 功能说明

### 编辑器功能
- 使用vditor实现富文本markdown编辑
- 支持实时预览
- 支持语法高亮
- 支持快捷键操作

### 数据管理
- 自动保存编辑内容到DocumentDB
- 支持导入markdown文件
- 支持导出markdown文件
- 未保存状态提示

### 图床配置
- **本地存储**: 图片转换为base64存储
- **Imgur**: 上传到Imgur图床（需要Client ID）
- **自定义API**: 支持自定义上传接口

### 加密功能
- 使用AES-256-CBC加密算法
- PBKDF2密钥派生，10000次迭代
- 随机盐值生成
- 密码验证机制

### 文件保存
- **保存包含数据**: 保存当前编辑内容和配置
- **保存空编辑器**: 保存干净的编辑器副本

## 技术架构

### 前端框架
- Vue 3.5.18 (Composition API)
- TypeScript 5.8.3
- Vite 5.4.19

### 核心依赖
- vditor 3.11.1 - Markdown编辑器
- crypto-js 4.2.0 - AES加密
- DocumentDB - 页面内数据存储

### 项目结构
```
src/
├── components/          # Vue组件
│   ├── Toolbar.vue     # 工具栏
│   ├── ImageConfigDialog.vue  # 图床配置
│   └── EncryptionDialog.vue   # 加密对话框
├── composables/         # Vue Composables
│   ├── useDocumentDB.ts # DocumentDB管理
│   ├── useEditor.ts     # 编辑器管理
│   ├── useEncryption.ts # 加密功能
│   └── useImageConfig.ts # 图床配置
├── App.vue             # 主组件
└── main.ts             # 入口文件
```

## 使用说明

### 基本编辑
1. 直接在编辑器中输入markdown内容
2. 内容会自动保存到DocumentDB
3. 支持所有标准的markdown语法

### 文件操作
1. **导入文件**: 点击"导入文件"按钮选择markdown文件
2. **导出文件**: 点击"导出文件"按钮下载当前内容

### 图床配置
1. 点击"图床配置"按钮
2. 选择图床类型
3. 配置相应的参数
4. 保存配置

### 加密功能
1. 点击"加密"按钮
2. 输入密码
3. 内容将被加密存储
4. 解密时需要输入正确密码

### 保存副本
1. **包含数据**: 点击"保存包含数据"保存当前状态
2. **空编辑器**: 点击"保存空编辑器"保存干净副本

## 安全说明

- 加密使用AES-256-CBC算法
- 密码通过PBKDF2派生密钥
- 每次加密使用随机盐值
- 加密数据仅在当前页面有效

## 注意事项

- 保存的HTML文件包含所有依赖，可以独立运行
- 加密功能仅在当前页面有效，刷新页面后需要重新解密
- 图床配置需要相应的API密钥或接口地址
- 建议定期备份重要内容

## 开发说明

### 添加新的图床支持
1. 在`useImageConfig.ts`中添加新的上传函数
2. 在`ImageConfigDialog.vue`中添加配置选项
3. 更新类型定义

### 自定义样式
1. 修改`index.html`中的CSS样式
2. 或修改`App.vue`中的scoped样式

### 扩展功能
1. 在`composables`目录添加新的功能模块
2. 在`components`目录添加新的UI组件
3. 在`App.vue`中集成新功能 