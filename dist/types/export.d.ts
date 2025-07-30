import { ExportDocumentOptions, DocumentDBState } from './types';
/**
 * 导出数据库（返回根元素outerHTML）
 * @param document - document对象
 * @returns HTML字符串
 */
export declare const exportDatabase: (document: Document) => string;
/**
 * 导出完整文档（返回包含数据库的完整HTML文档）
 * @param document - document对象
 * @param options - 导出选项
 * @returns 完整HTML文档字符串
 */
export declare const exportDocument: (document: Document, options?: ExportDocumentOptions) => string;
/**
 * 导入数据库（用新HTML替换根元素内容）
 * @param document - document对象
 * @param htmlData - HTML数据
 */
export declare const importDatabase: (document: Document, htmlData: string) => void;
/**
 * 克隆数据库（返回新DocumentDB状态）
 * @param document - document对象
 * @returns 新的DocumentDB状态
 */
export declare const cloneDatabase: (document: Document) => DocumentDBState;
