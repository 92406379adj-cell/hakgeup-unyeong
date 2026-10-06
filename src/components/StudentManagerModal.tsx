'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Modal } from '@/components/Modal';
import { SeatStudent } from '@/types';
import {
  FileSpreadsheet,
  Upload,
  ClipboardPaste,
  UserCheck,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  Check,
  Users,
  RotateCcw,
} from 'lucide-react';
import { INITIAL_STUDENTS } from '@/lib/initialData';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: SeatStudent[];
  onSaveStudents: (newStudents: SeatStudent[]) => void;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'manual'>('upload');
  const [currentList, setCurrentList] = useState<SeatStudent[]>(students);
  const [previewList, setPreviewList] = useState<SeatStudent[] | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New student manual form
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'M' | 'F'>('M');

  // Reset when opening
  React.useEffect(() => {
    setCurrentList(students);
    setPreviewList(null);
    setErrorMsg('');
    setSuccessMsg('');
  }, [isOpen, students]);

  // 1. Handle Excel / CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('엑셀 파일에 데이터가 없습니다.');
          return;
        }

        // Process rows
        const parsed: SeatStudent[] = [];
        let startIndex = 0;

        // Check if first row is header (e.g., contains '이름', 'name', '번호')
        const firstRowStr = (rawJson[0] || []).join(' ').toLowerCase();
        if (
          firstRowStr.includes('이름') ||
          firstRowStr.includes('성명') ||
          firstRowStr.includes('name') ||
          firstRowStr.includes('번호')
        ) {
          startIndex = 1;
        }

        for (let i = startIndex; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;

          // Detect columns
          // Case A: 3 cols -> [번호, 이름, 성별]
          // Case B: 2 cols -> [이름, 성별] or [번호, 이름]
          // Case C: 1 col -> [이름]
          let name = '';
          let gender: 'M' | 'F' = 'M';

          if (row.length >= 3) {
            name = String(row[1] || '').trim();
            const gVal = String(row[2] || '').trim();
            gender = gVal.includes('여') || gVal.toUpperCase() === 'F' ? 'F' : 'M';
          } else if (row.length === 2) {
            // Check if col 0 is number or name
            if (typeof row[0] === 'number' || !isNaN(Number(row[0]))) {
              name = String(row[1] || '').trim();
            } else {
              name = String(row[0] || '').trim();
              const gVal = String(row[1] || '').trim();
              gender = gVal.includes('여') || gVal.toUpperCase() === 'F' ? 'F' : 'M';
            }
          } else if (row.length === 1) {
            name = String(row[0] || '').trim();
          }

          if (name) {
            parsed.push({
              id: parsed.length + 1,
              name,
              gender,
            });
          }
        }

        if (parsed.length === 0) {
          setErrorMsg('유효한 학생 이름을 찾을 수 없습니다. (양식: 번호, 이름, 성별)');
          return;
        }

        setPreviewList(parsed);
        setSuccessMsg(`총 ${parsed.length}명의 학생 데이터가 성공적으로 추출되었습니다.`);
      } catch (err: any) {
        setErrorMsg('엑셀 파일 분석 중 오류가 발생했습니다: ' + err.message);
      }
    };

    reader.readAsBinaryString(file);
  };

  // 2. Handle Text Paste (from Excel cells)
  const handleParsePaste = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!pasteText.trim()) {
      setErrorMsg('붙여넣을 텍스트를 입력해주세요.');
      return;
    }

    const lines = pasteText.split('\n');
    const parsed: SeatStudent[] = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Split by tab (Excel default copy delimiter) or comma or multiple spaces
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.includes(',')
        ? line.split(',')
        : line.split(/\s+/);

      let name = '';
      let gender: 'M' | 'F' = 'M';

      if (parts.length >= 3) {
        name = parts[1].trim();
        const gVal = parts[2].trim();
        gender = gVal.includes('여') || gVal.toUpperCase() === 'F' ? 'F' : 'M';
      } else if (parts.length === 2) {
        if (!isNaN(Number(parts[0]))) {
          name = parts[1].trim();
        } else {
          name = parts[0].trim();
          const gVal = parts[1].trim();
          gender = gVal.includes('여') || gVal.toUpperCase() === 'F' ? 'F' : 'M';
        }
      } else if (parts.length === 1) {
        name = parts[0].trim();
      }

      // Skip header row if copied
      if (name === '이름' || name === '성명' || name === 'Name') continue;

      if (name) {
        parsed.push({
          id: parsed.length + 1,
          name,
          gender,
        });
      }
    }

    if (parsed.length === 0) {
      setErrorMsg('데이터를 파싱할 수 없습니다. 엑셀 행/열을 올바르게 복사했는지 확인해주세요.');
      return;
    }

    setPreviewList(parsed);
    setSuccessMsg(`붙여넣기 데이터에서 총 ${parsed.length}명이 감지되었습니다.`);
  };

  // Apply preview to current list
  const applyPreview = () => {
    if (previewList) {
      setCurrentList(previewList);
      setPreviewList(null);
      setActiveTab('manual');
      setSuccessMsg(`새 명단(${previewList.length}명)이 반영되었습니다. 최종 저장을 눌러주세요.`);
    }
  };

  // Manual Add Student
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStudent: SeatStudent = {
      id: currentList.length > 0 ? Math.max(...currentList.map((s) => s.id)) + 1 : 1,
      name: newName.trim(),
      gender: newGender,
    };

    setCurrentList((prev) => [...prev, newStudent]);
    setNewName('');
  };

  // Remove single student
  const handleRemoveStudent = (id: number) => {
    setCurrentList((prev) => prev.filter((s) => s.id !== id));
  };

  // Reset to default 30 sample students
  const handleResetToDefault = () => {
    if (window.confirm('기본 샘플 30명 명단으로 되돌리시겠습니까?')) {
      setCurrentList(INITIAL_STUDENTS);
      setPreviewList(null);
      setSuccessMsg('기본 명단으로 복원되었습니다.');
    }
  };

  // Download sample template
  const handleDownloadTemplate = () => {
    const csvContent =
      '\uFEFF번호,이름,성별\n1,강민서,여\n2,김도현,남\n3,김서연,여\n4,김시우,남\n5,김하늘,여\n6,문준호,남\n7,박건우,남\n8,박서아,여\n9,박예준,남\n10,배수빈,여';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', '학급_학생명단_샘플양식.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Final save
  const handleSaveAll = () => {
    if (currentList.length === 0) {
      setErrorMsg('최소 1명 이상의 학생이 등록되어야 합니다.');
      return;
    }

    onSaveStudents(currentList);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              관리자 학생 명단 관리
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold">
                현재 {currentList.length}명
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              엑셀 업로드, 복사-붙여넣기 또는 직접 편집을 통해 우리 반 학생 명단을 등록하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 my-4">
        <button
          onClick={() => {
            setActiveTab('upload');
            setPreviewList(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> 엑셀 파일 업로드
        </button>

        <button
          onClick={() => {
            setActiveTab('paste');
            setPreviewList(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'paste'
              ? 'bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" /> 엑셀 복사-붙여넣기
        </button>

        <button
          onClick={() => {
            setActiveTab('manual');
            setPreviewList(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'manual'
              ? 'bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" /> 명단 직접 관리 ({currentList.length})
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: File Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-4 py-2">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/60 dark:bg-slate-800/40">
            <Upload className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              엑셀(.xlsx, .xls) 또는 .csv 파일 선택
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              [번호, 이름, 성별] 열이 포함된 엑셀 파일을 업로드하면 자동으로 학생 명단이 변환됩니다.
            </p>

            <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl clay-button bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs md:text-sm cursor-pointer shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-4 h-4" /> 엑셀 파일 불러오기
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>💡 첫 행에 [번호, 이름, 성별] 헤더가 있어도 자동으로 감지하여 제외합니다.</span>
            <button
              onClick={handleDownloadTemplate}
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> 표준 양식 다운로드
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Copy-Paste */}
      {activeTab === 'paste' && (
        <div className="space-y-3 py-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            엑셀에서 <strong>[번호 / 이름 / 성별]</strong> 영역을 마우스로 드래그하여 복사(Ctrl+C)한 뒤 아래 상자에 붙여넣기(Ctrl+V) 하세요:
          </p>
          <textarea
            rows={6}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`예시:\n1\t강민서\t여\n2\t김도현\t남\n3\t김서연\t여`}
            className="w-full text-xs font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleParsePaste}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> 붙여넣은 데이터 분석 및 추출
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW BANNER (If parsed from upload or paste) */}
      {previewList && (
        <div className="my-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-600" /> 추출 결과 미리보기 ({previewList.length}명)
            </h4>
            <button
              onClick={applyPreview}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
            >
              현재 명단으로 적용하기
            </button>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
            {previewList.slice(0, 10).map((st, i) => (
              <span
                key={i}
                className="inline-block mr-2 mb-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                #{i + 1} {st.name} ({st.gender === 'F' ? '여' : '남'})
              </span>
            ))}
            {previewList.length > 10 && (
              <span className="text-[11px] text-slate-500 font-medium">
                ... 외 {previewList.length - 10}명
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Manual Edit & Roster Table */}
      {activeTab === 'manual' && (
        <div className="space-y-4 py-2">
          {/* Add Student Bar */}
          <form onSubmit={handleAddManual} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="학생 이름 입력"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <select
              value={newGender}
              onChange={(e) => setNewGender(e.target.value as 'M' | 'F')}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 font-semibold"
            >
              <option value="M">남학생</option>
              <option value="F">여학생</option>
            </select>
            <button
              type="submit"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> 학생 추가
            </button>
          </form>

          {/* Student List Grid */}
          <div className="max-h-56 overflow-y-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 space-y-1.5 bg-slate-50/50 dark:bg-slate-800/40">
            {currentList.map((st, idx) => (
              <div
                key={`${st.id}-${idx}`}
                className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 text-xs shadow-sm border border-slate-100 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-400 font-bold text-[11px] w-6">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{st.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      st.gender === 'F'
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300'
                    }`}
                  >
                    {st.gender === 'F' ? '여' : '남'}
                  </span>
                  {st.isFixed && (
                    <span className="text-[10px] text-amber-500 font-medium">📌 고정석</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveStudent(st.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-md"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>남학생 {currentList.filter((s) => s.gender === 'M').length}명 / 여학생 {currentList.filter((s) => s.gender === 'F').length}명</span>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" /> 기본 샘플 30명으로 리셋
            </button>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" /> 명단 최종 저장 및 자리배치 반영
        </button>
      </div>
    </Modal>
  );
};
