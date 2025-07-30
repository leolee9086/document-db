const k = (n) => typeof n == "string" ? n.startsWith("data:image/") ? "base64" : n.startsWith("{") || n.startsWith("[") ? "json" : "string" : typeof n == "number" ? "number" : typeof n == "boolean" ? "boolean" : n === null || n === void 0 ? "null" : "json", A = (n, t, e) => {
  let r = "";
  switch (e) {
    case "json":
      r = JSON.stringify(t);
      break;
    case "base64":
    case "string":
      r = String(t);
      break;
    case "number":
    case "boolean":
      r = String(t);
      break;
    case "null":
      r = "";
      break;
    default:
      r = JSON.stringify(t);
  }
  n.textContent !== r && (n.textContent = r);
}, p = (n, t) => {
  switch (t) {
    case "json":
      try {
        return JSON.parse(n);
      } catch {
        return n;
      }
    case "number":
      return Number(n);
    case "boolean":
      return n === "true";
    case "null":
      return null;
    case "base64":
    case "string":
    default:
      return n;
  }
}, L = (n, t) => {
  let e = n.getElementById(t);
  if (!e) {
    e = n.createElement("span"), e.id = t, e.style.display = "none";
    const r = n.createDocumentFragment();
    r.appendChild(e), n.body.appendChild(r);
  }
  return e;
}, M = (n, t, e) => {
  let r = n.querySelector(`[data-key="${e}"]`);
  return r || (r = t.createElement("span"), r.setAttribute("data-key", e), r.style.display = "none", n.appendChild(r)), r;
}, S = /* @__PURE__ */ new WeakMap(), b = (n, t = "document-db") => {
  const e = L(n, t), r = {
    document: n,
    rootId: t,
    root: e,
    transactionStack: [],
    isInTransaction: !1
  };
  return S.set(n, r), r;
}, l = (n) => S.get(n), D = (n, t, e, r, s, o) => {
  const a = M(n.root, n.document, t), i = {
    "data-type": r,
    "data-version": s,
    "data-created": (/* @__PURE__ */ new Date()).toISOString()
  };
  Object.entries(o).forEach(([c, u]) => {
    i[`data-${c}`] = String(u);
  }), Object.entries(i).forEach(([c, u]) => {
    a.setAttribute(c, u);
  }), A(a, e, r);
}, I = (n, t) => {
  const e = n.root.querySelector(`[data-key="${t}"]`);
  e && e.remove();
}, T = (n) => {
  const t = n.root.querySelectorAll("[data-key]");
  if (t.length > 0) {
    const e = n.document.createDocumentFragment();
    t.forEach((r) => e.appendChild(r));
  }
}, h = (n, t, e, r = {}) => {
  const s = l(n);
  if (!s) throw new Error("DocumentDB state not found");
  const { type: o = "auto", version: a = "1.0", ...i } = r, c = o === "auto" ? k(e) : o || "string";
  s.isInTransaction ? s.transactionStack[s.transactionStack.length - 1].operations.push({
    type: "set",
    key: t,
    value: e,
    detectedType: c,
    version: a,
    meta: i
  }) : D(s, t, e, c, a, i);
}, g = (n, t, e = null) => {
  const r = l(n);
  if (!r) return e;
  const s = r.root.querySelector(`[data-key="${t}"]`);
  if (!s) return e;
  const o = s.getAttribute("data-type"), a = s.textContent?.trim() || "";
  return p(a, o);
}, B = (n, t) => {
  const e = l(n);
  if (!e) throw new Error("DocumentDB state not found");
  e.isInTransaction ? e.transactionStack[e.transactionStack.length - 1].operations.push({
    type: "delete",
    key: t
  }) : I(e, t);
}, H = (n, t) => {
  const e = l(n);
  return e ? e.root.querySelector(`[data-key="${t}"]`) !== null : !1;
}, E = (n) => {
  const t = l(n);
  if (!t) return [];
  const e = t.root.querySelectorAll("[data-key]");
  return Array.from(e).map((r) => r.getAttribute("data-key") || "");
}, w = (n) => {
  const t = l(n);
  if (!t) throw new Error("DocumentDB state not found");
  t.isInTransaction ? t.transactionStack[t.transactionStack.length - 1].operations.push({
    type: "clear"
  }) : T(t);
}, O = (n) => {
  const t = l(n);
  if (!t) throw new Error("DocumentDB state not found");
  const e = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, r = {
    id: e,
    operations: [],
    snapshot: v(t),
    startTime: Date.now()
  };
  return t.transactionStack.push(r), t.isInTransaction = !0, e;
}, q = (n, t) => {
  const e = l(n);
  if (!e) return !1;
  const r = C(e, t);
  if (!r) return !1;
  for (const s of r.operations)
    K(e, s);
  return x(e, t), !0;
}, j = (n, t) => {
  const e = l(n);
  if (!e) return !1;
  const r = C(e, t);
  return r ? (P(e, r.snapshot), x(e, t), !0) : !1;
}, F = (n) => {
  const t = l(n);
  return t ? {
    isInTransaction: t.isInTransaction,
    activeTransactions: t.transactionStack.length,
    transactionIds: t.transactionStack.map((e) => e.id)
  } : {
    isInTransaction: !1,
    activeTransactions: 0,
    transactionIds: []
  };
}, R = (n) => {
  const t = l(n);
  return t ? t.isInTransaction : !1;
}, $ = (n, t) => {
  const e = l(n);
  if (!e || !e.isInTransaction)
    return null;
  const r = e.transactionStack[e.transactionStack.length - 1];
  if (!r)
    return null;
  for (let s = r.operations.length - 1; s >= 0; s--) {
    const o = r.operations[s];
    if (o.type === "set" && o.key === t)
      return o.value;
    if (o.type === "delete" && o.key === t)
      return null;
  }
  return g(n, t);
}, N = (n, t, e) => {
  const r = l(n);
  if (!r || !r.isInTransaction)
    return !1;
  const s = r.transactionStack[r.transactionStack.length - 1];
  return s ? (s.operations.push({
    type: "set",
    key: t,
    value: e,
    detectedType: k(e),
    version: "1.0",
    meta: {}
  }), !0) : !1;
}, C = (n, t) => n.transactionStack.find((e) => e.id === t), x = (n, t) => {
  const e = n.transactionStack.findIndex((r) => r.id === t);
  e !== -1 && (n.transactionStack.splice(e, 1), n.isInTransaction = n.transactionStack.length > 0);
}, v = (n) => {
  const t = {};
  return n.root.querySelectorAll("[data-key]").forEach((r) => {
    const s = r.getAttribute("data-key"), o = r.getAttribute("data-type"), a = r.textContent?.trim() || "", i = p(a, o);
    s && (t[s] = { value: i, type: o || "string" });
  }), t;
}, P = (n, t) => {
  T(n), Object.entries(t).forEach(([e, { value: r, type: s }]) => {
    D(n, e, r, s, "1.0", {});
  });
}, K = (n, t) => {
  switch (t.type) {
    case "set":
      t.key && t.detectedType && D(n, t.key, t.value, t.detectedType, t.version || "1.0", t.meta || {});
      break;
    case "delete":
      t.key && I(n, t.key);
      break;
    case "clear":
      T(n);
      break;
  }
}, U = (n) => {
  const t = l(n);
  return t ? t.root.outerHTML : "";
}, J = (n, t = {}) => {
  const e = l(n);
  if (!e) return "";
  const {
    title: r = "DocumentDB Export",
    charset: s = "UTF-8"
  } = t, o = n.implementation.createHTMLDocument(r);
  let a = o.querySelector("meta[charset]");
  a ? a.setAttribute("charset", s) : (a = o.createElement("meta"), a.setAttribute("charset", s), o.head.insertBefore(a, o.head.firstChild)), o.title = r;
  const i = o.createElement("style");
  i.textContent = `
#${e.rootId} { display: none !important; }
#${e.rootId} [data-key] { display: none !important; }
`, o.head.appendChild(i), o.body.innerHTML = n.body.innerHTML;
  let c = o.getElementById(e.rootId);
  return c || (c = o.createElement("span"), c.id = e.rootId, c.style.display = "none", o.body.appendChild(c)), c.innerHTML = e.root.innerHTML, `<!DOCTYPE html>
` + o.documentElement.outerHTML;
}, W = (n, t) => {
  const e = l(n);
  if (!e) throw new Error("DocumentDB state not found");
  const o = new DOMParser().parseFromString(t, "text/html").getElementById(e.rootId);
  o && (w(n), o.querySelectorAll("[data-key]").forEach((a) => {
    const i = a.getAttribute("data-key"), c = a.getAttribute("data-type"), u = a.textContent?.trim() || "", f = p(u, c);
    i && h(n, i, f, { type: c || "auto" });
  }));
}, Y = (n) => {
  const t = l(n);
  if (!t) throw new Error("DocumentDB state not found");
  const e = n.cloneNode(!0);
  return b(e, t.rootId);
}, z = async (n, t = {}) => {
  try {
    const {
      filename: e = `document-db-${Date.now()}.html`,
      includeDBRoot: r = !0,
      customStyles: s = ""
    } = t, o = G(n, r, s);
    return Q(o, e, "text/html");
  } catch {
    return !1;
  }
}, G = (n, t, e) => {
  const r = n.cloneNode(!0);
  if (t) {
    const a = l(n);
    if (!a)
      throw new Error("DocumentDB state not found");
    b(r, a.rootId);
    const i = E(n);
    for (const c of i) {
      const u = g(n, c);
      u !== null && h(r, c, u);
    }
  } else {
    const a = l(n);
    if (a) {
      const i = r.getElementById(a.rootId);
      i && i.remove();
    }
  }
  if (e) {
    const a = r.head, i = r.createElement("style");
    i.textContent = e, a.appendChild(i);
  }
  const s = "<!DOCTYPE html>", o = r.documentElement.outerHTML;
  return s + `
` + o;
}, Q = (n, t, e) => {
  try {
    const r = new Blob([n], { type: e }), s = URL.createObjectURL(r), o = document.createElement("a");
    return o.href = s, o.download = t, o.style.display = "none", document.body.appendChild(o), o.click(), document.body.removeChild(o), URL.revokeObjectURL(s), !0;
  } catch (r) {
    return console.error("下载文件失败:", r), !1;
  }
}, V = async (n, t = {}) => {
  try {
    const { clearExisting: e = !0 } = t, r = n.createElement("input");
    return r.type = "file", r.accept = ".html,.htm", r.style.display = "none", new Promise((s) => {
      r.onchange = async (o) => {
        const i = o.target.files?.[0];
        if (!i) {
          s(!1);
          return;
        }
        try {
          const c = await X(i), u = Z(n, c, e);
          s(u);
        } catch (c) {
          console.error("加载HTML文件失败:", c), s(!1);
        } finally {
          n.body.removeChild(r);
        }
      }, r.click();
    });
  } catch (e) {
    return console.error("选择文件失败:", e), !1;
  }
}, X = (n) => new Promise((t, e) => {
  const r = new FileReader();
  r.onload = (s) => {
    const o = s.target?.result;
    t(o);
  }, r.onerror = e, r.readAsText(n);
}), Z = (n, t, e) => {
  try {
    const o = new DOMParser().parseFromString(t, "text/html").querySelector('[id*="document-db"]');
    if (!o)
      return console.warn("未找到DocumentDB根元素"), !1;
    const a = l(n);
    if (!a)
      return console.error("当前文档没有DocumentDB状态"), !1;
    e && (a.root.innerHTML = "");
    const i = o.querySelectorAll("[data-key]");
    for (const c of i) {
      const u = c.getAttribute("data-key"), f = c.getAttribute("data-type"), d = c.textContent;
      if (u && d !== null) {
        let m = d;
        if (f === "json")
          try {
            m = JSON.parse(d);
          } catch {
            m = d;
          }
        else f === "number" ? m = Number(d) : f === "boolean" && (m = d === "true");
        h(n, u, m);
      }
    }
    return !0;
  } catch (r) {
    return console.error("解析HTML失败:", r), !1;
  }
};
class y {
  /**
   * 创建DocumentDB实例
   * @param document - Document对象
   * @param rootId - 根元素ID，默认为'document-db'
   */
  constructor(t, e = "document-db") {
    this.document = t;
    const r = l(t);
    r && r.rootId === e ? this.state = r : this.state = b(t, e);
  }
  /**
   * 获取当前状态
   */
  getState() {
    return this.state;
  }
  /**
   * 获取根元素ID
   */
  getRootId() {
    return this.state.rootId;
  }
  // ===== 数据操作方法 =====
  /**
   * 设置数据
   * @param key - 键名
   * @param value - 值
   */
  setData(t, e) {
    h(this.document, t, e);
  }
  /**
   * 获取数据
   * @param key - 键名
   * @returns 值或null
   */
  getData(t) {
    return g(this.document, t);
  }
  /**
   * 检查数据是否存在
   * @param key - 键名
   * @returns 是否存在
   */
  hasData(t) {
    return H(this.document, t);
  }
  /**
   * 删除数据
   * @param key - 键名
   */
  deleteData(t) {
    B(this.document, t);
  }
  /**
   * 列出所有数据键
   * @returns 键名数组
   */
  listDataKeys() {
    return E(this.document);
  }
  /**
   * 清空所有数据
   */
  clearData() {
    w(this.document);
  }
  // ===== 事务操作方法 =====
  /**
   * 开始事务
   * @returns 事务ID
   */
  beginTransaction() {
    return O(this.document);
  }
  /**
   * 提交事务
   * @param transactionId - 事务ID
   * @returns 是否提交成功
   */
  commitTransaction(t) {
    return q(this.document, t);
  }
  /**
   * 回滚事务
   * @param transactionId - 事务ID
   * @returns 是否回滚成功
   */
  rollbackTransaction(t) {
    return j(this.document, t);
  }
  /**
   * 检查是否在事务中
   * @returns 是否在事务中
   */
  isInTransaction() {
    return R(this.document);
  }
  /**
   * 在事务中获取数据
   * @param key - 键名
   * @returns 值或null
   */
  getTransactionData(t) {
    return $(this.document, t);
  }
  /**
   * 在事务中设置数据
   * @param key - 键名
   * @param value - 值
   * @returns 是否设置成功
   */
  setTransactionData(t, e) {
    return N(this.document, t, e);
  }
  // ===== 导入导出方法 =====
  /**
   * 导出整个数据库
   * @returns 导出的HTML字符串
   */
  exportDatabase() {
    return U(this.document);
  }
  /**
   * 导出完整文档
   * @param options - 导出选项
   * @returns 完整HTML文档字符串
   */
  exportDocument(t) {
    return J(this.document, t);
  }
  /**
   * 导入数据库
   * @param htmlData - HTML数据
   */
  importDatabase(t) {
    W(this.document, t);
  }
  /**
   * 克隆数据库到新文档
   * @param targetDocument - 目标文档
   * @returns 新的DocumentDB实例或null
   */
  cloneDatabase(t) {
    const e = Y(this.document);
    return e ? new y(t, e.rootId) : null;
  }
  // ===== 文件处理方法 =====
  /**
   * 保存为HTML文件
   * @param options - 保存选项
   * @returns 是否保存成功
   */
  async saveAsHTML(t = {}) {
    return z(this.document, t);
  }
  /**
   * 从HTML文件加载
   * @param options - 加载选项
   * @returns 是否加载成功
   */
  async loadFromHTML(t = {}) {
    return V(this.document, t);
  }
  // ===== 实用方法 =====
  /**
   * 获取数据库信息
   * @returns 数据库信息对象
   */
  getInfo() {
    return {
      rootId: this.state.rootId,
      dataCount: this.listDataKeys().length,
      isInTransaction: this.isInTransaction(),
      keys: this.listDataKeys()
    };
  }
  /**
   * 销毁DocumentDB实例
   * 清理所有数据和状态
   */
  destroy() {
    if (this.isInTransaction()) {
      const e = F(this.document);
      e.transactionIds.length > 0 && this.rollbackTransaction(e.transactionIds[e.transactionIds.length - 1]);
    }
    this.clearData();
    const t = this.document.getElementById(this.state.rootId);
    t && t.remove();
  }
  /**
   * 静态方法：从现有文档获取DocumentDB实例
   * @param document - Document对象
   * @returns DocumentDB实例或null
   */
  static fromDocument(t) {
    const e = l(t);
    return e ? new y(t, e.rootId) : null;
  }
  /**
   * 静态方法：检查文档是否包含DocumentDB
   * @param document - Document对象
   * @returns 是否包含DocumentDB
   */
  static hasDocumentDB(t) {
    return l(t) !== null;
  }
}
export {
  y as DocumentDB,
  O as beginTransaction,
  w as clearData,
  Y as cloneDatabase,
  q as commitTransaction,
  b as createDocumentDBState,
  B as deleteData,
  U as exportDatabase,
  J as exportDocument,
  g as getData,
  l as getDocumentDBState,
  $ as getTransactionData,
  F as getTransactionStatus,
  H as hasData,
  W as importDatabase,
  R as isInTransaction,
  E as listDataKeys,
  V as loadFromHTML,
  j as rollbackTransaction,
  z as saveAsHTML,
  h as setData,
  N as setTransactionData
};
