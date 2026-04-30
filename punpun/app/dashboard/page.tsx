'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  attachments?: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'สวัสดีค่ะ! ฉันคือ PunPun ผู้ช่วยด้านความรู้ของคุณ มีอะไรที่ฉันสามารถช่วยคุณได้บ้างคะ?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
      attachments: attachedFiles.map((f) => f.name),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setAttachedFiles([]);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'ขอบคุณที่ส่งข้อมูลมานะคะ ฉันกำลังประมวลผลคำถามของคุณ...',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              P
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PunPun</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-sm transition-all ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none border border-blue-100 dark:border-slate-600'
                }`}
              >
                <p className="text-sm lg:text-base wrap-break-words">{message.text}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((file, idx) => (
                      <p key={idx} className="text-xs opacity-75">
                        📎 {file}
                      </p>
                    ))}
                  </div>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 border-t border-blue-100 dark:border-slate-700 p-4 shadow-lg">
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 bg-blue-100 dark:bg-slate-700 px-3 py-2 rounded-lg text-sm"
                >
                  <span>📎</span>
                  <span className="text-slate-700 dark:text-white truncate max-w-xs">{file.name}</span>
                  <button
                    onClick={() => removeAttachedFile(idx)}
                    className="ml-1 text-slate-500 hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.txt"
              multiple
              className="hidden"
              aria-label="Upload documents"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach PDF or TXT files"
              className="shrink-0 p-3 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 transition-colors"
            >
              📎
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="พิมพ์ข้อความของคุณ... (Enter = ส่ง, Shift+Enter = ขึ้นบรรทัด)"
              className="flex-1 px-4 py-3 border border-blue-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />

            <button
              onClick={handleSendMessage}
              className="shrink-0 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm font-bold text-lg"
            >
              ➤
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            รองรับไฟล์ PDF และ TXT เท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
}
