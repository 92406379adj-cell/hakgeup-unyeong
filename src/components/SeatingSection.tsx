'use client';

import React, { useState, useEffect } from 'react';
import { Shuffle, Pin, RotateCcw, Sparkles, Users, FileSpreadsheet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SeatStudent } from '@/types';

interface SeatingSectionProps {
  students: SeatStudent[];
  onOpenStudentManager: () => void;
}

export const SeatingSection: React.FC<SeatingSectionProps> = ({
  students: parentStudents,
  onOpenStudentManager,
}) => {
  const [students, setStudents] = useState<SeatStudent[]>(parentStudents);
  const [isShuffling, setIsShuffling] = useState(false);

  // Sync when parent student list changes (e.g. from Excel import)
  useEffect(() => {
    setStudents(parentStudents);
  }, [parentStudents]);

  // Toggle fixed seat for a student
  const toggleFixedSeat = (id: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFixed: !s.isFixed } : s))
    );
  };

  // Run random seat shuffle while preserving fixed seats
  const handleShuffle = () => {
    setIsShuffling(true);

    // Confetti explosion
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
      });
    } catch (e) {
      // safe fallback if confetti canvas fails
    }

    setTimeout(() => {
      setStudents((prev) => {
        // Separate fixed and non-fixed
        const fixedIndices = new Set(
          prev.map((s, idx) => (s.isFixed ? idx : -1)).filter((idx) => idx !== -1)
        );
        const movableStudents = prev.filter((s) => !s.isFixed);

        // Fisher-Yates shuffle
        const shuffled = [...movableStudents];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Reconstruct list
        let movableIdx = 0;
        return prev.map((s, idx) => {
          if (fixedIndices.has(idx)) {
            return s;
          }
          const nextStudent = shuffled[movableIdx++];
          return nextStudent;
        });
      });
      setIsShuffling(false);
    }, 600);
  };

  const handleReset = () => {
    setStudents(parentStudents);
  };

  const maleCount = students.filter((s) => s.gender === 'M').length;
  const femaleCount = students.filter((s) => s.gender === 'F').length;

  return (
    <div className="clay-card bg-white/90 dark:bg-slate-900/90 p-5 md:p-6 transition-all duration-300">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              스마트 자리바꾸기 추첨기
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 font-normal">
                {students.length}인 학급 맞춤
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              고정석(시력/배려) 설정 유지 기능 탑재 & 원클릭 공정 랜덤 추첨
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Roster Button */}
          <button
            onClick={onOpenStudentManager}
            title="학생 명단 편집 및 엑셀 일괄 등록"
            className="px-3 py-2 rounded-2xl clay-button bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs md:text-sm flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>학생 명단 관리 (엑셀)</span>
          </button>

          <button
            onClick={handleReset}
            title="초기 자리로 리셋"
            className="p-2 rounded-2xl clay-button bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleShuffle}
            disabled={isShuffling}
            className={`px-4 py-2 rounded-2xl clay-button bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs md:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] ${
              isShuffling ? 'opacity-70 animate-pulse' : ''
            }`}
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            {isShuffling ? '추첨 셔플 중...' : '원클릭 자리 추첨'}
          </button>
        </div>
      </div>

      {/* Chalkboard / Teacher Podium Front Indicator */}
      <div className="w-full mb-6">
        <div className="w-full max-w-xl mx-auto py-2 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-emerald-100 text-center font-bold text-xs tracking-wider shadow-inner border-2 border-emerald-900/60 flex items-center justify-center gap-2">
          <span>[ 칠 판 / 교 탁 ] ──── 앞 쪽 (강단)</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>
      </div>

      {/* Seating Grid (5 Columns default, responsive) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2.5 md:gap-3">
        {students.map((student, idx) => {
          const seatNumber = idx + 1;
          const isFixed = student.isFixed;

          return (
            <div
              key={`${student.id}-${idx}`}
              className={`p-2.5 md:p-3 rounded-2xl border transition-all duration-300 relative group select-none ${
                isFixed
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-md'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/70 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Seat number & Fixed Toggle */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                  #{seatNumber}
                </span>
                <button
                  onClick={() => toggleFixedSeat(student.id)}
                  title={isFixed ? '고정석 해제' : '고정석 지정'}
                  className={`p-1 rounded-md transition-colors ${
                    isFixed
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60'
                      : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                </button>
              </div>

              {/* Student Name */}
              <div className="text-center py-1">
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                  {student.name}
                </span>
              </div>

              {/* Gender badge & Status */}
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span
                  className={`px-1.5 py-0.2 rounded-full font-medium ${
                    student.gender === 'F'
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300'
                  }`}
                >
                  {student.gender === 'F' ? '여' : '남'}
                </span>

                {isFixed && (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                    고정석
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <div>💡 핀(Pin) 아이콘을 클릭하여 시력 배려석 및 특별 배려석을 고정할 수 있습니다.</div>
        <div className="font-medium">
          총 인원: {students.length}명 (남 {maleCount}명 / 여 {femaleCount}명)
        </div>
      </div>
    </div>
  );
};
