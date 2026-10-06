'use client';

import React, { useState } from 'react';
import { Calendar, RefreshCw, AlertCircle, Plus, Check } from 'lucide-react';
import { TimetableItem, TimetableChange, ClassSettings } from '@/types';

interface TimetableSectionProps {
  timetable: TimetableItem[];
  changes: TimetableChange[];
  onAddChange: (newChange: TimetableChange) => void;
  onRemoveChange: (id: string) => void;
  classSettings?: ClassSettings;
}

const DAYS: { key: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'; label: string }[] = [
  { key: 'monday', label: '월요일' },
  { key: 'tuesday', label: '화요일' },
  { key: 'wednesday', label: '수요일' },
  { key: 'thursday', label: '목요일' },
  { key: 'friday', label: '금요일' },
];

export const TimetableSection: React.FC<TimetableSectionProps> = ({
  timetable,
  changes,
  onAddChange,
  onRemoveChange,
  classSettings,
}) => {

  const [selectedDay, setSelectedDay] = useState<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>('monday');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new change
  const [formDay, setFormDay] = useState<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>('monday');
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formOrig, setFormOrig] = useState('');
  const [formNew, setFormNew] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formReason, setFormReason] = useState('');

  const handleOpenModal = () => {
    const defaultItem = timetable.find((t) => t.period === formPeriod);
    const origSub = defaultItem ? defaultItem[formDay].subject : '';
    setFormOrig(origSub);
    setIsModalOpen(true);
  };

  const handlePeriodChange = (period: number) => {
    setFormPeriod(period);
    const item = timetable.find((t) => t.period === period);
    if (item) {
      setFormOrig(item[formDay].subject);
    }
  };

  const handleDaySelectInForm = (day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday') => {
    setFormDay(day);
    const item = timetable.find((t) => t.period === formPeriod);
    if (item) {
      setFormOrig(item[day].subject);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNew.trim()) return;

    const newChange: TimetableChange = {
      id: `tc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      day: formDay,
      period: formPeriod,
      originalSubject: formOrig || '기존 수업',
      newSubject: formNew.trim(),
      teacher: formTeacher.trim() || '대체 교사',
      reason: formReason.trim() || '학급 일정 변경',
    };

    onAddChange(newChange);
    setIsModalOpen(false);
    setFormNew('');
    setFormTeacher('');
    setFormReason('');
  };

  // Helper to check if a period has a substitution
  const getSubstitutedClass = (day: string, period: number) => {
    return changes.find((c) => c.day === day && c.period === period);
  };

  return (
    <div className="clay-card bg-white/90 dark:bg-slate-900/90 p-5 md:p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              학급 시간표 & 변동 관리
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-normal">
                주간 정규 35시수
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              실시간 수업 변경, 대강, 단축 수업 일정을 확인하고 등록하세요.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-3.5 py-2 rounded-2xl clay-button bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-xs md:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> 시간표 변경 등록
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-5 overflow-x-auto">
        {DAYS.map((d) => {
          const isSelected = selectedDay === d.key;
          const dayChangeCount = changes.filter((c) => c.day === d.key).length;
          return (
            <button
              key={d.key}
              onClick={() => setSelectedDay(d.key)}
              className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{d.label}</span>
              {dayChangeCount > 0 && (
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-amber-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable List for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
        {timetable.map((item) => {
          const classInfo = item[selectedDay];
          const substitution = getSubstitutedClass(selectedDay, item.period);

          return (
            <div
              key={item.period}
              className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                substitution
                  ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  {item.period}교시 ({item.time})
                </span>
                {substitution ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> 변동
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {classInfo.room || `${classSettings?.grade || 3}-${classSettings?.classNum || 7}반`}
                  </span>

                )}
              </div>

              {substitution ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-amber-900 dark:text-amber-200">
                      {substitution.newSubject}
                    </span>
                    <span className="text-xs line-through text-slate-400 dark:text-slate-500">
                      {substitution.originalSubject}
                    </span>
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-300 mt-1 flex items-center gap-1">
                    <span>담당: {substitution.teacher}</span>
                  </div>
                  <div className="text-[11px] text-amber-600/90 dark:text-amber-400/90 mt-1 bg-amber-100/60 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
                    사유: {substitution.reason}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {classInfo.subject}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                    <span>교사: {classInfo.teacher}</span>
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      정규수업
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notice Banner of Active Substitutions */}
      {changes.length > 0 && (
        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">
            <AlertCircle className="w-3.5 h-3.5" /> 이번 주 시간표 변동 목록 ({changes.length}건)
          </div>
          <div className="space-y-1.5">
            {changes.map((c) => {
              const dayLabel = DAYS.find((d) => d.key === c.day)?.label || c.day;
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-white dark:bg-slate-800/80 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      [{dayLabel} {c.period}교시]
                    </span>
                    <span className="line-through text-slate-400">{c.originalSubject}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">➜ {c.newSubject}</span>
                    <span className="text-slate-500 dark:text-slate-400">({c.teacher} / {c.reason})</span>
                  </div>
                  <button
                    onClick={() => onRemoveChange(c.id)}
                    className="text-slate-400 hover:text-rose-500 text-[11px] font-medium ml-2 px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950"
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for adding timetable change */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-500" /> 시간표 변동 / 대강 등록
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              출장, 결강, 행사 등으로 인한 수업 변경 사항을 입력하세요.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    요일 선택
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => handleDaySelectInForm(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100"
                  >
                    {DAYS.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    교시 선택
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => handlePeriodChange(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                      <option key={p} value={p}>
                        {p}교시
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  기존 과목 (자동 채움)
                </label>
                <input
                  type="text"
                  value={formOrig}
                  onChange={(e) => setFormOrig(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 p-2.5 text-slate-700 dark:text-slate-300"
                  placeholder="기존 과목"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  변경/대체 과목 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNew}
                  onChange={(e) => setFormNew(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="예: 물리학 I (보강), 진로상담, 자율활동"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    담당/대체 교사
                  </label>
                  <input
                    type="text"
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="교사명"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    변경 사유
                  </label>
                  <input
                    type="text"
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="예: 교사 연수, 축제 준비"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> 저장 및 적용
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
