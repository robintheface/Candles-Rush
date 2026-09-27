// Candle Rush Mobile App

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/node_modules/@capacitor/core/dist/index.js
var ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp, SystemBarsStyle, SystemBarType, SystemBarsPluginWeb, SystemBars;
var init_dist = __esm({
  "Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/node_modules/@capacitor/core/dist/index.js"() {
    (function(ExceptionCode2) {
      ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
      ExceptionCode2["Unavailable"] = "UNAVAILABLE";
    })(ExceptionCode || (ExceptionCode = {}));
    CapacitorException = class extends Error {
      constructor(message, code, data) {
        super(message);
        this.message = message;
        this.code = code;
        this.data = data;
      }
    };
    getPlatformId = (win) => {
      var _a, _b;
      if (win === null || win === void 0 ? void 0 : win.androidBridge) {
        return "android";
      } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
        return "ios";
      } else {
        return "web";
      }
    };
    createCapacitor = (win) => {
      const capCustomPlatform = win.CapacitorCustomPlatform || null;
      const cap = win.Capacitor || {};
      const Plugins = cap.Plugins = cap.Plugins || {};
      const getPlatform = () => {
        return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
      };
      const isNativePlatform = () => getPlatform() !== "web";
      const isPluginAvailable = (pluginName) => {
        const plugin = registeredPlugins.get(pluginName);
        if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
          return true;
        }
        if (getPluginHeader(pluginName)) {
          return true;
        }
        return false;
      };
      const getPluginHeader = (pluginName) => {
        var _a;
        return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
      };
      const handleError = (err) => win.console.error(err);
      const registeredPlugins = /* @__PURE__ */ new Map();
      const registerPlugin2 = (pluginName, jsImplementations = {}) => {
        const registeredPlugin = registeredPlugins.get(pluginName);
        if (registeredPlugin) {
          console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
          return registeredPlugin.proxy;
        }
        const platform = getPlatform();
        const pluginHeader = getPluginHeader(pluginName);
        let jsImplementation;
        const loadPluginImplementation = async () => {
          if (!jsImplementation && platform in jsImplementations) {
            jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
          } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
            jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
          }
          return jsImplementation;
        };
        const createPluginMethod = (impl, prop) => {
          var _a, _b;
          if (pluginHeader) {
            const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
            if (methodHeader) {
              if (methodHeader.rtype === "promise") {
                return (options) => cap.nativePromise(pluginName, prop.toString(), options);
              } else {
                return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
              }
            } else if (impl) {
              return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
            }
          } else if (impl) {
            return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
          } else {
            throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
          }
        };
        const createPluginMethodWrapper = (prop) => {
          let remove;
          const wrapper = (...args) => {
            const p = loadPluginImplementation().then((impl) => {
              const fn = createPluginMethod(impl, prop);
              if (fn) {
                const p2 = fn(...args);
                remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                return p2;
              } else {
                throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
              }
            });
            if (prop === "addListener") {
              p.remove = async () => remove();
            }
            return p;
          };
          wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
          Object.defineProperty(wrapper, "name", {
            value: prop,
            writable: false,
            configurable: false
          });
          return wrapper;
        };
        const addListener = createPluginMethodWrapper("addListener");
        const removeListener = createPluginMethodWrapper("removeListener");
        const addListenerNative = (eventName, callback) => {
          const call = addListener({ eventName }, callback);
          const remove = async () => {
            const callbackId = await call;
            removeListener({
              eventName,
              callbackId
            }, callback);
          };
          const p = new Promise((resolve) => call.then(() => resolve({ remove })));
          p.remove = async () => {
            console.warn(`Using addListener() without 'await' is deprecated.`);
            await remove();
          };
          return p;
        };
        const proxy = new Proxy({}, {
          get(_, prop) {
            switch (prop) {
              // https://github.com/facebook/react/issues/20030
              case "$$typeof":
                return void 0;
              case "toJSON":
                return () => ({});
              case "addListener":
                return pluginHeader ? addListenerNative : addListener;
              case "removeListener":
                return removeListener;
              default:
                return createPluginMethodWrapper(prop);
            }
          }
        });
        Plugins[pluginName] = proxy;
        registeredPlugins.set(pluginName, {
          name: pluginName,
          proxy,
          platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
        });
        return proxy;
      };
      if (!cap.convertFileSrc) {
        cap.convertFileSrc = (filePath) => filePath;
      }
      cap.getPlatform = getPlatform;
      cap.handleError = handleError;
      cap.isNativePlatform = isNativePlatform;
      cap.isPluginAvailable = isPluginAvailable;
      cap.registerPlugin = registerPlugin2;
      cap.Exception = CapacitorException;
      cap.DEBUG = !!cap.DEBUG;
      cap.isLoggingEnabled = !!cap.isLoggingEnabled;
      return cap;
    };
    initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
    Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
    registerPlugin = Capacitor.registerPlugin;
    WebPlugin = class {
      constructor() {
        this.listeners = {};
        this.retainedEventArguments = {};
        this.windowListeners = {};
      }
      addListener(eventName, listenerFunc) {
        let firstListener = false;
        const listeners = this.listeners[eventName];
        if (!listeners) {
          this.listeners[eventName] = [];
          firstListener = true;
        }
        this.listeners[eventName].push(listenerFunc);
        const windowListener = this.windowListeners[eventName];
        if (windowListener && !windowListener.registered) {
          this.addWindowListener(windowListener);
        }
        if (firstListener) {
          this.sendRetainedArgumentsForEvent(eventName);
        }
        const remove = async () => this.removeListener(eventName, listenerFunc);
        const p = Promise.resolve({ remove });
        return p;
      }
      async removeAllListeners() {
        this.listeners = {};
        for (const listener in this.windowListeners) {
          this.removeWindowListener(this.windowListeners[listener]);
        }
        this.windowListeners = {};
      }
      notifyListeners(eventName, data, retainUntilConsumed) {
        const listeners = this.listeners[eventName];
        if (!listeners) {
          if (retainUntilConsumed) {
            let args = this.retainedEventArguments[eventName];
            if (!args) {
              args = [];
            }
            args.push(data);
            this.retainedEventArguments[eventName] = args;
          }
          return;
        }
        listeners.forEach((listener) => listener(data));
      }
      hasListeners(eventName) {
        var _a;
        return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
      }
      registerWindowListener(windowEventName, pluginEventName) {
        this.windowListeners[pluginEventName] = {
          registered: false,
          windowEventName,
          pluginEventName,
          handler: (event) => {
            this.notifyListeners(pluginEventName, event);
          }
        };
      }
      unimplemented(msg = "not implemented") {
        return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
      }
      unavailable(msg = "not available") {
        return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
      }
      async removeListener(eventName, listenerFunc) {
        const listeners = this.listeners[eventName];
        if (!listeners) {
          return;
        }
        const index = listeners.indexOf(listenerFunc);
        if (index !== -1) {
          this.listeners[eventName].splice(index, 1);
        }
        if (!this.listeners[eventName].length) {
          this.removeWindowListener(this.windowListeners[eventName]);
        }
      }
      addWindowListener(handle) {
        window.addEventListener(handle.windowEventName, handle.handler);
        handle.registered = true;
      }
      removeWindowListener(handle) {
        if (!handle) {
          return;
        }
        window.removeEventListener(handle.windowEventName, handle.handler);
        handle.registered = false;
      }
      sendRetainedArgumentsForEvent(eventName) {
        const args = this.retainedEventArguments[eventName];
        if (!args) {
          return;
        }
        delete this.retainedEventArguments[eventName];
        args.forEach((arg) => {
          this.notifyListeners(eventName, arg);
        });
      }
    };
    encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
    decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    CapacitorCookiesPluginWeb = class extends WebPlugin {
      async getCookies() {
        const cookies = document.cookie;
        const cookieMap = {};
        cookies.split(";").forEach((cookie) => {
          if (cookie.length <= 0)
            return;
          let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
          key = decode(key).trim();
          value = decode(value).trim();
          cookieMap[key] = value;
        });
        return cookieMap;
      }
      async setCookie(options) {
        try {
          const encodedKey = encode(options.key);
          const encodedValue = encode(options.value);
          const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
          const path = (options.path || "/").replace("path=", "");
          const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
          document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
        } catch (error) {
          return Promise.reject(error);
        }
      }
      async deleteCookie(options) {
        try {
          document.cookie = `${options.key}=; Max-Age=0`;
        } catch (error) {
          return Promise.reject(error);
        }
      }
      async clearCookies() {
        try {
          const cookies = document.cookie.split(";") || [];
          for (const cookie of cookies) {
            document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
          }
        } catch (error) {
          return Promise.reject(error);
        }
      }
      async clearAllCookies() {
        try {
          await this.clearCookies();
        } catch (error) {
          return Promise.reject(error);
        }
      }
    };
    CapacitorCookies = registerPlugin("CapacitorCookies", {
      web: () => new CapacitorCookiesPluginWeb()
    });
    readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
    normalizeHttpHeaders = (headers = {}) => {
      const originalKeys = Object.keys(headers);
      const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
      const normalized = loweredKeys.reduce((acc, key, index) => {
        acc[key] = headers[originalKeys[index]];
        return acc;
      }, {});
      return normalized;
    };
    buildUrlParams = (params, shouldEncode = true) => {
      if (!params)
        return null;
      const output = Object.entries(params).reduce((accumulator, entry) => {
        const [key, value] = entry;
        let encodedValue;
        let item;
        if (Array.isArray(value)) {
          item = "";
          value.forEach((str) => {
            encodedValue = shouldEncode ? encodeURIComponent(str) : str;
            item += `${key}=${encodedValue}&`;
          });
          item.slice(0, -1);
        } else {
          encodedValue = shouldEncode ? encodeURIComponent(value) : value;
          item = `${key}=${encodedValue}`;
        }
        return `${accumulator}&${item}`;
      }, "");
      return output.substr(1);
    };
    buildRequestInit = (options, extra = {}) => {
      const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
      const headers = normalizeHttpHeaders(options.headers);
      const type = headers["content-type"] || "";
      if (typeof options.data === "string") {
        output.body = options.data;
      } else if (type.includes("application/x-www-form-urlencoded")) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(options.data || {})) {
          params.set(key, value);
        }
        output.body = params.toString();
      } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
        const form = new FormData();
        if (options.data instanceof FormData) {
          options.data.forEach((value, key) => {
            form.append(key, value);
          });
        } else {
          for (const key of Object.keys(options.data)) {
            form.append(key, options.data[key]);
          }
        }
        output.body = form;
        const headers2 = new Headers(output.headers);
        headers2.delete("content-type");
        output.headers = headers2;
      } else if (type.includes("application/json") || typeof options.data === "object") {
        output.body = JSON.stringify(options.data);
      }
      return output;
    };
    CapacitorHttpPluginWeb = class extends WebPlugin {
      /**
       * Perform an Http request given a set of options
       * @param options Options to build the HTTP request
       */
      async request(options) {
        const requestInit = buildRequestInit(options, options.webFetchExtra);
        const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
        const url = urlParams ? `${options.url}?${urlParams}` : options.url;
        const response = await fetch(url, requestInit);
        const contentType = response.headers.get("content-type") || "";
        let { responseType = "text" } = response.ok ? options : {};
        if (contentType.includes("application/json")) {
          responseType = "json";
        }
        let data;
        let blob;
        switch (responseType) {
          case "arraybuffer":
          case "blob":
            blob = await response.blob();
            data = await readBlobAsBase64(blob);
            break;
          case "json":
            data = await response.json();
            break;
          case "document":
          case "text":
          default:
            data = await response.text();
        }
        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        return {
          data,
          headers,
          status: response.status,
          url: response.url
        };
      }
      /**
       * Perform an Http GET request given a set of options
       * @param options Options to build the HTTP request
       */
      async get(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
      }
      /**
       * Perform an Http POST request given a set of options
       * @param options Options to build the HTTP request
       */
      async post(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
      }
      /**
       * Perform an Http PUT request given a set of options
       * @param options Options to build the HTTP request
       */
      async put(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
      }
      /**
       * Perform an Http PATCH request given a set of options
       * @param options Options to build the HTTP request
       */
      async patch(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
      }
      /**
       * Perform an Http DELETE request given a set of options
       * @param options Options to build the HTTP request
       */
      async delete(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
      }
    };
    CapacitorHttp = registerPlugin("CapacitorHttp", {
      web: () => new CapacitorHttpPluginWeb()
    });
    (function(SystemBarsStyle2) {
      SystemBarsStyle2["Dark"] = "DARK";
      SystemBarsStyle2["Light"] = "LIGHT";
      SystemBarsStyle2["Default"] = "DEFAULT";
    })(SystemBarsStyle || (SystemBarsStyle = {}));
    (function(SystemBarType2) {
      SystemBarType2["StatusBar"] = "StatusBar";
      SystemBarType2["NavigationBar"] = "NavigationBar";
    })(SystemBarType || (SystemBarType = {}));
    SystemBarsPluginWeb = class extends WebPlugin {
      async setStyle() {
        this.unavailable("not available for web");
      }
      async setAnimation() {
        this.unavailable("not available for web");
      }
      async show() {
        this.unavailable("not available for web");
      }
      async hide() {
        this.unavailable("not available for web");
      }
    };
    SystemBars = registerPlugin("SystemBars", {
      web: () => new SystemBarsPluginWeb()
    });
  }
});

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/node_modules/@capacitor/app/dist/esm/web.js
var web_exports = {};
__export(web_exports, {
  AppWeb: () => AppWeb
});
var AppWeb;
var init_web = __esm({
  "Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/node_modules/@capacitor/app/dist/esm/web.js"() {
    init_dist();
    AppWeb = class extends WebPlugin {
      constructor() {
        super();
        this.handleVisibilityChange = () => {
          const data = {
            isActive: document.hidden !== true
          };
          this.notifyListeners("appStateChange", data);
          if (document.hidden) {
            this.notifyListeners("pause", null);
          } else {
            this.notifyListeners("resume", null);
          }
        };
        document.addEventListener("visibilitychange", this.handleVisibilityChange, false);
      }
      exitApp() {
        throw this.unimplemented("Not implemented on web.");
      }
      async getInfo() {
        throw this.unimplemented("Not implemented on web.");
      }
      async getLaunchUrl() {
        return { url: "" };
      }
      async getState() {
        return { isActive: document.hidden !== true };
      }
      async minimizeApp() {
        throw this.unimplemented("Not implemented on web.");
      }
      async toggleBackButtonHandler() {
        throw this.unimplemented("Not implemented on web.");
      }
      async getAppLanguage() {
        return {
          value: navigator.language.split("-")[0].toLowerCase()
        };
      }
    };
  }
});

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/loading.js
var screen2 = document.getElementById("loadingScreen");
var label = document.getElementById("loadingLabel");
var retry = document.getElementById("loadingRetry");
var tasks = /* @__PURE__ */ new Map();
function render() {
  const busy = tasks.size > 0;
  screen2.hidden = !busy;
  document.body.dataset.busy = String(busy);
  document.getElementById("welcomeScreen").inert = busy;
  document.getElementById("game").setAttribute("aria-busy", String(busy));
  if (busy) label.textContent = [...tasks.values()].at(-1);
  document.dispatchEvent(new Event("hood-loading-change"));
}
function beginLoading(message = "Loading\u2026") {
  const token = Symbol();
  tasks.set(token, message);
  render();
  return () => {
    tasks.delete(token);
    render();
  };
}
async function withLoading(message, operation) {
  const finish = beginLoading(message);
  try {
    return await operation();
  } finally {
    finish();
  }
}
var finishBoot = beginLoading("Loading game\u2026");
document.addEventListener("hood-assets-ready", finishBoot, { once: true });
document.addEventListener("hood-assets-error", () => {
  tasks.clear();
  tasks.set("error", "Could not load the game. Please try again.");
  screen2.classList.add("has-error");
  retry.hidden = false;
  render();
  retry.focus();
}, { once: true });
retry.addEventListener("click", () => window.location.reload());

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/intro.js
var intro = document.getElementById("studioIntro");
if (intro) {
  const revealAndPause = new Promise((resolve) => setTimeout(resolve, 4000));
  const gameReady = new Promise((resolve) => {
    document.addEventListener("hood-assets-ready", resolve, { once: true });
    document.addEventListener("hood-assets-error", resolve, { once: true });
  });
  Promise.all([revealAndPause, gameReady]).then(() => {
    intro.classList.add("is-exiting");
    setTimeout(() => {
      intro.hidden = true;
      document.body.dataset.intro = "false";
    }, 1000);
  });
}

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/entry.js
init_dist();

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/native-auth.js
init_dist();
var FirebaseAuthentication = registerPlugin("FirebaseAuthentication");

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/player.js
var player = { uid: null, name: "Guest" };
var currentPlayer = () => ({ ...player });
function setPlayer(user) {
  player = user?.uid ? { uid: user.uid, name: user.displayName?.trim().slice(0, 80) || "Player" } : { uid: null, name: "Guest" };
  return currentPlayer();
}

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/firestore-board.js
var dayBoard = (now = Date.now()) => `day-${Math.floor(now / 864e5)}`;
function createFirestoreBoard({ projectId, getToken, fetcher = fetch }) {
  const database = `projects/${projectId}/databases/(default)`;
  const documents = `${database}/documents`;
  const base = `https://firestore.googleapis.com/v1/${documents}`;
  async function request(path, token, body, method = "POST") {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1e4);
    try {
      const response = await fetcher(base + path, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, ...body ? { body: JSON.stringify(body) } : {}, signal: controller.signal });
      if (!response.ok) {
        if (response.status === 404 && method === "GET") return null;
        const error = new Error(`firestore_${response.status}`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
  return {
    async getBest(uid) {
      if (!uid) return 0;
      const token = await getToken();
      const doc = await request(`/mobileLeaderboardV1/all/scores/${encodeURIComponent(uid)}`, token, null, "GET");
      const score = Number(doc?.fields?.score?.integerValue || 0);
      return Number.isSafeInteger(score) && score > 0 && score <= 1e6 ? score : 0;
    },
    async getBoard(which) {
      const token = await getToken();
      const board = which === "today" ? dayBoard() : "all";
      const rows = await request(`/mobileLeaderboardV1/${board}:runQuery`, token, { structuredQuery: { from: [{ collectionId: "scores" }], orderBy: [{ field: { fieldPath: "score" }, direction: "DESCENDING" }], limit: 10 } });
      if (!Array.isArray(rows)) throw new Error("invalid_board");
      return rows.filter((row) => row?.document).map(({ document: document2 }) => ({
        name: document2.fields?.name?.stringValue,
        score: Number(document2.fields?.score?.integerValue)
      })).filter((row) => typeof row.name === "string" && Number.isSafeInteger(row.score) && row.score > 0 && row.score <= 1e6).slice(0, 10).map((row, i) => ({ rank: i + 1, ...row }));
    },
    async save(player2, score) {
      if (!player2.uid || !Number.isSafeInteger(score) || score < 1 || score > 1e6) throw new Error("invalid_score");
      const token = await getToken();
      for (let attempt = 0; attempt < 3; attempt++) {
        const paths = ["all", dayBoard()].map((board) => `/mobileLeaderboardV1/${board}/scores/${encodeURIComponent(player2.uid)}`);
        const old = await Promise.all(paths.map((path) => request(path, token, null, "GET")));
        const writes = old.map((doc, i) => ({
          update: { name: documents + decodeURIComponent(paths[i]), fields: { name: { stringValue: player2.name }, score: { integerValue: String(Math.max(score, Number(doc?.fields?.score?.integerValue || 0))) } } },
          updateTransforms: [{ fieldPath: "updatedAt", setToServerValue: "REQUEST_TIME" }],
          currentDocument: doc ? { updateTime: doc.updateTime } : { exists: false }
        }));
        try {
          await request(":commit", token, { writes });
          return;
        } catch (error) {
          if (![409, 412].includes(error.status) || attempt === 2) throw error;
        }
      }
    }
  };
}

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/online-config.js
var onlineConfig = { enabled: true, projectId: "outrun-the-rug" };

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/offline-leaderboard.js
var KEY = "hoodRunnerLocalRanksV1";
var KEY_V2 = "hoodRunnerLocalRanksV2";
var LIMIT = 10;
var dayKey = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
var valid = (row) => row && Number.isSafeInteger(row.score) && row.score > 0 && Number.isFinite(row.at);
var top = (rows) => rows.filter(valid).sort((a, b) => b.score - a.score || a.at - b.at).slice(0, LIMIT);
var memory = { all: [], today: [], day: "" };
var activeRun = false;
var runPlayer = currentPlayer();
var loaded = false;
function read() {
  if (!loaded) {
    loaded = true;
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem(KEY_V2);
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.all) && Array.isArray(data.today)) memory = { all: top(data.all), today: top(data.today), day: data.day };
    } catch {
    }
  }
  if (memory.day !== dayKey(/* @__PURE__ */ new Date())) memory = { ...memory, today: [], day: dayKey(/* @__PURE__ */ new Date()) };
  return memory;
}
var canSubmit = () => activeRun;
var qualifies = (score) => Number.isSafeInteger(score) && score > 0;
var startRun = async () => {
  activeRun = true;
  runPlayer = currentPlayer();
};
async function getBoard(which = "all") {
  return read()[which === "today" ? "today" : "all"].map((row, index) => ({
    rank: index + 1,
    score: row.score,
    name: row.uid && row.uid === currentPlayer().uid ? currentPlayer().name : row.name || "Guest"
  }));
}
var checkName = async () => ({ known: false });
async function submit(_name, score) {
  if (!activeRun) return { ok: false, error: "no_token" };
  activeRun = false;
  if (!qualifies(score)) return { ok: false, error: "invalid_score" };
  const previous = read();
  const row = { score, at: Date.now(), ...runPlayer };
  memory = { day: previous.day, all: top([...previous.all, row]), today: top([...previous.today, row]) };
  try {
    const s = JSON.stringify(memory);
    localStorage.setItem(KEY, s);
    localStorage.setItem(KEY_V2, s);
  } catch {
  }
  return { ok: true };
}

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/online-leaderboard.js
var cache = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
var latestQuery = 0;
var run = null;
var status = (text) => {
  const node = document.getElementById("leaderboardStatus");
  if (node) node.textContent = text;
};
var remote = createFirestoreBoard({ projectId: onlineConfig.projectId, getToken: async () => {
  const { token } = await FirebaseAuthentication.getIdToken({ forceRefresh: false });
  if (!token) throw new Error("sign_in_required");
  return token;
} });
var isAvailable = () => true;
var hasIdentity = () => Boolean(currentPlayer().uid);
var canSubmit2 = () => canSubmit();
var checkName2 = checkName;
async function getMyBest() {
  const uid = currentPlayer().uid;
  if (!uid || !onlineConfig.enabled) return 0;
  try {
    return await remote.getBest(uid);
  } catch {
    return 0;
  }
}
function startRun2() {
  startRun();
  const current = currentPlayer();
  run = current;
  return Promise.resolve();
}
async function submit2(name, score) {
  const finished = run;
  run = null;
  const saved = await submit(name, score);
  if (!saved.ok || !finished?.uid || !onlineConfig.enabled) return saved;
  if (finished.uid !== currentPlayer().uid) return saved;
  try {
    await remote.save(finished, score);
    cache.clear();
    status("Score saved online \xB7 App leaderboard");
  } catch {
    status("Score saved on this device only. Online save failed.");
  }
  return saved;
}
async function getBoard2(which = "all") {
  const query = ++latestQuery;
  const uid = currentPlayer().uid;
  const queryStatus = (text) => {
    if (query === latestQuery && uid === currentPlayer().uid) status(text);
  };
  if (!uid || !onlineConfig.enabled) {
    queryStatus(uid ? "On this device \xB7 Online leaderboard awaiting setup" : "Guest \xB7 Scores on this device");
    return getBoard(which);
  }
  const key = `${uid}:${which}:${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 15e3) {
    queryStatus("App Top 10 \xB7 Today uses UTC");
    return hit.entries;
  }
  queryStatus("Loading app leaderboard\u2026");
  try {
    if (!pending.has(key)) {
      pending.set(key, remote.getBoard(which).finally(() => pending.delete(key)));
    }
    const entries = await pending.get(key);
    if (cache.size >= 4 && !cache.has(key)) cache.delete(cache.keys().next().value);
    cache.set(key, { at: Date.now(), entries });
    queryStatus("App Top 10 \xB7 Today uses UTC");
    return entries;
  } catch {
    queryStatus(hit ? "Offline \xB7 Last loaded online scores" : "Online leaderboard unavailable. Try again later.");
    return hit?.entries || [];
  }
}

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/entry.js
function initEntry(byId2, onEnter) {
  const welcome = byId2("welcomeScreen");
  const status2 = byId2("signInStatus");
  const accountStatus = byId2("settingsAccountStatus");
  let user = null;
  let busy = false;
  const supported = Capacitor.getPlatform() === "ios";
  const buttons = ["googleSignIn", "guestButton", "returningPlay", "settingsGoogleConnect", "welcomeLogout", "settingsHomeBtn"];
  function lock(value) {
    busy = value;
    buttons.forEach((id) => byId2(id).disabled = value);
  }
  function identity(next) {
    user = next?.uid ? next : null;
    const player2 = setPlayer(user);
    const signedIn = Boolean(user);
    const owner = user ? `user:${user.uid}` : "guest";
    if (document.body.dataset.scoreOwner !== owner) {
      document.body.dataset.scoreOwner = owner;
      document.dispatchEvent(new Event("hood-runner-account-changed"));
    }
    byId2("playerName").textContent = player2.name;
    for (const id of ["googleSignIn", "guestButton", "settingsGoogleConnect"]) { const el = byId2(id); if (el) el.hidden = signedIn; }
    for (const id of ["returningPlay", "welcomeAccount", "welcomeUserRow"]) { const el = byId2(id); if (el) el.hidden = !signedIn; }
    byId2("welcomeAccount").textContent = player2.name;
    byId2("welcomeHeading").textContent = signedIn ? "Your next best run awaits." : "Your next great escape.";
    byId2("welcomeNote").hidden = signedIn;
    accountStatus.textContent = signedIn ? `Connected \xB7 ${player2.name}` : "Guest \xB7 Scores on this device";
    status2.textContent = signedIn ? "" : supported ? "Use your Google name on the leaderboard." : "Google sign-in is available in the iOS app.";
    let best = 0;
    try {
      const value = Number(localStorage.getItem(`hoodRunnerBest:${owner}`)) || Number(localStorage.getItem("hoodRunnerBest"));
      if (Number.isSafeInteger(value) && value > 0) best = value;
    } catch {
    }
    const welcomeBestEl = byId2("welcomeBest");
    if (welcomeBestEl) {
      welcomeBestEl.hidden = !signedIn && best <= 0;
    }
    byId2("welcomeBestScore").textContent = best.toLocaleString("en-US");
    byId2("welcomeBestPrompt").textContent = best ? "Ready to beat it?" : "Your first adventure starts here.";
    if (signedIn) {
      getMyBest().then((remoteBest) => {
        if (!remoteBest || user?.uid !== next.uid) return;
        const key = `hoodRunnerBest:${owner}`;
        const localBest = Number(localStorage.getItem(key)) || 0;
        const restored = Math.max(localBest, remoteBest);
        localStorage.setItem(key, String(restored));
        byId2("welcomeBestScore").textContent = restored.toLocaleString("en-US");
        byId2("welcomeBestPrompt").textContent = "Ready to beat it?";
        document.dispatchEvent(new Event("hood-runner-best-restored"));
      }).catch(() => {
      });
    }
  }
  function menu() {
    identity(user);
    document.body.dataset.entry = "welcome";
    welcome.hidden = false;
    byId2("hoodGameSettingsPanel").hidden = true;
    byId2("hoodGameRanksPanel").hidden = true;
    byId2("hoodGameSettingsBtn").setAttribute("aria-expanded", "false");
    onEnter();
    byId2(user ? "returningPlay" : "guestButton").focus();
  }
  function enter(next) {
    identity(next);
    document.body.dataset.entry = user ? "google" : "guest";
    welcome.hidden = true;
    onEnter();
    byId2("hoodGameWrap").focus({ preventScroll: true });
  }
  async function signIn(fromSettings = false) {
    if (busy) return;
    const message = fromSettings ? accountStatus : status2;
    if (!supported) {
      message.textContent = "Google sign-in is available in the iOS app.";
      return;
    }
    lock(true);
    try {
      const result = await withLoading("Signing in with Google\u2026", () => FirebaseAuthentication.signInWithGoogle());
      if (!result.user?.uid) throw Error("missing_user");
      if (fromSettings) {
        identity(result.user);
        onEnter();
        byId2("hoodGameSettingsBtn").focus();
      } else enter(result.user);
    } catch {
      message.textContent = "Sign-in did not finish. Please try again.";
    } finally {
      lock(false);
    }
  }
  async function signOut() {
    if (busy || !user) return;
    lock(true);
    try {
      await withLoading("Signing out\u2026", () => FirebaseAuthentication.signOut());
      identity(null);
      menu();
    } catch {
      (welcome.hidden ? accountStatus : status2).textContent = "Could not log out. Please try again.";
    } finally {
      lock(false);
    }
  }
  byId2("googleSignIn").addEventListener("click", () => signIn());
  byId2("settingsGoogleConnect").addEventListener("click", () => signIn(true));
  byId2("guestButton").addEventListener("click", () => {
    if (!busy) enter(null);
  });
  byId2("returningPlay").addEventListener("click", () => {
    if (!busy && user) enter(user);
  });
  const sLogout = byId2("settingsLogout"); if (sLogout) sLogout.addEventListener("click", signOut);
  byId2("welcomeLogout").addEventListener("click", signOut);
  const donateBtn = byId2("welcomeDonate");
  if (donateBtn) {
    donateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const url = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=huakt@icloud.com&item_name=Support+Candle+Rush&currency_code=USD";
      window.open(url, "_blank");
    });
  }
  document.addEventListener("hood-runner-quit", menu);
  identity(null);
  if (!supported) return Promise.resolve();
  lock(true);
  return withLoading("Getting your runner ready\u2026", () => FirebaseAuthentication.getCurrentUser()).then((result) => identity(result.user)).catch(() => {
    status2.textContent = "Could not restore your account. Sign in again or play as Guest.";
  }).finally(() => lock(false));
}

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/settings.js
function initSettings(byId2, settingsPanel2) {
  const volumeControls = [["hoodGameMusicVol", "musicValue"], ["hoodGameSfxVol", "sfxValue"]];
  function syncVolumeUI() {
    for (const [inputId, outputId] of volumeControls) {
      const input = byId2(inputId);
      byId2(outputId).textContent = `${input.value}%`;
      input.style.setProperty("--volume", `${input.value}%`);
    }
  }
  for (const [inputId] of volumeControls) byId2(inputId).addEventListener("input", syncVolumeUI);
  new MutationObserver(syncVolumeUI).observe(settingsPanel2, { attributes: true, attributeFilter: ["hidden"] });
  syncVolumeUI();
}

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/app.js
init_dist();

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/node_modules/@capacitor/app/dist/esm/index.js
init_dist();
var App = registerPlugin("App", {
  web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.AppWeb())
});

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/game.js
var canvas = document.getElementById("hoodGameCanvas");
if (canvas) {
  let sendNativeAudio = function(action, values = {}) {
    if (!nativeAudioHandler) return false;
    nativeAudioHandler.postMessage({ action, music: live.music, sfx: live.sfx, muted: live.muted, ...values });
    return true;
  };
  let loadImage = function(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = ASSET_BASE + src;
    });
  }, updateBestLabel = function() {
    if (bestEl) bestEl.textContent = "Best: " + Math.floor(best);
  }, resetRun = function() {
    jumpBufferUntil = 0;
    showResult = null;
    player2.y = GROUND_Y - GROUND_HEIGHT;
    player2.vy = 0;
    player2.grounded = true;
    player2.runFrame = 0;
    player2.runTimer = 0;
    player2.jumpFrame = 0;
    player2.jumpTimer = 0;
    obstacles = [];
    coins = [];
    greenCandles = [];
    pumps = [];
    pumpActiveTimer = 0;
    player2.invulnerableTimer = 0;
    eventFreeze.active = false;
    eventFreeze.type = null;
    eventFreeze.timer = 0;
    const freezeBannerEl = document.getElementById("eventFreezeBanner");
    if (freezeBannerEl) freezeBannerEl.hidden = true;
    popups = [];
    speed = BASE_SPEED;
    elapsed = 0;
    score = 0;
    lastDisplayedScore = -1;
    nextObstacleAt = 900;
    nextCoinAt = 1400;
    nextGreenCandleAt = 3e3 + Math.random() * 2e3;
    nextPumpCheckAt = 1200;
    bgScrollX = 0;
  }, scheduleNextObstacle = function() {
    if (clusterChain > 0) {
      clusterChain--;
      pendingClusterFollow = true;
      const speedProgress = Math.min(1, Math.max(0, (speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED)));
      const earlyPairScale = 0.5 + 0.5 * speedProgress;
      const followBase = Math.max(260 * earlyPairScale, (620 - speed * 550) * earlyPairScale);
      nextObstacleAt = elapsed + followBase + Math.random() * 80;
      return;
    }
    pendingClusterFollow = false;
    const base = Math.max(650, 1500 - speed * 900);
    nextObstacleAt = elapsed + base + Math.random() * base * 0.6;
  }, scheduleNextCoin = function() {
    nextCoinAt = elapsed + 1e3 + Math.random() * 1400;
  }, scheduleNextGreenCandle = function() {
    nextGreenCandleAt = elapsed + 3500 + Math.random() * 3500;
  }, scheduleNextPump = function() {
    nextPumpCheckAt = elapsed + 1400 + Math.random() * 1200;

  }, getItemMinGap = function(typeA, typeB) {
    // Tuyet doi khong cho coin de len hoac xuat hien sat bat ky cay nen nao (do hay xanh)
    const isCoinAndCandle = (typeA === "coin" && (typeB === "candle" || typeB === "greenCandle" || typeB === "obstacle")) ||
                            (typeB === "coin" && (typeA === "candle" || typeA === "greenCandle" || typeA === "obstacle"));
    if (isCoinAndCandle) return 140; // Khoang cach toi thieu 140px dam bao khong bao gio de len nen
    if (typeA === "pump" || typeB === "pump") return 110;
    if (typeA === "rugged" || typeB === "rugged") return 80;
    if (typeA === "coin" && typeB === "coin") return 45;
    return 40;
  }, findSafeSpawnX = function(startX, width, itemType) {
    let x = startX;
    let changed = true;
    let loops = 0;
    const lists = [obstacles, coins, greenCandles, pumps];
    while (changed && loops < 60) {
      loops++;
      changed = false;
      for (let l = 0; l < 4; l++) {
        const arr = lists[l];
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          if (!item || item.taken) continue;
          const itemW = item.w || 40;
          const otherType = item.kind || (item.baseY !== undefined && item.floatAmp !== undefined ? "pump" : (item.percent !== undefined || item.spriteKey ? "greenCandle" : "candle"));
          const reqGap = getItemMinGap(itemType, otherType);
          if (x < item.x + itemW + reqGap && x + width > item.x - reqGap) {
            x = item.x + itemW + reqGap;
            changed = true;
            break;
          }
        }
        if (changed) break;
      }
    }
    return x;
  }, spawnPumpGreenCandle = function() {
    const h = 66;
    const w = 36;
    const hover = Math.random() < 0.45;
    const y = hover ? GROUND_Y - GROUND_HEIGHT - 38 - Math.random() * 24 : GROUND_Y - h - 4;
    const x = findSafeSpawnX(CW + 20, w, "greenCandle");
    greenCandles.push({ kind: "greenCandle", x, y, w, h, spriteKey: "greenCandle2", taken: false });
  }, spawnPump = function() {
    scheduleNextPump();
    if (pumpActiveTimer > 0) return;
    if (Math.random() >= 0.02) return; // Ti le pump xuat hien la 2%
    const sprite = SPRITES.pump;
    if (!sprite || !sprite.img) return;
    const ruggedH = Math.round(GROUND_HEIGHT * 0.66 * 0.70 * 2 * 0.70); // 59px
    const h = Math.round(ruggedH * 1.30 * 1.20); // Tang pump size them 20% (92px)
    const aspect = sprite.img.naturalWidth / sprite.img.naturalHeight;
    const w = Math.round(h * aspect);
    const isAir = Math.random() < 0.5;
    let baseY;
    let floatAmp = 0;
    if (isAir) {
      baseY = 55;
      floatAmp = 6;
    } else {
      baseY = GROUND_Y - h - 2;
      floatAmp = 0;
    }
    const floatSpeed = 0.0032;
    const y = baseY;
    const x = findSafeSpawnX(CW + 20, w, "pump");
    pumps.push({ kind: "pump", isAir, x, baseY, y, w, h, floatTimer: Math.random() * 1000, floatAmp, floatSpeed, taken: false });
  }, spawnObstacle = function() {
    if (pumpActiveTimer > 0) {
      scheduleNextObstacle();
      spawnPumpGreenCandle();
      return;
    }
    const isRugged = elapsed >= RUGGED_MIN_ELAPSED && Math.random() < RUGGED_CHANCE;
    const kind = isRugged ? "rugged" : "candle";
    const sprite = SPRITES[kind];
    const aspect = sprite.img.naturalWidth / sprite.img.naturalHeight;
    const isClusterFollow = pendingClusterFollow;
    pendingClusterFollow = false;
    const variantRoll = isRugged || isClusterFollow ? 1 : Math.random();
    const variant = variantRoll < 0.12 ? "falling" : variantRoll < 0.22 ? "overhead" : "ground";
    const startsPair = !isRugged && variant === "ground" && !isClusterFollow && clusterChain === 0 && Math.random() < 0.14;
    const isPaired = startsPair || isClusterFollow;
    if (startsPair) clusterChain = 1;
    let h, w;
    if (isRugged) {
      h = Math.round(GROUND_HEIGHT * 0.66 * 0.70 * 2 * 0.70);
      w = Math.round(h * aspect);
    } else if (variant === "overhead") {
      h = GROUND_HEIGHT * 0.55;
      w = GROUND_HEIGHT * aspect;
    } else {
      const ratios = isPaired ? PAIRED_CANDLE_RATIOS : CANDLE_HEIGHT_RATIOS;
      const ratio = ratios[Math.random() * ratios.length | 0];
      h = GROUND_HEIGHT * (variant === "falling" ? Math.min(ratio, 0.95) : ratio);
      w = GROUND_HEIGHT * aspect;
    }
    const x = findSafeSpawnX(CW + 20, w, kind);
    let baseY = GROUND_Y - h;
    let moveType = "none", moveAmp = 0, moveSpeed = 0;
    let startY = baseY;
    if (isRugged) {
      const isFlying = Math.random() < 0.5;
      if (isFlying) {
        // Bay tren khong: luon cao hon dau Hero it nhat 18px ngay ca khi o diem thap nhat cua dao dong
        baseY = GROUND_Y - GROUND_HEIGHT - h - (28 + Math.random() * 10);
        moveType = "vertical";
        moveAmp = 6 + Math.random() * 4;
        moveSpeed = 0.0028 + Math.random() * 0.0014;
      } else {
        baseY = GROUND_Y - h - 2;
        moveType = "none";
        moveAmp = 0;
      }
      startY = baseY;
    } else if (variant === "falling") {
      moveType = "falling";
      startY = -h - 40 - Math.random() * 60;
    } else if (variant === "overhead") {
      baseY = GROUND_Y - GROUND_HEIGHT - h - (10 + Math.random() * 20);
      startY = baseY;
    }
    obstacles.push({ kind, baseX: x, x, baseY, y: startY, w, h, moveType, moveAmp, moveSpeed, moveTimer: 0 });
    scheduleNextObstacle();
  }, spawnCoin = function() {
    scheduleNextCoin();
    if (pumpActiveTimer > 0) return;
    const sprite = SPRITES.coin;
    const h = 46;
    const w = h * (sprite.img.naturalWidth / sprite.frames / sprite.img.naturalHeight);
    const hover = Math.random() < 0.55;
    const y = hover ? GROUND_Y - GROUND_HEIGHT - 70 - Math.random() * 30 : GROUND_Y - h - 6;
    const x = findSafeSpawnX(CW + 20, w, "coin");
    coins.push({ kind: "coin", x, y, w, h, frame: Math.random() * sprite.frames | 0, timer: 0, taken: false });
  }, spawnGreenCandle = function() {
    const roll = Math.random();
    const tier = pumpActiveTimer > 0
      ? { points: 200, height: 66, spriteKey: "greenCandle2" }
      : GREEN_CANDLE_TIERS.find((item) => roll < item.cutoff);
    scheduleNextGreenCandle();
    if (!tier) return;
    const h = tier.height;
    const w = 36;
    const hover = Math.random() < 0.45;
    const y = hover ? GROUND_Y - GROUND_HEIGHT - 38 - Math.random() * 24 : GROUND_Y - h - 4;
    const x = findSafeSpawnX(CW + 20, w, "greenCandle");
    greenCandles.push({ kind: "greenCandle", x, y, w, h, percent: tier.percent, points: tier.points, spriteKey: tier.spriteKey, taken: false });
  }, startRun3 = function() {
    resetRun();
    state = STATE.SPAWN;
    spawnTimer = 0;
    spawnBlinkOn = true;
    hideOverlay();
    ensureLoopRunning();
    startRun2();
    startMusicPlayback();
  }, updateSpawn = function(dt) {
    spawnTimer += dt;
    spawnBlinkOn = Math.floor(spawnTimer / BLINK_TOGGLE_MS) % 2 === 0;
    if (spawnTimer >= SPAWN_DURATION_MS) {
      state = STATE.PLAYING;
      fadeMusicIn(FADE_IN_MS);
      startRunSfx();
    }
  }, endRun = function() {
    state = STATE.OVER;
    resultShown = false;
    hitTimer = 0;
    hitBlinkOn = true;
    pumpActiveTimer = 0;
    player2.invulnerableTimer = 0;
    eventFreeze.active = false;
    eventFreeze.timer = 0;
    if (player2.vy < 0) player2.vy = 0;
    stopMusic();
    stopRunSfx();
    const formatted = Math.floor(score).toLocaleString("en-US");
    const isHighScore = score > best;
    if (isHighScore) {
      best = score;
      try {
        const owner = document.body.dataset.scoreOwner || "guest";
        localStorage.setItem("hoodRunnerBest:" + owner, String(Math.floor(best)));
        localStorage.setItem("hoodRunnerBest", String(Math.floor(best)));
      } catch (err) {
      }
      updateBestLabel();
    }
    const renderGameOverCard = (isHigh, formattedScore, currentVal, bestVal) => {
      if (overlayHideTimer) {
        clearTimeout(overlayHideTimer);
        overlayHideTimer = null;
      }
      const startBanner = document.getElementById("hoodGameStartBanner");
      const card = document.getElementById("gameOverCard");
      const titleEl = document.getElementById("gameOverTitle");
      const subEl = document.getElementById("gameOverSubtitle");
      const curEl = document.getElementById("gameOverCurrentScore");
      const bestEl = document.getElementById("gameOverBestScore");
      if (startBanner) startBanner.hidden = true;
      if (card) {
        card.hidden = false;
        card.classList.toggle("is-high-score", isHigh);
      }
      if (titleEl) {
        titleEl.textContent = isHigh ? "NEW HIGH SCORE!" : "GAME OVER";
      }
      if (subEl) {
        subEl.textContent = isHigh ? "New personal record achieved!" : "Better luck next run!";
      }
      if (curEl) curEl.textContent = formattedScore;
      if (bestEl) bestEl.textContent = bestVal.toLocaleString("en-US");
      if (overlayTitle) {
        overlayTitle.textContent = isHigh ? "NEW HIGH SCORE!" : "GAME OVER";
      }
      if (saveScoreForm) saveScoreForm.hidden = true;
      if (overlay2) {
        overlay2.hidden = false;
        void overlay2.offsetWidth;
        overlay2.classList.add("is-visible");
      }
    };
    showResult = () => {
      resultShown = true;
      overSince = performance.now();
      const currentScoreNum = Math.floor(score);
      const bestScoreNum = Math.floor(best);
      renderGameOverCard(isHighScore, formatted, currentScoreNum, bestScoreNum);
      void submit2(void 0, currentScoreNum);
    };
  }, updateHitBlink = function(dt) {
    hitTimer += dt;
    if (!player2.grounded) {
      player2.vy += GRAVITY * dt;
      player2.y += player2.vy * dt;
      if (player2.y >= GROUND_Y - GROUND_HEIGHT) {
        player2.y = GROUND_Y - GROUND_HEIGHT;
        player2.vy = 0;
        player2.grounded = true;
      }
    }
    if (hitTimer >= OVERLAY_DELAY_MS) {
      player2.y = GROUND_Y - GROUND_HEIGHT;
      player2.vy = 0;
      player2.grounded = true;
      hitBlinkOn = false;
      if (showResult) {
        showResult();
        showResult = null;
      }
      return;
    }
    hitBlinkOn = Math.floor(hitTimer / BLINK_TOGGLE_MS) % 2 === 0;
  }, jump = function() {
    if (paused22 || eventFreeze.active || document.body.dataset.busy === "true" || document.body.dataset.entry === "welcome") return;
    if (awaitingSave) return;
    if (state === STATE.IDLE) {
      startRun3();
      return;
    }
    if (state === STATE.OVER) {
      if (!resultShown) return;
      if (performance.now() - overSince < RESTART_COOLDOWN) return;
      startRun3();
      return;
    }
    if (state !== STATE.PLAYING) return;
    if (!player2.grounded) {
      jumpBufferUntil = performance.now() + JUMP_BUFFER_MS;
      return;
    }
    jumpBufferUntil = 0;
    player2.vy = JUMP_VELOCITY;
    player2.grounded = false;
    player2.jumpFrame = 0;
    player2.jumpTimer = 0;
    playSfx("jump");
    stopRunSfx();
  }, showOverlay = function(title, lines) {
    if (!overlay2) return;
    if (overlayHideTimer) {
      clearTimeout(overlayHideTimer);
      overlayHideTimer = null;
    }
    const startBanner = document.getElementById("hoodGameStartBanner");
    const card = document.getElementById("gameOverCard");
    if (startBanner) startBanner.hidden = false;
    if (card) card.hidden = true;
    if (overlayTitle) {
      overlayTitle.textContent = title || "";
      overlayTitle.hidden = !title;
      overlayTitle.classList.toggle("hood-game-overlay-title-sm", title === "GAME OVER" || title === "RUGGED!");
    }
    if (overlayLines) {
      overlayLines.innerHTML = "";
      lines.forEach((line) => {
        const p = document.createElement("p");
        if (typeof line === "string") {
          p.textContent = line;
        } else {
          p.textContent = line.text;
          if (line.cls) p.className = line.cls;
        }
        overlayLines.appendChild(p);
      });
    }
    if (saveScoreForm) saveScoreForm.hidden = true;
    overlay2.hidden = false;
    void overlay2.offsetWidth;
    overlay2.classList.add("is-visible");
  }, hideOverlay = function() {
    if (!overlay2) return;
    overlay2.classList.remove("is-visible");
    overlayHideTimer = setTimeout(() => {
      overlay2.hidden = true;
      const card = document.getElementById("gameOverCard");
      if (card) card.hidden = true;
      overlayHideTimer = null;
    }, 260);
  }, hitHazard = function(b) {
    // Vat can nguy hiem (Nen do, Rugged): thu gon hitbox 16% tao do khoan dung, tranh chet oan
    const pad = 0.16;
    const bx = b.x + b.w * pad, bw = b.w * (1 - pad * 2);
    const by = b.y + b.h * pad, bh = b.h * (1 - pad * 2);
    return playerHitBox.x < bx + bw && playerHitBox.x + playerHitBox.w > bx && playerHitBox.y < by + bh && playerHitBox.y + playerHitBox.h > by;
  }, hitCollectible = function(b) {
    // Vat pham an thuong (Coin, Nen xanh, Pump): mo rong vung an 8% giup an muot ma, nhay ben
    const pad = -0.08;
    const bx = b.x + b.w * pad, bw = b.w * (1 - pad * 2);
    const by = b.y + b.h * pad, bh = b.h * (1 - pad * 2);
    return playerHitBox.x < bx + bw && playerHitBox.x + playerHitBox.w > bx && playerHitBox.y < by + bh && playerHitBox.y + playerHitBox.h > by;
  }, hit = function(b) {
    return hitHazard(b);
  }, update = function(dt) {
    if (eventFreeze.active) {
      eventFreeze.timer -= dt;

      if (eventFreeze.type === "pump") {
        const elapsed = 2000 - eventFreeze.timer;
        const progress = Math.min(1, Math.max(0, elapsed / 500)); // Cong diem tren dau va HUD trong 0.5s
        score = Math.round(eventFreeze.initialScore + (eventFreeze.targetScore - eventFreeze.initialScore) * progress);
        if (score > best) {
          best = Math.floor(score);
          updateBestLabel();
        }

        // Delay tren khong: giu nguyen vi tri tren khong trong suot 2s
        player2.vy = 0;

        // Khi het 2s:
        if (eventFreeze.timer <= 0) {
          eventFreeze.active = false;
          score = eventFreeze.targetScore;

          // Dap xuong dat
          player2.grounded = true;
          player2.y = GROUND_Y - GROUND_HEIGHT;
          player2.vy = 0;
          playSfx("land");
          startRunSfx();

          // Bat dau fade in nhac moi (bonus-time.mp3)
          startBonusMusic();

          // Bat dau 15s voi nen xanh
          pumpActiveTimer = 15000;
          coins = [];
          obstacles = [];
          spawnPumpGreenCandle();
        }
        return;
      }

      // Rugged freeze: bo chu & so o giua man hinh, nhap nhay, -90% tren dau hero, tiep dat va di tiep
      const elapsedFreeze = 1200 - eventFreeze.timer;
      const scoreProgress = Math.min(1, Math.max(0, elapsedFreeze / 500)); // Dem lui mat 90% trong 0.5s
      score = Math.round(eventFreeze.initialScore + (eventFreeze.targetScore - eventFreeze.initialScore) * scoreProgress);
      if (score > best) {
        best = Math.floor(score);
        updateBestLabel();
      }

      // Giu nguyen vi tri tren khong, khong roi khi dang freeze
      player2.vy = 0;

      // Khi het freeze: tiep dat va di tiep
      if (eventFreeze.timer <= 0) {
        eventFreeze.active = false;
        score = eventFreeze.targetScore;

        // Tiep dat
        player2.grounded = true;
        player2.y = GROUND_Y - GROUND_HEIGHT;
        player2.vy = 0;
        playSfx("land");

        // Di tiep
        startRunSfx();
        player2.invulnerableTimer = 1200; // Bat tu nhap nhay 1.2s de tiep tuc an toan
        startMusicPlayback(); // Nhac tiep tuc
      }
      return;
    }
    elapsed += dt;
    speed = Math.min(MAX_SPEED, BASE_SPEED + elapsed * SPEED_RAMP);
    score += dt * speed * 0.05;
    if (!player2.grounded) {
      player2.vy += GRAVITY * dt;
      player2.y += player2.vy * dt;
      if (player2.y >= GROUND_Y - GROUND_HEIGHT) {
        player2.y = GROUND_Y - GROUND_HEIGHT;
        player2.vy = 0;
        player2.grounded = true;
        playSfx("land");
        startRunSfx();
        if (performance.now() < jumpBufferUntil) {
          jumpBufferUntil = 0;
          jump();
        }
      }
    }
    if (player2.grounded) {
      player2.runTimer += dt * speed;
      while (player2.runTimer > 28) {
        player2.runTimer -= 28;
        player2.runFrame = (player2.runFrame + 1) % SPRITES.run.frames;
      }
    } else {
      player2.jumpTimer += dt;
      while (player2.jumpTimer > 64 && player2.jumpFrame < SPRITES.jump.frames - 1) {
        player2.jumpTimer -= 64;
        player2.jumpFrame++;
      }
    }
    // Cap nhat playerHitBox ngay sau khi cap nhat vi tri va frame cua nhan vat
    const playerW = GROUND_HEIGHT * (player2.grounded ? runAspect : jumpAspect);
    let topPad = 0.16;
    if (!player2.grounded && player2.jumpFrame >= 12 && player2.jumpFrame <= 21) {
      // Khi nhan vat cuon nguoi tren dinh cu nhay (frame 12-21), dau ha thap, tranh phantom hitbox tren dau
      topPad = 0.28;
    }
    playerHitBox.x = player2.x + playerW * 0.16;
    playerHitBox.w = playerW * (1 - 0.16 * 2);
    playerHitBox.y = player2.y + GROUND_HEIGHT * topPad;
    playerHitBox.h = GROUND_HEIGHT * (1 - topPad - 0.16 * 0.5);
    if (player2.invulnerableTimer > 0) {
      player2.invulnerableTimer = Math.max(0, player2.invulnerableTimer - dt);
    }
    if (pumpActiveTimer > 0) {
      pumpActiveTimer = Math.max(0, pumpActiveTimer - dt);
      if (pumpActiveTimer <= 0) {
        // Sau khi het 15s lai bat dau nhac cu!
        startMusicPlayback(1000);
      }
    }
    if (elapsed >= nextObstacleAt) spawnObstacle();
    if (elapsed >= nextCoinAt) spawnCoin();
    if (elapsed >= nextGreenCandleAt) spawnGreenCandle();
    if (elapsed >= nextPumpCheckAt) spawnPump();
    const dx = speed * dt;
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.baseX -= dx;
      o.moveTimer += dt;
      if (o.moveType === "vertical") {
        o.x = o.baseX;
        o.y = o.baseY + Math.sin(o.moveTimer * o.moveSpeed) * o.moveAmp;
      } else if (o.moveType === "horizontal") {
        o.x = o.baseX + Math.sin(o.moveTimer * o.moveSpeed) * o.moveAmp;
        o.y = o.baseY;
      } else if (o.moveType === "falling") {
        o.x = o.baseX;
        o.y += FALL_SPEED * dt;
        if (o.y >= o.baseY) {
          o.y = o.baseY;
          o.moveType = "none";
        }
      } else {
        o.x = o.baseX;
        o.y = o.baseY;
      }
      if (o.baseX + o.w <= -20) obstacles.splice(i, 1);
    }
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.x -= dx;
      c.timer += dt;
      if (c.timer > 45) {
        c.timer = 0;
        c.frame = (c.frame + 1) % SPRITES.coin.frames;
      }
      if (c.x + c.w <= -20 || c.taken) coins.splice(i, 1);
    }
    for (let i = greenCandles.length - 1; i >= 0; i--) {
      const candle = greenCandles[i];
      candle.x -= dx;
      if (candle.x + candle.w <= -20 || candle.taken) greenCandles.splice(i, 1);
    }
    for (let i = pumps.length - 1; i >= 0; i--) {
      const p = pumps[i];
      p.x -= dx;
      if (p.floatAmp > 0) {
        p.floatTimer = (p.floatTimer || 0) + dt;
        p.y = p.baseY + Math.sin(p.floatTimer * (p.floatSpeed || 0.0032)) * p.floatAmp;
      } else {
        p.y = p.baseY;
      }
      if (p.x + p.w <= -20 || p.taken) {
        pumps.splice(i, 1);
        continue;
      }
      const hitPump = hitCollectible(p);
      if (!p.taken && hitPump) {
        if (eventFreeze.active) continue;
        p.taken = true;

        // 1. Dung nhac & dung tieng chay chan ngay lap tuc
        stopMusic();
        stopRunSfx();

        // 2. Tat ca item dang sau pump bien mat, chi tru nen xanh
        obstacles = [];
        coins = [];
        pumps = [];

        // 3. Phat file levelup.mp3 moi
        playSfx("levelup");

        // 4. Delay tren khong: giu nguyen vi tri tren khong, khong roi xuong
        player2.vy = 0;

        // 5. Khoi dong 2s delay tren khong, nhap nhay va cong diem tren dau hero (luy tien theo moc 10k, cap 10k)
        eventFreeze.active = true;
        eventFreeze.type = "pump";
        eventFreeze.timer = 2000;
        eventFreeze.initialScore = Math.floor(score);
        const pumpTier = Math.floor(eventFreeze.initialScore / 10000) + 1;
        const pumpBonus = Math.min(10, Math.max(1, pumpTier)) * 1000;
        eventFreeze.pumpBonus = pumpBonus;
        eventFreeze.targetScore = eventFreeze.initialScore + pumpBonus;
        break;
      }
    }
    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      p.x -= dx;
      p.life += dt;
      if (p.life >= p.dur) popups.splice(i, 1);
    }
    const backgroundCycleWidth = bgDrawW * 2;
    if (backgroundCycleWidth > 0) {
      bgScrollX = (bgScrollX - dx * 0.5) % backgroundCycleWidth;
    }
    // playerHitBox already updated freshly above
    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];
      if (hitHazard(o)) {
        if (player2.invulnerableTimer > 0 || eventFreeze.active) continue;
        if (o.kind === "rugged") {
          playSfx("impact");
          stopMusic(); // Nhac tam dung
          stopRunSfx();
          obstacles.splice(i, 1);
          i--;
          player2.vy = 0; // Giu nguyen vi tri tren khong, khong roi
          eventFreeze.active = true;
          eventFreeze.type = "rugged";
          eventFreeze.timer = 1200; // Freeze 1.2s
          eventFreeze.initialScore = Math.floor(score);
          eventFreeze.targetScore = Math.max(0, Math.floor(score * 0.10));
          break;
        } else {
          playSfx("impact");
          endRun();
          break;
        }
      }
    }
    if (state === STATE.OVER || eventFreeze.active) return;
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      if (!c.taken && hitCollectible(c)) {
        c.taken = true;
        score += COIN_SCORE;
        popups.push({ x: c.x + c.w / 2, y: c.y, life: 0, dur: 650, text: "+" + COIN_SCORE });
        playSfx("coin");
      }
    }
    for (let i = 0; i < greenCandles.length; i++) {
      const candle = greenCandles[i];
      if (!candle.taken && hitCollectible(candle)) {
        candle.taken = true;
        playSfx("coin");

        if (pumpActiveTimer > 0) {
          // Trong 15s Pump: diem nen xanh tich luy theo moc 10k (100, 200, 300... cap o 1000)
          const pumpCandleTier = Math.floor(score / 10000) + 1;
          const candleBonus = Math.min(10, Math.max(1, pumpCandleTier)) * 100;
          score += candleBonus;
          popups.push({
            x: candle.x + candle.w / 2,
            y: candle.y,
            life: 0,
            dur: 850,
            text: "+" + candleBonus,
            color: "#4eff87"
          });
        } else {
          // Ngoai 15s pump: an nen xanh cong diem co dinh 100 - 300 - 500 - 1000
          const bonus = candle.points || 100;
          score += bonus;
          popups.push({
            x: candle.x + candle.w / 2,
            y: candle.y,
            life: 0,
            dur: 950,
            text: "+" + bonus,
            color: "#4eff87"
          });
        }
      }
    }
  }, drawFrame = function(sprite, frameIndex, x, y, w, h) {
    if (sprite === SPRITES.jump && frameIndex >= 3 && frameIndex <= 10) frameIndex = frameIndex <= 6 ? 2 : 11;
    const img = sprite.img;
    ctx.drawImage(img, frameIndex * sprite.frameW, 0, sprite.frameW, sprite.frameH, x, y, w, h);
  }, drawGreenCandle = function(candle) {
    const spriteKey = candle.spriteKey;
    const sprite = (spriteKey && SPRITES[spriteKey]) || SPRITES.greenCandle || SPRITES.candle;
    if (sprite && sprite.img) {
      const b = spriteKey && GREEN_CANDLE_BOUNDS[spriteKey];
      if (b) {
        ctx.drawImage(sprite.img, b.sx, b.sy, b.sw, b.sh, candle.x, candle.y, candle.w, candle.h);
      } else {
        ctx.drawImage(sprite.img, candle.x, candle.y, candle.w, candle.h);
      }
    }
  }, playerVisible = function() {
    if (state === STATE.LOADING || state === STATE.IDLE) return false;
    if (state === STATE.SPAWN) return spawnBlinkOn;
    if (state === STATE.OVER) return !resultShown ? hitBlinkOn : true;
    return true;
  }, drawPlayer = function() {
    if (!playerVisible()) return;
    if (eventFreeze.active && ((eventFreeze.timer / 100 | 0) % 2 === 0)) return;
    if (player2.invulnerableTimer > 0 && ((player2.invulnerableTimer / 90 | 0) % 2 === 0)) return;
    const h = GROUND_HEIGHT;
    if (state === STATE.SPAWN || state === STATE.OVER) {
      if (player2.grounded) {
        drawFrame(SPRITES.stand, 0, player2.x, player2.y, h * standAspect, h);
      } else {
        const w = h * jumpAspect;
        drawFrame(SPRITES.jump, player2.jumpFrame, player2.x, player2.y, w, h);
      }
    } else if (eventFreeze.active && eventFreeze.type === "pump") {
      // Delay tren khong, nhap nhay trong 2s (nhip nhap nhay 100ms do dong if phia tren dieu khien)
      if (player2.grounded) {
        drawFrame(SPRITES.stand, 0, player2.x, player2.y, h * standAspect, h);
      } else {
        const w = h * jumpAspect;
        drawFrame(SPRITES.jump, player2.jumpFrame, player2.x, player2.y, w, h);
      }
    } else if (player2.grounded) {
      const w = h * runAspect;
      drawFrame(SPRITES.run, player2.runFrame, player2.x, player2.y, w, h);
    } else {
      const w = h * jumpAspect;
      drawFrame(SPRITES.jump, player2.jumpFrame, player2.x, player2.y, w, h);
    }
  }, drawGroundShadow = function(cx, w, lift) {
    const t = Math.min(1, Math.max(0, lift) / 140);
    const alpha = 0.24 * (1 - t * 0.75);
    if (alpha < 0.02) return;
    const sw = w * (1 - t * 0.3);
    const sh = 9 * (1 - t * 0.4);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(cx, GROUND_Y + 3, Math.max(1, sw / 2), Math.max(1, sh / 2), 0, 0, Math.PI * 2);
    ctx.fill();
  }, draw = function() {
    ctx.clearRect(0, 0, CW, CH);
    const bg = SPRITES.background.img;
    const backgroundCycleWidth = bgDrawW * 2;
    const normalizedScroll = (bgScrollX % backgroundCycleWidth + backgroundCycleWidth) % backgroundCycleWidth;
    let pairX = normalizedScroll - backgroundCycleWidth;
    while (pairX < CW) {
      ctx.drawImage(bg, 0, 0, bg.naturalWidth, bgSourceH, pairX, 0, bgDrawW, GROUND_Y);

      ctx.save();
      ctx.translate(pairX + backgroundCycleWidth, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(bg, 0, 0, bg.naturalWidth, bgSourceH, 0, 0, bgDrawW, GROUND_Y);
      ctx.restore();

      pairX += backgroundCycleWidth;
    }
    ctx.fillStyle = "#1a2916";
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      if (!c.taken) drawGroundShadow(c.x + c.w / 2, c.w, GROUND_Y - c.h - c.y);
    }
    // green candle uses direct sprite without ground shadow overlay
    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];
      drawGroundShadow(o.x + o.w / 2, o.w, GROUND_Y - o.h - o.y);
    }
    if (playerVisible()) {
      const playerW = GROUND_HEIGHT * ((state === STATE.SPAWN || state === STATE.OVER) ? (player2.grounded ? standAspect : jumpAspect) : (player2.grounded ? runAspect : jumpAspect));
      drawGroundShadow(player2.x + playerW / 2, playerW * 0.95, GROUND_Y - GROUND_HEIGHT - player2.y);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      if (!c.taken) drawFrame(SPRITES.coin, c.frame, c.x, c.y, c.w, c.h);
    }
    for (let i = 0; i < greenCandles.length; i++) {
      const candle = greenCandles[i];
      if (!candle.taken) drawGreenCandle(candle);
    }
    for (let i = 0; i < pumps.length; i++) {
      const p = pumps[i];
      if (!p.taken && SPRITES.pump && SPRITES.pump.img) {
        ctx.drawImage(SPRITES.pump.img, p.x, p.y, p.w, p.h);
      }
    }
    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];
      if (SPRITES[o.kind] && SPRITES[o.kind].img) {
        ctx.drawImage(SPRITES[o.kind].img, o.x, o.y, o.w, o.h);
      }
    }
    drawPlayer();
    if (eventFreeze.active) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const aspect = player2.grounded ? standAspect : jumpAspect;
      const playerW = GROUND_HEIGHT * aspect;
      const hx = player2.x + playerW / 2;
      const hy = player2.y - 14;

      if (eventFreeze.type === "pump") {
        ctx.font = "bold 34px 'Times New Roman', Times, serif";
        ctx.fillStyle = "#4eff87";
        ctx.shadowColor = "rgba(78, 255, 135, 1)";
        ctx.shadowBlur = 20;
        ctx.fillText("+" + (eventFreeze.pumpBonus || 1000), hx, hy);
      } else if (eventFreeze.type === "rugged") {
        ctx.font = "bold 34px 'Times New Roman', Times, serif";
        ctx.fillStyle = "#ff3333";
        ctx.shadowColor = "rgba(255, 51, 51, 1)";
        ctx.shadowBlur = 20;
        ctx.fillText("-90%", hx, hy);
      }
      ctx.restore();
    }

    if (popups.length) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "bold 32px 'Times New Roman', Times, serif";
      for (let i = 0; i < popups.length; i++) {
        const p = popups[i];
        const t = p.life / p.dur;
        ctx.globalAlpha = Math.max(0, 1 - t);
        ctx.fillStyle = p.color || "#e0b23a";
        if (p.color === "#ff4d4d" || p.color === "#ff3b30") {
          ctx.shadowColor = "rgba(255, 59, 48, 1)";
          ctx.shadowBlur = 20;
        } else if (p.color === "#4eff87" || p.color === "#30d158") {
          ctx.shadowColor = "rgba(78, 255, 135, 1)";
          ctx.shadowBlur = 20;
        } else {
          ctx.shadowColor = "rgba(246, 215, 115, 0.9)";
          ctx.shadowBlur = 16;
        }
        ctx.fillText(p.text, p.x, p.y - t * 42);
      }
      ctx.restore();
    }
    const shownScore = Math.floor(score);
    if (scoreEl && shownScore !== lastDisplayedScore) {
      lastDisplayedScore = shownScore;
      scoreEl.textContent = String(shownScore);
    }
  }, loop = function(ts) {
    if (paused22) {
      loopScheduled = false;
      lastTs = 0;
      return;
    }
    if (!lastTs) lastTs = ts;
    const dt = Math.min(48, ts - lastTs);
    lastTs = ts;
    if (state === STATE.PLAYING) update(dt);
    else if (state === STATE.SPAWN) updateSpawn(dt);
    else if (state === STATE.OVER && !resultShown) updateHitBlink(dt);
    if (assetsReady) draw();
    if (state === STATE.PLAYING || state === STATE.SPAWN || state === STATE.OVER && !resultShown) {
      requestAnimationFrame(loop);
    } else {
      loopScheduled = false;
    }
  }, ensureLoopRunning = function() {
    if (paused22 || loopScheduled || !assetsReady) return;
    loopScheduled = true;
    lastTs = 0;
    requestAnimationFrame(loop);
  }, loadStoredVolume = function(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const v = parseFloat(raw);
      return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;
    } catch (err) {
      return fallback;
    }
  }, clamp01 = function(v) {
    return Math.min(1, Math.max(0, v));
  }, ensureAudioCtx = function() {
    if (actx) return actx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    actx = new AudioCtx();
    masterGain = actx.createGain();
    masterGain.connect(actx.destination);
    musicGain = actx.createGain();
    musicGain.connect(masterGain);
    sfxGain = actx.createGain();
    sfxGain.connect(masterGain);
    runGain = actx.createGain();
    runGain.connect(masterGain);
    musicGain.gain.value = 0;
    sfxGain.gain.value = live.sfx;
    runGain.gain.value = live.sfx;
    masterGain.gain.value = live.muted ? 0 : 1;
    return actx;
  }, resumeCtx = function() {
    if (!paused22 && actx && actx.state === "suspended") actx.resume().catch(() => {
    });
  }, rampGain = function(param, value, immediate) {
    if (!param || !actx) return;
    if (immediate) {
      param.cancelScheduledValues(actx.currentTime);
      param.setValueAtTime(value, actx.currentTime);
    } else {
      param.setTargetAtTime(value, actx.currentTime, GAIN_SMOOTH);
    }
  }, ensureMusicEl = function() {
    if (musicEl) return musicEl;
    musicEl = new Audio();
    musicEl.loop = true;
    musicEl.preload = "auto";
    musicEl.volume = 1;
    const ctx2 = ensureAudioCtx();
    if (ctx2 && ctx2.createMediaElementSource) {
      try {
        ctx2.createMediaElementSource(musicEl).connect(musicGain);
        musicRouted = true;
      } catch (err) {
        musicRouted = false;
      }
    }
    if (!musicRouted) musicEl.volume = 0;
    musicEl.addEventListener("playing", onMusicPlaying);
    return musicEl;
  }, setMusicLevel = function(v, immediate) {
    const level = clamp01(v);
    if (musicRouted) rampGain(musicGain && musicGain.gain, level, immediate);
    else if (musicEl) musicEl.volume = level;
  }, musicLevel = function() {
    if (musicRouted) return musicGain ? musicGain.gain.value : 0;
    return musicEl ? musicEl.volume : 0;
  }, beginFade = function(ms) {
    if (musicFadeTimer) {
      clearInterval(musicFadeTimer);
      musicFadeTimer = null;
    }
    const from = musicLevel();
    const startTs = performance.now();
    musicFadeTimer = setInterval(() => {
      const t = Math.min(1, (performance.now() - startTs) / ms);
      setMusicLevel(from + (live.music - from) * t);
      if (t >= 1) {
        clearInterval(musicFadeTimer);
        musicFadeTimer = null;
      }
    }, 60);
  }, fadeMusicIn = function(ms) {
    if (!musicEl) return;
    if (!musicAudible) {
      pendingFadeMs = ms;
      return;
    }
    beginFade(ms);
  }, onMusicPlaying = function() {
    musicAudible = true;
    if (pendingFadeMs) {
      const ms = pendingFadeMs;
      pendingFadeMs = 0;
      beginFade(ms);
    }
  }, pickTrackIndex = function() {
    if (MUSIC_TRACKS.length <= 1) return 0;
    let idx;
    do {
      idx = Math.random() * MUSIC_TRACKS.length | 0;
    } while (idx === lastTrackIdx);
    return idx;
  }, playMusicEl = function() {
    if (paused22 || !musicEl) return;
    const p = musicEl.play();
    if (p && p.catch) p.catch(() => {
    });
  }, startMusicPlayback = function(fadeMs = 0) {
    if (musicFadeTimer) {
      clearInterval(musicFadeTimer);
      musicFadeTimer = null;
    }
    musicAudible = false;
    pendingFadeMs = 0;
    lastTrackIdx = pickTrackIndex();
    const effectiveFadeSec = (fadeMs > 0 ? fadeMs : FADE_IN_MS) / 1e3;
    if (sendNativeAudio("playMusic", { file: MUSIC_TRACKS[lastTrackIdx], fadeDuration: effectiveFadeSec })) return;
    const el = ensureMusicEl();
    resumeCtx();
    el.src = ASSET_BASE + MUSIC_BASE + MUSIC_TRACKS[lastTrackIdx];
    el.currentTime = 0;
    setMusicLevel(0, true);
    if (live.muted) return;
    playMusicEl();
  }, startBonusMusic = function() {
    if (musicFadeTimer) {
      clearInterval(musicFadeTimer);
      musicFadeTimer = null;
    }
    musicAudible = false;
    pendingFadeMs = 0;
    const trackIdx = pickBonusTrackIndex();
    const trackFile = BONUS_MUSIC_TRACKS[trackIdx];
    if (sendNativeAudio("playMusic", { file: trackFile, fadeDuration: 0.8 })) return;
    const el = ensureMusicEl();
    resumeCtx();
    el.src = ASSET_BASE + MUSIC_BASE + trackFile;
    el.currentTime = 0;
    setMusicLevel(0, true);
    if (live.muted) return;
    playMusicEl();
    fadeMusicIn(800);
  }, stopMusic = function() {
    if (sendNativeAudio("stopMusic")) return;
    if (musicFadeTimer) {
      clearInterval(musicFadeTimer);
      musicFadeTimer = null;
    }
    pendingFadeMs = 0;
    musicAudible = false;
    setMusicLevel(0, true);
    if (musicEl) musicEl.pause();
  }, loadBuffer = function(file) {
    if (audioBuffers[file]) return audioBuffers[file];
    const ctx2 = ensureAudioCtx();
    if (!ctx2) return Promise.resolve(null);
    const p = fetch(ASSET_BASE + MUSIC_BASE + file).then((r) => r.arrayBuffer()).then((ab) => ctx2.decodeAudioData(ab)).catch((err) => {
      console.warn("Candle Rush: audio load failed", file, err);
      return null;
    });
    audioBuffers[file] = p;
    return p;
  }, preloadAudio = function() {
    if (!ensureAudioCtx()) return;
    const critical = [RUN_SFX_FILE].concat(Object.values(SFX_FILES));
    critical.reduce((p, file) => p.then(() => loadBuffer(file)), Promise.resolve());
  }, stopRunSfx = function() {
    nativeRunPlaying = false;
    if (sendNativeAudio("stopRun")) return;
    if (runSource) {
      try {
        runSource.stop();
      } catch (err) {
      }
      runSource = null;
    }
  }, setMusicVolume = function(v) {
    live.music = clamp01(v);
    if (sendNativeAudio("setMusicVolume")) return;
    if (!musicFadeTimer) setMusicLevel(live.music);
  }, setSfxVolume = function(v) {
    live.sfx = clamp01(v);
    if (sendNativeAudio("setSfxVolume")) return;
    rampGain(sfxGain && sfxGain.gain, live.sfx, false);
    rampGain(runGain && runGain.gain, live.sfx, false);
  }, setMuted = function(muted) {
    live.muted = !!muted;
    if (soundToggle) soundToggle.checked = !live.muted;
    if (sendNativeAudio("setMuted")) {
      if (live.muted) nativeRunPlaying = false;
      else if (!paused22 && state === STATE.PLAYING && player2.grounded) startRunSfx();
      return;
    }
    rampGain(masterGain && masterGain.gain, live.muted ? 0 : 1, false);
    if (live.muted) {
      if (musicEl) musicEl.pause();
      stopRunSfx();
    } else {
      resumeCtx();
      if (musicEl && musicEl.src && (state === STATE.SPAWN || state === STATE.PLAYING)) playMusicEl();
      if (state === STATE.PLAYING && player2.grounded) startRunSfx();
    }
  }, rememberSynced = function(v) {
    if (!(v > syncedBest)) return;
    syncedBest = Math.floor(v);
    try {
      localStorage.setItem(SYNCED_KEY + ":" + (document.body.dataset.scoreOwner || "guest"), String(syncedBest));
    } catch (err) {
    }
  }, setNameState = function(kind, text) {
    if (nickField) {
      nickField.classList.toggle("is-free", kind === "free");
      nickField.classList.toggle("is-taken", kind === "taken");
    }
    if (nickState) {
      nickState.hidden = !text;
      nickState.classList.toggle("is-error", kind === "taken");
      nickState.textContent = text || "";
    }
    if (nickSaveBtn) nickSaveBtn.disabled = kind === "taken";
  }, scheduleNameCheck = function() {
    if (nameCheckTimer) clearTimeout(nameCheckTimer);
    const typed = (nickInput && nickInput.value || "").trim();
    const seq = ++nameCheckSeq;
    if (!typed) {
      setNameState("none", "");
      return;
    }
    setNameState("none", "");
    nameCheckTimer = setTimeout(async () => {
      const r = await checkName2(typed);
      if (seq !== nameCheckSeq) return;
      if (!r.known || !r.valid) return setNameState("none", "");
      setNameState(r.taken ? "taken" : "free", r.taken ? "Already used" : "Available");
    }, NAME_CHECK_DEBOUNCE_MS);
  }, showContinueLine = function(on) {
    const cont = overlay2 && overlay2.querySelector(".hood-game-overlay-continue");
    if (cont) cont.hidden = !on;
  }, renderRanks = function(entries) {
    if (!ranksList) return;
    ranksList.replaceChildren();
    if (ranksEmpty) ranksEmpty.hidden = entries.length > 0;
    entries.forEach((e) => {
      const li = document.createElement("li");
      li.className = "hood-game-ranks-row" + (e.name === lastSavedNick ? " is-you" : "");
      const num = document.createElement("span");
      num.className = "hood-game-ranks-num";
      num.textContent = String(e.rank).padStart(2, "0");
      const name = document.createElement("span");
      name.className = "hood-game-ranks-name";
      name.textContent = e.name;
      const sc = document.createElement("span");
      sc.className = "hood-game-ranks-score";
      sc.textContent = e.score.toLocaleString("en-US");
      li.append(num, name, sc);
      ranksList.appendChild(li);
    });
  }, openRanks = function() {
    if (!ranksPanel2) return;
    if (settingsPanel2) settingsPanel2.hidden = true;
    if (settingsBtn) settingsBtn.setAttribute("aria-expanded", "false");
    ranksPanel2.hidden = false;
    showRanks(ranksBoard);
  }, closeRanks = function() {
    if (ranksPanel2) ranksPanel2.hidden = true;
  }, showSaveNote = function(text) {
    if (!saveScoreForm || !saveMsg) return;
    saveScoreForm.classList.add("is-done");
    saveScoreForm.hidden = false;
    saveMsg.hidden = false;
    saveMsg.classList.remove("is-error");
    saveMsg.textContent = text;
  }, openSavePrompt = function(finalScore, carried) {
    carriedOffer = carried;
    if (saveMsg) {
      saveMsg.hidden = true;
      saveMsg.classList.remove("is-error");
    }
    if (nickInput) {
      nickInput.value = "";
      nickInput.disabled = false;
    }
    if (nickSaveBtn) nickSaveBtn.disabled = false;
    if (nickSkipBtn) {
      nickSkipBtn.hidden = false;
      nickSkipBtn.disabled = false;
    }
    saveScoreForm.classList.remove("is-done");
    nameCheckSeq++;
    setNameState("none", "");
    saveScoreForm.hidden = false;
    saveScoreForm.dataset.score = String(finalScore);
    awaitingSave = true;
    if (overlay2) overlay2.classList.add("is-naming");
    showContinueLine(false);
  }, finishSave = function() {
    awaitingSave = false;
    if (nickSkipBtn) nickSkipBtn.hidden = true;
    if (overlay2) overlay2.classList.remove("is-naming");
    showContinueLine(true);
  }, isFullscreen = function() {
    return pseudoFullscreenActive || !!(document.fullscreenElement || document.webkitFullscreenElement);
  }, enterPseudoFullscreen = function() {
    if (!wrapEl || pseudoFullscreenActive) return;
    pseudoFullscreenActive = true;
    scrollYBeforePseudoFullscreen = window.scrollY;
    document.body.style.top = -scrollYBeforePseudoFullscreen + "px";
    wrapEl.classList.add("is-pseudo-fullscreen");
    document.documentElement.classList.add("hood-game-scroll-locked");
    handleFullscreenChange();
  }, exitPseudoFullscreen = function() {
    if (!pseudoFullscreenActive) return;
    pseudoFullscreenActive = false;
    if (wrapEl) wrapEl.classList.remove("is-pseudo-fullscreen");
    document.documentElement.classList.remove("hood-game-scroll-locked");
    document.body.style.top = "";
    window.scrollTo({ top: scrollYBeforePseudoFullscreen, left: 0, behavior: "instant" });
    handleFullscreenChange();
  }, enterFullscreen = function() {
    if (!wrapEl) return;
    const req = wrapEl.requestFullscreen || wrapEl.webkitRequestFullscreen;
    if (!req || document.fullscreenEnabled === false) {
      enterPseudoFullscreen();
      return;
    }
    const r = req.call(wrapEl);
    if (r && r.catch) r.catch(() => enterPseudoFullscreen());
  }, exitFullscreen = function() {
    if (pseudoFullscreenActive) {
      exitPseudoFullscreen();
      return;
    }
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) {
      const r = exit.call(document);
      if (r && r.catch) r.catch(() => {
      });
    }
  }, isPortraitNow = function() {
    return !!(window.matchMedia && window.matchMedia("(orientation: portrait)").matches);
  }, isCoarsePointer = function() {
    return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }, updateForceLandscape = function() {
    if (!wrapEl) return;
    const shouldForce = isFullscreen() && isCoarsePointer() && isPortraitNow();
    wrapEl.classList.toggle("hood-game-force-landscape", shouldForce);
  }, handleFullscreenChange = function() {
    const active = isFullscreen();
    if (fullscreenBtn) {
      fullscreenBtn.classList.toggle("is-active", active);
      fullscreenBtn.setAttribute("aria-label", active ? "Exit fullscreen" : "Play fullscreen");
    }
    if (active && screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").then(updateForceLandscape, updateForceLandscape);
    } else {
      updateForceLandscape();
    }
    if (!active && screen.orientation && screen.orientation.unlock) {
      try {
        screen.orientation.unlock();
      } catch (err) {
      }
    }
  }, primeAudio = function() {
    if (audioPrimed) return;
    audioPrimed = true;
    const ctx2 = ensureAudioCtx();
    if (ctx2 && ctx2.state === "suspended") ctx2.resume();
    preloadAudio();
  }, handleGameTap = function(e) {
    if (!assetsReady) return;
    const now = performance.now();
    if (now - lastTapTs < 50) return;
    if (now < inputLockedUntil) return;
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : null);
    if (clientY != null && (clientY >= window.innerHeight - 46 || clientY <= 15)) return;
    if (e.target && e.target.closest && e.target.closest("a, button, input, #hoodGameSettingsPanel, #hoodGameRanksPanel, #hoodGameSaveScore, .nav-links, .nav-more, .topbar-right")) return;
    const inFrame = !!(wrapEl && wrapEl.contains(e.target));
    if (!inFrame && (state === STATE.IDLE || state === STATE.OVER)) return;
    lastTapTs = now;
    primeAudio();
    jump();
  };
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("hoodGameScore");
  const bestEl = document.getElementById("hoodGameBest");
  const overlay2 = document.getElementById("hoodGameOverlay");
  const overlayTitle = document.getElementById("hoodGameOverlayTitle");
  const overlayLines = document.getElementById("hoodGameOverlayLines");
  const fullscreenBtn = document.getElementById("hoodGameFullscreenBtn");
  const settingsBtn = document.getElementById("hoodGameSettingsBtn");
  const settingsPanel2 = document.getElementById("hoodGameSettingsPanel");
  const soundToggle = document.getElementById("hoodGameSoundToggle");
  const musicVolInput = document.getElementById("hoodGameMusicVol");
  const sfxVolInput = document.getElementById("hoodGameSfxVol");
  const versionEl = document.getElementById("hoodGameVersion");
  const versionBadgeEl = document.getElementById("hoodGameVersionBadge");
  const ranksBtn = document.getElementById("hoodGameRanksBtn");
  const ranksPanel2 = document.getElementById("hoodGameRanksPanel");
  const ranksList = document.getElementById("hoodGameRanksList");
  const ranksEmpty = document.getElementById("hoodGameRanksEmpty");
  const ranksClose = document.getElementById("hoodGameRanksClose");
  const saveScoreForm = document.getElementById("hoodGameSaveScore");
  const nickInput = document.getElementById("hoodGameNick");
  const nickSaveBtn = document.getElementById("hoodGameNickSave");
  const saveMsg = document.getElementById("hoodGameSaveMsg");
  const nickSkipBtn = document.getElementById("hoodGameNickSkip");
  const nickField = document.querySelector(".hood-game-save-field");
  const nickState = document.getElementById("hoodGameNickState");
  const GAME_VERSION = "1.1.0";
  if (versionBadgeEl) versionBadgeEl.textContent = GAME_VERSION;
  let CW = canvas.width;
  const CH = canvas.height;
  const GROUND_Y = Math.round(CH * (250 / 300));
  const ASSET_BASE = "/game/";
  const SPRITES = {
    background: { src: "background.png" },
    stand: { src: "character-stand.png", frames: 1 },
    // static pose shown only during the SPAWN flicker -- the run cycle doesn't start until real movement (PLAYING) begins
    run: { src: "character-run.png", frames: 6 },
    jump: { src: "character-jump.png", frames: 24 },
    // sliced from the user-supplied jump2_anim.gif (24 frames, 60ms each)
    coin: { src: "coin-spin.png", frames: 12 },
    candle: { src: "obstacle-candle.png", frames: 1 },
    greenCandle: { src: "obstacle-candle-green.png", frames: 1 },
    greenCandle1: { src: "candle-green-1.png", frames: 1 },
    greenCandle2: { src: "candle-green-2.png", frames: 1 },
    greenCandle3: { src: "candle-green-3.png", frames: 1 },
    greenCandle4: { src: "candle-green-4.png", frames: 1 },
    pump: { src: "pump.png", frames: 1 },
    rugged: { src: "obstacle-rugged.png", frames: 1 }
  };
  let assetsReady = false;
  let standAspect = 0.63;
  let runAspect = 0.89;
  let jumpAspect = 0.85;
  let bgDrawW = 0;
  let bgSourceH = 0;
  const STATE = { LOADING: "loading", IDLE: "idle", SPAWN: "spawn", PLAYING: "playing", OVER: "over" };
  let state = STATE.LOADING;
  const mobileShell = document.body.dataset.mobile === "true";
  let paused22 = false;
  const BLINK_TOGGLE_MS = 100;
  const SPAWN_DURATION_MS = 1e3;
  let spawnTimer = 0;
  let spawnBlinkOn = true;
  const GROUND_HEIGHT = 90;
  const GRAVITY = 22e-4;
  const JUMP_VELOCITY = -0.90;
  let jumpBufferUntil = 0;
  const JUMP_BUFFER_MS = 144;
  const BASE_SPEED = 0.32;
  const MAX_SPEED = 0.75;
  const SPEED_RAMP = 6e-6;
  const player2 = {
    x: 90,
    y: GROUND_Y - GROUND_HEIGHT,
    vy: 0,
    grounded: true,
    runFrame: 0,
    runTimer: 0,
    jumpFrame: 0,
    jumpTimer: 0,
    invulnerableTimer: 0
  };
  const COIN_SCORE = 25;
  const GREEN_CANDLE_BOUNDS = {
    greenCandle1: { sx: 26, sy: 298, sw: 163, sh: 287 },
    greenCandle2: { sx: 23, sy: 231, sw: 166, sh: 423 },
    greenCandle3: { sx: 25, sy: 162, sw: 162, sh: 561 },
    greenCandle4: { sx: 26, sy: 23,  sw: 163, sh: 838 }
  };
  const GREEN_CANDLE_TIERS = [
    { points: 1000, height: 94, spriteKey: "greenCandle4", cutoff: 0.01 },
    { points: 500, height: 80, spriteKey: "greenCandle3", cutoff: 0.06 },
    { points: 300, height: 66, spriteKey: "greenCandle2", cutoff: 0.16 },
    { points: 100, height: 52, spriteKey: "greenCandle1", cutoff: 0.36 }
  ];
  let obstacles = [];
  let coins = [];
  let greenCandles = [];
  let pumps = [];
  let pumpActiveTimer = 0;
  let eventFreeze = { active: false, type: null, timer: 0, initialScore: 0, targetScore: 0 };
  let nextPumpCheckAt = 0;
  let popups = [];
  let lastDisplayedScore = -1;
  let speed = BASE_SPEED;
  let elapsed = 0;
  let score = 0;
  let best = 0;
  try {
    best = parseInt(localStorage.getItem("hoodRunnerBest:" + (document.body.dataset.scoreOwner || "guest")) || localStorage.getItem("hoodRunnerBest") || "0", 10) || 0;
  } catch (err) {
    best = 0;
  }
  let nextObstacleAt = 0;
  let nextCoinAt = 0;
  let nextGreenCandleAt = 0;
  let bgScrollX = 0;
  let lastTs = 0;
  let overSince = 0;
  updateBestLabel();
  let clusterChain = 0;
  let pendingClusterFollow = false;
  const CANDLE_HEIGHT_RATIOS = [0.5, 0.72, 0.95, 1.2, 1.4, 1.6];
  const PAIRED_CANDLE_RATIOS = [0.5, 0.72];
  const RUGGED_CHANCE = 0.05; // Ti le rugged la 5%
  const RUGGED_MIN_ELAPSED = 15;
  const FALL_SPEED = 0.6;
  const OVERLAY_DELAY_MS = 1e3;
  const RESTART_COOLDOWN = 1e3;
  let hitTimer = 0;
  let hitBlinkOn = true;
  let resultShown = false;
  let showResult = null;
  let overlayHideTimer = null;
  const playerHitBox = { x: 0, y: 0, w: 0, h: 0 };
  let loopScheduled = false;
  const MUSIC_BASE = "sound-effects/";
  const MUSIC_TRACKS = [
    "1sound.mp3",
    "2sound.mp3",
    "3sound.mp3",
    "5sound.mp3",
    "main-1.mp3",
    "main-2.mp3",
    "main-3.mp3",
    "main-4.mp3",
    "main-5.mp3"
  ];
  const FADE_IN_MS = 3e3;
  const SFX_FILES = { jump: "jumping.mp3", land: "landing.mp3", coin: "coin.mp3", impact: "impact.mp3", levelup: "levelup.mp3" };
  const BONUS_MUSIC_TRACKS = [
    "bonus-time.mp3",
    "bonus-1.mp3",
    "bonus-2.mp3",
    "bonus-3.mp3",
    "bonus-4.mp3",
    "bonus-5.mp3",
    "bonus-6.mp3"
  ];
  let lastBonusTrackIdx = -1;
  const pickBonusTrackIndex = function() {
    if (BONUS_MUSIC_TRACKS.length <= 1) return 0;
    let nextIdx = Math.floor(Math.random() * BONUS_MUSIC_TRACKS.length);
    if (nextIdx === lastBonusTrackIdx) {
      nextIdx = (nextIdx + 1 + Math.floor(Math.random() * (BONUS_MUSIC_TRACKS.length - 1))) % BONUS_MUSIC_TRACKS.length;
    }
    lastBonusTrackIdx = nextIdx;
    return nextIdx;
  };
  const RUN_SFX_FILE = "running.mp3";
  const GAIN_SMOOTH = 0.03;
  const STORE = { music: "hoodRunnerMusicVol", sfx: "hoodRunnerSfxVol", muted: "hoodRunnerMuted" };
  const live = {
    music: loadStoredVolume(STORE.music, 0.5),
    sfx: loadStoredVolume(STORE.sfx, 0.35),
    muted: (() => {
      try {
        return localStorage.getItem(STORE.muted) === "1";
      } catch (err) {
        return false;
      }
    })()
  };
  const saved = { music: live.music, sfx: live.sfx, muted: live.muted };
  let actx = null;
  let masterGain = null, musicGain = null, sfxGain = null, runGain = null;
  const audioBuffers = /* @__PURE__ */ Object.create(null);
  let runSource = null;
  let lastTrackIdx = -1;
  let musicEl = null;
  let musicRouted = false;
  let musicFadeTimer = null;
  let musicAudible = false;
  let pendingFadeMs = 0;
  const nativeAudioHandler = window.webkit?.messageHandlers?.audioSession;
  let nativeRunPlaying = false;
  async function playSfx(name) {
    if (paused22 || live.muted) return;
    if (sendNativeAudio("playSfx", { file: SFX_FILES[name] })) return;
    const ctx2 = ensureAudioCtx();
    if (!ctx2) return;
    resumeCtx();
    const buf = await loadBuffer(SFX_FILES[name]);
    if (!buf || paused22 || live.muted) return;
    const src = ctx2.createBufferSource();
    src.buffer = buf;
    src.connect(sfxGain);
    src.start(0);
  }
  async function startRunSfx() {
    if (paused22 || live.muted || runSource || nativeRunPlaying) return;
    if (sendNativeAudio("startRun", { file: RUN_SFX_FILE })) {
      nativeRunPlaying = true;
      return;
    }
    const ctx2 = ensureAudioCtx();
    if (!ctx2) return;
    resumeCtx();
    const buf = await loadBuffer(RUN_SFX_FILE);
    if (!buf || paused22 || live.muted || runSource || state !== STATE.PLAYING || !player2.grounded) return;
    const src = ctx2.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(runGain);
    src.start(0);
    runSource = src;
  }
  if (mobileShell) {
    const resetIdentity = () => {
      try {
        best = Number(localStorage.getItem("hoodRunnerBest:" + (document.body.dataset.scoreOwner || "guest"))) || Number(localStorage.getItem("hoodRunnerBest")) || 0;
      } catch {
        best = 0;
      }
      syncedBest = 0;
      resetRun();
      updateBestLabel();
      scoreEl.textContent = "0";
      stopMusic();
      stopRunSfx();
      paused22 = false;
      if (assetsReady) {
        state = STATE.IDLE;
        showOverlay("TAP TO START", []);
        draw();
      }
      document.dispatchEvent(new Event("hood-runner-resumed"));
    };
    document.addEventListener("hood-runner-account-changed", resetIdentity);
    document.addEventListener("hood-runner-best-restored", () => {
      try {
        best = Number(localStorage.getItem("hoodRunnerBest:" + (document.body.dataset.scoreOwner || "guest"))) || Number(localStorage.getItem("hoodRunnerBest")) || 0;
      } catch {
        best = 0;
      }
      updateBestLabel();
    });
    document.addEventListener("hood-runner-quit", resetIdentity);
    let fitMobileCanvas = function() {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const width = Math.max(450, Math.round(CH * bounds.width / bounds.height));
      if (width === CW) return;
      CW = width;
      canvas.width = width;
      if (assetsReady) draw();
    };
    window.addEventListener("resize", fitMobileCanvas);
    fitMobileCanvas();
    document.addEventListener("hood-runner-pause", () => {
      if (paused22 || ![STATE.SPAWN, STATE.PLAYING, STATE.OVER].includes(state)) return;
      if (state === STATE.OVER && resultShown) return;
      paused22 = true;
      if (!sendNativeAudio("pause")) {
        if (musicEl) musicEl.pause();
        stopRunSfx();
      }
      if (actx) actx.suspend().catch(() => {
      });
      document.dispatchEvent(new CustomEvent("hood-runner-paused"));
    });
    document.addEventListener("hood-runner-resume", () => {
      if (!paused22 || document.hidden) return;
      inputLockedUntil = performance.now() + 250;
      paused22 = false;
      lastTs = 0;
      if (sendNativeAudio("resume", {
        shouldPlayMusic: [STATE.SPAWN, STATE.PLAYING].includes(state),
        run: state === STATE.PLAYING && player2.grounded
      })) {
        nativeRunPlaying = state === STATE.PLAYING && player2.grounded;
      }
      resumeCtx();
      if (!nativeAudioHandler && !live.muted && [STATE.SPAWN, STATE.PLAYING].includes(state)) {
        playMusicEl();
        if (state === STATE.PLAYING) fadeMusicIn(300);
      }
      if (!nativeAudioHandler && state === STATE.PLAYING && player2.grounded) startRunSfx();
      ensureLoopRunning();
      document.dispatchEvent(new CustomEvent("hood-runner-resumed"));
    });
    document.addEventListener("hood-runner-restart", () => {
      if (!assetsReady || document.hidden) return;
      paused22 = false;
      primeAudio();
      resumeCtx();
      startRun3();
      document.dispatchEvent(new CustomEvent("hood-runner-resumed"));
    });
  }
  if (settingsBtn && settingsPanel2) {
    let syncControls = function() {
      if (soundToggle) soundToggle.checked = !live.muted;
      if (musicVolInput) musicVolInput.value = String(Math.round(live.music * 100));
      if (sfxVolInput) sfxVolInput.value = String(Math.round(live.sfx * 100));
    }, persistSettings = function() {
      try {
        localStorage.setItem(STORE.music, String(live.music));
        localStorage.setItem(STORE.sfx, String(live.sfx));
        localStorage.setItem(STORE.muted, live.muted ? "1" : "0");
      } catch (err) {
      }
      saved.music = live.music;
      saved.sfx = live.sfx;
      saved.muted = live.muted;
    }, closeSettings = function() {
      settingsPanel2.hidden = true;
      settingsBtn.setAttribute("aria-expanded", "false");
    };
    if (versionEl) versionEl.textContent = "Candle Rush " + GAME_VERSION;
    syncControls();
    const settingsCloseBtn = document.getElementById("settingsClose");
    if (settingsCloseBtn) {
      settingsCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeSettings();
      });
    }
    settingsBtn.addEventListener("click", () => {
      if (settingsPanel2.hidden) {
        settingsPanel2.hidden = false;
        settingsBtn.setAttribute("aria-expanded", "true");
      } else {
        closeSettings();
      }
    });
    document.addEventListener("pointerup", (e) => {
      if (settingsPanel2.hidden) return;
      if (e.target === settingsBtn || settingsBtn.contains(e.target) || settingsPanel2.contains(e.target)) return;
      closeSettings();
    });
    if (soundToggle) {
      soundToggle.addEventListener("change", () => {
        setMuted(!soundToggle.checked);
        persistSettings();
      });
    }
    if (musicVolInput) {
      musicVolInput.addEventListener("input", () => {
        setMusicVolume(musicVolInput.valueAsNumber / 100);
        persistSettings();
      });
    }
    if (sfxVolInput) {
      sfxVolInput.addEventListener("input", () => {
        setSfxVolume(sfxVolInput.valueAsNumber / 100);
        persistSettings();
      });
    }
  }
  let ranksBoard = "all";
  let lastSavedNick = "";
  let awaitingSave = false;
  let carriedOffer = false;
  const SYNCED_KEY = "hoodRunnerSynced";
  let syncedBest = (() => {
    try {
      return parseInt(localStorage.getItem(SYNCED_KEY + ":" + (document.body.dataset.scoreOwner || "guest")) || "0", 10) || 0;
    } catch (err) {
      return 0;
    }
  })();
  const SAVE_ERRORS = {
    rate_limited: "Too many saves \u2014 try later",
    bad_nickname: "Pick another name",
    store_not_configured: "Leaderboard is offline",
    store_unavailable: "Leaderboard is unreachable",
    no_token: "No finished run to save",
    bad_secret: "Could not save",
    no_identity: "Could not save",
    name_taken: "That name is taken",
    carried_limit: "Too many carried scores today",
    token_unknown_or_used: "This run was already saved",
    score_implausible: "Run could not be verified",
    run_too_short: "Run could not be verified"
  };
  const ranksTabs = document.querySelectorAll(".hood-game-ranks-tab");
  const NAME_CHECK_DEBOUNCE_MS = 300;
  let nameCheckTimer = null;
  let nameCheckSeq = 0;
  if (nickInput) nickInput.addEventListener("input", scheduleNameCheck);
  let ranksRequest = 0;
  async function showRanks(which) {
    const request = ++ranksRequest;
    ranksBoard = which;
    ranksTabs.forEach((t) => {
      const on = t.dataset.board === which;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    const entries = await getBoard2(which);
    if (request === ranksRequest) renderRanks(entries);
  }
  if (ranksBtn) ranksBtn.addEventListener("click", openRanks);
  if (ranksClose) ranksClose.addEventListener("click", closeRanks);
  const gameOverCardEl = document.getElementById("gameOverCard");
  if (gameOverCardEl) {
    gameOverCardEl.addEventListener("click", (e) => e.stopPropagation());
  }
  const gameOverRestartBtn = document.getElementById("gameOverRestartBtn");
  if (gameOverRestartBtn) {
    gameOverRestartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      startRun3();
    });
  }

  const gameOverHomeBtn = document.getElementById("gameOverHomeBtn");
  if (gameOverHomeBtn) {
    gameOverHomeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      send("quit");
    });
  }
  const settingsHomeBtn = document.getElementById("settingsHomeBtn");
  if (settingsHomeBtn) {
    settingsHomeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (settingsPanel2) settingsPanel2.hidden = true;
      if (typeof settingsPanel !== "undefined" && settingsPanel) settingsPanel.hidden = true;
      send("quit");
    });
  }
  ranksTabs.forEach((t) => {
    t.addEventListener("click", () => showRanks(t.dataset.board));
  });
  document.addEventListener("pointerup", (e) => {
    if (!ranksPanel2 || ranksPanel2.hidden) return;
    if (ranksPanel2.contains(e.target) || ranksBtn && ranksBtn.contains(e.target)) return;
    closeRanks();
  });
  async function offerScoreSave(finalScore) {
    if (!saveScoreForm || !isAvailable() || !canSubmit2()) return;
    if (hasIdentity()) {
      autoSubmit(finalScore);
      return;
    }
    openSavePrompt(Math.max(Math.floor(best), finalScore), Math.floor(best) > finalScore);
  }
  async function autoSubmit(finalScore) {
    if (finalScore <= syncedBest) return;
    const res = await submit2(void 0, finalScore, false);
    if (!res.ok) return;
    rememberSynced(Number.isFinite(res.best) ? res.best : finalScore);
    if (!res.improved) return;
    showSaveNote(res.rank ? "New best \u2014 #" + res.rank : "New best saved");
  }
  async function submitScore(nick) {
    if (!saveScoreForm) return;
    if (nickSaveBtn) nickSaveBtn.disabled = true;
    if (nickSkipBtn) nickSkipBtn.disabled = true;
    const res = await submit2(nick, Number(saveScoreForm.dataset.score || 0), carriedOffer);
    if (res.retry) {
      setNameState("taken", "Already used");
      if (nickSkipBtn) nickSkipBtn.disabled = false;
      return;
    }
    if (res.ok) {
      lastSavedNick = res.nickname || "";
      rememberSynced(Number.isFinite(res.best) ? res.best : Number(saveScoreForm.dataset.score || 0));
      saveScoreForm.classList.add("is-done");
      if (saveMsg) {
        saveMsg.hidden = false;
        saveMsg.classList.remove("is-error");
        saveMsg.textContent = "Playing as " + lastSavedNick + (res.rank ? " \u2014 #" + res.rank : "");
      }
    } else if (saveMsg) {
      saveScoreForm.classList.add("is-done");
      saveMsg.hidden = false;
      saveMsg.classList.add("is-error");
      saveMsg.textContent = SAVE_ERRORS[res.error] || "Could not save";
    }
    finishSave();
  }
  if (nickSkipBtn) nickSkipBtn.addEventListener("click", () => submitScore(null));
  if (saveScoreForm) {
    saveScoreForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nick = (nickInput && nickInput.value || "").trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, "").slice(0, 12);
      if (!nick) return;
      submitScore(nick);
    });
  }
  getBoard2("all").then(() => {
    if (isAvailable() && ranksBtn) ranksBtn.hidden = false;
  });
  const wrapEl = document.getElementById("hoodGameWrap");
  let pseudoFullscreenActive = false;
  let scrollYBeforePseudoFullscreen = 0;
  window.addEventListener("resize", updateForceLandscape);
  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener("change", updateForceLandscape);
  }
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      if (isFullscreen()) exitFullscreen();
      else enterFullscreen();
    });
  }
  let audioPrimed = false;
  let inputLockedUntil = 0;
  let lastTapTs = 0;
  document.addEventListener("hood-runner-input-lock", () => {
    inputLockedUntil = performance.now() + 250;
  });
  document.addEventListener("hood-runner-start", () => {
    if (!assetsReady) return;
    primeAudio();
    jump();
  });
  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (!assetsReady) return;
    if (e.target && e.target.closest && e.target.closest("input, button, a")) return;
    e.preventDefault();
    primeAudio();
    jump();
  });
  const gameSection = document.getElementById("game");
  const tapTarget = gameSection || canvas;
  tapTarget.addEventListener("touchstart", handleGameTap, { passive: true });
  tapTarget.addEventListener("pointerdown", handleGameTap);
  document.addEventListener("pointerup", (e) => {
    if (!gameSection || gameSection.contains(e.target)) return;
    const r = gameSection.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    handleGameTap(e);
  });
  showOverlay("", ["Loading\u2026"]);
  Promise.all(
    Object.entries(SPRITES).map(
      ([key, sprite]) => loadImage(sprite.src).then((img) => {
        sprite.img = img;
      })
    )
  ).then(() => {
    standAspect = SPRITES.stand.img.naturalWidth / SPRITES.stand.frames / SPRITES.stand.img.naturalHeight;
    runAspect = SPRITES.run.img.naturalWidth / SPRITES.run.frames / SPRITES.run.img.naturalHeight;
    jumpAspect = SPRITES.jump.img.naturalWidth / SPRITES.jump.frames / SPRITES.jump.img.naturalHeight;
    Object.values(SPRITES).forEach((sprite) => {
      if (sprite.frames) {
        sprite.frameW = sprite.img.naturalWidth / sprite.frames;
        sprite.frameH = sprite.img.naturalHeight;
      }
    });
    const background = SPRITES.background.img;
    // Crop at the painted ground line so it aligns with the gameplay surface.
    bgSourceH = Math.round(background.naturalHeight * 0.865);
    bgDrawW = background.naturalWidth * (GROUND_Y / bgSourceH);
    assetsReady = true;
    document.dispatchEvent(new Event("hood-assets-ready"));
    state = STATE.IDLE;
    showOverlay("TAP TO START", []);
    ensureLoopRunning();
  }).catch((err) => {
    console.error("Candle Rush: asset load failed", err);
    document.dispatchEvent(new Event("hood-assets-error"));
    showOverlay("", ["Could not load \u2014 try refreshing."]);
  });
}

// Users/erickieu/Documents/Codex/2026-09-23/bu/hood-runner/src/app.js
var byId = (id) => document.getElementById(id);
var pauseScreen = byId("pauseScreen");
var rotateScreen = byId("rotateScreen");
var resumeButton = byId("resumeButton");
var pauseButton = byId("pauseButton");
var settingsPanel = byId("hoodGameSettingsPanel");
var ranksPanel = byId("hoodGameRanksPanel");
var overlay = byId("hoodGameOverlay");
var wrap = byId("hoodGameWrap");
var send = (name) => document.dispatchEvent(new Event(`hood-runner-${name}`));
var paused2 = false;
var modalPaused = false;
var orientationPaused = false;
function syncPauseScreen() {
  const welcoming = document.body.dataset.entry === "welcome" || document.body.dataset.busy === "true";
  const visible = !welcoming && paused2 && settingsPanel.hidden && ranksPanel.hidden && rotateScreen.hidden;
  pauseScreen.hidden = !visible;
  wrap.inert = welcoming || visible || !rotateScreen.hidden;
  pauseScreen.inert = !rotateScreen.hidden;
  if (visible) resumeButton.focus();
}
function syncOrientation() {
  const portrait = window.innerHeight > window.innerWidth;
  rotateScreen.hidden = !portrait;
  if (portrait) {
    if (!paused2) {
      orientationPaused = true;
      send("pause");
    }
  } else if (orientationPaused) {
    orientationPaused = false;
    send("resume");
  }
  syncPauseScreen();
}
pauseButton.addEventListener("click", () => send("pause"));
resumeButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  document.dispatchEvent(new Event("hood-runner-input-lock"));
});
resumeButton.addEventListener("touchstart", (event) => {
  event.stopPropagation();
  document.dispatchEvent(new Event("hood-runner-input-lock"));
}, { passive: true });
resumeButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  send("resume");
});
pauseScreen.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  send("resume");
});
byId("restartButton").addEventListener("click", () => send("restart"));
document.addEventListener("hood-runner-paused", () => {
  paused2 = true;
  syncPauseScreen();
});
document.addEventListener("hood-runner-resumed", () => {
  paused2 = false;
  orientationPaused = false;
  syncPauseScreen();
  wrap.focus({ preventScroll: true });
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    send("pause");
  } else if (modalPaused) {
    }
});
window.addEventListener("pagehide", () => {
  send("pause");
});
document.addEventListener("hood-runner-background", () => {
});
window.addEventListener("resize", syncOrientation);
document.addEventListener("hood-loading-change", () => {
  if (document.body.dataset.busy === "true") send("pause");
  syncPauseScreen();
});
var panelObserver = new MutationObserver(() => {
  const panelOpen = !settingsPanel.hidden || !ranksPanel.hidden;
  if (panelOpen && !modalPaused) {
    modalPaused = true;
    send("pause");
  } else if (!panelOpen && modalPaused) {
    modalPaused = false;
      send("resume");
  }
  syncPauseScreen();
});
for (const panel of [settingsPanel, ranksPanel]) {
  panelObserver.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
}
byId("quitButton").addEventListener("click", () => send("quit"));
initSettings(byId, settingsPanel);
initEntry(byId, syncPauseScreen);
function syncOverlay() {
  for (const line of overlay.querySelectorAll(".hood-game-overlay-continue")) {
    const text = /AGAIN|continue/i.test(line.textContent) ? "TAP TO RUN AGAIN" : "TAP TO START";
    if (line.textContent !== text) line.textContent = text;
  }
  pauseButton.hidden = !overlay.hidden;
  const title = byId("hoodGameOverlayTitle").textContent || "";
  byId("hoodGameBest").hidden = overlay.hidden || !/NEW HIGH SCORE|GAME OVER|RUGGED/i.test(title);
}
new MutationObserver(syncOverlay).observe(overlay, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"] });
syncOverlay();
syncOrientation();
if (Capacitor.isNativePlatform()) {
  App.addListener("appStateChange", ({ isActive }) => {
    if (!isActive) {
        send("pause");
    } else {
      SystemBars.hide().catch(() => {
      });
    }
  });
  if (Capacitor.getPlatform() === "android") App.addListener("backButton", () => {
    if (overlay.hidden && !paused2) send("pause");
    else App.minimizeApp();
  });
}
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
