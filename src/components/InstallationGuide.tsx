import React, { useState } from 'react';
import { Download, FolderOpen, Chrome, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Layers, FileCode } from 'lucide-react';

interface InstallationGuideProps {
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const InstallationGuide: React.FC<InstallationGuideProps> = ({ onDownloadZip, isDownloading }) => {
  const [activeMode, setActiveMode] = useState<'chrome' | 'tampermonkey'>('chrome');

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Mode Switcher */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
        <button
          id="modeChromeTab"
          onClick={() => setActiveMode('chrome')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
            activeMode === 'chrome'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Chrome className="w-4 h-4 text-blue-600" />
          <span>Chrome / Edge 扩展程序安装（推荐）</span>
        </button>
        <button
          id="modeTampermonkeyTab"
          onClick={() => setActiveMode('tampermonkey')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
            activeMode === 'tampermonkey'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FileCode className="w-4 h-4 text-amber-600" />
          <span>Tampermonkey 油猴脚本（免解压方式）</span>
        </button>
      </div>

      {activeMode === 'chrome' ? (
        <div className="p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
            <div>
              <h4 className="text-sm font-semibold text-blue-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                已为你生成完整的 Manifest V3 插件包
              </h4>
              <p className="text-xs text-blue-800 mt-1">
                包含 manifest.json、content.js、popup 界面、图标与中文字符防误触机制。
              </p>
            </div>
            <button
              id="downloadExtensionZipGuideBtn"
              onClick={onDownloadZip}
              disabled={isDownloading}
              className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? '正在打包中...' : '一键下载插件 (.ZIP)'}</span>
            </button>
          </div>

          {/* 4 Step Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">第 1 步</span>
                </div>
                <h5 className="text-xs font-semibold text-slate-900">下载并解压</h5>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  点击上方下载 ZIP 压缩包，解压到任意文件夹（例如 <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono text-[10px]">ai-studio-plugin</code>）。
                </p>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200/60 flex items-center gap-1">
                <FolderOpen className="w-3 h-3 text-slate-500" />
                <span>保留解压后的整个文件夹</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">第 2 步</span>
                </div>
                <h5 className="text-xs font-semibold text-slate-900">打开扩展管理</h5>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  在 Chrome 浏览器地址栏输入并回车：
                  <code className="block bg-slate-200/90 text-slate-900 px-1.5 py-1 rounded font-mono text-[11px] mt-1 select-all font-semibold">
                    chrome://extensions
                  </code>
                </p>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200/60 flex items-center gap-1">
                <Chrome className="w-3 h-3 text-slate-500" />
                <span>Edge 用户输入 edge://extensions</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">第 3 步</span>
                </div>
                <h5 className="text-xs font-semibold text-slate-900">开启开发者模式</h5>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  在页面右上角打开 **「开发者模式」 (Developer mode)** 开关。
                </p>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>允许加载本地未打包插件</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">第 4 步</span>
                </div>
                <h5 className="text-xs font-semibold text-slate-900">加载已解压扩展</h5>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  点击左上角 **「加载已解压的扩展程序」**，选中解压出的文件夹即可！
                </p>
              </div>
              <div className="pt-2 text-[10px] text-emerald-700 font-medium border-t border-slate-200/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>刷新 AI Studio 立即生效</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-start gap-2 border border-slate-200">
            <span className="font-semibold text-slate-800 shrink-0">💡 提示：</span>
            <span>
              安装完成后，打开 <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">aistudio.google.com</a> 刷新页面，在输入框按 <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[11px]">Enter</kbd> 即可直接发送，按 <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[11px]">Ctrl+Enter</kbd> 即可换行。
            </span>
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
            <h4 className="font-semibold text-amber-950 flex items-center gap-1.5 text-sm">
              <FileCode className="w-4 h-4 text-amber-700" />
              使用 Tampermonkey 油猴脚本方式
            </h4>
            <p className="text-amber-800 leading-relaxed">
              如果你已经安装了 Chrome 油猴扩展（Tampermonkey 或 Violentmonkey），可以直接复制脚本代码新建脚本，免去解压步骤。
            </p>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 leading-relaxed">
            <li>
              点击下方代码查看器中的 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">google-ai-studio-shortcuts.user.js</code> 标签。
            </li>
            <li>
              点击右上角的 **「复制代码」** 按钮。
            </li>
            <li>
              点击浏览器右上角的 Tampermonkey 图标 ➔ 选择 **「添加新脚本」**。
            </li>
            <li>
              全选并粘贴代码，按 <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono">Ctrl + S</kbd>（或 Cmd + S）保存。
            </li>
            <li>
              打开 Google AI Studio 即可享受 Enter 发送与 Ctrl+Enter 换行！
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
