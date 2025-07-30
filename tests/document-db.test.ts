import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // 使用真实的HTML页面而不是about:blank
  await page.goto('http://127.0.0.1:3000/');
  
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
  
  // 使用ES模块导入，然后暴露到全局
  try {
    await page.addScriptTag({ 
      type: 'module',
      content: `
        import * as DocumentDB from '/dist/document-db.es.js';
        window.DocumentDB = DocumentDB;
        console.log('DocumentDB loaded successfully:', Object.keys(DocumentDB));
      `
    });
    
    // 等待库加载完成
    await page.waitForFunction(() => {
      // 检查是否有全局的DocumentDB对象
      return typeof (window as any).DocumentDB !== 'undefined';
    }, { timeout: 10000 });
    
  } catch (error) {
    console.error('Error in beforeEach:', error);
    throw error;
  }
});

test('DocumentDB should be defined and accessible in the browser', async ({ page }) => {
  const isDocumentDBDefined = await page.evaluate(() => {
    return typeof (window as any).DocumentDB !== 'undefined';
  });
  expect(isDocumentDBDefined).toBe(true);
});

test('createDocumentDBState should create a new state object and root element', async ({ page }) => {
  const rootId = 'new-db-state-root';
  const state = await page.evaluate((id) => {
    const { createDocumentDBState } = (window as any).DocumentDB;
    const state = createDocumentDBState(document, id);
    return {
      rootId: state.rootId,
      rootExists: !!document.getElementById(id),
      rootDisplay: document.getElementById(id)?.style.display
    };
  }, rootId);

  expect(state.rootId).toBe(rootId);
  expect(state.rootExists).toBe(true);
  expect(state.rootDisplay).toBe('none');
});

test('getDocumentDBState should return the existing state', async ({ page }) => {
  const rootId = 'existing-db-state-root';
  const result = await page.evaluate((id) => {
    const { createDocumentDBState, getDocumentDBState } = (window as any).DocumentDB;
    const createdState = createDocumentDBState(document, id);
    const retrievedState = getDocumentDBState(document);
    return {
      createdRootId: createdState.rootId,
      retrievedRootId: retrievedState?.rootId,
      statesMatch: createdState.rootId === retrievedState?.rootId
    };
  }, rootId);

  expect(result.createdRootId).toBe(rootId);
  expect(result.retrievedRootId).toBe(rootId);
  expect(result.statesMatch).toBe(true);
});

test('getDocumentDBState should return undefined if state does not exist', async ({ page }) => {
  const result = await page.evaluate(() => {
    const { getDocumentDBState } = (window as any).DocumentDB;
    return getDocumentDBState(document);
  });

  expect(result).toBeUndefined();
});

test('setData and getData should work correctly', async ({ page }) => {
  const rootId = 'data-test-root';
  const testData = await page.evaluate((id) => {
    const { createDocumentDBState, setData, getData } = (window as any).DocumentDB;
    const state = createDocumentDBState(document, id);
    
    // 测试不同类型的数据
    setData(document, 'string-key', 'hello world');
    setData(document, 'number-key', 42);
    setData(document, 'boolean-key', true);
    setData(document, 'object-key', { name: 'test', value: 123 });
    
    return {
      stringValue: getData(document, 'string-key'),
      numberValue: getData(document, 'number-key'),
      booleanValue: getData(document, 'boolean-key'),
      objectValue: getData(document, 'object-key'),
      nonExistentValue: getData(document, 'non-existent-key', 'default')
    };
  }, rootId);

  expect(testData.stringValue).toBe('hello world');
  expect(testData.numberValue).toBe(42);
  expect(testData.booleanValue).toBe(true);
  expect(testData.objectValue).toEqual({ name: 'test', value: 123 });
  expect(testData.nonExistentValue).toBe('default');
});

test('hasData should work correctly', async ({ page }) => {
  const rootId = 'has-data-test-root';
  const result = await page.evaluate((id) => {
    const { createDocumentDBState, setData, hasData } = (window as any).DocumentDB;
    const state = createDocumentDBState(document, id);
    
    setData(document, 'test-key', 'test-value');
    
    return {
      hasExistingKey: hasData(document, 'test-key'),
      hasNonExistentKey: hasData(document, 'non-existent-key')
    };
  }, rootId);

  expect(result.hasExistingKey).toBe(true);
  expect(result.hasNonExistentKey).toBe(false);
});

test('deleteData should work correctly', async ({ page }) => {
  const rootId = 'delete-data-test-root';
  const result = await page.evaluate((id) => {
    const { createDocumentDBState, setData, deleteData, hasData, getData } = (window as any).DocumentDB;
    const state = createDocumentDBState(document, id);
    
    setData(document, 'key-to-delete', 'value-to-delete');
    setData(document, 'key-to-keep', 'value-to-keep');
    
    const beforeDelete = {
      hasKeyToDelete: hasData(document, 'key-to-delete'),
      hasKeyToKeep: hasData(document, 'key-to-keep')
    };
    
    deleteData(document, 'key-to-delete');
    
    const afterDelete = {
      hasKeyToDelete: hasData(document, 'key-to-delete'),
      hasKeyToKeep: hasData(document, 'key-to-keep'),
      deletedValue: getData(document, 'key-to-delete')
    };
    
    return { beforeDelete, afterDelete };
  }, rootId);

  expect(result.beforeDelete.hasKeyToDelete).toBe(true);
  expect(result.beforeDelete.hasKeyToKeep).toBe(true);
  expect(result.afterDelete.hasKeyToDelete).toBe(false);
  expect(result.afterDelete.hasKeyToKeep).toBe(true);
  expect(result.afterDelete.deletedValue).toBeNull();
});

test('listDataKeys should work correctly', async ({ page }) => {
  const rootId = 'list-keys-test-root';
  const result = await page.evaluate((id) => {
    const { createDocumentDBState, setData, listDataKeys } = (window as any).DocumentDB;
    const state = createDocumentDBState(document, id);
    
    setData(document, 'key1', 'value1');
    setData(document, 'key2', 'value2');
    setData(document, 'key3', 'value3');
    
    return listDataKeys(document);
  }, rootId);

  expect(result).toContain('key1');
  expect(result).toContain('key2');
  expect(result).toContain('key3');
  expect(result.length).toBe(3);
});

test('clearData should work correctly', async ({ page }) => {
  const rootId = 'clear-data-test-root';
  const result = await page.evaluate((id) => {
    const { createDocumentDBState, setData, clearData, listDataKeys } = (window as any).DocumentDB;
    const state = createDocumentDBState(document, id);
    
    setData(document, 'key1', 'value1');
    setData(document, 'key2', 'value2');
    
    const beforeClear = listDataKeys(document);
    clearData(document);
    const afterClear = listDataKeys(document);
    
    return { beforeClear, afterClear };
  }, rootId);

  expect(result.beforeClear.length).toBe(2);
  expect(result.afterClear.length).toBe(0);
});

test('transaction operations should work correctly', async ({ page }) => {
  const rootId = 'transaction-test-root';
  const result = await page.evaluate((id) => {
    const { 
      createDocumentDBState, 
      setData, 
      getData, 
      beginTransaction, 
      commitTransaction, 
      rollbackTransaction,
      getTransactionStatus 
    } = (window as any).DocumentDB;
    
    const state = createDocumentDBState(document, id);
    
    // 设置初始数据
    setData(document, 'initial-key', 'initial-value');
    
    // 开始事务
    const txId = beginTransaction(document);
    const statusBefore = getTransactionStatus(document);
    
    // 在事务中修改数据
    setData(document, 'transaction-key', 'transaction-value');
    setData(document, 'initial-key', 'modified-value');
    
    // 在事务中，数据还没有写入DOM，所以getData应该返回null或原始值
    const valueInTransaction = getData(document, 'transaction-key');
    const modifiedValueInTransaction = getData(document, 'initial-key');
    
    // 提交事务
    const commitResult = commitTransaction(document, txId);
    const statusAfter = getTransactionStatus(document);
    
    // 提交后，数据应该可以读取
    const valueAfterCommit = getData(document, 'transaction-key');
    const modifiedValueAfterCommit = getData(document, 'initial-key');
    
    return {
      txId,
      statusBefore,
      statusAfter,
      valueInTransaction,
      modifiedValueInTransaction,
      commitResult,
      valueAfterCommit,
      modifiedValueAfterCommit
    };
  }, rootId);

  expect(result.txId).toBeTruthy();
  expect(result.statusBefore.isInTransaction).toBe(true);
  expect(result.statusAfter.isInTransaction).toBe(false);
  // 在事务中，数据还没有写入DOM，所以应该返回null
  expect(result.valueInTransaction).toBeNull();
  // 在事务中，修改的数据还没有写入DOM，所以应该返回原始值
  expect(result.modifiedValueInTransaction).toBe('initial-value');
  expect(result.commitResult).toBe(true);
  // 提交后，数据应该可以读取
  expect(result.valueAfterCommit).toBe('transaction-value');
  expect(result.modifiedValueAfterCommit).toBe('modified-value');
});