'use client';

import React, { useState } from 'react';
import { Trophy, Medal, Award, Plus, Flame, Sparkles, X } from 'lucide-react';
import { ScoreItem } from '@/types';
import { Modal } from '@/components/Modal';


interface RankingSectionProps {
  scores: ScoreItem[];
  onAddScore: (item: Omit<ScoreItem, 'id' | 'played_at'>) => void;
}

export const RankingSection: React.FC<RankingSectionProps> = ({ scores, onAddScore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [scoreToAdd, setScoreToAdd] = useState(10);

  // Sorted scores descending
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  const maxScore = sortedScores.length > 0 ? sortedScores[0].score : 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    onAddScore({
      nickname: nickname.trim(),
      score: Number(scoreToAdd),
      badge: Number(scoreToAdd) >= 50 ? '🌟 모범상' : '✨ 칭찬',
    });

    setIsModalOpen(false);
    setNickname('');
    setScoreToAdd(10);
  };

  return (
    <div className="clay-card bg-white/90 dark:bg-slate-900/90 p-5 md:p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              학급 활동 & 칭찬 랭킹
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-normal">
                Supabase scores 연동
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              학급 참여도, 퀴즈 배틀, 봉사활동 칭찬 스탬프 현황입니다.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl clay-button bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium text-xs md:text-sm flex items-center gap-1.5 shadow-md shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> 칭찬 점수 부여
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {/* 2nd place */}
        {sortedScores[1] && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center flex flex-col items-center justify-center relative shadow-sm">
            <span className="text-xl mb-0.5">🥈</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate w-full">
              {sortedScores[1].nickname}
            </span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
              {sortedScores[1].score}점
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">2위</span>
          </div>
        )}

        {/* 1st place */}
        {sortedScores[0] && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/40 dark:from-amber-950/40 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-700 text-center flex flex-col items-center justify-center relative shadow-md scale-105 z-10">
            <span className="text-2xl mb-0.5 animate-bounce">👑</span>
            <span className="text-xs font-black text-amber-900 dark:text-amber-200 truncate w-full">
              {sortedScores[0].nickname}
            </span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              {sortedScores[0].score}점
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">1위 챔피언</span>
          </div>
        )}

        {/* 3rd place */}
        {sortedScores[2] && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center flex flex-col items-center justify-center relative shadow-sm">
            <span className="text-xl mb-0.5">🥉</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate w-full">
              {sortedScores[2].nickname}
            </span>
            <span className="text-sm font-extrabold text-amber-700 dark:text-amber-500 font-mono mt-0.5">
              {sortedScores[2].score}점
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">3위</span>
          </div>
        )}
      </div>

      {/* Leaderboard List with Progress Bars */}
      <div className="space-y-2">
        {sortedScores.map((item, idx) => {
          const rank = idx + 1;
          const percentage = Math.max(15, Math.round((item.score / maxScore) * 100));

          return (
            <div
              key={item.id}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-3 text-xs shadow-sm hover:shadow transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    rank === 1
                      ? 'bg-amber-400 text-white'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-800'
                      : rank === 3
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {rank}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                  {item.nickname}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex-1 hidden sm:block">
                <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-medium">
                    {item.badge}
                  </span>
                )}
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-xs">
                  {item.score}점
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding score */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" /> 학급 활동 칭찬 점수 부여
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          성실한 발표, 청소 봉사, 퀴즈 참여 학생에게 스탬프를 부여합니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              학생 이름 / 닉네임
            </label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 김민서, 1모둠"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              부여할 점수 (기본 10점 ~ 50점)
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[5, 10, 20, 50].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setScoreToAdd(pts)}
                  className={`py-1.5 rounded-lg text-xs font-bold border ${
                    scoreToAdd === pts
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  +{pts}
                </button>
              ))}
            </div>
            <input
              type="number"
              required
              min={1}
              max={200}
              value={scoreToAdd}
              onChange={(e) => setScoreToAdd(Number(e.target.value))}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
            />
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"
            >
              점수 등록
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
