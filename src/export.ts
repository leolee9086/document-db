/**
 * DocumentDB - 导出相关
 * 包含数据库导出、文档导出、导入等功能
 */

import type { ExportDocumentOptions, DocumentDBState } from './types';
import { getDocumentDBState, createDocumentDBState } from './state';
import { setData, clearData } from './operations';
import { parseElementContent } from './utils';

/**
 * 导出数据库（返回根元素outerHTML）
 * @param document - document对象
 * @returns HTML字符串
 */
export const exportDatabase = (document: Document): string => {
  const state = getDocumentDBState(document);
  if (!state) return '';

  return state.root.outerHTML;
};

/**
 * 导出完整文档（返回包含数据库的完整HTML文档）
 * @param document - document对象
 * @param options - 导出选项
 * @returns 完整HTML文档字符串
 */
export const exportDocument = (document: Document, options: ExportDocumentOptions = {}): string => {
  const state = getDocumentDBState(document);
  if (!state) return '';

  const {
    title = 'DocumentDB Export',
    charset = 'UTF-8',
  } = options;

  // 创建新文档
  const newDoc = document.implementation.createHTMLDocument(title);
  
  // 设置charset
  let metaCharset = newDoc.querySelector('meta[charset]');
  if (!metaCharset) {
    metaCharset = newDoc.createElement('meta');
    metaCharset.setAttribute('charset', charset);
    newDoc.head.insertBefore(metaCharset, newDoc.head.firstChild);
  } else {
    metaCharset.setAttribute('charset', charset);
  }
  
  // 设置title
  newDoc.title = title;
  
  // 添加样式
  const style = newDoc.createElement('style');
  style.textContent = `
#${state.rootId} { display: none !important; }
#${state.rootId} [data-key] { display: none !important; }
`;
  newDoc.head.appendChild(style);
  
  // 复制body内容
  newDoc.body.innerHTML = document.body.innerHTML;
  
  // 确保数据库元素存在且不可见
  let dbRoot = newDoc.getElementById(state.rootId);
  if (!dbRoot) {
    dbRoot = newDoc.createElement('span');
    dbRoot.id = state.rootId;
    dbRoot.style.display = 'none';
    newDoc.body.appendChild(dbRoot);
  }
  
  // 用当前数据库内容覆盖
  dbRoot.innerHTML = state.root.innerHTML;
  
  // 返回完整HTML（含DOCTYPE）
  return '<!DOCTYPE html>\n' + newDoc.documentElement.outerHTML;
};

/**
 * 导入数据库（用新HTML替换根元素内容）
 * @param document - document对象
 * @param htmlData - HTML数据
 */
export const importDatabase = (document: Document, htmlData: string): void => {
  const state = getDocumentDBState(document);
  if (!state) throw new Error('DocumentDB state not found');

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlData, 'text/html');
  const dbElement = doc.getElementById(state.rootId);
  
  if (dbElement) {
    clearData(document);
    dbElement.querySelectorAll('[data-key]').forEach(element => {
      const key = element.getAttribute('data-key');
      const type = element.getAttribute('data-type');
      const content = element.textContent?.trim() || '';
      const value = parseElementContent(content, type);
      if (key) {
        setData(document, key, value, { type: type || 'auto' });
      }
    });
  }
};

/**
 * 克隆数据库（返回新DocumentDB状态）
 * @param document - document对象
 * @returns 新的DocumentDB状态
 */
export const cloneDatabase = (document: Document): DocumentDBState => {
  const state = getDocumentDBState(document);
  if (!state) throw new Error('DocumentDB state not found');

  const newDocument = document.cloneNode(true) as Document;
  return createDocumentDBState(newDocument, state.rootId);
}; 