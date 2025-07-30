/**
 * DocumentDB - 工具函数
 * 包含数据类型检测、元素内容处理等纯函数
 */
/**
 * 检测数据类型
 * @param value - 数据值
 * @returns 数据类型
 */
export declare const detectType: (value: any) => string;
/**
 * 设置元素内容
 * @param element - 元素
 * @param value - 数据值
 * @param type - 数据类型
 */
export declare const setElementContent: (element: HTMLElement, value: any, type: string) => void;
/**
 * 解析元素内容
 * @param content - 内容字符串
 * @param type - 数据类型
 * @returns 解析后的值
 */
export declare const parseElementContent: (content: string, type: string | null) => any;
/**
 * 获取或创建根元素
 * @param document - document对象
 * @param rootId - 根元素ID
 * @returns 根元素
 */
export declare const getOrCreateRoot: (document: Document, rootId: string) => HTMLElement;
/**
 * 获取或创建数据元素
 * @param root - 根元素
 * @param document - document对象
 * @param key - 数据键
 * @returns 数据元素
 */
export declare const getOrCreateElement: (root: HTMLElement, document: Document, key: string) => HTMLElement;
