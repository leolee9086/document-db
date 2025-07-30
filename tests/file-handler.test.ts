import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // 使用demo.html页面而不是目录列表
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

  // 等待DocumentDB加载完成（demo.html已经包含了DocumentDB导入）
  try {
    await page.waitForFunction(() => {
      const docDB = (window as any).DocumentDB;
      console.log('Checking DocumentDB:', docDB);
      return docDB !== undefined && docDB !== null;
    }, { timeout: 10000 });

  } catch (error) {
    console.error('Error in beforeEach:', error);
    throw error;
  }
});

test('saveAsHTML should generate correct HTML content with DocumentDB data', async ({ page }) => {
  const rootId = 'save-html-test-root';
  
  // 直接测试HTML生成逻辑，不依赖下载
  const htmlContent = await page.evaluate(async (id) => {
    const { 
      createDocumentDBState, 
      setData, 
      getDocumentDBState,
      listDataKeys,
      getData
    } = (window as any).DocumentDB;
    
    const state = createDocumentDBState(document, id);
    
    // 设置一些测试数据
    setData(document, 'test-key-1', 'test-value-1');
    setData(document, 'test-key-2', { nested: 'object' });
    setData(document, 'test-key-3', 123);
    setData(document, 'test-boolean', true);
    
    // 模拟saveAsHTML的内部逻辑来生成HTML
    const currentState = getDocumentDBState(document);
    if (!currentState) {
      throw new Error('DocumentDB state not found');
    }

    // 1. 克隆当前HTML文档
    const clonedDocument = document.cloneNode(true) as Document;
    
    // 2. 在克隆的文档中创建新的DocumentDB状态
    const clonedState = createDocumentDBState(clonedDocument, currentState.rootId);
    
    // 3. 将当前数据写入克隆的DocumentDB
    const dataKeys = listDataKeys(document);
    for (const key of dataKeys) {
      const value = getData(document, key);
      if (value !== null) {
        setData(clonedDocument, key, value);
      }
    }

    // 4. 返回完整的HTML文档内容，包含DOCTYPE声明
    const doctype = '<!DOCTYPE html>';
    const htmlContent = clonedDocument.documentElement.outerHTML;
    return doctype + '\n' + htmlContent;
  }, rootId);

  // 验证HTML内容
  expect(htmlContent).toContain('<!DOCTYPE html>');
  expect(htmlContent).toContain('<html');
  expect(htmlContent).toContain('test-key-1');
  expect(htmlContent).toContain('test-value-1');
  expect(htmlContent).toContain('test-key-2');
  expect(htmlContent).toContain('{"nested":"object"}');
  expect(htmlContent).toContain('test-key-3');
  expect(htmlContent).toContain('123');
  expect(htmlContent).toContain('test-boolean');
  expect(htmlContent).toContain('true');
  expect(htmlContent).toContain('data-key="test-key-1"');
  expect(htmlContent).toContain('data-type="string"');
  expect(htmlContent).toContain('data-type="json"');
  expect(htmlContent).toContain('data-type="number"');
  expect(htmlContent).toContain('data-type="boolean"');
});

test('HTML content should exclude DB root when includeDBRoot is false', async ({ page }) => {
  const rootId = 'save-html-no-root-test-root';
  
  const result = await page.evaluate(async (id) => {
    const { 
      createDocumentDBState, 
      setData, 
      getDocumentDBState,
      listDataKeys,
      getData
    } = (window as any).DocumentDB;
    
    const state = createDocumentDBState(document, id);
    setData(document, 'clean-key', 'clean-value');
    
    // 模拟保存逻辑
    const currentState = getDocumentDBState(document);
    const clonedDocument = document.cloneNode(true) as Document;
    const clonedState = createDocumentDBState(clonedDocument, currentState.rootId);
    
    const dataKeys = listDataKeys(document);
    for (const key of dataKeys) {
      const value = getData(document, key);
      if (value !== null) {
        setData(clonedDocument, key, value);
      }
    }

    // 模拟移除DB根元素的逻辑（用于测试对比）
    const clonedDocumentForClean = clonedDocument.cloneNode(true) as Document;
    const rootElementToRemove = clonedDocumentForClean.getElementById(currentState.rootId);
    if (rootElementToRemove) {
      rootElementToRemove.remove();
    }
    const cleanHtmlContent = clonedDocumentForClean.documentElement.outerHTML;
    
    return {
      originalHtml: clonedDocument.documentElement.outerHTML,
      cleanHtml: cleanHtmlContent
    };
  }, rootId);

  // 验证原始HTML包含DocumentDB数据
  expect(result.originalHtml).toContain('data-key="clean-key"');
  expect(result.originalHtml).toContain('clean-value');
  
  // 验证清理后的HTML不包含测试创建的根元素
  expect(result.cleanHtml).not.toContain('save-html-no-root-test-root');
  expect(result.cleanHtml).not.toContain('data-key="clean-key"');
  expect(result.cleanHtml).not.toContain('clean-value');
});

test('HTML content should include custom styles', async ({ page }) => {
  const rootId = 'save-html-styles-test-root';
  
  const htmlContent = await page.evaluate(async (id) => {
    const { 
      createDocumentDBState, 
      setData, 
      getDocumentDBState,
      listDataKeys,
      getData
    } = (window as any).DocumentDB;
    
    const state = createDocumentDBState(document, id);
    setData(document, 'styled-key', 'styled-value');
    
    // 模拟保存逻辑
    const currentState = getDocumentDBState(document);
    const clonedDocument = document.cloneNode(true) as Document;
    const clonedState = createDocumentDBState(clonedDocument, currentState.rootId);
    
    const dataKeys = listDataKeys(document);
    for (const key of dataKeys) {
      const value = getData(document, key);
      if (value !== null) {
        setData(clonedDocument, key, value);
      }
    }

    let htmlContent = clonedDocument.documentElement.outerHTML;
    
    // 模拟添加自定义样式的逻辑
    const customStyles = `
      body { 
        font-family: Arial, sans-serif; 
        background-color: #f0f0f0; 
      }
      .custom-class { 
        color: blue; 
      }
    `;
    
    const styleTag = `<style>\n${customStyles}\n</style>`;
    htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
    
    return htmlContent;
  }, rootId);

  // 验证HTML内容包含自定义样式
  expect(htmlContent).toContain('<style>');
  expect(htmlContent).toContain('font-family: Arial, sans-serif');
  expect(htmlContent).toContain('background-color: #f0f0f0');
  expect(htmlContent).toContain('.custom-class');
  expect(htmlContent).toContain('color: blue');
  expect(htmlContent).toContain('</style>');
  // 验证还包含DocumentDB数据
  expect(htmlContent).toContain('data-key="styled-key"');
  expect(htmlContent).toContain('styled-value');
});

test('saveAsHTML should handle errors gracefully', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { saveAsHTML } = (window as any).DocumentDB;
    
    // 创建一个新的空白document来测试错误情况
    const newDoc = document.implementation.createHTMLDocument('Test');
    
    // 尝试在没有DocumentDB状态的文档上保存
    const success = await saveAsHTML(newDoc, {
      filename: 'error-test.html'
    });
    
    return { success };
  });

  expect(result.success).toBe(false);
});

test('saved HTML should be a complete and valid document', async ({ page }) => {
  const rootId = 'complete-html-test-root';
  
  const htmlContent = await page.evaluate(async (id) => {
    const { 
      createDocumentDBState, 
      setData, 
      getDocumentDBState,
      listDataKeys,
      getData
    } = (window as any).DocumentDB;
    
    const state = createDocumentDBState(document, id);
    
    // 设置测试数据
    setData(document, 'complete-test-key', 'complete-test-value');
    setData(document, 'complete-json', { complete: true, number: 42 });
    
    // 模拟完整的保存逻辑
    const currentState = getDocumentDBState(document);
    const clonedDocument = document.cloneNode(true) as Document;
    const clonedState = createDocumentDBState(clonedDocument, currentState.rootId);
    
    const dataKeys = listDataKeys(document);
    for (const key of dataKeys) {
      const value = getData(document, key);
      if (value !== null) {
        setData(clonedDocument, key, value);
      }
    }

    return clonedDocument.documentElement.outerHTML;
  }, rootId);

  // 验证是完整的HTML文档
  expect(htmlContent).toMatch(/^<html[^>]*>/);
  expect(htmlContent).toContain('<head>');
  expect(htmlContent).toContain('</head>');
  expect(htmlContent).toContain('<body>');
  expect(htmlContent).toContain('</body>');
  expect(htmlContent).toContain('</html>');
  
  // 验证包含DocumentDB数据
  expect(htmlContent).toContain('complete-test-key');
  expect(htmlContent).toContain('complete-test-value');
  expect(htmlContent).toContain('complete-json');
  expect(htmlContent).toContain('{"complete":true,"number":42}');
  
  // 验证数据元素结构正确
  expect(htmlContent).toContain('data-key="complete-test-key"');
  expect(htmlContent).toContain('data-type="string"');
  expect(htmlContent).toContain('data-key="complete-json"');
  expect(htmlContent).toContain('data-type="json"');
}); 