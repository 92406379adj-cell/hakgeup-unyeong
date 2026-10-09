import { NextResponse } from 'next/server';
import { INITIAL_TIMETABLE } from '@/lib/initialData';
import { TimetableItem } from '@/types';

// NEIS API Configuration for Suncheon Bokseong High School
const NEIS_CONFIG = {
  ATPT_OFCDC_SC_CODE: 'Q10', // 전라남도교육청
  SD_SCHUL_CODE: '7140281', // 순천복성고등학교
  SCHOOL_NAME: '순천복성고등학교',
};

// Subject to teacher/room mapping for Suncheon Bokseong High School
const SUBJECT_DETAILS: Record<string, { teacher: string; room: string; isEvent?: boolean }> = {
  '대체공휴일': { teacher: '공휴일', room: '-', isEvent: true },
  '한글날': { teacher: '국경일', room: '-', isEvent: true },
  '1차시험': { teacher: '고사본부', room: '3-7', isEvent: true },
  '1차시험화법과 작문': { teacher: '교과 담당', room: '3-7', isEvent: true },
  '물리학Ⅱ': { teacher: '물리 교사', room: '과학실 1' },
  '화학Ⅱ': { teacher: '화학 교사', room: '과학실 2' },
  '생명과학Ⅱ': { teacher: '생명 교사', room: '과학실 3' },
  '지구과학Ⅱ': { teacher: '지학 교사', room: '과학실 4' },
  '미적분': { teacher: '수학 교사', room: '3-7' },
  '기하': { teacher: '수학 교사', room: '3-7' },
  '기하C': { teacher: '수학 교사', room: '3-7' },
  '심화 수학Ⅰ': { teacher: '수학 교사', room: '3-7' },
  '화법과 작문': { teacher: '국어 교사', room: '3-7' },
  '영어 독해와 작문': { teacher: '영어 교사', room: '3-7' },
  '영어 독해와 작문과중-A': { teacher: '영어 교사', room: '3-7' },
  '사회문제 탐구과중-A': { teacher: '사회 교사', room: '3-7' },
  '운동과 건강': { teacher: '체육 교사', room: '체육관' },
  '자율활동': { teacher: '담임교사', room: '3-7' },
  '진로활동': { teacher: '진로 담당', room: '진로실' },
  '동아리활동': { teacher: '동아리 담당', room: '특별실' },
  '심리학': { teacher: '상담 교사', room: '상담실' },
  '심리학G': { teacher: '상담 교사', room: '상담실' },
  '진로 영어': { teacher: '영어 교사', room: '3-7' },
  '고전과 윤리': { teacher: '윤리 교사', room: '3-7' },
  '과학융합': { teacher: '과학 교사', room: '과학실' },
};

// Period standard times
const PERIOD_TIMES: Record<number, string> = {
  1: '09:00 - 09:50',
  2: '10:00 - 10:50',
  3: '11:00 - 11:50',
  4: '12:00 - 12:50',
  5: '13:50 - 14:40',
  6: '14:50 - 15:40',
  7: '15:50 - 16:40',
};

// Helper to format Date to YYYYMMDD string
function formatDateToYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Helper to get Korean Date string
function formatDateToDisplay(d: Date): string {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}.${day < 10 ? '0' : ''}${day}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade') || '3';
    const classNum = searchParams.get('classNum') || '7';
    const targetDateStr = searchParams.get('date'); // YYYYMMDD
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0', 10); // 0 = 이번주, 1 = 다음주, -1 = 이전주

    // 1. Calculate the week's Monday ~ Friday dates in Korea Standard Time (UTC+9)
    const now = new Date();
    const kstOffset = 9 * 60; // minutes
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const kstNow = new Date(utc + kstOffset * 60000);

    let baseDate: Date;
    if (targetDateStr && targetDateStr.length === 8) {
      const y = parseInt(targetDateStr.slice(0, 4), 10);
      const m = parseInt(targetDateStr.slice(4, 6), 10) - 1;
      const d = parseInt(targetDateStr.slice(6, 8), 10);
      baseDate = new Date(y, m, d);
    } else {
      baseDate = kstNow;
    }

    // Apply week offset
    if (weekOffset !== 0) {
      baseDate = new Date(baseDate.getTime() + weekOffset * 7 * 86400 * 1000);
    }

    // Find Monday of the target week (Day 0 = Sun, 1 = Mon ... 6 = Sat)
    const currentDayOfWeek = baseDate.getDay();
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const mondayDate = new Date(baseDate.getTime() + diffToMonday * 86400 * 1000);

    const weekDays: { key: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'; date: Date; ymd: string; label: string }[] = [
      { key: 'monday', date: mondayDate, ymd: formatDateToYMD(mondayDate), label: '월' },
      { key: 'tuesday', date: new Date(mondayDate.getTime() + 1 * 86400 * 1000), ymd: formatDateToYMD(new Date(mondayDate.getTime() + 1 * 86400 * 1000)), label: '화' },
      { key: 'wednesday', date: new Date(mondayDate.getTime() + 2 * 86400 * 1000), ymd: formatDateToYMD(new Date(mondayDate.getTime() + 2 * 86400 * 1000)), label: '수' },
      { key: 'thursday', date: new Date(mondayDate.getTime() + 3 * 86400 * 1000), ymd: formatDateToYMD(new Date(mondayDate.getTime() + 3 * 86400 * 1000)), label: '목' },
      { key: 'friday', date: new Date(mondayDate.getTime() + 4 * 86400 * 1000), ymd: formatDateToYMD(new Date(mondayDate.getTime() + 4 * 86400 * 1000)), label: '금' },
    ];

    const fridayDate = weekDays[4].date;
    const weekLabel = `${mondayDate.getFullYear()}년 ${mondayDate.getMonth() + 1}월 ${formatDateToDisplay(mondayDate)} ~ ${formatDateToDisplay(fridayDate)}`;

    // 2. Fetch NEIS hisTimetable data concurrently for each day of the week
    const neisKey = searchParams.get('neisKey') || process.env.NEIS_API_KEY || '8acce9b8e59349ca9fd3a2ff3285e675';
    const dayFetchPromises = weekDays.map(async (dayInfo) => {
      try {
        let neisUrl = `https://open.neis.go.kr/hub/hisTimetable?Type=json&ATPT_OFCDC_SC_CODE=${NEIS_CONFIG.ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${NEIS_CONFIG.SD_SCHUL_CODE}&GRADE=${grade}&CLASS_NM=${classNum}&ALL_TI_YMD=${dayInfo.ymd}`;
        if (neisKey) {
          neisUrl += `&KEY=${neisKey}&pSize=100`;
        }

        const res = await fetch(neisUrl, { next: { revalidate: 3600 } });
        if (!res.ok) return { dayKey: dayInfo.key, rows: [] };

        const data = await res.json();
        const rows: any[] = data?.hisTimetable?.[1]?.row || [];
        return { dayKey: dayInfo.key, rows };
      } catch (err) {
        return { dayKey: dayInfo.key, rows: [] };
      }
    });

    const dayResults = await Promise.all(dayFetchPromises);
    let totalNeisRows = 0;

    // 3. Initialize timetable structure with INITIAL_TIMETABLE as baseline
    const timetableData: TimetableItem[] = [1, 2, 3, 4, 5, 6, 7].map((period) => {
      const baseItem = INITIAL_TIMETABLE.find((t) => t.period === period);
      return {
        period,
        time: PERIOD_TIMES[period] || baseItem?.time || '09:00 - 09:50',
        monday: { ...(baseItem?.monday || { subject: '자율학습', teacher: '담임교사' }), isNeis: false },
        tuesday: { ...(baseItem?.tuesday || { subject: '자율학습', teacher: '담임교사' }), isNeis: false },
        wednesday: { ...(baseItem?.wednesday || { subject: '자율학습', teacher: '담임교사' }), isNeis: false },
        thursday: { ...(baseItem?.thursday || { subject: '자율학습', teacher: '담임교사' }), isNeis: false },
        friday: { ...(baseItem?.friday || { subject: '자율학습', teacher: '담임교사' }), isNeis: false },
      };
    });

    // 4. Overlay NEIS live subjects onto the timetable
    dayResults.forEach(({ dayKey, rows }: { dayKey: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'; rows: any[] }) => {
      // Check if this day is a full-day holiday
      const isFullDayHoliday =
        rows.length > 0 &&
        rows.every((r: any) => {
          const s = (r.ITRT_CNTNT || '').trim();
          return s.includes('공휴일') || s.includes('한글날') || s.includes('개천절') || s.includes('현충일') || s.includes('휴업');
        });

      if (isFullDayHoliday) {
        const holidayName = (rows[0]?.ITRT_CNTNT || '공휴일').trim();
        totalNeisRows += 7;
        timetableData.forEach((tableItem) => {
          tableItem[dayKey] = {
            subject: holidayName,
            teacher: '공휴일',
            room: '-',
            isNeis: true,
            isEvent: true,
          };
        });
        return;
      }

      rows.forEach((row: any) => {
        const periodNum = parseInt(row.PERIO, 10);
        const subjectName = (row.ITRT_CNTNT || '').trim();

        if (periodNum >= 1 && periodNum <= 7 && subjectName) {
          totalNeisRows++;
          const tableItem = timetableData.find((t) => t.period === periodNum);
          if (tableItem) {
            const detail = SUBJECT_DETAILS[subjectName];
            tableItem[dayKey] = {
              subject: subjectName,
              teacher: detail?.teacher || `${subjectName} 담당`,
              room: detail?.room || `${grade}-${classNum}반`,
              isNeis: true,
              isEvent: detail?.isEvent || subjectName.includes('공휴일') || subjectName.includes('시험') || subjectName.includes('한글날'),
            };
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      schoolName: NEIS_CONFIG.SCHOOL_NAME,
      grade: parseInt(grade, 10),
      classNum: parseInt(classNum, 10),
      weekInfo: {
        mondayYmd: weekDays[0].ymd,
        fridayYmd: weekDays[4].ymd,
        label: weekLabel,
        weekOffset,
        days: weekDays.map((d) => ({
          key: d.key,
          ymd: d.ymd,
          displayDate: formatDateToDisplay(d.date),
          label: `${d.label} (${formatDateToDisplay(d.date)})`,
          isToday: d.ymd === formatDateToYMD(kstNow),
        })),
      },
      timetable: timetableData,
      isNeisLive: totalNeisRows > 0,
      neisFetchedCount: totalNeisRows,
    });
  } catch (error: any) {
    console.error('NEIS Timetable API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '시간표 조회 중 오류가 발생했습니다.',
        timetable: INITIAL_TIMETABLE,
        isNeisLive: false,
      },
      { status: 500 }
    );
  }
}
