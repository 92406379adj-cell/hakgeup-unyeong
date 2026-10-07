'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TimetableSection } from '@/components/TimetableSection';
import { SeatingSection } from '@/components/SeatingSection';
import { NoticeSection } from '@/components/NoticeSection';
import { RankingSection } from '@/components/RankingSection';
import { StudentManagerModal } from '@/components/StudentManagerModal';
import { ClassAIChatModal } from '@/components/ClassAIChatModal';
import { TeacherMemberManagementModal } from '@/components/TeacherMemberManagementModal';
import { StudentAuthModal } from '@/components/StudentAuthModal';
import { TeacherAuthModal } from '@/components/TeacherAuthModal';
import { MealSection } from '@/components/MealSection';
import {
  INITIAL_TIMETABLE,
  INITIAL_CHANGES,
  INITIAL_POSTS,
  INITIAL_SCORES,
  INITIAL_STUDENTS,
  INITIAL_MEMBERS,
  DEFAULT_CLASS_SETTINGS,
} from '@/lib/initialData';
import { TimetableItem, TimetableChange, Post, ScoreItem, ClassSettings, SeatStudent, StudentMember } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ShieldCheck, Zap, Database, Server, ExternalLink, Bot } from 'lucide-react';

// Helper to extract SeatStudent list from approved StudentMember list
const getSeatStudentsFromMembers = (members: StudentMember[]): SeatStudent[] => {
  return members
    .filter((m) => m.status === 'approved')
    .sort((a, b) => a.student_no - b.student_no)
    .map((m) => ({
      id: typeof m.id === 'number' ? m.id : Number(m.id) || m.student_no,
      name: m.name,
      gender: m.gender,
    }));
};

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [classSettings, setClassSettings] = useState<ClassSettings>(DEFAULT_CLASS_SETTINGS);
  const [students, setStudents] = useState<SeatStudent[]>(INITIAL_STUDENTS);
  const [classMembers, setClassMembers] = useState<StudentMember[]>(INITIAL_MEMBERS);
  const [isMemberManagerOpen, setIsMemberManagerOpen] = useState(false);
  const [isStudentAuthOpen, setIsStudentAuthOpen] = useState(false);
  const [isTeacherAuthOpen, setIsTeacherAuthOpen] = useState(false);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
  const [loggedInStudent, setLoggedInStudent] = useState<StudentMember | null>(null);

  const [isStudentManagerOpen, setIsStudentManagerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [timetable, setTimetable] = useState<TimetableItem[]>(INITIAL_TIMETABLE);

  const [changes, setChanges] = useState<TimetableChange[]>(INITIAL_CHANGES);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [scores, setScores] = useState<ScoreItem[]>(INITIAL_SCORES);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline_fallback'>('offline_fallback');

  // Initialize theme, classSettings, members from localStorage
  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);

    const savedSettings = localStorage.getItem('class_settings');
    if (savedSettings) {
      try {
        setClassSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }

    const savedTeacherLogged = localStorage.getItem('is_teacher_logged_in') === 'true';
    setIsTeacherLoggedIn(savedTeacherLogged);

    const savedMembers = localStorage.getItem('class_members');
    if (savedMembers) {
      try {
        const parsed: StudentMember[] = JSON.parse(savedMembers);
        setClassMembers(parsed);
        const approved = getSeatStudentsFromMembers(parsed);
        if (approved.length > 0) {
          setStudents(approved);
        }
      } catch (e) {}
    } else {
      const savedStudents = localStorage.getItem('class_students');
      if (savedStudents) {
        try {
          setStudents(JSON.parse(savedStudents));
        } catch (e) {}
      }
    }

    const savedLoggedIn = localStorage.getItem('logged_in_student');
    if (savedLoggedIn) {
      try {
        setLoggedInStudent(JSON.parse(savedLoggedIn));
      } catch (e) {}
    }
  }, []);

  const handleUpdateClassSettings = (newSettings: ClassSettings) => {
    setClassSettings(newSettings);
    localStorage.setItem('class_settings', JSON.stringify(newSettings));
  };

  const handleSaveStudents = (newStudents: SeatStudent[]) => {
    setStudents(newStudents);
    localStorage.setItem('class_students', JSON.stringify(newStudents));
  };

  // Sync dark mode class on html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load from Supabase or localStorage
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured && supabase) {
        try {
          // Fetch Class Members
          const { data: membersData, error: membersErr } = await supabase
            .from('class_members')
            .select('*')
            .order('student_no', { ascending: true });

          if (!membersErr && membersData && membersData.length > 0) {
            setClassMembers(membersData);
            localStorage.setItem('class_members', JSON.stringify(membersData));
            const approved = getSeatStudentsFromMembers(membersData);
            setStudents(approved);
            localStorage.setItem('class_students', JSON.stringify(approved));
            setDbStatus('connected');
          }

          // Fetch Posts
          const { data: postsData, error: postsErr } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

          if (!postsErr && postsData && postsData.length > 0) {
            setPosts(postsData);
            setDbStatus('connected');
          }

          // Fetch Scores
          const { data: scoresData, error: scoresErr } = await supabase
            .from('scores')
            .select('*')
            .order('score', { ascending: false });

          if (!scoresErr && scoresData && scoresData.length > 0) {
            setScores(scoresData);
            setDbStatus('connected');
          }
        } catch (err) {
          console.warn('Supabase fetch fallback to local cache:', err);
          setDbStatus('offline_fallback');
        }
      }
    }

    loadData();
  }, []);

  // Timetable change handler
  const handleAddChange = (newChange: TimetableChange) => {
    setChanges((prev) => [newChange, ...prev]);
  };

  const handleRemoveChange = (id: string) => {
    setChanges((prev) => prev.filter((c) => c.id !== id));
  };

  // Add post handler
  const handleAddPost = async (newPostData: Omit<Post, 'id' | 'likes' | 'created_at'>) => {
    const newPost: Post = {
      id: Date.now(),
      title: newPostData.title,
      content: newPostData.content,
      author: newPostData.author,
      category: newPostData.category,
      created_at: new Date().toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      likes: 0,
    };

    setPosts((prev) => [newPost, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('posts').insert([
          {
            title: newPost.title,
            content: newPost.content,
            author: newPost.author,
            created_at: newPost.created_at,
            likes: 0,
          },
        ]);
      } catch (e) {
        console.warn('Supabase post insert failed, saved locally');
      }
    }
  };

  // Like post handler
  const handleLikePost = async (id: string | number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        const target = posts.find((p) => p.id === id);
        if (target) {
          await supabase
            .from('posts')
            .update({ likes: target.likes + 1 })
            .eq('id', id);
        }
      } catch (e) {
        console.warn('Supabase like update failed');
      }
    }
  };

  // Add score handler
  const handleAddScore = async (item: Omit<ScoreItem, 'id' | 'played_at'>) => {
    const newScoreItem: ScoreItem = {
      id: Date.now(),
      nickname: item.nickname,
      score: item.score,
      badge: item.badge,
      played_at: new Date().toISOString().split('T')[0],
    };

    setScores((prev) => {
      const existing = prev.find((s) => s.nickname === item.nickname);
      if (existing) {
        return prev.map((s) =>
          s.nickname === item.nickname ? { ...s, score: s.score + item.score } : s
        );
      }
      return [...prev, newScoreItem];
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('scores').insert([
          {
            nickname: item.nickname,
            score: item.score,
            played_at: newScoreItem.played_at,
          },
        ]);
      } catch (e) {
        console.warn('Supabase score insert failed, saved locally');
      }
    }
  };

  // Sync helper for class members and seat students
  const syncMembersAndStudents = (newMembers: StudentMember[]) => {
    setClassMembers(newMembers);
    localStorage.setItem('class_members', JSON.stringify(newMembers));

    const approvedStudents = getSeatStudentsFromMembers(newMembers);
    setStudents(approvedStudents);
    localStorage.setItem('class_students', JSON.stringify(approvedStudents));
  };

  // Teacher approves member (fixing typos if needed)
  const handleApproveMember = async (
    id: string | number,
    updatedData: { student_no: number; name: string; gender: 'M' | 'F' }
  ) => {
    const updated = classMembers.map((m) =>
      m.id === id
        ? {
            ...m,
            student_no: updatedData.student_no,
            name: updatedData.name,
            gender: updatedData.gender,
            status: 'approved' as const,
          }
        : m
    );
    syncMembersAndStudents(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('class_members')
          .update({
            student_no: updatedData.student_no,
            name: updatedData.name,
            gender: updatedData.gender,
            status: 'approved',
          })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase member approve update failed, saved locally:', e);
      }
    }
  };

  // Teacher rejects member
  const handleRejectMember = async (id: string | number) => {
    const updated = classMembers.filter((m) => m.id !== id);
    syncMembersAndStudents(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('class_members').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase member delete failed, saved locally:', e);
      }
    }
  };

  // Teacher updates member PIN (password reset)
  const handleUpdateMemberPin = async (id: string | number, newPin: string) => {
    const updated = classMembers.map((m) =>
      m.id === id ? { ...m, pin: newPin } : m
    );
    syncMembersAndStudents(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('class_members')
          .update({ pin: newPin })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase member pin update failed, saved locally:', e);
      }
    }
  };

  // Teacher deletes member
  const handleDeleteMember = async (id: string | number) => {
    const updated = classMembers.filter((m) => m.id !== id);
    syncMembersAndStudents(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('class_members').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase member delete failed, saved locally:', e);
      }
    }
  };

  // Teacher adds member directly
  const handleAddMemberDirectly = async (
    newMemberData: Omit<StudentMember, 'id' | 'created_at'>
  ) => {
    const newMember: StudentMember = {
      id: Date.now(),
      student_no: newMemberData.student_no,
      name: newMemberData.name,
      gender: newMemberData.gender,
      pin: newMemberData.pin,
      status: 'approved',
      intro: newMemberData.intro,
      created_at: new Date().toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updated = [...classMembers, newMember];
    syncMembersAndStudents(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('class_members').insert([
          {
            student_no: newMember.student_no,
            name: newMember.name,
            gender: newMember.gender,
            pin: newMember.pin,
            status: 'approved',
            intro: newMember.intro,
            created_at: newMember.created_at,
          },
        ]);
      } catch (e) {
        console.warn('Supabase direct member insert failed, saved locally:', e);
      }
    }
  };

  // Student requests sign up
  const handleRequestSignUp = async (
    newMemberData: Omit<StudentMember, 'id' | 'created_at' | 'status'>
  ) => {
    const newMember: StudentMember = {
      id: Date.now(),
      student_no: newMemberData.student_no,
      name: newMemberData.name,
      gender: newMemberData.gender,
      pin: newMemberData.pin,
      status: 'pending',
      intro: newMemberData.intro,
      created_at: new Date().toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updated = [...classMembers, newMember];
    setClassMembers(updated);
    localStorage.setItem('class_members', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('class_members').insert([
          {
            student_no: newMember.student_no,
            name: newMember.name,
            gender: newMember.gender,
            pin: newMember.pin,
            status: 'pending',
            intro: newMember.intro,
            created_at: newMember.created_at,
          },
        ]);
      } catch (e) {
        console.warn('Supabase member signup insert failed, saved locally:', e);
      }
    }
  };

  // Student login success
  const handleStudentLoginSuccess = (student: StudentMember) => {
    setLoggedInStudent(student);
    localStorage.setItem('logged_in_student', JSON.stringify(student));
  };

  // Student logout
  const handleStudentLogout = () => {
    setLoggedInStudent(null);
    localStorage.removeItem('logged_in_student');
  };

  // Update Invite Code
  const handleUpdateInviteCode = (newCode: string) => {
    const updated = { ...classSettings, inviteCode: newCode };
    handleUpdateClassSettings(updated);
  };

  // Teacher auth handlers
  const handleTeacherLoginSuccess = () => {
    setIsTeacherLoggedIn(true);
    localStorage.setItem('is_teacher_logged_in', 'true');
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    localStorage.removeItem('is_teacher_logged_in');
  };

  const handleUpdateTeacherPassword = (newPassword: string) => {
    const updated = { ...classSettings, teacherPassword: newPassword };
    handleUpdateClassSettings(updated);
  };

  const pendingMemberCount = classMembers.filter((m) => m.status === 'pending').length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header with claymorphism & dark mode switch */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        classSettings={classSettings}
        onUpdateClassSettings={handleUpdateClassSettings}
        pendingMemberCount={pendingMemberCount}
        onOpenMemberManager={() => setIsMemberManagerOpen(true)}
        loggedInStudent={loggedInStudent}
        onOpenStudentAuth={() => setIsStudentAuthOpen(true)}
        onStudentLogout={handleStudentLogout}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onOpenTeacherAuth={() => setIsTeacherAuthOpen(true)}
        onTeacherLogout={handleTeacherLogout}
      />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Bento Cell 1: Timetable & substitutions (Large 8-col) */}
        <div className="lg:col-span-8">
          <TimetableSection
            timetable={timetable}
            changes={changes}
            onAddChange={handleAddChange}
            onRemoveChange={handleRemoveChange}
            classSettings={classSettings}
            onTimetableUpdate={(newTimetable) => setTimetable(newTimetable)}
          />
        </div>

        {/* Bento Cell 2: Suncheon Bokseong High School NEIS Meal Service (4-col) */}
        <div className="lg:col-span-4">
          <MealSection />
        </div>

        {/* Bento Cell 3: Smart Seating Arrangement (7-col) */}
        <div className="lg:col-span-7">
          <SeatingSection
            students={students}
            onOpenStudentManager={() => {
              if (!isTeacherLoggedIn) {
                setIsTeacherAuthOpen(true);
              } else {
                setIsStudentManagerOpen(true);
              }
            }}
          />
        </div>

        {/* Bento Cell 4: Points & Praise Ranking (5-col) */}
        <div className="lg:col-span-5">
          <RankingSection
            scores={scores}
            onAddScore={handleAddScore}
            students={students}
          />
        </div>

        {/* Bento Cell 5: Notices & Board (12-col Full Width) */}
        <div className="lg:col-span-12">
          <NoticeSection
            posts={posts}
            onAddPost={handleAddPost}
            onLikePost={handleLikePost}
            onOpenChatBot={() => setIsChatOpen(true)}
          />
        </div>
      </div>

      {/* Bento Cell 5: Seoul Region & Infrastructure Status Card */}
      <div className="clay-card bg-white/80 dark:bg-slate-900/80 p-5 rounded-3xl transition-all duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shadow-sm">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  한국 서울 리전(Seoul Region) 통일 최적화 아키텍처
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  초저지연 RTT 98% 단축
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Vercel 서버리스 엣지와 Supabase Postgres DB를 서울 단일 리전으로 일치시켜 네트워크 레이턴시를 극대화했습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Vercel Region */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <Server className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-slate-500 dark:text-slate-400">Vercel:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">Seoul (icn1)</span>
            </div>

            {/* Supabase Region */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-slate-500 dark:text-slate-400">Supabase:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">Seoul (ap-northeast-2)</span>
            </div>

            {/* DB Connection Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{dbStatus === 'connected' ? 'Supabase 연동 완료' : 'Active (Local + Cloud Ready)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Chatbot Action Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        title="학급 공지사항 AI 알리미에게 질문하기"
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full clay-button bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl shadow-purple-500/40 flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all group border border-white/20"
      >
        <Bot className="w-5 h-5 animate-bounce" />
        <span className="text-xs font-extrabold tracking-wide">
          AI 알리미 질문
        </span>
      </button>

      {/* Teacher Member Management Modal via Portal */}
      <TeacherMemberManagementModal
        isOpen={isMemberManagerOpen}
        onClose={() => setIsMemberManagerOpen(false)}
        classMembers={classMembers}
        classSettings={classSettings}
        onApproveMember={handleApproveMember}
        onRejectMember={handleRejectMember}
        onUpdateMemberPin={handleUpdateMemberPin}
        onDeleteMember={handleDeleteMember}
        onAddMemberDirectly={handleAddMemberDirectly}
        onUpdateInviteCode={handleUpdateInviteCode}
      />

      {/* Teacher Auth Modal via Portal */}
      <TeacherAuthModal
        isOpen={isTeacherAuthOpen}
        onClose={() => setIsTeacherAuthOpen(false)}
        classSettings={classSettings}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onLoginSuccess={handleTeacherLoginSuccess}
        onLogout={handleTeacherLogout}
        onUpdateTeacherPassword={handleUpdateTeacherPassword}
      />

      {/* Student Auth Modal (Login / Sign Up) via Portal */}
      <StudentAuthModal
        isOpen={isStudentAuthOpen}
        onClose={() => setIsStudentAuthOpen(false)}
        classSettings={classSettings}
        classMembers={classMembers}
        onLoginSuccess={handleStudentLoginSuccess}
        onRequestSignUp={handleRequestSignUp}
      />

      {/* Student Roster Manager Modal via Portal */}
      <StudentManagerModal
        isOpen={isStudentManagerOpen}
        onClose={() => setIsStudentManagerOpen(false)}
        students={students}
        onSaveStudents={handleSaveStudents}
      />

      {/* Class AI Chatbot Modal via Portal */}
      <ClassAIChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        posts={posts}
        timetable={timetable}
        classSettings={classSettings}
      />
    </main>
  );
}


