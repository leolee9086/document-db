import { DocumentDBState, DocumentDBOptions } from './types';
/**
 * 执行设置操作
 * @param state - DocumentDB状态
 * @param key - 数据键
 * @param value - 数据值
 * @param detectedType - 检测到的类型
 * @param version - 版本
 * @param meta - 元数据
 */
export declare const executeSet: (state: DocumentDBState, key: string, value: any, detectedType: string, version: string, meta: Record<string, any>) => void;
/**
 * 执行删除操作
 * @param state - DocumentDB状态
 * @param key - 数据键
 */
export declare const executeDelete: (state: DocumentDBState, key: string) => void;
/**
 * 执行清空操作
 * @param state - DocumentDB状态
 */
export declare const executeClear: (state: DocumentDBState) => void;
/**
 * 设置数据（支持事务）
 * @param document - document对象
 * @param key - 数据键
 * @param value - 数据值
 * @param options - 选项
 */
export declare const setData: (document: Document, key: string, value: any, options?: DocumentDBOptions) => void;
/**
 * 获取数据
 * @param document - document对象
 * @param key - 数据键
 * @param defaultValue - 默认值
 * @returns 数据值
 */
export declare const getData: (document: Document, key: string, defaultValue?: any) => any;
/**
 * 删除数据（支持事务）
 * @param document - document对象
 * @param key - 数据键
 */
export declare const deleteData: (document: Document, key: string) => void;
/**
 * 检查数据是否存在
 * @param document - document对象
 * @param key - 数据键
 * @returns 是否存在
 */
export declare const hasData: (document: Document, key: string) => boolean;
/**
 * 列出所有数据键
 * @param document - document对象
 * @returns 数据键数组
 */
export declare const listDataKeys: (document: Document) => string[];
/**
 * 清空所有数据（支持事务）
 * @param document - document对象
 */
export declare const clearData: (document: Document) => void;
