'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { StudentMember, ClassSettings } from '@/types';
import {
  Users,
  UserCheck,
  Clock,
  ShieldCheck,
  Check,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Edit2,
  Trash2,
  Plus,
  Copy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Sparkles,
} from 'lucide-react';

interface TeacherMemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classMembers: StudentMember[];
  classSettings: ClassSettings;
  onApproveMember: (
    id: string | number,
    updatedData: { student_no: number; name: string; gender: 'M' | 'F' }
  ) => void;
  onRejectMember: (id: string | number) => void;
  onUpdateMemberPin: (id: string | number, newPin: string) => void;
  onDeleteMember: (id: string | number) => void;
  onAddMemberDirectly: (newMember: Omit<StudentMember, 'id' | 'created_at'>) => void;
  onUpdateInviteCode: (newCode: string) => void;
}

export const TeacherMemberManagementModal: React.FC<TeacherMemberManagementModalProps> = ({
  isOpen,
  onClose,
  classMembers,
  classSettings,
  onApproveMember,
  onRejectMember,
  onUpdateMemberPin,
  onDeleteMember,
  onAddMemberDirectly,
  onUpdateInviteCode,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'members' | 'invite'>('pending');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Global show all pins toggle
  const [showAllPins, setShowAllPins] = useState(false);
  // Individual visible PINs set
  const [visiblePinIds, setVisiblePinIds] = useState<Set<string | number>>(new Set());

  // Pending items editing state (to fix typos before approve)
  const [pendingEdits, setPendingEdits] = useState<
    Record<string | number, { student_no: number; name: string; gender: 'M' | 'F' }>
  >({});

  // Reset PIN inline state
  const [resetPinTargetId, setResetPinTargetId] = useState<string | number | null>(null);
  const [resetPinValue, setResetPinValue] = useState('');

  // Edit member inline state
  const [editingMemberId, setEditingMemberId] = useState<string | number | null>(null);
  const [editMemberStudentNo, setEditMemberStudentNo] = useState<number>(1);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberGender, setEditMemberGender] = useState<'M' | 'F'>('M');

  // Add member directly form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addStudentNo, setAddStudentNo] = useState('');
  const [addName, setAddName] = useState('');
  const [addGender, setAddGender] = useState<'M' | 'F'>('M');
  const [addPin, setAddPin] = useState('');
  const [addIntro, setAddIntro] = useState('');

  // Invite code edit state
  const [newInviteCode, setNewInviteCode] = useState(classSettings.inviteCode || '3077');
  const [copySuccess, setCopySuccess] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sync pending edits when classMembers changes
  React.useEffect(() => {
    const edits: Record<string | number, { student_no: number; name: string; gender: 'M' | 'F' }> = {};
    classMembers
      .filter((m) => m.status === 'pending')
      .forEach((m) => {
        edits[m.id] = {
          student_no: m.student_no,
          name: m.name,
          gender: m.gender,
        };
      });
    setPendingEdits(edits);
    setNewInviteCode(classSettings.inviteCode || '3077');
  }, [classMembers, classSettings.inviteCode]);

  // Flash action notification
  const flashNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3000);
  };

  const pendingMembers = classMembers.filter((m) => m.status === 'pending');
  const approvedMembers = classMembers
    .filter((m) => m.status === 'approved')
    .sort((a, b) => a.student_no - b.student_no);

  const filteredApproved = approvedMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(m.student_no).includes(searchTerm)
  );

  const togglePinVisibility = (id: string | number) => {
    setVisiblePinIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePendingFieldChange = (
    id: string | number,
    field: 'student_no' | 'name' | 'gender',
    val: any
  ) => {
    setPendingEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val,
      },
    }));
  };

  const handleApproveWithEdits = (member: StudentMember) => {
    const edit = pendingEdits[member.id] || {
      student_no: member.student_no,
      name: member.name,
      gender: member.gender,
    };

    if (!edit.name.trim()) {
      alert('학생 이름을 입력해 주세요.');
      return;
    }

    onApproveMember(member.id, {
      student_no: Number(edit.student_no) || member.student_no,
      name: edit.name.trim(),
      gender: edit.gender,
    });
    flashNotice(`[${edit.student_no}번 ${edit.name}] 학생이 승인되어 정식 명단에 등록되었습니다!`);
  };

  const handleReject = (member: StudentMember) => {
    if (confirm(`'${member.name}' 학생의 가입 신청을 반려하시겠습니까?`)) {
      onRejectMember(member.id);
      flashNotice(`'${member.name}' 학생의 가입 신청이 반려되었습니다.`);
    }
  };

  const handleSavePinReset = (id: string | number) => {
    if (!resetPinValue || resetPinValue.length !== 4 || !/^\d{4}$/.test(resetPinValue)) {
      alert('비밀번호(PIN)는 4자리 숫자로 입력해 주세요.');
      return;
    }
    onUpdateMemberPin(id, resetPinValue);
    setResetPinTargetId(null);
    setResetPinValue('');
    flashNotice('학생의 비밀번호(PIN)가 성공적으로 재설정되었습니다.');
  };

  const handleStartEditMember = (m: StudentMember) => {
    setEditingMemberId(m.id);
    setEditMemberStudentNo(m.student_no);
    setEditMemberName(m.name);
    setEditMemberGender(m.gender);
  };

  const handleSaveEditMember = (id: string | number) => {
    if (!editMemberName.trim()) {
      alert('학생 이름을 입력해 주세요.');
      return;
    }
    onApproveMember(id, {
      student_no: Number(editMemberStudentNo) || 1,
      name: editMemberName.trim(),
      gender: editMemberGender,
    });
    setEditingMemberId(null);
    flashNotice('학생 정보가 수정되었습니다.');
  };

  const handleDeleteApprovedMember = (m: StudentMember) => {
    if (confirm(`'${m.student_no}번 ${m.name}' 학생을 명단에서 삭제하시겠습니까?`)) {
      onDeleteMember(m.id);
      flashNotice(`'${m.name}' 학생이 명단에서 삭제되었습니다.`);
    }
  };

  const handleAddDirectlySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sNo = Number(addStudentNo);
    if (!sNo || !addName.trim()) {
      alert('출석번호와 이름을 입력해 주세요.');
      return;
    }
    const pin = addPin.trim() || '1234';
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      alert('비밀번호(PIN)는 4자리 숫자로 입력해 주세요.');
      return;
    }

    onAddMemberDirectly({
      student_no: sNo,
      name: addName.trim(),
      gender: addGender,
      pin: pin,
      status: 'approved',
      intro: addIntro.trim() || undefined,
    });

    setAddStudentNo('');
    setAddName('');
    setAddPin('');
    setAddIntro('');
    setShowAddForm(false);
    flashNotice(`[${sNo}번 ${addName}] 학생이 정식 명단에 추가되었습니다.`);
  };

  const handleCopyInviteCode = () => {
    const code = classSettings.inviteCode || '3077';
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveInviteCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteCode.trim()) {
      alert('학급 초대코드를 입력해 주세요.');
      return;
    }
    onUpdateInviteCode(newInviteCode.trim());
    flashNotice(`학급 초대코드가 [${newInviteCode.trim()}] 로 변경되었습니다.`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              교사용 학급 구성원 승인 & 비밀번호 관리
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {classSettings.grade}학년 {classSettings.classNum}반 • 학생 가입 승인, 학번/이름 오타 수정, 학생 PIN 조회 및 재설정
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

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mt-4 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>가입 승인 대기</span>
          {pendingMembers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {pendingMembers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'members'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>정식 명단 & 비밀번호(PIN)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {approvedMembers.length}명
          </span>
        </button>

        <button
          onClick={() => setActiveTab('invite')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'invite'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>학급 초대코드 설정</span>
        </button>
      </div>

      {/* Tab 1: Pending Requests with Typo Correction */}
      {activeTab === 'pending' && (
        <div className="mt-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold">선생님 확인 가이드:</span> 학생이 가입 신청 시 입력한{' '}
              <strong className="underline">출석번호</strong>나 <strong className="underline">이름에 오타</strong>가
              있는 경우, 아래 입력란에서 바로 수정한 후 <strong>[오타 확인 & 승인]</strong> 버튼을 누르시면 교정된
              정보로 승인됩니다.
            </div>
          </div>

          {pendingMembers.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                현재 승인 대기 중인 가입 신청이 없습니다.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                학생들에게 학급 초대코드 <strong>[{classSettings.inviteCode || '3077'}]</strong>를 알려주시면 학생이 직접
                가입을 신청할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMembers.map((member) => {
                const currentEdit = pendingEdits[member.id] || {
                  student_no: member.student_no,
                  name: member.name,
                  gender: member.gender,
                };

                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-950/50 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Editable Inputs for Typo Fixing */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 승인 대기
                          </span>
                          <span className="text-[11px] text-slate-400">신청일시: {member.created_at}</span>
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            설정 PIN: {member.pin}
                          </span>
                        </div>

                        {/* Typo Correction Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                          {/* Student No */}
                          <div className="sm:col-span-3">
                            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                              출석번호 (수정가능)
                            </label>
                            <div className="flex items-center">
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={currentEdit.student_no}
                                onChange={(e) =>
                                  handlePendingFieldChange(member.id, 'student_no', Number(e.target.value))
                                }
                                className="w-full text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-xs text-slate-500">번</span>
                            </div>
                          </div>

                          {/* Student Name */}
                          <div className="sm:col-span-5">
                            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                              학생 이름 (오타 교정)
                            </label>
                            <input
                              type="text"
                              value={currentEdit.name}
                              onChange={(e) =>
                                handlePendingFieldChange(member.id, 'name', e.target.value)
                              }
                              placeholder="이름"
                              className="w-full text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Student Gender */}
                          <div className="sm:col-span-4">
                            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                              성별
                            </label>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handlePendingFieldChange(member.id, 'gender', 'M')}
                                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                                  currentEdit.gender === 'M'
                                    ? 'bg-sky-500 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                남 👦
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePendingFieldChange(member.id, 'gender', 'F')}
                                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                                  currentEdit.gender === 'F'
                                    ? 'bg-pink-500 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                여 👧
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Intro message */}
                        {member.intro && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 italic">
                            &quot;{member.intro}&quot;
                          </div>
                        )}
                      </div>

                      {/* Right: Approve / Reject Buttons */}
                      <div className="flex sm:flex-col justify-end gap-2 min-w-[150px]">
                        <button
                          type="button"
                          onClick={() => handleApproveWithEdits(member)}
                          className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                        >
                          <Check className="w-4 h-4" /> 오타 확인 & 승인
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(member)}
                          className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-600 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> 신청 반려
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Approved Roster & Password Management */}
      {activeTab === 'members' && (
        <div className="mt-4 space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="학생 이름 또는 번호 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Show All PINs Toggle */}
              <button
                type="button"
                onClick={() => setShowAllPins(!showAllPins)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  showAllPins
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="학생들이 비밀번호를 잊어버렸을 때 모든 학생의 PIN을 한눈에 확인합니다"
              >
                {showAllPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAllPins ? 'PIN 전체 숨기기' : 'PIN 전체 표시'}</span>
              </button>

              {/* Add Member Directly Toggle */}
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>학생 직접 등록</span>
              </button>
            </div>
          </div>

          {/* Collapsible Direct Add Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddDirectlySubmit}
              className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-3 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> 교사 권한으로 학생 직접 추가
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  닫기
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    출석번호
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={addStudentNo}
                    onChange={(e) => setAddStudentNo(e.target.value)}
                    placeholder="예: 31"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    성별
                  </label>
                  <select
                    value={addGender}
                    onChange={(e) => setAddGender(e.target.value as 'M' | 'F')}
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white outline-none"
                  >
                    <option value="M">남 (M)</option>
                    <option value="F">여 (F)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    4자리 PIN (기본: 1234)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={addPin}
                    onChange={(e) => setAddPin(e.target.value)}
                    placeholder="1234"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  등록 완료
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-16 text-center">번호</th>
                  <th className="py-3 px-3">이름</th>
                  <th className="py-3 px-3 w-16 text-center">성별</th>
                  <th className="py-3 px-3">
                    <span className="flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-purple-500" />
                      비밀번호 (PIN)
                    </span>
                  </th>
                  <th className="py-3 px-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredApproved.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      등록된 학생이 없거나 검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredApproved.map((member) => {
                    const isPinVisible = showAllPins || visiblePinIds.has(member.id);
                    const isResetting = resetPinTargetId === member.id;
                    const isEditing = editingMemberId === member.id;

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Student No */}
                        <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-200">
                          {isEditing ? (
                            <input
                              type="number"
                              min={1}
                              value={editMemberStudentNo}
                              onChange={(e) => setEditMemberStudentNo(Number(e.target.value))}
                              className="w-12 text-center text-xs p-1 rounded-lg border border-indigo-300 bg-white dark:bg-slate-900"
                            />
                          ) : (
                            `${member.student_no}번`
                          )}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-white">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editMemberName}
                              onChange={(e) => setEditMemberName(e.target.value)}
                              className="text-xs p-1 rounded-lg border border-indigo-300 bg-white dark:bg-slate-900"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {member.intro && (
                                <span
                                  title={member.intro}
                                  className="text-[10px] text-slate-400 cursor-help"
                                >
                                  💬
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Gender */}
                        <td className="py-3 px-3 text-center">
                          {isEditing ? (
                            <select
                              value={editMemberGender}
                              onChange={(e) => setEditMemberGender(e.target.value as 'M' | 'F')}
                              className="text-xs p-1 rounded-lg border border-indigo-300 bg-white dark:bg-slate-900"
                            >
                              <option value="M">남</option>
                              <option value="F">여</option>
                            </select>
                          ) : member.gender === 'M' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                              남
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                              여
                            </span>
                          )}
                        </td>

                        {/* PIN Area (Eye toggle & Reset) */}
                        <td className="py-3 px-3">
                          {isResetting ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                maxLength={4}
                                autoFocus
                                placeholder="새 PIN 4자리"
                                value={resetPinValue}
                                onChange={(e) => setResetPinValue(e.target.value)}
                                className="w-24 text-xs font-mono font-bold p-1 rounded-lg border border-purple-400 bg-white dark:bg-slate-900 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSavePinReset(member.id)}
                                className="px-2 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px] hover:bg-purple-700"
                              >
                                저장
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setResetPinTargetId(null);
                                  setResetPinValue('');
                                }}
                                className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 text-[10px]"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {/* PIN display badge */}
                              <span
                                className={`px-2 py-1 rounded-lg font-mono text-xs font-bold tracking-wider ${
                                  isPinVisible
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {isPinVisible ? member.pin : '••••'}
                              </span>

                              {/* Toggle eye */}
                              <button
                                type="button"
                                onClick={() => togglePinVisibility(member.id)}
                                title={isPinVisible ? '비밀번호 가리기' : '비밀번호 보기'}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                {isPinVisible ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Reset PIN button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setResetPinTargetId(member.id);
                                  setResetPinValue('');
                                }}
                                title="비밀번호 분실 시 새 PIN으로 재설정"
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-purple-200 dark:border-purple-800"
                              >
                                재설정
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Action buttons (Edit & Delete) */}
                        <td className="py-3 px-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEditMember(member.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                              >
                                완료
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingMemberId(null)}
                                className="px-2 py-1 rounded-lg text-slate-400 text-[10px]"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditMember(member)}
                                title="학생 정보 수정"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteApprovedMember(member)}
                                title="명단에서 삭제"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              총 {approvedMembers.length}명 (남{' '}
              {approvedMembers.filter((m) => m.gender === 'M').length}명, 여{' '}
              {approvedMembers.filter((m) => m.gender === 'F').length}명)
            </span>
            <span>💡 자리바꾸기 추첨기 및 칭찬 랭킹에 실시간 자동 반영됩니다.</span>
          </div>
        </div>
      )}

      {/* Tab 3: Invite Code Management & Guide */}
      {activeTab === 'invite' && (
        <div className="mt-4 space-y-5">
          {/* Big Invite Code Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
              현재 학급 초대 코드
            </span>
            <div className="text-4xl md:text-5xl font-black font-mono tracking-widest text-slate-800 dark:text-white my-3">
              {classSettings.inviteCode || '3077'}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCopyInviteCode}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
              >
                {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copySuccess ? '초대코드 복사 완료!' : '초대코드 복사'}</span>
              </button>
            </div>
          </div>

          {/* Change Code Form */}
          <form
            onSubmit={handleSaveInviteCode}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-indigo-500" /> 초대코드 변경
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newInviteCode}
                onChange={(e) => setNewInviteCode(e.target.value)}
                placeholder="새 초대코드 (예: 3077, CLASS7)"
                className="flex-1 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
              >
                변경 저장
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * 초대코드를 변경하면 학생들이 새로 가입할 때 변경된 코드를 입력해야 합니다.
            </p>
          </form>

          {/* Classroom Onboarding Guide */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-500" /> 학급 학생 가입 안내 칠판 가이드
            </h4>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
              <li>
                웹사이트 우측 상단 <strong>[ 👤 학생 로그인 / 가입 ]</strong> 버튼을 클릭하도록 안내합니다.
              </li>
              <li>
                <strong>[ 📝 학급 가입 신청 ]</strong> 탭에서 학급 초대코드{' '}
                <strong className="text-indigo-600 dark:text-indigo-400">[{classSettings.inviteCode || '3077'}]</strong>
                를 입력합니다.
              </li>
              <li>
                출석번호, 본인 이름, 사용할 <strong>4자리 비밀번호(PIN)</strong>를 입력하고 가입 신청을 제출합니다.
              </li>
              <li>
                선생님께서 본 관리창의 <strong>[가입 승인 대기]</strong> 탭에서 학생의 이름이나 학번 오타를 확인하고{' '}
                <strong>[승인]</strong>을 클릭하면 즉시 학급 구성원으로 등록됩니다.
              </li>
              <li>
                학생이 비밀번호를 잊어버린 경우, 선생님께서 <strong>[정식 명단 & 비밀번호]</strong> 탭에서 👁️ 눈 아이콘을
                눌러 학생의 비밀번호를 바로 확인하거나 새 번호로 재설정해 줄 수 있습니다.
              </li>
            </ol>
          </div>
        </div>
      )}
    </Modal>
  );
};
