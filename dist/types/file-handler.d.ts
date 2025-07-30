/**
 * DocumentDB - 文件处理模块
 * 包含HTML保存和文件选择功能
 */
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
export declare const saveAsHTML: (document: Document, options?: HTMLSaveOptions) => Promise<boolean>;
/**
 * 选择并加载HTML文件
 * @param document - 当前document对象
 * @param options - 文件选择选项
 * @returns Promise<boolean> - 是否加载成功
 */
export declare const loadFromHTML: (document: Document, options?: {
    clearExisting?: boolean;
}) => Promise<boolean>;
