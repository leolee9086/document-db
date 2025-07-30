import { DocumentDBState, ExportDocumentOptions } from './types';
import { HTMLSaveOptions } from './file-handler';
/**
 * DocumentDB类
 * 提供完整的文档数据库功能封装
 */
export declare class DocumentDB {
    private document;
    private state;
    /**
     * 创建DocumentDB实例
     * @param document - Document对象
     * @param rootId - 根元素ID，默认为'document-db'
     */
    constructor(document: Document, rootId?: string);
    /**
     * 获取当前状态
     */
    getState(): DocumentDBState;
    /**
     * 获取根元素ID
     */
    getRootId(): string;
    /**
     * 设置数据
     * @param key - 键名
     * @param value - 值
     */
    setData(key: string, value: any): void;
    /**
     * 获取数据
     * @param key - 键名
     * @returns 值或null
     */
    getData(key: string): any;
    /**
     * 检查数据是否存在
     * @param key - 键名
     * @returns 是否存在
     */
    hasData(key: string): boolean;
    /**
     * 删除数据
     * @param key - 键名
     */
    deleteData(key: string): void;
    /**
     * 列出所有数据键
     * @returns 键名数组
     */
    listDataKeys(): string[];
    /**
     * 清空所有数据
     */
    clearData(): void;
    /**
     * 开始事务
     * @returns 事务ID
     */
    beginTransaction(): string;
    /**
     * 提交事务
     * @param transactionId - 事务ID
     * @returns 是否提交成功
     */
    commitTransaction(transactionId: string): boolean;
    /**
     * 回滚事务
     * @param transactionId - 事务ID
     * @returns 是否回滚成功
     */
    rollbackTransaction(transactionId: string): boolean;
    /**
     * 检查是否在事务中
     * @returns 是否在事务中
     */
    isInTransaction(): boolean;
    /**
     * 在事务中获取数据
     * @param key - 键名
     * @returns 值或null
     */
    getTransactionData(key: string): any;
    /**
     * 在事务中设置数据
     * @param key - 键名
     * @param value - 值
     * @returns 是否设置成功
     */
    setTransactionData(key: string, value: any): boolean;
    /**
     * 导出整个数据库
     * @returns 导出的HTML字符串
     */
    exportDatabase(): string;
    /**
     * 导出完整文档
     * @param options - 导出选项
     * @returns 完整HTML文档字符串
     */
    exportDocument(options?: ExportDocumentOptions): string;
    /**
     * 导入数据库
     * @param htmlData - HTML数据
     */
    importDatabase(htmlData: string): void;
    /**
     * 克隆数据库到新文档
     * @param targetDocument - 目标文档
     * @returns 新的DocumentDB实例或null
     */
    cloneDatabase(targetDocument: Document): DocumentDB | null;
    /**
     * 保存为HTML文件
     * @param options - 保存选项
     * @returns 是否保存成功
     */
    saveAsHTML(options?: HTMLSaveOptions): Promise<boolean>;
    /**
     * 从HTML文件加载
     * @param options - 加载选项
     * @returns 是否加载成功
     */
    loadFromHTML(options?: {
        clearExisting?: boolean;
    }): Promise<boolean>;
    /**
     * 获取数据库信息
     * @returns 数据库信息对象
     */
    getInfo(): {
        rootId: string;
        dataCount: number;
        isInTransaction: boolean;
        keys: string[];
    };
    /**
     * 销毁DocumentDB实例
     * 清理所有数据和状态
     */
    destroy(): void;
    /**
     * 静态方法：从现有文档获取DocumentDB实例
     * @param document - Document对象
     * @returns DocumentDB实例或null
     */
    static fromDocument(document: Document): DocumentDB | null;
    /**
     * 静态方法：检查文档是否包含DocumentDB
     * @param document - Document对象
     * @returns 是否包含DocumentDB
     */
    static hasDocumentDB(document: Document): boolean;
}
