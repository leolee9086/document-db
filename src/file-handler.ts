/**
 * DocumentDB - 文件处理模块
 * 包含HTML保存和文件选择功能
 */

import type { DocumentDBState } from './types';
import { createDocumentDBState, getDocumentDBState } from './state';
import { setData, getData, listDataKeys } from './operations';

/**
 * HTML保存选项
 */
export interface HTMLSaveOptions {
  /** 文件名 */
  filename?: string;
  /** 是否包含DocumentDB根元素 */
  includeDBRoot?: boolean;
  /** 自定义样式 */
  customStyles?: string;
}

/**
 * 保存当前DocumentDB状态为HTML文件
 * @param document - 当前document对象
 * @param options - 保存选项
 * @returns Promise<boolean> - 是否保存成功
 */
export const saveAsHTML = async (document: Document, options: HTMLSaveOptions = {}): Promise<boolean> => {
  try {
    const {
      filename = `document-db-${Date.now()}.html`,
      includeDBRoot = true,
      customStyles = ''
    } = options;

    // 1. 构建HTML内容
    const htmlContent = buildHTMLContent(document, includeDBRoot, customStyles);
    
    // 2. 创建并下载文件
    return downloadFile(htmlContent, filename, 'text/html');
  } catch (error) {
    // 静默处理错误，返回false表示失败
    return false;
  }
};

/**
 * 构建HTML内容
 * @param document - 原始document对象
 * @param includeDBRoot - 是否包含DocumentDB根元素
 * @param customStyles - 自定义样式
 * @returns HTML字符串
 */
const buildHTMLContent = (document: Document, includeDBRoot: boolean, customStyles: string): string => {
  // 在函数内部克隆document以避免修改原始文档
  const clonedDocument = document.cloneNode(true) as Document;
  
  // 如果需要包含DB根元素，则重建DocumentDB状态
  if (includeDBRoot) {
    // 获取当前DocumentDB状态并在克隆文档中重建
    const currentState = getDocumentDBState(document);
    if (!currentState) {
      throw new Error('DocumentDB state not found');
    }
    
    // 在克隆的文档中创建新的DocumentDB状态
    const clonedState = createDocumentDBState(clonedDocument, currentState.rootId);
    
    // 将当前数据写入克隆的DocumentDB
    const dataKeys = listDataKeys(document);
    for (const key of dataKeys) {
      const value = getData(document, key);
      if (value !== null) {
        setData(clonedDocument, key, value);
      }
    }
  } else {
    // 如果不需要包含DB根元素，则移除指定的根元素
    // 获取当前DocumentDB状态的rootId
    const currentState = getDocumentDBState(document);
    if (currentState) {
      const rootElement = clonedDocument.getElementById(currentState.rootId);
      if (rootElement) {
        rootElement.remove();
      }
    }
  }

  // 添加自定义样式
  if (customStyles) {
    const head = clonedDocument.head;
    const styleElement = clonedDocument.createElement('style');
    styleElement.textContent = customStyles;
    head.appendChild(styleElement);
  }

  // 手动构建完整的HTML文档，包含DOCTYPE声明
  const doctype = '<!DOCTYPE html>';
  const htmlContent = clonedDocument.documentElement.outerHTML;
  return doctype + '\n' + htmlContent;
};

/**
 * 下载文件
 * @param content - 文件内容
 * @param filename - 文件名
 * @param mimeType - MIME类型
 * @returns Promise<boolean> - 是否下载成功
 */
const downloadFile = (content: string, filename: string, mimeType: string): boolean => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('下载文件失败:', error);
    return false;
  }
};

/**
 * 选择并加载HTML文件
 * @param document - 当前document对象
 * @param options - 文件选择选项
 * @returns Promise<boolean> - 是否加载成功
 */
export const loadFromHTML = async (document: Document, options: { clearExisting?: boolean } = {}): Promise<boolean> => {
  try {
    const { clearExisting = true } = options;
    
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.html,.htm';
    fileInput.style.display = 'none';
    
    return new Promise((resolve) => {
      fileInput.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          resolve(false);
          return;
        }

        try {
          const content = await readFileAsText(file);
          const success = parseAndLoadHTML(document, content, clearExisting);
          resolve(success);
        } catch (error) {
          console.error('加载HTML文件失败:', error);
          resolve(false);
        } finally {
          document.body.removeChild(fileInput);
        }
      };

      fileInput.click();
    });
  } catch (error) {
    console.error('选择文件失败:', error);
    return false;
  }
};

/**
 * 读取文件为文本
 * @param file - 文件对象
 * @returns Promise<string> - 文件内容
 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * 解析并加载HTML内容
 * @param document - 当前document对象
 * @param htmlContent - HTML内容
 * @param clearExisting - 是否清除现有数据
 * @returns boolean - 是否加载成功
 */
const parseAndLoadHTML = (document: Document, htmlContent: string, clearExisting: boolean): boolean => {
  try {
    // 创建临时DOM解析器
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(htmlContent, 'text/html');
    
    // 查找DocumentDB根元素
    const dbRoot = parsedDocument.querySelector('[id*="document-db"]');
    if (!dbRoot) {
      console.warn('未找到DocumentDB根元素');
      return false;
    }

    // 获取或创建当前文档的DocumentDB状态
    const currentState = getDocumentDBState(document);
    if (!currentState) {
      console.error('当前文档没有DocumentDB状态');
      return false;
    }

    // 如果清除现有数据，则清空当前根元素
    if (clearExisting) {
      currentState.root.innerHTML = '';
    }

    // 复制DocumentDB数据元素
    const dataElements = dbRoot.querySelectorAll('[data-key]');
    for (const element of dataElements) {
      const key = element.getAttribute('data-key');
      const type = element.getAttribute('data-type');
      const value = element.textContent;
      
      if (key && value !== null) {
        // 根据类型解析值
        let parsedValue: any = value;
        if (type === 'json') {
          try {
            parsedValue = JSON.parse(value);
          } catch {
            parsedValue = value;
          }
        } else if (type === 'number') {
          parsedValue = Number(value);
        } else if (type === 'boolean') {
          parsedValue = value === 'true';
        }
        
        setData(document, key, parsedValue);
      }
    }

    return true;
  } catch (error) {
    console.error('解析HTML失败:', error);
    return false;
  }
}; 