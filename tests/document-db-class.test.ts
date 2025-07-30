import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // 使用demo.html页面
  await page.goto('http://127.0.0.1:3000/demo.html');

  // 监听控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser console error:', msg.text());
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });

  // 等待DocumentDB加载完成
  try {
    await page.waitForFunction(() => {
      const docDB = (window as any).DocumentDB;
      return docDB !== undefined && docDB !== null;
    }, { timeout: 10000 });

  } catch (error) {
    console.error('Error in beforeEach:', error);
    throw error;
  }
});

test('DocumentDB class should work correctly', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { DocumentDB } = (window as any).DocumentDB;
    
    // 创建DocumentDB实例
    const db = new DocumentDB(document, 'class-test-db');
    
    // 测试基本数据操作
    db.setData('test-key', 'test-value');
    db.setData('test-object', { name: 'test', value: 123 });
    
    const value1 = db.getData('test-key');
    const value2 = db.getData('test-object');
    const hasData = db.hasData('test-key');
    const keys = db.listDataKeys();
    const info = db.getInfo();
    
    return {
      value1,
      value2,
      hasData,
      keys,
      info
    };
  });

  expect(result.value1).toBe('test-value');
  expect(result.value2).toEqual({ name: 'test', value: 123 });
  expect(result.hasData).toBe(true);
  expect(result.keys).toContain('test-key');
  expect(result.keys).toContain('test-object');
  expect(result.info.rootId).toBe('class-test-db');
  expect(result.info.dataCount).toBe(2);
  expect(result.info.isInTransaction).toBe(false);
});

test('DocumentDB class should handle transactions', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { DocumentDB } = (window as any).DocumentDB;
    
    const db = new DocumentDB(document, 'transaction-test-db');
    
    // 设置初始数据
    db.setData('initial', 'value');
    
    // 开始事务
    const txId = db.beginTransaction();
    
    // 在事务中设置数据
    db.setTransactionData('transaction-key', 'transaction-value');
    
    // 检查事务状态
    const inTransaction = db.isInTransaction();
    const txData = db.getTransactionData('transaction-key');
    const originalData = db.getData('transaction-key'); // 应该为null，因为还没提交
    
    // 提交事务
    const committed = db.commitTransaction(txId);
    
    // 检查提交后的数据
    const finalData = db.getData('transaction-key');
    const finalInTransaction = db.isInTransaction();
    
    return {
      txId,
      inTransaction,
      txData,
      originalData,
      committed,
      finalData,
      finalInTransaction
    };
  });

  expect(result.txId).toBeTruthy();
  expect(result.inTransaction).toBe(true);
  expect(result.txData).toBe('transaction-value');
  expect(result.originalData).toBeNull();
  expect(result.committed).toBe(true);
  expect(result.finalData).toBe('transaction-value');
  expect(result.finalInTransaction).toBe(false);
});

test('DocumentDB class should handle static methods', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { DocumentDB } = (window as any).DocumentDB;
    
    // 先创建一个DocumentDB实例
    const db = new DocumentDB(document, 'static-test-db');
    db.setData('static-test', 'static-value');
    
    // 测试静态方法
    const hasDB = DocumentDB.hasDocumentDB(document);
    const fromDoc = DocumentDB.fromDocument(document);
    
    return {
      hasDB,
      fromDocExists: fromDoc !== null,
      fromDocRootId: fromDoc?.getRootId()
    };
  });

  expect(result.hasDB).toBe(true);
  expect(result.fromDocExists).toBe(true);
  expect(result.fromDocRootId).toBe('static-test-db');
});

test('DocumentDB class should handle file operations', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { DocumentDB } = (window as any).DocumentDB;
    
    const db = new DocumentDB(document, 'file-test-db');
    db.setData('file-test', 'file-value');
    
    // 测试导出功能
    const exportedDB = db.exportDatabase();
    const exportedDoc = db.exportDocument();
    
    return {
      exportedDB: typeof exportedDB,
      exportedDoc: typeof exportedDoc,
      exportedDBContains: exportedDB.includes('file-test'),
      exportedDocContains: exportedDoc.includes('file-test')
    };
  });

  expect(result.exportedDB).toBe('string');
  expect(result.exportedDoc).toBe('string');
  expect(result.exportedDBContains).toBe(true);
  expect(result.exportedDocContains).toBe(true);
}); 