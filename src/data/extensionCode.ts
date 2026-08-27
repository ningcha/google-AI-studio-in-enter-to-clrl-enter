import { ExtensionConfig, FileItem } from '../types';

export function generateManifestJson(): string {
  return JSON.stringify(
    {
      manifest_version: 3,
      name: "Google AI Studio Enter to Send (Ctrl+Enter Newline)",
      short_name: "AI Studio Enter Send",
      version: "1.0.0",
      description: "在 Google AI Studio 中将 Enter 键设为发送消息/运行，Ctrl+Enter 设为换行，支持中文输入法防误触。",
      icons: {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      },
      action: {
        default_popup: "popup.html",
        default_icon: {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png"
        },
        default_title: "AI Studio 快捷键设置"
      },
      permissions: ["storage"],
      content_scripts: [
        {
          matches: [
            "https://aistudio.google.com/*",
            "https://makersuite.google.com/*"
          ],
          js: ["content.js"],
          run_at: "document_idle"
        }
      ]
    },
    null,
    2
  );
}

export function generateContentJs(config: ExtensionConfig): string {
  return `/**
 * Google AI Studio: Enter to Send / Ctrl+Enter to Newline
 * Chrome Extension Content Script
 */

(function () {
  'use strict';

  // 默认配置
  let settings = {
    enabled: true,
    enterToSend: ${config.enterToSend},
    ctrlEnterToNewline: ${config.ctrlEnterToNewline},
    shiftEnterToNewline: ${config.shiftEnterToNewline},
    imeProtection: ${config.imeProtection},
    showSendBadge: ${config.showSendBadge}
  };

  // 从 Chrome 存储中同步设置
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(settings, (items) => {
      if (items) settings = { ...settings, ...items };
    });

    chrome.storage.onChanged.addListener((changes) => {
      for (const key in changes) {
        settings[key] = changes[key].newValue;
      }
    });
  }

  // 追踪输入法组合状态 (中文/日文拼音输入时防止回车误发送)
  let isComposing = false;

  document.addEventListener('compositionstart', () => {
    isComposing = true;
  }, true);

  document.addEventListener('compositionend', () => {
    isComposing = false;
  }, true);

  // 标记：是否正在分发原生 Run 快捷键（防止自身拦截器死循环）
  let isDispatchingNativeRun = false;

  /**
   * 深度模拟点击（支持 Angular MDC 及 Web Components）
   */
  function simulateClick(el) {
    if (!el) return false;
    try {
      const rect = el.getBoundingClientRect();
      const opts = {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        clientX: rect.left + (rect.width > 0 ? rect.width / 2 : 10),
        clientY: rect.top + (rect.height > 0 ? rect.height / 2 : 10)
      };
      el.dispatchEvent(new PointerEvent('pointerdown', opts));
      el.dispatchEvent(new MouseEvent('mousedown', opts));
      el.dispatchEvent(new PointerEvent('pointerup', opts));
      el.dispatchEvent(new MouseEvent('mouseup', opts));
      el.dispatchEvent(new MouseEvent('click', opts));
      if (typeof el.click === 'function') {
        el.click();
      }
      return true;
    } catch (err) {
      if (typeof el.click === 'function') {
        el.click();
        return true;
      }
    }
    return false;
  }

  /**
   * 查找并点击 Google AI Studio 中的 Run / Send 按钮，并广播原生快捷键
   */
  function triggerAiStudioRun(targetElement) {
    // 候选选择器列表（覆盖 AI Studio 所有 Prompt 模式、Chat 对话模式、Material Design 按钮）
    const selectors = [
      'button[aria-label*="Run" i]',
      'button[aria-label*="Send" i]',
      'button[aria-label*="运行" i]',
      'button[aria-label*="发送" i]',
      'button[data-testid*="run" i]',
      'button[data-testid*="send" i]',
      'button[data-test-id*="run" i]',
      'button[data-test-id*="send" i]',
      '.run-button',
      '.send-button',
      'ms-run-button button',
      'ms-prompt-nav button',
      'button.mat-mdc-unelevated-button.mat-primary',
      'button.primary-action-button',
      'button[type="submit"]',
      'button:has(mat-icon)',
      'button:has(.google-symbols)'
    ];

    let clicked = false;

    // 1. 尝试在当前输入框所在的容器/form中寻找 Run 按钮
    const container = targetElement?.closest?.('.prompt-input-container, .chat-input-area, form, .input-wrapper, mat-form-field, ms-chat-turn, ms-prompt-editor, ms-prompt-nav') || document;
    for (const selector of selectors) {
      try {
        const btn = container.querySelector(selector);
        if (btn && !btn.disabled && (btn.offsetWidth > 0 || btn.offsetHeight > 0 || btn.offsetParent !== null)) {
          simulateClick(btn);
          clicked = true;
          break;
        }
      } catch (e) {}
    }

    // 2. 在全局寻找可见且未禁用的 Run 按钮
    if (!clicked) {
      for (const selector of selectors) {
        try {
          const buttons = document.querySelectorAll(selector);
          for (const btn of buttons) {
            if (!btn.disabled && (btn.offsetWidth > 0 || btn.offsetHeight > 0 || btn.offsetParent !== null)) {
              simulateClick(btn);
              clicked = true;
              break;
            }
          }
          if (clicked) break;
        } catch (e) {}
      }
    }

    // 3. 备选：通过文本内容或 aria-label 匹配 "Run" / "运行"
    if (!clicked) {
      const allButtons = Array.from(document.querySelectorAll('button, [role="button"]'));
      for (const btn of allButtons) {
        const text = (btn.textContent || '').trim().toLowerCase();
        const aria = (btn.getAttribute('aria-label') || '').trim().toLowerCase();
        if (
          (text === 'run' || text.startsWith('run ') || aria.includes('run') || aria.includes('send') || text === '运行' || text === '发送') &&
          !btn.disabled &&
          (btn.offsetWidth > 0 || btn.offsetHeight > 0 || btn.offsetParent !== null)
        ) {
          simulateClick(btn);
          clicked = true;
          break;
        }
      }
    }

    // 4. 双重保障：触发 Google AI Studio 原生的 Ctrl+Enter / Cmd+Enter 键盘事件
    // 注意：必须设置 isDispatchingNativeRun 标志，确保本插件的 keydown 拦截器不会拦截自身分发的原生快捷键
    try {
      isDispatchingNativeRun = true;
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const eventParams = {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        ctrlKey: !isMac,
        metaKey: isMac,
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window
      };

      const dispatchTargets = [targetElement, document.activeElement, document.body, document, window].filter(Boolean);
      for (const target of dispatchTargets) {
        try {
          const kd = new KeyboardEvent('keydown', eventParams);
          target.dispatchEvent(kd);
          const kp = new KeyboardEvent('keypress', eventParams);
          target.dispatchEvent(kp);
          const ku = new KeyboardEvent('keyup', eventParams);
          target.dispatchEvent(ku);
        } catch (e) {}
      }
    } finally {
      setTimeout(() => {
        isDispatchingNativeRun = false;
      }, 60);
    }

    return true;
  }

  /**
   * 在光标处插入换行符并触发输入事件
   */
  function insertNewline(target) {
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      // 优先使用 execCommand 保持撤销历史 (Undo/Redo)
      const success = document.execCommand('insertText', false, '\\n');
      if (!success) {
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const value = target.value;
        target.value = value.substring(0, start) + '\\n' + value.substring(end);
        target.selectionStart = target.selectionEnd = start + 1;
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (target.isContentEditable) {
      const success = document.execCommand('insertLineBreak');
      if (!success) {
        document.execCommand('insertText', false, '\\n');
      }
    }
  }

  /**
   * 核心键盘事件拦截监听（在捕获阶段运行）
   */
  window.addEventListener(
    'keydown',
    function (e) {
      if (!settings.enabled) return;

      // 如果当前是脚本自身分发的原生 Run 快捷键，直接放行，让 AI Studio 的原生监听器处理！
      if (isDispatchingNativeRun) return;

      // 仅在 Enter 键时处理
      if (e.key !== 'Enter' && e.keyCode !== 13) return;

      // 中文/日文拼音选词中，不要触发
      if (settings.imeProtection && (isComposing || e.isComposing || e.keyCode === 229)) {
        return;
      }

      const target = e.target;
      if (!target) return;

      const isInput =
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.tagName === 'INPUT' && target.type === 'text');

      if (!isInput) return;

      const isCtrl = e.ctrlKey || e.metaKey; // Windows: Ctrl, Mac: Command
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // 情况 1: 用户按下 Ctrl + Enter (或 Cmd + Enter) -> 转换为换行 (NewLine)
      if (settings.ctrlEnterToNewline && isCtrl && !isShift && !isAlt) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        insertNewline(target);
        return;
      }

      // 情况 2: 用户按下 Shift + Enter -> 保持换行
      if (settings.shiftEnterToNewline && isShift && !isCtrl && !isAlt) {
        // 允许原生换行行为
        return;
      }

      // 情况 3: 用户单独按下 Enter 键 (无 Ctrl, 无 Shift, 无 Alt) -> 转换为发送 (Send / Run)
      if (settings.enterToSend && !isCtrl && !isShift && !isAlt) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        triggerAiStudioRun(target);
        return;
      }
    },
    true // 必须在捕获阶段 (Capture Phase) 拦截，先于 AI Studio 内部监听器执行
  );

  console.log('[AI Studio Shortcut Extension] Activated: Enter = Send, Ctrl+Enter = Newline');
})();
`;
}

export function generatePopupHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Studio 快捷键设置</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { width: 300px; padding: 16px; background: #ffffff; color: #1f2937; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
    .title { font-size: 14px; font-weight: 600; color: #111827; }
    .status-badge { font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #dcfce7; color: #166534; font-weight: 500; }
    .item { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .item-label { font-size: 13px; color: #374151; }
    .item-desc { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .key-badge { display: inline-block; padding: 1px 6px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; font-family: monospace; font-size: 11px; color: #1f2937; }
    .switch { position: relative; display: inline-block; width: 38px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #d1d5db; transition: .2s; border-radius: 20px; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; }
    input:checked + .slider { background-color: #2563eb; }
    input:checked + .slider:before { transform: translateX(18px); }
    .footer { margin-top: 14px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">AI Studio 快捷键</div>
    <span class="status-badge" id="statusBadge">已启用</span>
  </div>

  <div class="item">
    <div>
      <div class="item-label">总开关</div>
      <div class="item-desc">启用/停用本插件</div>
    </div>
    <label class="switch">
      <input type="checkbox" id="enabledToggle" checked>
      <span class="slider"></span>
    </label>
  </div>

  <div class="item">
    <div>
      <div class="item-label"><span class="key-badge">Enter</span> 发送消息</div>
      <div class="item-desc">回车直接运行 Prompt</div>
    </div>
    <label class="switch">
      <input type="checkbox" id="enterToSendToggle" checked>
      <span class="slider"></span>
    </label>
  </div>

  <div class="item">
    <div>
      <div class="item-label"><span class="key-badge">Ctrl+Enter</span> 换行</div>
      <div class="item-desc">快捷换行插入新行</div>
    </div>
    <label class="switch">
      <input type="checkbox" id="ctrlEnterToNewlineToggle" checked>
      <span class="slider"></span>
    </label>
  </div>

  <div class="item">
    <div>
      <div class="item-label">中文拼音输入保护</div>
      <div class="item-desc">输入法选词时回车不发送</div>
    </div>
    <label class="switch">
      <input type="checkbox" id="imeProtectionToggle" checked>
      <span class="slider"></span>
    </label>
  </div>

  <div class="footer">
    适用于 aistudio.google.com
  </div>

  <script src="popup.js"></script>
</body>
</html>`;
}

export function generatePopupJs(): string {
  return `document.addEventListener('DOMContentLoaded', () => {
  const enabledToggle = document.getElementById('enabledToggle');
  const enterToSendToggle = document.getElementById('enterToSendToggle');
  const ctrlEnterToNewlineToggle = document.getElementById('ctrlEnterToNewlineToggle');
  const imeProtectionToggle = document.getElementById('imeProtectionToggle');
  const statusBadge = document.getElementById('statusBadge');

  const defaultSettings = {
    enabled: true,
    enterToSend: true,
    ctrlEnterToNewline: true,
    imeProtection: true
  };

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(defaultSettings, (items) => {
      enabledToggle.checked = items.enabled;
      enterToSendToggle.checked = items.enterToSend;
      ctrlEnterToNewlineToggle.checked = items.ctrlEnterToNewline;
      imeProtectionToggle.checked = items.imeProtection;
      updateBadge(items.enabled);
    });

    const saveSettings = () => {
      const config = {
        enabled: enabledToggle.checked,
        enterToSend: enterToSendToggle.checked,
        ctrlEnterToNewline: ctrlEnterToNewlineToggle.checked,
        imeProtection: imeProtectionToggle.checked
      };
      chrome.storage.sync.set(config);
      updateBadge(config.enabled);
    };

    enabledToggle.addEventListener('change', saveSettings);
    enterToSendToggle.addEventListener('change', saveSettings);
    ctrlEnterToNewlineToggle.addEventListener('change', saveSettings);
    imeProtectionToggle.addEventListener('change', saveSettings);
  }

  function updateBadge(enabled) {
    if (statusBadge) {
      statusBadge.textContent = enabled ? '已启用' : '已暂停';
      statusBadge.style.background = enabled ? '#dcfce7' : '#fee2e2';
      statusBadge.style.color = enabled ? '#166534' : '#991b1b';
    }
  }
});`;
}

export function generateTampermonkeyScript(config: ExtensionConfig): string {
  return `// ==UserScript==
// @name         Google AI Studio Enter to Send (Ctrl+Enter Newline)
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  让 Google AI Studio 的对话将 Enter 键设为发送，Ctrl+Enter 设为换行，带中文拼音输入法防误触保护。
// @author       AI Assistant
// @match        https://aistudio.google.com/*
// @match        https://makersuite.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=aistudio.google.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  let isComposing = false;
  let isDispatchingNativeRun = false;

  document.addEventListener('compositionstart', () => { isComposing = true; }, true);
  document.addEventListener('compositionend', () => { isComposing = false; }, true);

  function simulateClick(el) {
    if (!el) return false;
    try {
      const rect = el.getBoundingClientRect();
      const opts = {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        clientX: rect.left + (rect.width > 0 ? rect.width / 2 : 10),
        clientY: rect.top + (rect.height > 0 ? rect.height / 2 : 10)
      };
      el.dispatchEvent(new PointerEvent('pointerdown', opts));
      el.dispatchEvent(new MouseEvent('mousedown', opts));
      el.dispatchEvent(new PointerEvent('pointerup', opts));
      el.dispatchEvent(new MouseEvent('mouseup', opts));
      el.dispatchEvent(new MouseEvent('click', opts));
      if (typeof el.click === 'function') el.click();
      return true;
    } catch (err) {
      if (typeof el.click === 'function') {
        el.click();
        return true;
      }
    }
    return false;
  }

  function triggerRun(targetElement) {
    const selectors = [
      'button[aria-label*="Run" i]',
      'button[aria-label*="Send" i]',
      'button[aria-label*="运行" i]',
      'button[aria-label*="发送" i]',
      'button[data-testid*="run" i]',
      'button[data-testid*="send" i]',
      'button[data-test-id*="run" i]',
      'button[data-test-id*="send" i]',
      '.run-button',
      '.send-button',
      'ms-run-button button',
      'ms-prompt-nav button',
      'button.mat-mdc-unelevated-button.mat-primary',
      'button.primary-action-button',
      'button[type="submit"]',
      'button:has(mat-icon)',
      'button:has(.google-symbols)'
    ];

    let clicked = false;

    // 1. 尝试在当前输入框所在的容器中寻找
    const container = targetElement?.closest?.('.prompt-input-container, .chat-input-area, form, .input-wrapper, mat-form-field, ms-chat-turn, ms-prompt-editor, ms-prompt-nav') || document;
    for (const selector of selectors) {
      try {
        const btn = container.querySelector(selector);
        if (btn && !btn.disabled && (btn.offsetWidth > 0 || btn.offsetHeight > 0 || btn.offsetParent !== null)) {
          simulateClick(btn);
          clicked = true;
          break;
        }
      } catch (e) {}
    }

    // 2. 全局搜索
    if (!clicked) {
      for (const selector of selectors) {
        try {
          const btns = document.querySelectorAll(selector);
          for (const btn of btns) {
            if (!btn.disabled && (btn.offsetWidth > 0 || btn.offsetHeight > 0 || btn.offsetParent !== null)) {
              simulateClick(btn);
              clicked = true;
              break;
            }
          }
          if (clicked) break;
        } catch (e) {}
      }
    }

    // 3. 文本搜索
    if (!clicked) {
      const allButtons = Array.from(document.querySelectorAll('button, [role="button"]'));
      for (const btn of allButtons) {
        const text = (btn.textContent || '').trim().toLowerCase();
        const aria = (btn.getAttribute('aria-label') || '').trim().toLowerCase();
        if (
          (text === 'run' || text.startsWith('run ') || aria.includes('run') || aria.includes('send') || text === '运行' || text === '发送') &&
          !btn.disabled &&
          (btn.offsetWidth > 0 || btn.offsetHeight > 0 || btn.offsetParent !== null)
        ) {
          simulateClick(btn);
          clicked = true;
          break;
        }
      }
    }

    // 4. 原生快捷键双重广播（绕过自身拦截器）
    try {
      isDispatchingNativeRun = true;
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const eventParams = {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        ctrlKey: !isMac,
        metaKey: isMac,
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window
      };

      const dispatchTargets = [targetElement, document.activeElement, document.body, document, window].filter(Boolean);
      for (const target of dispatchTargets) {
        try {
          const kd = new KeyboardEvent('keydown', eventParams);
          target.dispatchEvent(kd);
          const kp = new KeyboardEvent('keypress', eventParams);
          target.dispatchEvent(kp);
          const ku = new KeyboardEvent('keyup', eventParams);
          target.dispatchEvent(ku);
        } catch (e) {}
      }
    } finally {
      setTimeout(() => {
        isDispatchingNativeRun = false;
      }, 60);
    }

    return true;
  }

  function insertNewline(target) {
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      const ok = document.execCommand('insertText', false, '\\n');
      if (!ok) {
        const start = target.selectionStart;
        const end = target.selectionEnd;
        target.value = target.value.substring(0, start) + '\\n' + target.value.substring(end);
        target.selectionStart = target.selectionEnd = start + 1;
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (target.isContentEditable) {
      document.execCommand('insertLineBreak') || document.execCommand('insertText', false, '\\n');
    }
  }

  window.addEventListener(
    'keydown',
    function (e) {
      if (isDispatchingNativeRun) return;
      if (e.key !== 'Enter' && e.keyCode !== 13) return;
      if (isComposing || e.isComposing || e.keyCode === 229) return;

      const target = e.target;
      if (!target) return;

      const isInput = target.tagName === 'TEXTAREA' || target.isContentEditable || (target.tagName === 'INPUT' && target.type === 'text');
      if (!isInput) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Ctrl + Enter -> 换行
      if (isCtrl && !isShift && !isAlt) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        insertNewline(target);
        return;
      }

      // Shift + Enter -> 允许原生换行
      if (isShift && !isCtrl && !isAlt) {
        return;
      }

      // Enter -> 发送
      if (!isCtrl && !isShift && !isAlt) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        triggerRun(target);
        return;
      }
    },
    true
  );

  console.log('[AI Studio Tampermonkey Script] Enter=Send, Ctrl+Enter=Newline activated!');
})();
`;
}

export function generateReadmeMd(): string {
  return `# Google AI Studio 快捷键切换 Chrome 插件

此插件将 **Google AI Studio** (https://aistudio.google.com) 的快捷键修改为更符合日常习惯的操作：
- ⌨️ **Enter**：直接发送消息 / 运行 Prompt（Run）
- ⌨️ **Ctrl + Enter**（Mac 上为 **Cmd + Enter**）：在光标处换行
- ⌨️ **Shift + Enter**：保留换行
- 🛡️ **中文拼音防误触**：使用拼音/五笔输入法选词时按 Enter 不会误发送！

---

## 🚀 安装步骤（只需 30 秒）

### 方式一：Chrome 扩展程序安装（推荐）

1. **下载或解压**：将生成的 ZIP 文件解压为一个独立的文件夹（例如命名为 \`ai-studio-shortcut-extension\`）。
2. **打开扩展管理页面**：在 Google Chrome 浏览器地址栏输入 \`chrome://extensions\` 并按回车。
3. **开启开发者模式**：在右上角找到 **「开发者模式」 (Developer mode)** 开关并开启。
4. **加载插件**：点击左上角的 **「加载已解压的扩展程序」 (Load unpacked)** 按钮。
5. **选择文件夹**：选择刚才解压的 \`ai-studio-shortcut-extension\` 文件夹即可。
6. **使用**：打开 [Google AI Studio (https://aistudio.google.com)](https://aistudio.google.com)，在输入框输入内容并按 **Enter** 即可发送，按 **Ctrl+Enter** 即可换行！

---

### 方式二：Tampermonkey 油猴脚本（免解压）

如果你的浏览器已安装油猴插件 (Tampermonkey 或 Violentmonkey)：
1. 打开 Tampermonkey -> 「添加新脚本」
2. 将 \`google-ai-studio-shortcuts.user.js\` 中的代码粘贴进去并保存 (Ctrl+S)。
3. 刷新 Google AI Studio 页面即可生效。

---

## 🛠️ 文件结构
\`\`\`
ai-studio-shortcut-extension/
├── manifest.json       # 扩展清单文件 (Manifest V3)
├── content.js          # 核心按键捕获与发送脚本
├── popup.html          # 点击插件图标弹出的设置界面
├── popup.js            # 设置界面交互逻辑
├── README.md           # 安装说明文档
└── icons/              # 插件图标 (16px, 48px, 128px)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
\`\`\`
`;
}

export function getExtensionFiles(config: ExtensionConfig): FileItem[] {
  return [
    {
      filename: "manifest.json",
      language: "json",
      description: "Chrome 扩展清单文件 (Manifest V3)",
      content: generateManifestJson()
    },
    {
      filename: "content.js",
      language: "javascript",
      description: "核心内容脚本（拦截键盘事件、中文拼音防误触、自动触发 Run 按钮）",
      content: generateContentJs(config)
    },
    {
      filename: "popup.html",
      language: "html",
      description: "扩展弹窗配置页面（开关切换界面）",
      content: generatePopupHtml()
    },
    {
      filename: "popup.js",
      language: "javascript",
      description: "弹窗控制与配置存储逻辑",
      content: generatePopupJs()
    },
    {
      filename: "google-ai-studio-shortcuts.user.js",
      language: "javascript",
      description: "Tampermonkey / 油猴脚本版本（免打包直接使用）",
      content: generateTampermonkeyScript(config)
    },
    {
      filename: "README.md",
      language: "markdown",
      description: "安装与使用详细说明文档",
      content: generateReadmeMd()
    }
  ];
}
