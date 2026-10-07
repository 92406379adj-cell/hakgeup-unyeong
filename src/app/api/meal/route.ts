import { NextResponse } from 'next/server';

// NEIS School Meal API Configuration for Suncheon Bokseong High School
const NEIS_CONFIG = {
  ATPT_OFCDC_SC_CODE: 'Q10', // 전라남도교육청
  SD_SCHUL_CODE: '7140281', // 순천복성고등학교
  SCHOOL_NAME: '순천복성고등학교',
};

// Allergen map based on Korea Ministry of Education standard
const ALLERGEN_MAP: Record<string, string> = {
  '1': '난류(계란)',
  '2': '우유',
  '3': '메밀',
  '4': '땅콩',
  '5': '대두(콩)',
  '6': '밀',
  '7': '고등어',
  '8': '게',
  '9': '새우',
  '10': '돼지고기',
  '11': '복숭아',
  '12': '토마토',
  '13': '아황산염',
  '14': '호두',
  '15': '닭고기',
  '16': '쇠고기',
  '17': '오징어',
  '18': '조개류(굴, 전복, 홍합 포함)',
  '19': '잣',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get target date (default to today in Korea KST timezone)
    let ymd = searchParams.get('date');
    if (!ymd || ymd.length !== 8) {
      const now = new Date();
      // Adjust to KST (UTC+9)
      const kstOffset = 9 * 60; // in minutes
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const kstDate = new Date(utc + kstOffset * 60000);

      const year = kstDate.getFullYear();
      const month = String(kstDate.getMonth() + 1).padStart(2, '0');
      const day = String(kstDate.getDate()).padStart(2, '0');
      ymd = `${year}${month}${day}`;
    }

    const neisUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=${NEIS_CONFIG.ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${NEIS_CONFIG.SD_SCHUL_CODE}&MLSV_YMD=${ymd}`;

    const res = await fetch(neisUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour on server
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'NEIS API request failed', date: ymd },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rows: any[] = data?.mealServiceDietInfo?.[1]?.row || [];

    // Parse meal types: 2 = 중식(점심), 3 = 석식(저녁), 1 = 조식(아침)
    let lunchRow = rows.find((r) => r.MMEAL_SC_CODE === '2');
    let dinnerRow = rows.find((r) => r.MMEAL_SC_CODE === '3');

    const parseDish = (rawStr?: string) => {
      if (!rawStr) return { cleanMenu: [], rawMenu: [], allergens: [] };
      const rawLines = rawStr
        .split(/<br\s*\/?>|\n/)
        .map((s) => s.trim())
        .filter(Boolean);

      const cleanMenu: string[] = [];
      const allergensFound = new Set<string>();

      rawLines.forEach((line) => {
        // Find allergens in parentheses e.g. (1.5.6.13)
        const match = line.match(/\(([\d\.]+)\)/);
        if (match) {
          const nums = match[1].split('.').filter(Boolean);
          nums.forEach((n) => {
            if (ALLERGEN_MAP[n]) {
              allergensFound.add(ALLERGEN_MAP[n]);
            }
          });
        }
        // Clean dish name
        const cleanName = line.replace(/\([\d\.]+\)/g, '').trim();
        if (cleanName) {
          cleanMenu.push(cleanName);
        }
      });

      return {
        cleanMenu,
        rawMenu: rawLines,
        allergens: Array.from(allergensFound),
      };
    };

    const lunchData = lunchRow
      ? {
          type: '중식',
          cal: lunchRow.CAL_INFO || '',
          ...parseDish(lunchRow.DDISH_NM),
          ntr: lunchRow.NTR_INFO?.replace(/<br\s*\/?>/g, ', ') || '',
        }
      : null;

    const dinnerData = dinnerRow
      ? {
          type: '석식',
          cal: dinnerRow.CAL_INFO || '',
          ...parseDish(dinnerRow.DDISH_NM),
          ntr: dinnerRow.NTR_INFO?.replace(/<br\s*\/?>/g, ', ') || '',
        }
      : null;

    return NextResponse.json({
      success: true,
      schoolName: NEIS_CONFIG.SCHOOL_NAME,
      date: ymd,
      lunch: lunchData,
      dinner: dinnerData,
    });
  } catch (error: any) {
    console.error('NEIS meal API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch meal info' },
      { status: 500 }
    );
  }
}
