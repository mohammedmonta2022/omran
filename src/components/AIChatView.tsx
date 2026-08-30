import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  BookOpen,
  Compass,
  Award,
  Flame,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, Student, AppSettings } from '../types';

interface AIChatViewProps {
  chatMessages: ChatMessage[];
  onSendMessage: (userText: string) => Promise<void>;
  onResetChat: () => void;
  students: Student[];
  settings: AppSettings;
}

export const AIChatView: React.FC<AIChatViewProps> = ({
  chatMessages,
  onSendMessage,
  onResetChat,
  students,
  settings,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    setInputText('');
    setIsLoading(true);
    try {
      await onSendMessage(text.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'كيف أتعامل مع طالب يجد صعوبة في ضبط متشابهات سورة البقرة؟',
    'اقترح لي خطة تحفيزية ومسابقة قرآنية أسبوعية للطلاب',
    'طريقة سهلة لتعليم أحكام النون الساكنة والتنوين للأطفال في الحلقة',
    'كيف أساعد طالباً ضعيف التركيز على تثبيت حفظ جزء عم؟',
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-950/60">
            <Bot className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-kufi text-slate-100">
                مساعد عمران القرآني والتربوي الذكي
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 font-bold text-[10px]">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مستشارك التربوي المتخصص في علوم القرآن، التجويد، ضبط المتشابهات، وتكييف خطط الحفظ
            </p>
          </div>
        </div>

        <button
          onClick={onResetChat}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بدء محادثة جديدة</span>
        </button>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col h-[65vh]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1">
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                    isUser
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white'
                      : 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                  <span className="block text-[9px] text-slate-400/80 mt-1 text-left font-sans">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white text-xs">
                <Bot className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>مساعد عمران يحلل السياق القرآني ويكتب الرد...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-3 pb-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-amber-400/80 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>اقتراحات:</span>
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="flex-shrink-0 px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-2 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="اكتب استفسارك أو طلبك القرآني والتربوي هنا..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold shadow-lg shadow-amber-950 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-5 h-5 transform -rotate-45" />
          </button>
        </form>
      </div>
    </div>
  );
};
