/**
 * DocumentDB - 事务管理
 * 包含事务的开始、提交、回滚等功能
 */

import type { DocumentDBState, Transaction, TransactionStatus, Operation } from './types';
import { getDocumentDBState } from './state';
import { executeSet, executeDelete, executeClear, getData } from './operations';
import { parseElementContent, detectType } from './utils';

/**
 * 开始事务
 * @param document - document对象
 * @returns 事务ID
 */
export const beginTransaction = (document: Document): string => {
  const state = getDocumentDBState(document);
  if (!state) throw new Error('DocumentDB state not found');

  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const transaction: Transaction = {
    id: transactionId,
    operations: [],
    snapshot: createSnapshot(state),
    startTime: Date.now()
  };
  
  state.transactionStack.push(transaction);
  state.isInTransaction = true;
  return transactionId;
};

/**
 * 提交事务
 * @param document - document对象
 * @param transactionId - 事务ID
 * @returns 是否成功
 */
export const commitTransaction = (document: Document, transactionId: string): boolean => {
  const state = getDocumentDBState(document);
  if (!state) return false;

  const transaction = findTransaction(state, transactionId);
  if (!transaction) return false;

  // 执行所有操作
  for (const operation of transaction.operations) {
    executeOperation(state, operation);
  }

  // 移除事务
  removeTransaction(state, transactionId);
  return true;
};

/**
 * 回滚事务
 * @param document - document对象
 * @param transactionId - 事务ID
 * @returns 是否成功
 */
export const rollbackTransaction = (document: Document, transactionId: string): boolean => {
  const state = getDocumentDBState(document);
  if (!state) return false;

  const transaction = findTransaction(state, transactionId);
  if (!transaction) return false;

  // 恢复快照
  restoreSnapshot(state, transaction.snapshot);

  // 移除事务
  removeTransaction(state, transactionId);
  return true;
};

/**
 * 获取事务状态
 * @param document - document对象
 * @returns 事务状态
 */
export const getTransactionStatus = (document: Document): TransactionStatus => {
  const state = getDocumentDBState(document);
  if (!state) {
    return {
      isInTransaction: false,
      activeTransactions: 0,
      transactionIds: []
    };
  }

  return {
    isInTransaction: state.isInTransaction,
    activeTransactions: state.transactionStack.length,
    transactionIds: state.transactionStack.map(tx => tx.id)
  };
};

/**
 * 检查是否在事务中
 * @param document - document对象
 * @returns 是否在事务中
 */
export const isInTransaction = (document: Document): boolean => {
  const state = getDocumentDBState(document);
  return state ? state.isInTransaction : false;
};

/**
 * 在事务中获取数据
 * @param document - document对象
 * @param key - 键名
 * @returns 值或null
 */
export const getTransactionData = (document: Document, key: string): any => {
  const state = getDocumentDBState(document);
  if (!state || !state.isInTransaction) {
    return null;
  }

  // 查找当前事务中的操作
  const currentTransaction = state.transactionStack[state.transactionStack.length - 1];
  if (!currentTransaction) {
    return null;
  }

  // 从最新的操作开始查找
  for (let i = currentTransaction.operations.length - 1; i >= 0; i--) {
    const operation = currentTransaction.operations[i];
    if (operation.type === 'set' && operation.key === key) {
      return operation.value;
    }
    if (operation.type === 'delete' && operation.key === key) {
      return null;
    }
  }

  // 如果事务中没有相关操作，返回原始数据
  return getData(document, key);
};

/**
 * 在事务中设置数据
 * @param document - document对象
 * @param key - 键名
 * @param value - 值
 * @returns 是否设置成功
 */
export const setTransactionData = (document: Document, key: string, value: any): boolean => {
  const state = getDocumentDBState(document);
  if (!state || !state.isInTransaction) {
    return false;
  }

  const currentTransaction = state.transactionStack[state.transactionStack.length - 1];
  if (!currentTransaction) {
    return false;
  }

  // 添加设置操作到事务中
  currentTransaction.operations.push({
    type: 'set',
    key,
    value,
    detectedType: detectType(value),
    version: '1.0',
    meta: {}
  });

  return true;
};

// 私有辅助函数

/**
 * 查找事务
 * @param state - DocumentDB状态
 * @param transactionId - 事务ID
 * @returns 事务对象
 */
const findTransaction = (state: DocumentDBState, transactionId: string): Transaction | undefined => {
  return state.transactionStack.find(tx => tx.id === transactionId);
};

/**
 * 移除事务
 * @param state - DocumentDB状态
 * @param transactionId - 事务ID
 */
const removeTransaction = (state: DocumentDBState, transactionId: string): void => {
  const index = state.transactionStack.findIndex(tx => tx.id === transactionId);
  if (index !== -1) {
    state.transactionStack.splice(index, 1);
    state.isInTransaction = state.transactionStack.length > 0;
  }
};

/**
 * 创建快照
 * @param state - DocumentDB状态
 * @returns 快照对象
 */
const createSnapshot = (state: DocumentDBState): Record<string, { value: any; type: string }> => {
  const snapshot: Record<string, { value: any; type: string }> = {};
  const elements = state.root.querySelectorAll('[data-key]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-key');
    const type = element.getAttribute('data-type');
    const content = element.textContent?.trim() || '';
    const value = parseElementContent(content, type);
    if (key) {
      snapshot[key] = { value, type: type || 'string' };
    }
  });
  
  return snapshot;
};

/**
 * 恢复快照
 * @param state - DocumentDB状态
 * @param snapshot - 快照对象
 */
const restoreSnapshot = (state: DocumentDBState, snapshot: Record<string, { value: any; type: string }>): void => {
  executeClear(state);
  Object.entries(snapshot).forEach(([key, { value, type }]) => {
    executeSet(state, key, value, type, '1.0', {});
  });
};

/**
 * 执行操作
 * @param state - DocumentDB状态
 * @param operation - 操作对象
 */
const executeOperation = (state: DocumentDBState, operation: Operation): void => {
  switch (operation.type) {
    case 'set':
      if (operation.key && operation.detectedType) {
        executeSet(state, operation.key, operation.value, operation.detectedType, operation.version || '1.0', operation.meta || {});
      }
      break;
    case 'delete':
      if (operation.key) {
        executeDelete(state, operation.key);
      }
      break;
    case 'clear':
      executeClear(state);
      break;
  }
}; 