/**
 * DocumentDB - 类型定义
 * 包含所有接口和类型定义
 */

/**
 * DocumentDB选项接口
 */
export interface DocumentDBOptions {
  type?: 'auto' | 'json' | 'string' | 'number' | 'boolean' | 'base64' | 'null' | string | null;
  version?: string;
  [key: string]: any;
}

/**
 * 事务接口
 */
export interface Transaction {
  id: string;
  operations: Operation[];
  snapshot: Record<string, { value: any; type: string }>;
  startTime: number;
}

/**
 * 操作接口
 */
export interface Operation {
  type: 'set' | 'delete' | 'clear';
  key?: string;
  value?: any;
  detectedType?: string;
  version?: string;
  meta?: Record<string, any>;
}

/**
 * 事务状态接口
 */
export interface TransactionStatus {
  isInTransaction: boolean;
  activeTransactions: number;
  transactionIds: string[];
}

/**
 * DocumentDB状态接口
 */
export interface DocumentDBState {
  document: Document;
  rootId: string;
  root: HTMLElement;
  transactionStack: Transaction[];
  isInTransaction: boolean;
}

/**
 * 导出文档选项接口
 */
export interface ExportDocumentOptions {
  title?: string;
  charset?: string;
  pretty?: boolean;
} 