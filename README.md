# DocumentDB

基于 DOM 的轻量级文档数据库，专为构建**单文件自包含应用**而设计。

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)

## 简介

DocumentDB 是一个利用 HTML DOM 结构存储数据的 TypeScript 库。不同于 `localStorage` 或 `IndexedDB` 将数据存储在浏览器缓存中，DocumentDB 将数据直接存储在 HTML 页面本身的 DOM 结构里（利用 `data-` 属性和元素内容）。

这意味着，当你将页面另存为 HTML 文件时，**数据库中的所有数据也会随之被保存到文件中**。

## 为什么使用 DocumentDB？(适用场景)

本库的核心价值在于**数据与文档的一体化**。它非常适合以下场景：

1.  **单文件应用 (Single File Apps)**
    *   创建无需后端的工具、计算器或笔记本。
    *   用户使用后，只需 "另存为" HTML，即可保存当前的所有状态和数据。
    *   下次打开该 HTML 文件，应用会从上次保存的状态继续运行。

2.  **可携带的报表与仪表盘**
    *   生成包含动态数据的 HTML 报表。
    *   数据不是死板的表格，而是存储在 "数据库" 中，可以通过页面内的脚本进行交互、筛选或修改。
    *   文件可以分发给任何人，无需搭建服务器即可查看和操作数据。

3.  **离线优先的个人工具**
    *   构建完全运行在本地的个人知识库或任务管理工具。
    *   数据完全掌握在用户手中的 HTML 文件里，安全且隐私。

## 主要特性

*   🚀 **零依赖/轻量级**：直接利用浏览器的 DOM 解析器作为数据库引擎。
*   💾 **所见即所得的持久化**：支持将当前数据库状态导出为新的 HTML 文件，实现"文件即数据库"。
*   🔄 **事务支持**：支持 ACID 风格的事务操作（开始、提交、回滚），确保数据完整性。
*   📦 **多类型自动处理**：自动序列化/反序列化 JSON、字符串、数字、布尔值、Base64 等类型。
*   🛡️ **TypeScript**：提供完整的类型定义，开发体验友好。
*   🎨 **双重 API**：同时提供面向对象的 `DocumentDB` 类和函数式 API。

## 安装

```bash
pnpm add @leolee9086/document-db
# 或者
npm install @leolee9086/document-db
```

## 快速开始

### 初始化

```typescript
import { DocumentDB } from '@leolee9086/document-db';

// 在当前文档中初始化数据库
// 默认会在 document.body 下查找或创建一个 id 为 'document-db' 的容器
const db = new DocumentDB(document);
```

### 基本数据操作

```typescript
// 写入数据（自动序列化对象）
db.setData('user.config', {
  theme: 'dark',
  fontSize: 14,
  plugins: ['plugin-a', 'plugin-b']
});

// 写入简单类型
db.setData('app.version', '1.0.0');
db.setData('app.initialized', true);

// 读取数据
const config = db.getData('user.config');
console.log(config.theme); // 'dark'

// 检查是否存在
if (db.hasData('user.config')) {
  // ...
}

// 删除数据
db.deleteData('app.version');

// 列出所有键
const keys = db.listDataKeys();
console.log(keys); // ['user.config', 'app.initialized']
```

### 事务操作

DocumentDB 支持事务，确保数据操作的原子性。

```typescript
// 开始事务
const txId = db.beginTransaction();

try {
  db.setData('order.id', '12345');
  db.setData('order.status', 'pending');
  
  // 模拟错误
  // throw new Error('Something went wrong');

  // 提交事务
  db.commitTransaction(txId);
  console.log('事务提交成功');
} catch (error) {
  // 发生错误，回滚事务
  db.rollbackTransaction(txId);
  console.log('事务已回滚');
}
```

### 导入与导出

```typescript
// 导出数据库内容为 HTML 字符串
const html = db.exportDatabase();

// 导出包含完整 HTML 结构的文档
const fullDoc = db.exportDocument({
  title: 'My Database Backup',
  pretty: true
});

// 保存为 HTML 文件 (触发浏览器下载)
await db.saveAsHTML({
  fileName: 'backup.html'
});

// 从 HTML 文件加载 (触发文件选择)
await db.loadFromHTML();
```

## API 参考

### DocumentDB 类

*   `constructor(document: Document, rootId?: string)`
*   `setData(key: string, value: any): void`
*   `getData(key: string): any`
*   `hasData(key: string): boolean`
*   `deleteData(key: string): void`
*   `clearData(): void`
*   `listDataKeys(): string[]`
*   `beginTransaction(): string`
*   `commitTransaction(transactionId: string): boolean`
*   `rollbackTransaction(transactionId: string): boolean`
*   `saveAsHTML(options?: HTMLSaveOptions): Promise<boolean>`
*   `loadFromHTML(options?: { clearExisting?: boolean }): Promise<boolean>`

更多详细 API 请参考 TypeScript 类型定义文件。

## 许可证

ISC
