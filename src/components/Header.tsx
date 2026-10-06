'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Sparkles, Server, Clock, Settings2, Check, X, School } from 'lucide-react';
import { ClassSettings } from '@/types';
import { Modal } from '@/components/Modal';


interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  classSettings: ClassSettings;
  onUpdateClassSettings: (settings: ClassSettings) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  classSettings,
  onUpdateClassSettings,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form states
  const [editGrade, setEditGrade] = useState(classSettings.grade);
  const [editClassNum, setEditClassNum] = useState(classSettings.classNum);
  const [editTitle, setEditTitle] = useState(classSettings.title);
  const [editTeacher, setEditTeacher] = useState(classSettings.teacherName || '담임선생님');

  useEffect(() => {
    setEditGrade(classSettings.grade);
    setEditClassNum(classSettings.classNum);
    setEditTitle(classSettings.title);
    setEditTeacher(classSettings.teacherName || '담임선생님');
  }, [classSettings]);

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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClassSettings({
      grade: Number(editGrade),
      classNum: Number(editClassNum),
      title: editTitle.trim() || '학급운영 허브',
      teacherName: editTeacher.trim() || '담임선생님',
    });
    setIsEditModalOpen(false);
  };

  return (
    <header className="w-full clay-card bg-white/80 dark:bg-slate-900/80 p-5 md:p-6 mb-6 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 text-2xl font-bold">
            🏫
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                {classSettings.grade}학년 {classSettings.classNum}반 {classSettings.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live
              </span>

              {/* Admin Class Edit Button */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                title="학년/반 및 학급 명칭 관리자 수정"
                className="px-2.5 py-1 rounded-xl clay-button bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 text-xs font-semibold flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>학년·반 변경</span>
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              고등학교 교사 및 학생을 위한 올인원 대시보드 & 생산성 도구 (담임: {classSettings.teacherName || '선생님'})
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

      {/* Admin Settings Modal via Portal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-500" /> 관리자 학년 및 학급 정보 변경
          </h3>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          새 학년도나 학급 개편에 맞춰 학년과 반 정보를 즉시 변경하고 반영할 수 있습니다.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                학년 (Grade)
              </label>
              <select
                value={editGrade}
                onChange={(e) => setEditGrade(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 font-semibold"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    {g}학년
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                학급 (Class)
              </label>
              <select
                value={editClassNum}
                onChange={(e) => setEditClassNum(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 font-semibold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((c) => (
                  <option key={c} value={c}>
                    {c}반
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              학급 타이틀 / 부제
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="예: 학급운영 허브, 꿈을 향해 달리는 우리반"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              담임 교사명
            </label>
            <input
              type="text"
              value={editTeacher}
              onChange={(e) => setEditTeacher(e.target.value)}
              placeholder="예: 김선생님"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> 변경사항 저장
            </button>
          </div>
        </form>
      </Modal>

    </header>
  );
};
