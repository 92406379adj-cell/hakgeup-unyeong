'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Post, TimetableItem, ClassSettings } from '@/types';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  HelpCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface ClassAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  timetable?: TimetableItem[];
  classSettings?: ClassSettings;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'openai' | 'local_search';
}

const DEFAULT_SUGGESTIONS = [
  '오늘 순천복성고 점심/저녁 메뉴 뭐야?',
  '중간고사 시험 일정이 언제야?',
  '과학탐구실험 보고서 마감일 언제까지야?',
  '축제 학급 부스 투표 아이디어 알려줘',
];

export const ClassAIChatModal: React.FC<ClassAIChatModalProps> = ({
  isOpen,
  onClose,
  posts,
  timetable = [],
  classSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const grade = classSettings?.grade || 3;
  const classNum = classSettings?.classNum || 7;

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `안녕하세요! **${grade}학년 ${classNum}반 학급 공지사항 AI 챗봇**입니다. 🤖✨\n\n게시판에 올라온 시험 일정, 수행평가 마감일, 학급 행사 등에 대해 궁금한 점을 편하게 물어보세요!`,
          timestamp: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        },
      ]);
    }
  }, [isOpen, grade, classNum, messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          posts,
          timetable,
          classSettings,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          source: data.source,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || '답변을 받아오지 못했습니다.');
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `답변 중 오류가 발생했습니다: ${err.message}`,
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `대화가 초기화되었습니다. 공지사항에 대해 무엇이든 질문해 주세요! 😊`,
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      },
    ]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                학급 공지사항 AI 챗봇
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1 border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-2.5 h-2.5" /> GPT-4o 연동
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {grade}학년 {classNum}반 공지사항 및 학사일정을 학습한 실시간 질의응답
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="대화 내용 지우기"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Questions Pills */}
      <div className="py-2.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
          <HelpCircle className="w-3 h-3" /> 추천 질문:
        </span>
        {DEFAULT_SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sug)}
            disabled={isLoading}
            className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200/60 dark:border-slate-700/60"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Messages Thread Container */}
      <div className="h-80 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  isUser
                    ? 'bg-indigo-600'
                    : 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-sm'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/50'
                }`}
              >
                <div className="whitespace-pre-line text-xs font-normal">
                  {m.content}
                </div>
                <div
                  className={`text-[9px] mt-1 flex items-center gap-1 ${
                    isUser ? 'text-indigo-200 justify-end' : 'text-slate-400 justify-start'
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>{m.timestamp}</span>
                  {m.source === 'openai' && (
                    <span className="text-purple-500 dark:text-purple-400 font-semibold ml-1">
                      • GPT
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px]">공지사항을 확인하며 답변을 작성하고 있습니다...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="공지사항이나 시험 일정에 대해 물어보세요... (예: 중간고사 며칠이야?)"
          disabled={isLoading}
          className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all ${
            !inputText.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>전송</span>
        </button>
      </form>
    </Modal>
  );
};
