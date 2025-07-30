import { TransactionStatus } from './types';
/**
 * 开始事务
 * @param document - document对象
 * @returns 事务ID
 */
export declare const beginTransaction: (document: Document) => string;
/**
 * 提交事务
 * @param document - document对象
 * @param transactionId - 事务ID
 * @returns 是否成功
 */
export declare const commitTransaction: (document: Document, transactionId: string) => boolean;
/**
 * 回滚事务
 * @param document - document对象
 * @param transactionId - 事务ID
 * @returns 是否成功
 */
export declare const rollbackTransaction: (document: Document, transactionId: string) => boolean;
/**
 * 获取事务状态
 * @param document - document对象
 * @returns 事务状态
 */
export declare const getTransactionStatus: (document: Document) => TransactionStatus;
/**
 * 检查是否在事务中
 * @param document - document对象
 * @returns 是否在事务中
 */
export declare const isInTransaction: (document: Document) => boolean;
/**
 * 在事务中获取数据
 * @param document - document对象
 * @param key - 键名
 * @returns 值或null
 */
export declare const getTransactionData: (document: Document, key: string) => any;
/**
 * 在事务中设置数据
 * @param document - document对象
 * @param key - 键名
 * @param value - 值
 * @returns 是否设置成功
 */
export declare const setTransactionData: (document: Document, key: string, value: any) => boolean;
