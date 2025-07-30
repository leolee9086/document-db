/**
 * DocumentDB - 工具函数
 * 包含数据类型检测、元素内容处理等纯函数
 */

/**
 * 检测数据类型
 * @param value - 数据值
 * @returns 数据类型
 */
export const detectType = (value: any): string => {
  if (typeof value === 'string') {
    if (value.startsWith('data:image/')) return 'base64';
    if (value.startsWith('{') || value.startsWith('[')) return 'json';
    return 'string';
  }
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value === null) return 'null';
  if (value === undefined) return 'null';
  return 'json';
};

/**
 * 设置元素内容
 * @param element - 元素
 * @param value - 数据值
 * @param type - 数据类型
 */
export const setElementContent = (element: HTMLElement, value: any, type: string): void => {
  let content = '';
  switch (type) {
    case 'json':
      content = JSON.stringify(value);
      break;
    case 'base64':
    case 'string':
      content = String(value);
      break;
    case 'number':
    case 'boolean':
      content = String(value);
      break;
    case 'null':
      content = '';
      break;
    default:
      content = JSON.stringify(value);
  }
  
  // 避免不必要的textContent设置
  if (element.textContent !== content) {
    element.textContent = content;
  }
};

/**
 * 解析元素内容
 * @param content - 内容字符串
 * @param type - 数据类型
 * @returns 解析后的值
 */
export const parseElementContent = (content: string, type: string | null): any => {
  switch (type) {
    case 'json':
      try {
        return JSON.parse(content);
      } catch {
        return content;
      }
    case 'number':
      return Number(content);
    case 'boolean':
      return content === 'true';
    case 'null':
      return null;
    case 'base64':
    case 'string':
    default:
      return content;
  }
};

/**
 * 获取或创建根元素
 * @param document - document对象
 * @param rootId - 根元素ID
 * @returns 根元素
 */
export const getOrCreateRoot = (document: Document, rootId: string): HTMLElement => {
  let root = document.getElementById(rootId);
  if (!root) {
    // 使用更轻量的span元素而不是div
    root = document.createElement('span');
    root.id = rootId;
    // 使用display: none完全避免回流和重绘
    root.style.display = 'none';
    // 使用DocumentFragment减少重绘
    const fragment = document.createDocumentFragment();
    fragment.appendChild(root);
    document.body.appendChild(fragment);
  }
  return root;
};

/**
 * 获取或创建数据元素
 * @param root - 根元素
 * @param document - document对象
 * @param key - 数据键
 * @returns 数据元素
 */
export const getOrCreateElement = (root: HTMLElement, document: Document, key: string): HTMLElement => {
  let element = root.querySelector(`[data-key="${key}"]`) as HTMLElement;
  if (!element) {
    // 使用更轻量的span元素而不是div
    element = document.createElement('span');
    element.setAttribute('data-key', key);
    // 设置display: none避免回流和重绘
    element.style.display = 'none';
    // 批量DOM操作，减少重绘
    root.appendChild(element);
  }
  return element;
}; 