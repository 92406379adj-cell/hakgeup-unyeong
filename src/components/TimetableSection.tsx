'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  RefreshCw,
  AlertCircle,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
  School,
  Clock,
  Info,
  BookOpen,
} from 'lucide-react';
import { TimetableItem, TimetableChange, ClassSettings } from '@/types';
import { Modal } from '@/components/Modal';
import { INITIAL_TIMETABLE } from '@/lib/initialData';

interface TimetableSectionProps {
  timetable: TimetableItem[];
  changes: TimetableChange[];
  onAddChange: (newChange: TimetableChange) => void;
  onRemoveChange: (id: string) => void;
  classSettings?: ClassSettings;
  onTimetableUpdate?: (newTimetable: TimetableItem[]) => void;
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

const DEFAULT_DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: '월요일' },
  { key: 'tuesday', label: '화요일' },
  { key: 'wednesday', label: '수요일' },
  { key: 'thursday', label: '목요일' },
  { key: 'friday', label: '금요일' },
];

// Helper to determine today's day key in Korea Standard Time
const getTodayDayKey = (): DayKey => {
  const now = new Date();
  const kstOffset = 9 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kst = new Date(utc + kstOffset * 60000);
  const day = kst.getDay();
  if (day === 1) return 'monday';
  if (day === 2) return 'tuesday';
  if (day === 3) return 'wednesday';
  if (day === 4) return 'thursday';
  if (day === 5) return 'friday';
  return 'monday'; // Weekend defaults to monday
};

export const TimetableSection: React.FC<TimetableSectionProps> = ({
  timetable,
  changes,
  onAddChange,
  onRemoveChange,
  classSettings,
  onTimetableUpdate,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayKey>(getTodayDayKey());
  const [viewMode, setViewMode] = useState<'realtime' | 'regular'>('realtime');
  const [timetableData, setTimetableData] = useState<TimetableItem[]>(timetable);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingNeis, setIsLoadingNeis] = useState(false);
  const [isNeisLive, setIsNeisLive] = useState(false);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [weekInfo, setWeekInfo] = useState<{
    label: string;
    mondayYmd: string;
    fridayYmd: string;
    days: { key: DayKey; ymd: string; displayDate: string; label: string; isToday: boolean }[];
  } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Form State for new change
  const [formDay, setFormDay] = useState<DayKey>('monday');
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formOrig, setFormOrig] = useState('');
  const [formNew, setFormNew] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formReason, setFormReason] = useState('');

  // Fetch real-time timetable from NEIS API
  const fetchTimetable = useCallback(
    async (offset: number) => {
      setIsLoadingNeis(true);
      try {
        const grade = classSettings?.grade || 3;
        const classNum = classSettings?.classNum || 7;
        const res = await fetch(`/api/timetable?grade=${grade}&classNum=${classNum}&weekOffset=${offset}`);
        if (!res.ok) throw new Error('시간표 수신 실패');

        const data = await res.json();
        if (data.success && data.timetable) {
          setTimetableData(data.timetable);
          setIsNeisLive(Boolean(data.isNeisLive));
          setWeekInfo(data.weekInfo);
          setLastSyncTime(
            new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
          if (onTimetableUpdate) {
            onTimetableUpdate(data.timetable);
          }
        }
      } catch (err) {
        console.warn('NEIS Timetable fetch fallback to local:', err);
      } finally {
        setIsLoadingNeis(false);
      }
    },
    [classSettings?.grade, classSettings?.classNum, onTimetableUpdate]
  );

  // Initial load and when class settings change
  useEffect(() => {
    fetchTimetable(weekOffset);
  }, [fetchTimetable, weekOffset]);

  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset);
  };

  // Determine which timetable array to display
  const activeTimetable = viewMode === 'regular' ? INITIAL_TIMETABLE : timetableData;

  const handleOpenModal = () => {
    const defaultItem = activeTimetable.find((t) => t.period === formPeriod);
    const origSub = defaultItem ? defaultItem[formDay].subject : '';
    setFormOrig(origSub);
    setIsModalOpen(true);
  };

  const handlePeriodChange = (period: number) => {
    setFormPeriod(period);
    const item = activeTimetable.find((t) => t.period === period);
    if (item) {
      setFormOrig(item[formDay].subject);
    }
  };

  const handleDaySelectInForm = (day: DayKey) => {
    setFormDay(day);
    const item = activeTimetable.find((t) => t.period === formPeriod);
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

  // Get active day list
  const daysList =
    viewMode === 'realtime' && weekInfo?.days
      ? weekInfo.days
      : DEFAULT_DAYS.map((d) => ({ key: d.key, label: d.label, isToday: false }));

  // Check if selected day in realtime mode is entirely a holiday
  const selectedDayItems = activeTimetable.map((t) => t[selectedDay]);
  const isSelectedDayHoliday =
    viewMode === 'realtime' &&
    selectedDayItems.slice(0, 4).every((item) => item?.isEvent || item?.subject?.includes('공휴일') || item?.subject?.includes('한글날'));
  const holidayName = selectedDayItems[0]?.subject || '공휴일';

  return (
    <div className="clay-card bg-white/90 dark:bg-slate-900/90 p-5 md:p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                학급 시간표 & 변동 관리
              </h2>
              {/* Mode Badge */}
              {viewMode === 'realtime' && isNeisLive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-emerald-500" />
                  나이스(NEIS) 실시간 연동됨
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  3-7 정규 35시수 기준표
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>순천복성고 {classSettings?.grade || 3}학년 {classSettings?.classNum || 7}반 공식 시간표</span>
              {viewMode === 'realtime' && lastSyncTime && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  (최근 동기화: {lastSyncTime})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls: View Mode Toggle & Add Change */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('realtime')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'realtime'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>실시간 나이스</span>
            </button>
            <button
              onClick={() => setViewMode('regular')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'regular'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>정규 기준표</span>
            </button>
          </div>

          {viewMode === 'realtime' && (
            <button
              onClick={() => fetchTimetable(weekOffset)}
              disabled={isLoadingNeis}
              title="나이스 실시간 시간표 다시 불러오기"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNeis ? 'animate-spin text-indigo-500' : ''}`} />
              <span className="hidden sm:inline">실시간 갱신</span>
            </button>
          )}

          <button
            onClick={handleOpenModal}
            className="px-3 py-1.5 rounded-xl clay-button bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-xs flex items-center gap-1 shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" /> 시간표 변경 등록
          </button>
        </div>
      </div>

      {/* Mode Specific Toolbar */}
      {viewMode === 'realtime' ? (
        /* Week Navigation Toolbar */
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleWeekChange(weekOffset - 1)}
              disabled={isLoadingNeis}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="이전 주"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 dark:text-slate-200 px-1">
              {weekInfo?.label || '이번 주 시간표'}
            </span>
            <button
              onClick={() => handleWeekChange(weekOffset + 1)}
              disabled={isLoadingNeis}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="다음 주"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {weekOffset !== 0 ? (
              <button
                onClick={() => handleWeekChange(0)}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100 transition-colors"
              >
                오늘(이번 주)로 이동
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                이번 주 진행 중
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Regular Timetable Info Toolbar */
        <div className="mb-4 p-2.5 px-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              <strong>순천복성고 3학년 7반 2학기 정규 35시수 기준 시간표</strong> (공휴일과 무관한 평소 정규 수업 과목)
            </span>
          </div>
          <button
            onClick={() => setViewMode('realtime')}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 shrink-0 self-start sm:self-auto"
          >
            이번 주 실시간 나이스로 전환 ➜
          </button>
        </div>
      )}

      {/* Holiday Alert Banner (if selected day is a holiday in realtime mode) */}
      {isSelectedDayHoliday && (
        <div className="mb-4 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>
              <strong>{daysList.find((d) => d.key === selectedDay)?.label}</strong>은 법정 공휴일(<strong>{holidayName}</strong>)로 정규 수업이 없는 날입니다.
            </span>
          </div>
          <button
            onClick={() => setViewMode('regular')}
            className="px-2.5 py-1 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all text-[11px] shrink-0 self-start sm:self-auto shadow-sm"
          >
            3-7 평소 정규 시간표 확인 ➜
          </button>
        </div>
      )}

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-5 overflow-x-auto">
        {daysList.map((d) => {
          const isSelected = selectedDay === d.key;
          const dayChangeCount = changes.filter((c) => c.day === d.key).length;
          return (
            <button
              key={d.key}
              onClick={() => setSelectedDay(d.key as DayKey)}
              className={`flex-1 min-w-[85px] py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{d.label}</span>
              {d.isToday && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                  오늘
                </span>
              )}
              {dayChangeCount > 0 && (
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-amber-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable Cards for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
        {activeTimetable.map((item) => {
          const classInfo = item[selectedDay];
          const substitution = getSubstitutedClass(selectedDay, item.period);
          const isSpecialEvent = classInfo?.isEvent;

          return (
            <div
              key={item.period}
              className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                substitution
                  ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-sm'
                  : isSpecialEvent
                  ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50 shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800'
              }`}
            >
              {/* Card Header: Period & Status */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {item.period}교시 ({item.time})
                </span>

                {substitution ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> 변동됨
                  </span>
                ) : isSpecialEvent ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/70 dark:text-purple-300">
                    🎌 학사일정/공휴일
                  </span>
                ) : viewMode === 'realtime' && classInfo?.isNeis ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-0.5 border border-emerald-200 dark:border-emerald-800">
                    <Zap className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" /> 나이스
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {classInfo?.room || `${classSettings?.grade || 3}-${classSettings?.classNum || 7}반`}
                  </span>
                )}
              </div>

              {/* Subject & Teacher Info */}
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
              ) : isSpecialEvent ? (
                <div>
                  <div className="text-lg font-extrabold text-purple-900 dark:text-purple-200">
                    {classInfo?.subject}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center justify-between">
                    <span>순천복성고 공식 학사일정</span>
                    <span className="text-[11px] bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300">
                      공휴일/시험
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    {classInfo?.subject}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                    <span>교사: {classInfo?.teacher || '교과 담당'}</span>
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {classInfo?.room || '3-7교실'}
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
              const dayLabel = DEFAULT_DAYS.find((d) => d.key === c.day)?.label || c.day;
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-500" /> 시간표 변동 / 대강 등록
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
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
                onChange={(e) => handleDaySelectInForm(e.target.value as DayKey)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100"
              >
                {DEFAULT_DAYS.map((d) => (
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
              placeholder="예: 물리학Ⅱ (보강), 진로상담, 자율활동"
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
                placeholder="예: 교사 연수, 진로 체험"
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
      </Modal>
    </div>
  );
};
