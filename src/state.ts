/**
 * DocumentDB - 状态管理
 * 包含DocumentDB状态的创建和获取
 */

import type { DocumentDBState } from './types';
import { getOrCreateRoot } from './utils';

// 全局状态管理
const dbStates = new WeakMap<Document, DocumentDBState>();

/**
 * 创建DocumentDB状态
 * @param document - 目标document对象
 * @param rootId - 数据库根元素ID
 * @returns DocumentDB状态对象
 */
export const createDocumentDBState = (document: Document, rootId: string = 'document-db'): DocumentDBState => {
  const root = getOrCreateRoot(document, rootId);
  const state: DocumentDBState = {
    document,
    rootId,
    root,
    transactionStack: [],
    isInTransaction: false
  };
  dbStates.set(document, state);
  return state;
};

/**
 * 获取DocumentDB状态
 * @param document - document对象
 * @returns DocumentDB状态对象
 */
export const getDocumentDBState = (document: Document): DocumentDBState | undefined => {
  return dbStates.get(document);
}; 