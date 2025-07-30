/**
 * DocumentDB类 - 完整的文档数据库封装
 */

import type { DocumentDBState, ExportDocumentOptions } from './types';
import { createDocumentDBState, getDocumentDBState } from './state';
import { setData, getData, hasData, deleteData, listDataKeys, clearData } from './operations';
import { 
  beginTransaction, 
  commitTransaction, 
  rollbackTransaction, 
  getTransactionStatus,
  isInTransaction,
  getTransactionData,
  setTransactionData
} from './transaction';
import { exportDatabase, exportDocument, importDatabase, cloneDatabase } from './export';
import { saveAsHTML, loadFromHTML } from './file-handler';
import type { HTMLSaveOptions } from './file-handler';

/**
 * DocumentDB类
 * 提供完整的文档数据库功能封装
 */
export class DocumentDB {
  private document: Document;
  private state: DocumentDBState;

  /**
   * 创建DocumentDB实例
   * @param document - Document对象
   * @param rootId - 根元素ID，默认为'document-db'
   */
  constructor(document: Document, rootId: string = 'document-db') {
    this.document = document;
    
    // 尝试获取已存在的状态，否则创建新状态
    const existingState = getDocumentDBState(document);
    if (existingState && existingState.rootId === rootId) {
      this.state = existingState;
    } else {
      this.state = createDocumentDBState(document, rootId);
    }
  }

  /**
   * 获取当前状态
   */
  getState(): DocumentDBState {
    return this.state;
  }

  /**
   * 获取根元素ID
   */
  getRootId(): string {
    return this.state.rootId;
  }

  // ===== 数据操作方法 =====

  /**
   * 设置数据
   * @param key - 键名
   * @param value - 值
   */
  setData(key: string, value: any): void {
    setData(this.document, key, value);
  }

  /**
   * 获取数据
   * @param key - 键名
   * @returns 值或null
   */
  getData(key: string): any {
    return getData(this.document, key);
  }

  /**
   * 检查数据是否存在
   * @param key - 键名
   * @returns 是否存在
   */
  hasData(key: string): boolean {
    return hasData(this.document, key);
  }

  /**
   * 删除数据
   * @param key - 键名
   */
  deleteData(key: string): void {
    deleteData(this.document, key);
  }

  /**
   * 列出所有数据键
   * @returns 键名数组
   */
  listDataKeys(): string[] {
    return listDataKeys(this.document);
  }

  /**
   * 清空所有数据
   */
  clearData(): void {
    clearData(this.document);
  }

  // ===== 事务操作方法 =====

  /**
   * 开始事务
   * @returns 事务ID
   */
  beginTransaction(): string {
    return beginTransaction(this.document);
  }

  /**
   * 提交事务
   * @param transactionId - 事务ID
   * @returns 是否提交成功
   */
  commitTransaction(transactionId: string): boolean {
    return commitTransaction(this.document, transactionId);
  }

  /**
   * 回滚事务
   * @param transactionId - 事务ID
   * @returns 是否回滚成功
   */
  rollbackTransaction(transactionId: string): boolean {
    return rollbackTransaction(this.document, transactionId);
  }

  /**
   * 检查是否在事务中
   * @returns 是否在事务中
   */
  isInTransaction(): boolean {
    return isInTransaction(this.document);
  }

  /**
   * 在事务中获取数据
   * @param key - 键名
   * @returns 值或null
   */
  getTransactionData(key: string): any {
    return getTransactionData(this.document, key);
  }

  /**
   * 在事务中设置数据
   * @param key - 键名
   * @param value - 值
   * @returns 是否设置成功
   */
  setTransactionData(key: string, value: any): boolean {
    return setTransactionData(this.document, key, value);
  }

  // ===== 导入导出方法 =====

  /**
   * 导出整个数据库
   * @returns 导出的HTML字符串
   */
  exportDatabase(): string {
    return exportDatabase(this.document);
  }

  /**
   * 导出完整文档
   * @param options - 导出选项
   * @returns 完整HTML文档字符串
   */
  exportDocument(options?: ExportDocumentOptions): string {
    return exportDocument(this.document, options);
  }

  /**
   * 导入数据库
   * @param htmlData - HTML数据
   */
  importDatabase(htmlData: string): void {
    importDatabase(this.document, htmlData);
  }

  /**
   * 克隆数据库到新文档
   * @param targetDocument - 目标文档
   * @returns 新的DocumentDB实例或null
   */
  cloneDatabase(targetDocument: Document): DocumentDB | null {
    const clonedState = cloneDatabase(this.document);
    if (clonedState) {
      return new DocumentDB(targetDocument, clonedState.rootId);
    }
    return null;
  }

  // ===== 文件处理方法 =====

  /**
   * 保存为HTML文件
   * @param options - 保存选项
   * @returns 是否保存成功
   */
  async saveAsHTML(options: HTMLSaveOptions = {}): Promise<boolean> {
    return saveAsHTML(this.document, options);
  }

  /**
   * 从HTML文件加载
   * @param options - 加载选项
   * @returns 是否加载成功
   */
  async loadFromHTML(options: { clearExisting?: boolean } = {}): Promise<boolean> {
    return loadFromHTML(this.document, options);
  }

  // ===== 实用方法 =====

  /**
   * 获取数据库信息
   * @returns 数据库信息对象
   */
  getInfo(): {
    rootId: string;
    dataCount: number;
    isInTransaction: boolean;
    keys: string[];
  } {
    return {
      rootId: this.state.rootId,
      dataCount: this.listDataKeys().length,
      isInTransaction: this.isInTransaction(),
      keys: this.listDataKeys()
    };
  }

  /**
   * 销毁DocumentDB实例
   * 清理所有数据和状态
   */
  destroy(): void {
    // 如果在事务中，先回滚
    if (this.isInTransaction()) {
      // 获取当前事务ID并回滚
      const status = getTransactionStatus(this.document);
      if (status.transactionIds.length > 0) {
        this.rollbackTransaction(status.transactionIds[status.transactionIds.length - 1]);
      }
    }
    
    // 清空所有数据
    this.clearData();
    
    // 移除根元素
    const rootElement = this.document.getElementById(this.state.rootId);
    if (rootElement) {
      rootElement.remove();
    }
  }

  /**
   * 静态方法：从现有文档获取DocumentDB实例
   * @param document - Document对象
   * @returns DocumentDB实例或null
   */
  static fromDocument(document: Document): DocumentDB | null {
    const state = getDocumentDBState(document);
    if (state) {
      return new DocumentDB(document, state.rootId);
    }
    return null;
  }

  /**
   * 静态方法：检查文档是否包含DocumentDB
   * @param document - Document对象
   * @returns 是否包含DocumentDB
   */
  static hasDocumentDB(document: Document): boolean {
    return getDocumentDBState(document) !== null;
  }
} 