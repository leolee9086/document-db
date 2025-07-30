/**
 * DocumentDB - 主入口文件
 * XML风格的HTML页面数据库 (TypeScript无类版本)
 * data-属性用于存储meta信息，元素内容用于存储实际数据（如JSON/base64等）
 * 支持事务性操作，使用最轻量的DOM元素优化性能
 */
export { DocumentDB } from './document-db-class';
export type { DocumentDBState, DocumentDBOptions, Transaction, TransactionStatus, Operation, ExportDocumentOptions } from './types';
export type { HTMLSaveOptions } from './file-handler';
export { createDocumentDBState, getDocumentDBState } from './state';
export { setData, getData, hasData, deleteData, listDataKeys, clearData } from './operations';
export { beginTransaction, commitTransaction, rollbackTransaction, getTransactionStatus, isInTransaction, getTransactionData, setTransactionData } from './transaction';
export { exportDatabase, exportDocument, importDatabase, cloneDatabase } from './export';
export { saveAsHTML, loadFromHTML } from './file-handler';
