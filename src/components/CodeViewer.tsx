import React, { useState } from 'react';
import { FileItem } from '../types';
import { Copy, Check, FileCode, ExternalLink, Terminal } from 'lucide-react';

interface CodeViewerProps {
  files: FileItem[];
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ files }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const activeFile = files[activeTab] || files[0];

  const handleCopy = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-sm">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-3 pt-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
        <div className="flex items-center space-x-1">
          {files.map((file, idx) => (
            <button
              key={file.filename}
              id={`tab-${file.filename.replace(/[^a-zA-Z0-9]/g, '-')}`}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-t-lg transition border-b-2 ${
                activeTab === idx
                  ? 'bg-slate-900 text-blue-400 border-blue-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pb-2 pl-2">
          <button
            id="copyCodeBtn"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>已复制源码</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制代码</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* File Description Header */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>{activeFile.description}</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          {activeFile.content.split('\n').length} 行代码
        </span>
      </div>

      {/* Code Display */}
      <div className="p-4 overflow-x-auto max-h-96 text-xs font-mono leading-relaxed text-slate-300">
        <pre className="selection:bg-blue-800 selection:text-white">
          <code>{activeFile.content}</code>
        </pre>
      </div>
    </div>
  );
};
