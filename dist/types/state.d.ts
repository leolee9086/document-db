import { DocumentDBState } from './types';
/**
 * 创建DocumentDB状态
 * @param document - 目标document对象
 * @param rootId - 数据库根元素ID
 * @returns DocumentDB状态对象
 */
export declare const createDocumentDBState: (document: Document, rootId?: string) => DocumentDBState;
/**
 * 获取DocumentDB状态
 * @param document - document对象
 * @returns DocumentDB状态对象
 */
export declare const getDocumentDBState: (document: Document) => DocumentDBState | undefined;
