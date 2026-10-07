'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { ClassSettings } from '@/types';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  X,
  HelpCircle,
  UserCheck,
} from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  classSettings: ClassSettings;
  isTeacherLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  onUpdateTeacherPassword: (newPassword: string) => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  classSettings,
  isTeacherLoggedIn,
  onLoginSuccess,
  onLogout,
  onUpdateTeacherPassword,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'change_pw' | 'info'>('login');

  // Login state
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Change password state
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);

  // Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentTeacherPassword = classSettings.teacherPassword || 'admin1234';

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleTabChange = (tab: 'login' | 'change_pw' | 'info') => {
    setActiveTab(tab);
    resetMessages();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!inputPassword.trim()) {
      setErrorMsg('교사 관리자 비밀번호를 입력해 주세요.');
      return;
    }

    if (inputPassword.trim() === currentTeacherPassword) {
      onLoginSuccess();
      setInputPassword('');
      setSuccessMsg('담임교사(관리자) 인증이 완료되었습니다! 모든 관리 권한이 활성화됩니다.');
      setTimeout(() => {
        onClose();
        resetMessages();
      }, 1000);
    } else {
      setErrorMsg('비밀번호가 일치하지 않습니다. 다시 확인해 주세요. (초기 비밀번호: admin1234)');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (currentPwInput.trim() !== currentTeacherPassword) {
      setErrorMsg('현재 관리자 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!newPwInput.trim() || newPwInput.trim().length < 4) {
      setErrorMsg('새 비밀번호는 최소 4자 이상으로 설정해 주세요.');
      return;
    }

    if (newPwInput.trim() !== confirmPwInput.trim()) {
      setErrorMsg('새 비밀번호와 확인 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    onUpdateTeacherPassword(newPwInput.trim());
    setSuccessMsg('교사 관리자 비밀번호가 성공적으로 변경되었습니다!');
    setCurrentPwInput('');
    setNewPwInput('');
    setConfirmPwInput('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              담임교사(관리자) 인증
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {classSettings.grade}학년 {classSettings.classNum}반 • 학급 운영 및 데이터 보호를 위한 교사 전용 인증
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-4 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
        <button
          onClick={() => handleTabChange('login')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'login'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{isTeacherLoggedIn ? '인증 상태' : '교사 로그인'}</span>
        </button>

        <button
          onClick={() => handleTabChange('change_pw')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'change_pw'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>비밀번호 변경</span>
        </button>

        <button
          onClick={() => handleTabChange('info')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'info'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>권한 안내</span>
        </button>
      </div>

      {/* Error / Success Messages */}
      {errorMsg && (
        <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab 1: Login / Status */}
      {activeTab === 'login' && (
        <div className="mt-4 space-y-4">
          {isTeacherLoggedIn ? (
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-200">
                  현재 담임교사(관리자) 인증 상태입니다
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  모든 관리자 권한(학생 승인, 비밀번호 관리, 학년/반 변경, 엑셀 명단, 공지 작성)이 활성화되어 있습니다.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setSuccessMsg('로그아웃되었습니다. 일반 학생 모드로 전환됩니다.');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 text-xs font-bold transition-colors"
                >
                  교사 관리자 로그아웃
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-colors shadow-md shadow-indigo-500/20"
                >
                  확인 완료
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  <strong>선생님 전용 관리 모드:</strong> 교사 비밀번호로 로그인하시면 학생 가입 승인, 학생 비밀번호 확인,
                  학년·반 변경 등 핵심 관리자 도구를 안전하게 사용하실 수 있습니다.
                  <div className="mt-1 font-mono font-bold text-[11px] text-purple-700 dark:text-purple-300">
                    💡 초기 비밀번호: <u>admin1234</u> (로그인 후 변경 가능)
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  교사 관리자 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="관리자 비밀번호를 입력하세요 (예: admin1234)"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 pr-10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>관리자 모드로 전환</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'change_pw' && (
        <form onSubmit={handleChangePasswordSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              현재 관리자 비밀번호
            </label>
            <input
              type="password"
              required
              placeholder="현재 비밀번호 (기본: admin1234)"
              value={currentPwInput}
              onChange={(e) => setCurrentPwInput(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              새 관리자 비밀번호
            </label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                placeholder="새 비밀번호 (4자 이상)"
                value={newPwInput}
                onChange={(e) => setNewPwInput(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 pr-10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              새 관리자 비밀번호 확인
            </label>
            <input
              type="password"
              required
              placeholder="새 비밀번호를 한 번 더 입력하세요"
              value={confirmPwInput}
              onChange={(e) => setConfirmPwInput(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              닫기
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>새 비밀번호로 저장</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Permission Info */}
      {activeTab === 'info' && (
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> 관리자(교사) 전용 기능 안내
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
              <li>
                <strong>학급 구성원 승인 및 오타 교정</strong>: 학생이 가입 신청 시 입력한 출석번호나 이름의 오타를 직접 수정하고
                정식 명단으로 승인할 수 있습니다.
              </li>
              <li>
                <strong>학생 비밀번호(PIN) 조회 및 재설정</strong>: 학생들이 비밀번호를 잊어버렸을 때 👁️ 눈 아이콘으로 즉시
                확인하거나 새 4자리 번호로 변경해 줄 수 있습니다.
              </li>
              <li>
                <strong>학년·반 및 학급 명칭 변경</strong>: 새 학년도 또는 학급 개편에 맞추어 기본 설정을 변경합니다.
              </li>
              <li>
                <strong>학생 명단 엑셀(Excel) 일괄 업로드</strong>: 엑셀 명단을 올리거나 복사-붙여넣기로 일괄 등록합니다.
              </li>
              <li>
                <strong>학급 공지사항 작성 및 관리</strong>: 담임선생님 공식 공지사항을 등록하고 관리합니다.
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
            * 학생들이 사용하는 공용 컴퓨터나 스마트폰에서 작업하신 후에는 반드시 <strong>[교사 로그아웃]</strong>을 진행해 주세요.
          </div>
        </div>
      )}
    </Modal>
  );
};
