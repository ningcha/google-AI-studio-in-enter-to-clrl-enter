import React, { useState, useRef, useEffect } from 'react';
import { ExtensionConfig } from '../types';
import { Play, CornerDownLeft, Sparkles, CheckCircle2, RotateCcw, AlertCircle, Bot, User } from 'lucide-react';

interface SimulatorProps {
  config: ExtensionConfig;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const InteractiveSimulator: React.FC<SimulatorProps> = ({ config }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'user',
      content: '你好！请介绍一下 Gemini 1.5 Pro 的特点。',
      timestamp: '10:00:12'
    },
    {
      id: '2',
      role: 'model',
      content: 'Gemini 1.5 Pro 拥有高达 200 万 token 的超长上下文窗口，能够一次性处理海量文档、数小时音频或整部视频，并在多模态推理与代码分析方面具备出色能力。',
      timestamp: '10:00:15'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [lastAction, setLastAction] = useState<{
    keyCombo: string;
    action: string;
    type: 'send' | 'newline' | 'ime';
    time: string;
  } | null>(null);
  const [isRunFlashing, setIsRunFlashing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');

    // Trigger visual run button animation
    setIsRunFlashing(true);
    setTimeout(() => setIsRunFlashing(false), 300);

    const now = new Date().toLocaleTimeString();
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: now
    };

    setMessages((prev) => [...prev, newMsg]);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `已成功收到您的输入（按 Enter 发送）: "${userText.slice(0, 30)}${userText.length > 30 ? '...' : ''}"。\n插件核心拦截器已正常工作！`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    if (e.key !== 'Enter') return;

    const now = new Date().toLocaleTimeString();

    // 1. IME composition check
    if (config.imeProtection && isComposing) {
      setLastAction({
        keyCombo: 'Enter (中文输入法选词中)',
        action: '已阻止发送（输入法选词保护）',
        type: 'ime',
        time: now
      });
      return;
    }

    // 2. Ctrl + Enter -> Newline
    if (config.ctrlEnterToNewline && isCtrl && !isShift && !isAlt) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const newText = value.substring(0, start) + '\n' + value.substring(end);
        setInputText(newText);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
          }
        }, 0);
      }

      setLastAction({
        keyCombo: isMac ? 'Cmd + Enter' : 'Ctrl + Enter',
        action: '插入换行符 (\\n)',
        type: 'newline',
        time: now
      });
      return;
    }

    // 3. Shift + Enter -> Default newline
    if (config.shiftEnterToNewline && isShift && !isCtrl && !isAlt) {
      setLastAction({
        keyCombo: 'Shift + Enter',
        action: '原生换行',
        type: 'newline',
        time: now
      });
      return;
    }

    // 4. Enter -> Send
    if (config.enterToSend && !isCtrl && !isShift && !isAlt) {
      e.preventDefault();
      setLastAction({
        keyCombo: 'Enter',
        action: '触发 Run / 发送消息',
        type: 'send',
        time: now
      });
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        role: 'user',
        content: '你好！请介绍一下 Gemini 1.5 Pro 的特点。',
        timestamp: '10:00:12'
      },
      {
        id: '2',
        role: 'model',
        content: 'Gemini 1.5 Pro 拥有高达 200 万 token 的超长上下文窗口，能够一次性处理海量文档、数小时音频或整部视频，并在多模态推理与代码分析方面具备出色能力。',
        timestamp: '10:00:15'
      }
    ]);
    setInputText('');
    setLastAction(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Simulator Header */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
            Google AI Studio 交互沙盒 (Live Sandbox)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="resetSimulatorBtn"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3 h-3" />
            重置对话
          </button>
        </div>
      </div>

      {/* Simulator Real-Time Keystroke Feedback Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">按键监听器状态:</span>
          {lastAction ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono ${
                lastAction.type === 'send'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : lastAction.type === 'newline'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <kbd className="font-bold">{lastAction.keyCombo}</kbd>
              <span>➔</span>
              <span>{lastAction.action}</span>
              <span className="text-[10px] opacity-60">({lastAction.time})</span>
            </span>
          ) : (
            <span className="text-slate-400 italic">在下方输入框尝试按 Enter 发送，或 Ctrl+Enter 换行</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">模拟输入法状态:</span>
          <button
            onClick={() => setIsComposing(!isComposing)}
            className={`px-2 py-0.5 text-[11px] rounded transition border ${
              isComposing
                ? 'bg-amber-500 text-white border-amber-600 font-medium'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
            title="模拟中文拼音打字选词中的状态"
          >
            {isComposing ? '🟠 拼音选词中 (isComposing: true)' : '⚪ 正常输入 (isComposing: false)'}
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="h-64 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs whitespace-pre-wrap'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-2xs whitespace-pre-wrap'
              }`}
            >
              <div className="text-xs mb-1 opacity-70 flex items-center gap-1">
                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                <span>{msg.role === 'user' ? 'You' : 'Gemini 1.5 Pro'}</span>
                <span className="ml-1 text-[10px]">{msg.timestamp}</span>
              </div>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Simulated AI Studio Prompt Input Box */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-lg p-2 transition bg-white">
          <textarea
            id="simulatedPromptInput"
            ref={textareaRef}
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="在模拟框中输入测试内容... (按 Enter 发送，按 Ctrl+Enter 或 Shift+Enter 换行)"
            className="w-full resize-none border-none outline-hidden text-sm text-slate-800 placeholder-slate-400 bg-transparent font-sans"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                <CornerDownLeft className="w-3 h-3" /> Enter 发送
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                Ctrl + Enter 换行
              </span>
            </div>

            <button
              id="simulatedRunButton"
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition ${
                isRunFlashing
                  ? 'bg-emerald-500 text-white scale-105 ring-4 ring-emerald-200'
                  : inputText.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run (发送)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
