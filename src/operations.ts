/**
 * DocumentDB - 数据操作
 * 包含数据的增删改查操作
 */

import type { DocumentDBState, DocumentDBOptions } from './types';
import { getDocumentDBState } from './state';
import { detectType, setElementContent, parseElementContent, getOrCreateElement } from './utils';

/**
 * 执行设置操作
 * @param state - DocumentDB状态
 * @param key - 数据键
 * @param value - 数据值
 * @param detectedType - 检测到的类型
 * @param version - 版本
 * @param meta - 元数据
 */
export const executeSet = (state: DocumentDBState, key: string, value: any, detectedType: string, version: string, meta: Record<string, any>): void => {
  const element = getOrCreateElement(state.root, state.document, key);
  
  // 批量设置属性，减少DOM操作
  const attributes: Record<string, string> = {
    'data-type': detectedType,
    'data-version': version,
    'data-created': new Date().toISOString()
  };
  
  // 添加meta属性
  Object.entries(meta).forEach(([k, v]) => {
    attributes[`data-${k}`] = String(v);
  });

  // 一次性设置所有属性
  Object.entries(attributes).forEach(([attr, value]) => {
    element.setAttribute(attr, value);
  });

  setElementContent(element, value, detectedType);
};

/**
 * 执行删除操作
 * @param state - DocumentDB状态
 * @param key - 数据键
 */
export const executeDelete = (state: DocumentDBState, key: string): void => {
  const element = state.root.querySelector(`[data-key="${key}"]`);
  if (element) element.remove();
};

/**
 * 执行清空操作
 * @param state - DocumentDB状态
 */
export const executeClear = (state: DocumentDBState): void => {
  // 使用更高效的方式清空
  const elements = state.root.querySelectorAll('[data-key]');
  if (elements.length > 0) {
    // 批量移除，减少重绘
    const fragment = state.document.createDocumentFragment();
    elements.forEach(el => fragment.appendChild(el));
    // fragment被丢弃时元素自动从DOM中移除
  }
};

/**
 * 设置数据（支持事务）
 * @param document - document对象
 * @param key - 数据键
 * @param value - 数据值
 * @param options - 选项
 */
export const setData = (document: Document, key: string, value: any, options: DocumentDBOptions = {}): void => {
  const state = getDocumentDBState(document);
  if (!state) throw new Error('DocumentDB state not found');

  const { type = 'auto', version = '1.0', ...meta } = options;
  const detectedType = type === 'auto' ? detectType(value) : (type || 'string');
  
  if (state.isInTransaction) {
    // 在事务中，记录操作但不立即执行
    const currentTransaction = state.transactionStack[state.transactionStack.length - 1];
    currentTransaction.operations.push({
      type: 'set',
      key,
      value,
      detectedType,
      version,
      meta
    });
  } else {
    // 直接执行
    executeSet(state, key, value, detectedType, version, meta);
  }
};

/**
 * 获取数据
 * @param document - document对象
 * @param key - 数据键
 * @param defaultValue - 默认值
 * @returns 数据值
 */
export const getData = (document: Document, key: string, defaultValue: any = null): any => {
  const state = getDocumentDBState(document);
  if (!state) return defaultValue;

  const element = state.root.querySelector(`[data-key="${key}"]`);
  if (!element) return defaultValue;
  
  const type = element.getAttribute('data-type');
  const content = element.textContent?.trim() || '';
  return parseElementContent(content, type);
};

/**
 * 删除数据（支持事务）
 * @param document - document对象
 * @param key - 数据键
 */
export const deleteData = (document: Document, key: string): void => {
  const state = getDocumentDBState(document);
  if (!state) throw new Error('DocumentDB state not found');

  if (state.isInTransaction) {
    // 在事务中，记录操作但不立即执行
    const currentTransaction = state.transactionStack[state.transactionStack.length - 1];
    currentTransaction.operations.push({
      type: 'delete',
      key
    });
  } else {
    // 直接执行
    executeDelete(state, key);
  }
};

/**
 * 检查数据是否存在
 * @param document - document对象
 * @param key - 数据键
 * @returns 是否存在
 */
export const hasData = (document: Document, key: string): boolean => {
  const state = getDocumentDBState(document);
  if (!state) return false;

  return state.root.querySelector(`[data-key="${key}"]`) !== null;
};

/**
 * 列出所有数据键
 * @param document - document对象
 * @returns 数据键数组
 */
export const listDataKeys = (document: Document): string[] => {
  const state = getDocumentDBState(document);
  if (!state) return [];

  const elements = state.root.querySelectorAll('[data-key]');
  return Array.from(elements).map(el => el.getAttribute('data-key') || '');
};

/**
 * 清空所有数据（支持事务）
 * @param document - document对象
 */
export const clearData = (document: Document): void => {
  const state = getDocumentDBState(document);
  if (!state) throw new Error('DocumentDB state not found');

  if (state.isInTransaction) {
    // 在事务中，记录操作但不立即执行
    const currentTransaction = state.transactionStack[state.transactionStack.length - 1];
    currentTransaction.operations.push({
      type: 'clear'
    });
  } else {
    // 直接执行
    executeClear(state);
  }
}; 