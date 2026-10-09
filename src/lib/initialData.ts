import { TimetableItem, TimetableChange, Post, ScoreItem, SeatStudent, ClassSettings, StudentMember } from '@/types';



export const INITIAL_TIMETABLE: TimetableItem[] = [
  {
    period: 1,
    time: '09:00 - 09:50',
    monday: { subject: '자율활동', teacher: '담임교사', room: '3-7' },
    tuesday: { subject: '물리학Ⅱ', teacher: '물리 교사', room: '과학실 1' },
    wednesday: { subject: '지구과학Ⅱ', teacher: '지학 교사', room: '과학실 4' },
    thursday: { subject: '자율활동', teacher: '담임교사', room: '3-7' },
    friday: { subject: '생명과학Ⅱ', teacher: '생명 교사', room: '과학실 3' },
  },
  {
    period: 2,
    time: '10:00 - 10:50',
    monday: { subject: '사회문제 탐구과중-A', teacher: '사회 교사', room: '3-7' },
    tuesday: { subject: '미적분', teacher: '수학 교사', room: '3-7' },
    wednesday: { subject: '화법과 작문', teacher: '국어 교사', room: '3-7' },
    thursday: { subject: '물리학Ⅱ', teacher: '물리 교사', room: '과학실 1' },
    friday: { subject: '심화 수학Ⅰ', teacher: '수학 교사', room: '3-7' },
  },
  {
    period: 3,
    time: '11:00 - 11:50',
    monday: { subject: '미적분', teacher: '수학 교사', room: '3-7' },
    tuesday: { subject: '기하', teacher: '수학 교사', room: '3-7' },
    wednesday: { subject: '생명과학Ⅱ', teacher: '생명 교사', room: '과학실 3' },
    thursday: { subject: '사회문제 탐구과중-A', teacher: '사회 교사', room: '3-7' },
    friday: { subject: '심화 수학Ⅰ', teacher: '수학 교사', room: '3-7' },
  },
  {
    period: 4,
    time: '12:00 - 12:50',
    monday: { subject: '화법과 작문', teacher: '국어 교사', room: '3-7' },
    tuesday: { subject: '운동과 건강', teacher: '체육 교사', room: '체육관' },
    wednesday: { subject: '심화 수학Ⅰ', teacher: '수학 교사', room: '3-7' },
    thursday: { subject: '기하', teacher: '수학 교사', room: '3-7' },
    friday: { subject: '운동과 건강', teacher: '체육 교사', room: '체육관' },
  },
  {
    period: 5,
    time: '13:50 - 14:40',
    monday: { subject: '영어 독해와 작문', teacher: '영어 교사', room: '3-7' },
    tuesday: { subject: '화학Ⅱ', teacher: '화학 교사', room: '과학실 2' },
    wednesday: { subject: '동아리활동', teacher: '동아리 담당', room: '특별실' },
    thursday: { subject: '미적분', teacher: '수학 교사', room: '3-7' },
    friday: { subject: '진로활동', teacher: '진로 담당', room: '진로실' },
  },
  {
    period: 6,
    time: '14:50 - 15:40',
    monday: { subject: '영어 독해와 작문', teacher: '영어 교사', room: '3-7' },
    tuesday: { subject: '영어 독해와 작문', teacher: '영어 교사', room: '3-7' },
    wednesday: { subject: '체육', teacher: '체육 교사', room: '체육관' },
    thursday: { subject: '심화 수학Ⅰ', teacher: '수학 교사', room: '3-7' },
    friday: { subject: '기하', teacher: '수학 교사', room: '3-7' },
  },
  {
    period: 7,
    time: '15:50 - 16:40',
    monday: { subject: '과학융합', teacher: '과학 교사', room: '과학실' },
    tuesday: { subject: '심리학', teacher: '상담 교사', room: '상담실' },
    wednesday: { subject: '동아리', teacher: '동아리 담당', room: '특별실' },
    thursday: { subject: '화법과 작문', teacher: '국어 교사', room: '3-7' },
    friday: { subject: '화학Ⅱ', teacher: '화학 교사', room: '과학실 2' },
  },
];

export const INITIAL_CHANGES: TimetableChange[] = [];

export const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    title: '📢 2학기 중간고사 시험 범위 및 일정 안내',
    content: '10월 20일부터 23일까지 4일간 진행됩니다. 과목별 자세한 시험 범위와 유의사항은 칠판 우측 게시판을 참고해 주세요.',
    author: '담임선생님',
    category: '학사일정',
    created_at: '2026-10-05 08:30',
    likes: 24,
  },
  {
    id: 2,
    title: '🔬 과학탐구실험 조별 보고서 제출 마감 D-3',
    content: '이번 주 목요일 7교시 전까지 3인 1조 보고서를 PDF 형식으로 제출하세요. 양식 미준수 시 감점 처리됩니다.',
    author: '과학부장',
    category: '수행평가',
    created_at: '2026-10-06 14:10',
    likes: 19,
  },
  {
    id: 3,
    title: '🎉 학급 부스 운영 아이디어 투표 안내',
    content: '가을 축제 학급 부스로 방탈출 카페 vs 타코야키 & 음료 부스 중 투표를 진행합니다. 댓글로 의견 남겨주세요!',
    author: '반장 김하늘',
    category: '학급행사',
    created_at: '2026-10-06 16:45',
    likes: 31,
  },
  {
    id: 4,
    title: '🧹 금요일 대청소 구역 배정 및 분리수거 수칙',
    content: '창틀 먼지 청소와 재활용 분리수거 철저히 부탁드립니다. 분리배출 당번은 3분단입니다.',
    author: '환경미화부장',
    category: '전체',
    created_at: '2026-10-06 17:20',
    likes: 12,
  },
];

export const INITIAL_SCORES: ScoreItem[] = [
  { id: 1, nickname: '김하늘 (반장)', score: 380, badge: '👑 1위', played_at: '2026-10-06' },
  { id: 2, nickname: '이도윤 (학습부장)', score: 350, badge: '🥈 2위', played_at: '2026-10-06' },
  { id: 3, nickname: '박서아 (체육부장)', score: 320, badge: '🥉 3위', played_at: '2026-10-06' },
  { id: 4, nickname: '최지우 (서기)', score: 290, badge: '✨ 우수', played_at: '2026-10-05' },
  { id: 5, nickname: '정시우 (정보부장)', score: 275, badge: '✨ 우수', played_at: '2026-10-05' },
  { id: 6, nickname: '강은서', score: 240, badge: '열정상', played_at: '2026-10-04' },
  { id: 7, nickname: '윤민재', score: 210, badge: '성실상', played_at: '2026-10-04' },
];

export const INITIAL_STUDENTS: SeatStudent[] = [
  { id: 1, name: '강민서', gender: 'F' },
  { id: 2, name: '김도현', gender: 'M' },
  { id: 3, name: '김서연', gender: 'F' },
  { id: 4, name: '김시우', gender: 'M' },
  { id: 5, name: '김하늘', gender: 'F' },
  { id: 6, name: '문준호', gender: 'M' },
  { id: 7, name: '박건우', gender: 'M' },
  { id: 8, name: '박서아', gender: 'F', isFixed: true },
  { id: 9, name: '박예준', gender: 'M' },
  { id: 10, name: '배수빈', gender: 'F' },
  { id: 11, name: '서유진', gender: 'F' },
  { id: 12, name: '송지호', gender: 'M' },
  { id: 13, name: '신아린', gender: 'F' },
  { id: 14, name: '안현우', gender: 'M' },
  { id: 15, name: '양지민', gender: 'F' },
  { id: 16, name: '오세진', gender: 'M' },
  { id: 17, name: '유승우', gender: 'M' },
  { id: 18, name: '윤민재', gender: 'M' },
  { id: 19, name: '이도윤', gender: 'M' },
  { id: 20, name: '이서윤', gender: 'F' },
  { id: 21, name: '이은우', gender: 'M' },
  { id: 22, name: '이채원', gender: 'F' },
  { id: 23, name: '임가은', gender: 'F' },
  { id: 24, name: '정시우', gender: 'M' },
  { id: 25, name: '정예나', gender: 'F' },
  { id: 26, name: '조유찬', gender: 'M' },
  { id: 27, name: '최지우', gender: 'F' },
  { id: 28, name: '한소율', gender: 'F' },
  { id: 29, name: '황동현', gender: 'M' },
  { id: 30, name: '황지아', gender: 'F' },
];

export const DEFAULT_CLASS_SETTINGS: ClassSettings = {
  grade: 3,
  classNum: 7,
  title: '학급운영 허브',
  teacherName: '담임선생님',
  inviteCode: '3077',
  teacherPassword: 'admin1234',
};

export const INITIAL_MEMBERS: StudentMember[] = [
  ...INITIAL_STUDENTS.map((s, idx) => ({
    id: s.id,
    student_no: idx + 1,
    name: s.name,
    gender: s.gender,
    pin: String(1000 + idx + 1),
    status: 'approved' as const,
    intro: '우리 반 화이팅!',
    created_at: '2026-10-06 09:00',
  })),
  {
    id: 31,
    student_no: 31,
    name: '이준혁',
    gender: 'M',
    pin: '7788',
    status: 'pending',
    intro: '선생님! 전학 온 이준혁입니다. 승인 부탁드려요!',
    created_at: '2026-10-07 00:30',
  },
  {
    id: 32,
    student_no: 32,
    name: '최수아',
    gender: 'F',
    pin: '9900',
    status: 'pending',
    intro: '신규 가입 신청합니다.',
    created_at: '2026-10-07 00:45',
  },
];


