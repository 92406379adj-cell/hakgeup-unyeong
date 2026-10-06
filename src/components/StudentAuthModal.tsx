'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { StudentMember, ClassSettings } from '@/types';
import {
  LogIn,
  UserPlus,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Heart,
} from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  classSettings: ClassSettings;
  classMembers: StudentMember[];
  onLoginSuccess: (student: StudentMember) => void;
  onRequestSignUp: (newMember: Omit<StudentMember, 'id' | 'created_at' | 'status'>) => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  classSettings,
  classMembers,
  onLoginSuccess,
  onRequestSignUp,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginStudentNo, setLoginStudentNo] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showLoginPin, setShowLoginPin] = useState(false);

  // Signup form state
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [signupStudentNo, setSignupStudentNo] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupGender, setSignupGender] = useState<'M' | 'F'>('M');
  const [signupPin, setSignupPin] = useState('');
  const [signupIntro, setSignupIntro] = useState('');

  // Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const targetInviteCode = classSettings.inviteCode || '3077';

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoginPin('');
    setSignupPin('');
  };

  const handleTabChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  // 1. Student Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const sNo = Number(loginStudentNo);
    if (!sNo || !loginPin) {
      setErrorMsg('출석번호와 비밀번호(PIN)를 입력해 주세요.');
      return;
    }

    const member = classMembers.find(
      (m) => m.student_no === sNo && m.pin === loginPin.trim()
    );

    if (!member) {
      setErrorMsg('번호 또는 비밀번호가 일치하지 않습니다. (비밀번호를 분실하신 경우 담임선생님께 확인을 요청하세요!)');
      return;
    }

    if (member.status === 'pending') {
      setErrorMsg('현재 담임선생님의 가입 승인 대기 중입니다. 승인 후 로그인이 가능합니다!');
      return;
    }

    if (member.status === 'rejected') {
      setErrorMsg('가입 신청이 반려되었습니다. 담임선생님께 문의해 주세요.');
      return;
    }

    onLoginSuccess(member);
    onClose();
  };

  // 2. Student Sign Up Request Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (inviteCodeInput.trim() !== targetInviteCode) {
      setErrorMsg(`학급 초대 코드가 올바르지 않습니다. 담임선생님께 확인해 주세요! (기본: ${targetInviteCode})`);
      return;
    }

    const sNo = Number(signupStudentNo);
    if (!sNo || sNo < 1 || sNo > 60) {
      setErrorMsg('유효한 출석번호/학번(1~60)을 입력해 주세요.');
      return;
    }

    if (!signupName.trim()) {
      setErrorMsg('이름을 입력해 주세요.');
      return;
    }

    if (!signupPin || signupPin.length < 4) {
      setErrorMsg('4자리 이상의 비밀번호(PIN)를 설정해 주세요.');
      return;
    }

    // Check duplicate student number
    const existing = classMembers.find((m) => m.student_no === sNo);
    if (existing && existing.status === 'approved') {
      setErrorMsg(`이미 ${sNo}번으로 등록된 학생(${existing.name})이 있습니다. 번호를 확인해 주세요.`);
      return;
    }

    onRequestSignUp({
      student_no: sNo,
      name: signupName.trim(),
      gender: signupGender,
      pin: signupPin.trim(),
      intro: signupIntro.trim() || '우리 반 화이팅!',
    });

    setSuccessMsg('🎉 가입 신청이 성공적으로 제출되었습니다!\n담임선생님께서 학번과 이름 오타를 확인 후 승인해 주시면 정식 학급원으로 등록됩니다.');
    setSignupName('');
    setSignupStudentNo('');
    setSignupPin('');
    setSignupIntro('');
    setInviteCodeInput('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
              {classSettings.grade}학년 {classSettings.classNum}반 학생 포털
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              학급 구성원 로그인 및 신규 가입 신청
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 my-4">
        <button
          onClick={() => handleTabChange('login')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'login'
              ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <LogIn className="w-4 h-4" /> 학생 로그인
        </button>

        <button
          onClick={() => handleTabChange('signup')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'signup'
              ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" /> 학생 가입 신청
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-1.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="whitespace-pre-line leading-relaxed">{successMsg}</span>
        </div>
      )}

      {/* MODE 1: Student Login */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              출석번호 / 학번
            </label>
            <input
              type="number"
              required
              min={1}
              max={60}
              placeholder="예: 5 (5번 학생)"
              value={loginStudentNo}
              onChange={(e) => setLoginStudentNo(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              4자리 비밀번호 (PIN)
            </label>
            <div className="relative">
              <input
                type={showLoginPin ? 'text' : 'password'}
                required
                maxLength={8}
                placeholder="설정한 4자리 비밀번호"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 pr-10 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowLoginPin(!showLoginPin)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showLoginPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              💡 비밀번호를 분실하신 경우 담임선생님께 말씀하시면 선생님 화면에서 바로 확인 및 재설정해 주실 수 있습니다.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <LogIn className="w-4 h-4" /> 학생 로그인
            </button>
          </div>
        </form>
      )}

      {/* MODE 2: Student Sign Up Request */}
      {mode === 'signup' && (
        <form onSubmit={handleSignUpSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              우리 반 초대 코드 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={`선생님께 안내받은 코드 (기본: ${targetInviteCode})`}
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                출석번호 / 학번 <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={60}
                placeholder="예: 31"
                value={signupStudentNo}
                onChange={(e) => setSignupStudentNo(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                성별 <span className="text-rose-500">*</span>
              </label>
              <select
                value={signupGender}
                onChange={(e) => setSignupGender(e.target.value as 'M' | 'F')}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 font-semibold"
              >
                <option value="M">남학생</option>
                <option value="F">여학생</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              학생 이름 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 이준혁 (실명 입력)"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              💡 오타가 있더라도 담임선생님께서 승인 시 확인 후 수정해 주실 수 있습니다.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              비밀번호 설정 (숫자 4자리) <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              maxLength={8}
              placeholder="기억하기 쉬운 4자리 번호 (예: 1234)"
              value={signupPin}
              onChange={(e) => setSignupPin(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              한 줄 각오 / 소개
            </label>
            <input
              type="text"
              placeholder="예: 3학년 7반 열심히 활동하겠습니다!"
              value={signupIntro}
              onChange={(e) => setSignupIntro(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <UserPlus className="w-4 h-4" /> 가입 신청 제출 (교사 승인 대기)
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
