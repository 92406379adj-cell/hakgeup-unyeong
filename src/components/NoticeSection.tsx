'use client';

import React, { useState } from 'react';
import { Megaphone, Heart, Plus, Clock, User, Check, Tag, X } from 'lucide-react';
import { Post } from '@/types';
import { Modal } from '@/components/Modal';


interface NoticeSectionProps {
  posts: Post[];
  onAddPost: (post: Omit<Post, 'id' | 'likes' | 'created_at'>) => void;
  onLikePost: (id: string | number) => void;
}

const CATEGORIES: ('전체' | '학사일정' | '수행평가' | '학급행사')[] = [
  '전체',
  '학사일정',
  '수행평가',
  '학급행사',
];

export const NoticeSection: React.FC<NoticeSectionProps> = ({ posts, onAddPost, onLikePost }) => {
  const [selectedCat, setSelectedCat] = useState<'전체' | '학사일정' | '수행평가' | '학급행사'>('전체');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formCategory, setFormCategory] = useState<'학사일정' | '수행평가' | '학급행사'>('학사일정');

  const filteredPosts = selectedCat === '전체'
    ? posts
    : posts.filter((p) => p.category === selectedCat);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    onAddPost({
      title: formTitle.trim(),
      content: formContent.trim(),
      author: formAuthor.trim() || '학급구성원',
      category: formCategory,
    });

    setIsModalOpen(false);
    setFormTitle('');
    setFormContent('');
    setFormAuthor('');
  };

  return (
    <div className="clay-card bg-white/90 dark:bg-slate-900/90 p-5 md:p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              학급 행사 및 공지사항
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 font-normal">
                Supabase posts 연동
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              학사일정, 수행평가 마감일, 학급 자치 공지를 확인하세요.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl clay-button bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium text-xs md:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> 공지 등록
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Notice Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> {post.category || '공지'}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.created_at}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1.5 leading-snug">
                {post.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-3">
                {post.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" /> {post.author}
              </span>

              <button
                onClick={() => onLikePost(post.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl clay-button bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:scale-105 active:scale-95 transition-transform"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>{post.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for new notice */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" /> 새 학급 공지사항 등록
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          학급 학우들과 공유할 중요 일정 및 공지글을 작성하세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                카테고리
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100"
              >
                <option value="학사일정">학사일정</option>
                <option value="수행평가">수행평가</option>
                <option value="학급행사">학급행사</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                작성자
              </label>
              <input
                type="text"
                required
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="예: 반장, 담임선생님"
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              공지 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="공지 제목을 입력하세요"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              공지 내용 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="상세 내용을 입력하세요"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> 공지 게시
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
