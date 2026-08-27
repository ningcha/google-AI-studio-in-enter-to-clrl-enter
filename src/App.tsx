import React, { useState, useMemo } from 'react';
import { ExtensionConfig } from './types';
import { getExtensionFiles } from './data/extensionCode';
import { downloadExtensionZip } from './utils/zipGenerator';
import { InteractiveSimulator } from './components/InteractiveSimulator';
import { InstallationGuide } from './components/InstallationGuide';
import { CodeViewer } from './components/CodeViewer';
import { ShortcutSettings } from './components/ShortcutSettings';
import {
  Download,
  Sparkles,
  Keyboard,
  FileCode,
  Layers,
  Settings2,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  ArrowDownToLine,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<ExtensionConfig>({
    enterToSend: true,
    ctrlEnterToNewline: true,
    shiftEnterToNewline: true,
    imeProtection: true,
    showSendBadge: true,
    matchPatterns: ['https://aistudio.google.com/*', 'https://makersuite.google.com/*']
  });

  const [activeView, setActiveView] = useState<'guide' | 'simulator' | 'code' | 'settings'>('guide');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const files = useMemo(() => getExtensionFiles(config), [config]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadMessage('正在准备扩展程序文件...');
      await downloadExtensionZip(config, (msg) => setDownloadMessage(msg));
      setDownloadMessage('下载成功！请解压并在 chrome://extensions 中加载。');
      setTimeout(() => setDownloadMessage(null), 4000);
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadMessage('下载失败，请手动复制代码使用。');
      setTimeout(() => setDownloadMessage(null), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                  Google AI Studio 快捷键助手
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Chrome Extension V3
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter 键发送 · Ctrl+Enter 换行 · 中文防误触
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            >
              <span>前往 AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              id="topDownloadZipBtn"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? '打包中...' : '下载插件 (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Download Alert Banner if active */}
      {downloadMessage && (
        <div className="bg-emerald-600 text-white py-2 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 transition-all">
          <CheckCircle className="w-4 h-4" />
          <span>{downloadMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <kbd className="font-mono text-xs font-bold">↵</kbd>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Enter 直接发送</div>
              <div className="text-[11px] text-slate-500">如同常规聊天软件快速交互</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <kbd className="font-mono text-xs font-bold">^↵</kbd>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Ctrl+Enter 快捷换行</div>
              <div className="text-[11px] text-slate-500">光标处精准插入换行符</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">中文拼音防误触</div>
              <div className="text-[11px] text-slate-500">选词按回车绝不误触发发送</div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            id="tabGuide"
            onClick={() => setActiveView('guide')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
              activeView === 'guide'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1. 安装教程与下载</span>
          </button>

          <button
            id="tabSimulator"
            onClick={() => setActiveView('simulator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
              activeView === 'simulator'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. 在线交互测试沙盒</span>
          </button>

          <button
            id="tabCode"
            onClick={() => setActiveView('code')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
              activeView === 'code'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>3. 插件源码与油猴脚本</span>
          </button>

          <button
            id="tabSettings"
            onClick={() => setActiveView('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
              activeView === 'settings'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>4. 按键行为定制</span>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeView === 'guide' && (
            <div className="space-y-6">
              <InstallationGuide
                onDownloadZip={handleDownload}
                isDownloading={isDownloading}
              />
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  插件工作原理与技术实现
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1.5">
                    <span className="font-semibold text-slate-800">1. 事件捕获拦截 (Capture Phase)</span>
                    <p className="text-slate-500 leading-relaxed">
                      在 window 最顶层捕获阶段优先拦截 keydown 事件，阻断 AI Studio 原生 Enter 换行并转发至 Run 触发器。
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1.5">
                    <span className="font-semibold text-slate-800">2. 中文输入法选词保护</span>
                    <p className="text-slate-500 leading-relaxed">
                      监听 compositionstart / compositionend 事件及 keyCode 229，确保拼音输入按回车时仅用于确认汉字，绝不误发送。
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1.5">
                    <span className="font-semibold text-slate-800">3. Undo/Redo 历史保留</span>
                    <p className="text-slate-500 leading-relaxed">
                      Ctrl+Enter 插入换行符时优先通过 document.execCommand 写入，保留原生撤销（Ctrl+Z）操作链。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'simulator' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">实时沙盒说明：</span>
                  此沙盒内置了本 Chrome 插件完全相同的按键拦截算法。你可以在下方输入框亲自测试 <kbd className="px-1 py-0.2 bg-white rounded border border-blue-200 font-mono">Enter</kbd> 发送与 <kbd className="px-1 py-0.2 bg-white rounded border border-blue-200 font-mono">Ctrl+Enter</kbd> 换行体验！
                </div>
              </div>
              <InteractiveSimulator config={config} />
            </div>
          )}

          {activeView === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">插件全部源代码</h3>
                  <p className="text-xs text-slate-500">你可以直接复制单个文件，或点击右上角打包下载全部文件。</p>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition cursor-pointer self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载完整 ZIP</span>
                </button>
              </div>
              <CodeViewer files={files} />
            </div>
          )}

          {activeView === 'settings' && (
            <div className="space-y-4">
              <ShortcutSettings config={config} onChange={setConfig} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>适用于 Google AI Studio (aistudio.google.com)</span>
          <span>Manifest V3 规范 · 纯本地运行 · 无任何网络请求</span>
        </div>
      </footer>
    </div>
  );
}
