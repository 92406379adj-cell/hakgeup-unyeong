'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Sparkles, Server, Clock } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full clay-card bg-white/80 dark:bg-slate-900/80 p-5 md:p-6 mb-6 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 text-2xl font-bold">
            🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                3학년 2반 학급운영 허브
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              고등학교 교사 및 학생을 위한 올인원 대시보드 & 생산성 도구
            </p>
          </div>
        </div>

        {/* Status Indicators & Dark Mode */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Seoul Region Badge */}
          <div className="px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <Server className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Seoul icn1</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">RTT ~4ms</span>
          </div>

          {/* Current Time */}
          <div className="px-3 py-1.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-xs font-medium text-sky-800 dark:text-sky-300 flex items-center gap-1.5 border border-sky-200 dark:border-sky-900 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{dateStr}</span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{timeStr}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="테마 전환"
            className="p-2.5 rounded-2xl clay-button bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-transform"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
