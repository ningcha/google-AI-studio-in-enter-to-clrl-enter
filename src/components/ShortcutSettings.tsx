import React from 'react';
import { ExtensionConfig } from '../types';
import { Settings, Shield, Keyboard, Check, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

interface ShortcutSettingsProps {
  config: ExtensionConfig;
  onChange: (config: ExtensionConfig) => void;
}

export const ShortcutSettings: React.FC<ShortcutSettingsProps> = ({ config, onChange }) => {
  const toggle = (key: keyof ExtensionConfig) => {
    onChange({
      ...config,
      [key]: !config[key]
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">快捷键行为与规则定制</h3>
        </div>
        <span className="text-[11px] text-slate-400">修改后将实时更新下载的插件代码</span>
      </div>

      {/* Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Toggle 1: Enter to Send */}
        <div
          onClick={() => toggle('enterToSend')}
          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between ${
            config.enterToSend
              ? 'border-blue-300 bg-blue-50/40 ring-1 ring-blue-100'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="space-y-1 pr-2">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-xs font-bold text-slate-800 shadow-2xs">
                Enter
              </kbd>
              <span className="text-xs font-semibold text-slate-900">设为发送 (Send / Run)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              按下回车键立即运行 Prompt，如同常规即时通讯工具
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.enterToSend}
            onChange={() => toggle('enterToSend')}
            className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer"
          />
        </div>

        {/* Toggle 2: Ctrl+Enter to Newline */}
        <div
          onClick={() => toggle('ctrlEnterToNewline')}
          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between ${
            config.ctrlEnterToNewline
              ? 'border-blue-300 bg-blue-50/40 ring-1 ring-blue-100'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="space-y-1 pr-2">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-xs font-bold text-slate-800 shadow-2xs">
                Ctrl + Enter
              </kbd>
              <span className="text-xs font-semibold text-slate-900">设为换行 (Newline)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Mac 上自动映射为 Command + Enter，在光标处插入新行
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.ctrlEnterToNewline}
            onChange={() => toggle('ctrlEnterToNewline')}
            className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer"
          />
        </div>

        {/* Toggle 3: Shift+Enter to Newline */}
        <div
          onClick={() => toggle('shiftEnterToNewline')}
          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between ${
            config.shiftEnterToNewline
              ? 'border-blue-300 bg-blue-50/40 ring-1 ring-blue-100'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="space-y-1 pr-2">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-xs font-bold text-slate-800 shadow-2xs">
                Shift + Enter
              </kbd>
              <span className="text-xs font-semibold text-slate-900">保留换行</span>
            </div>
            <p className="text-[11px] text-slate-500">
              兼容大多数编辑器的换行习惯
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.shiftEnterToNewline}
            onChange={() => toggle('shiftEnterToNewline')}
            className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer"
          />
        </div>

        {/* Toggle 4: IME Protection */}
        <div
          onClick={() => toggle('imeProtection')}
          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between ${
            config.imeProtection
              ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-100'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="space-y-1 pr-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-900">中文拼音输入法防误触 (IME)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              打字选词时按 Enter 不会触发发送，选词完成后按 Enter 才会发送
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.imeProtection}
            onChange={() => toggle('imeProtection')}
            className="w-4 h-4 text-emerald-600 rounded mt-0.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
        <div className="bg-slate-100/80 px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">
          按键行为对比映射表 (Key Behavior Comparison)
        </div>
        <div className="divide-y divide-slate-200">
          <div className="grid grid-cols-3 p-2.5 bg-slate-50/50 font-medium text-slate-500 text-[11px]">
            <span>按键操作</span>
            <span>Google AI Studio 默认</span>
            <span className="text-blue-600 font-semibold">使用本插件后 (修改后)</span>
          </div>

          <div className="grid grid-cols-3 p-2.5 items-center">
            <span className="font-mono font-bold text-slate-800">Enter</span>
            <span className="text-slate-500">换行 (Newline)</span>
            <span className="text-blue-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> 直接发送 / 运行 (Send)
            </span>
          </div>

          <div className="grid grid-cols-3 p-2.5 items-center">
            <span className="font-mono font-bold text-slate-800">Ctrl + Enter</span>
            <span className="text-slate-500">发送 / 运行 (Run)</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 换行 (Newline)
            </span>
          </div>

          <div className="grid grid-cols-3 p-2.5 items-center">
            <span className="font-mono font-bold text-slate-800">Shift + Enter</span>
            <span className="text-slate-500">换行 (Newline)</span>
            <span className="text-slate-700">保持换行 (Newline)</span>
          </div>

          <div className="grid grid-cols-3 p-2.5 items-center">
            <span className="font-mono font-bold text-slate-800">拼音输入中按 Enter</span>
            <span className="text-slate-500">确认拼音候选词</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> 正常选词，绝不误发送
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
