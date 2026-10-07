export interface TimetableItem {
  period: number;
  time: string;
  monday: { subject: string; teacher: string; room?: string; changed?: boolean; note?: string };
  tuesday: { subject: string; teacher: string; room?: string; changed?: boolean; note?: string };
  wednesday: { subject: string; teacher: string; room?: string; changed?: boolean; note?: string };
  thursday: { subject: string; teacher: string; room?: string; changed?: boolean; note?: string };
  friday: { subject: string; teacher: string; room?: string; changed?: boolean; note?: string };
}

export interface TimetableChange {
  id: string;
  date: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  period: number;
  originalSubject: string;
  newSubject: string;
  teacher: string;
  reason: string;
}

export interface Post {
  id: string | number;
  title: string;
  content: string;
  author: string;
  category: '전체' | '학사일정' | '수행평가' | '학급행사';
  created_at: string;
  likes: number;
}

export interface ScoreItem {
  id: string | number;
  nickname: string;
  score: number;
  badge?: string;
  played_at: string;
}

export interface SeatStudent {
  id: number;
  name: string;
  gender: 'M' | 'F';
  isFixed?: boolean;
}

export interface StudentMember {
  id: string | number;
  student_no: number;
  name: string;
  gender: 'M' | 'F';
  pin: string; // 4자리 비밀번호 (교사 확인 및 학생 로그인용)
  status: 'pending' | 'approved' | 'rejected';
  intro?: string;
  created_at: string;
}

export interface ClassSettings {
  grade: number;
  classNum: number;
  title: string;
  teacherName?: string;
  inviteCode?: string; // 학급 초대 코드 (기본 '3077')
  teacherPassword?: string; // 교사 관리자 비밀번호 (기본 'admin1234')
}


