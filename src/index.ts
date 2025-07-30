/**
 * DocumentDB - 主入口文件
 * XML风格的HTML页面数据库 (TypeScript无类版本)
 * data-属性用于存储meta信息，元素内容用于存储实际数据（如JSON/base64等）
 * 支持事务性操作，使用最轻量的DOM元素优化性能
 */

// 导出DocumentDB类
export { DocumentDB } from './document-db-class';

// 导出类型
export type {
  DocumentDBState,
  DocumentDBOptions,
  Transaction,
  TransactionStatus,
  Operation,
  ExportDocumentOptions
} from './types';

export type { HTMLSaveOptions } from './file-handler';

// 导出状态管理
export {
  createDocumentDBState,
  getDocumentDBState
} from './state';

// 导出数据操作
export {
  setData,
  getData,
  hasData,
  deleteData,
  listDataKeys,
  clearData
} from './operations';

// 导出事务管理
export {
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  getTransactionStatus,
  isInTransaction,
  getTransactionData,
  setTransactionData
} from './transaction';

// 导出导出相关
export {
  exportDatabase,
  exportDocument,
  importDatabase,
  cloneDatabase
} from './export';

// 导出文件处理
export {
  saveAsHTML,
  loadFromHTML
} from './file-handler'; 