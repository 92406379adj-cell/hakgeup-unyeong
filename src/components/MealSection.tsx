'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar,
  RotateCw,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

interface MealDetail {
  type: string;
  cal: string;
  cleanMenu: string[];
  rawMenu: string[];
  allergens: string[];
  ntr: string;
}

interface MealApiResponse {
  success: boolean;
  schoolName: string;
  date: string;
  lunch: MealDetail | null;
  dinner: MealDetail | null;
  error?: string;
}

// Fallback sample data for 2026-10-08 in case offline or network failure
const FALLBACK_MEALS: Record<string, { lunch: MealDetail; dinner: MealDetail }> = {
  '20261008': {
    lunch: {
      type: '중식',
      cal: '830.6 Kcal',
      cleanMenu: [
        '혼합잡곡밥',
        '바지락수제비국',
        '오향장육',
        '콩나물매운무침',
        '국물밀떡볶이/김말이',
        '배추김치',
        '방울토마토',
        '짜먹는요쿠르트',
      ],
      rawMenu: [
        '혼합잡곡밥 (5)',
        '바지락수제비국 (1.5.6.18)',
        '오향장육 (1.5.6.10.13.16.18)',
        '콩나물매운무침 (5)',
        '국물밀떡볶이/김말이 (1.5.6.13.16)',
        '배추김치 (9)',
        '방울토마토',
        '짜먹는요쿠르트 (2)',
      ],
      allergens: ['난류', '우유', '대두(콩)', '밀', '새우', '돼지고기', '아황산염', '조개류'],
      ntr: '탄수화물: 117.3g, 단백질: 51.2g, 지방: 16.7g',
    },
    dinner: {
      type: '석식',
      cal: '706.5 Kcal',
      cleanMenu: [
        '혼합잡곡밥',
        '꼬지어묵국',
        '수제치킨햄버거',
        '메추리알곤약조림',
        '열무된장초겉절이',
        '깍두기',
        '멜론',
        '포도쥬스',
      ],
      rawMenu: [
        '혼합잡곡밥 (5)',
        '꼬지어묵국 (1.5.6)',
        '수제치킨햄버거 (1.2.5.6.10.12.15.16)',
        '메추리알곤약조림 (1.5.6.13)',
        '열무된장초겉절이 (5.6.13)',
        '깍두기 (9)',
        '멜론',
        '포도쥬스 (13)',
      ],
      allergens: ['난류', '우유', '대두(콩)', '밀', '돼지고기', '토마토', '아황산염', '닭고기', '쇠고기'],
      ntr: '탄수화물: 102.8g, 단백질: 30.9g, 지방: 19.5g',
    },
  },
};

export const MealSection: React.FC = () => {
  // Current date state
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [activeTab, setActiveTab] = useState<'lunch' | 'dinner'>('lunch');
  const [mealData, setMealData] = useState<{ lunch: MealDetail | null; dinner: MealDetail | null }>({
    lunch: null,
    dinner: null,
  });
  const [loading, setLoading] = useState(false);
  const [showAllergens, setShowAllergens] = useState(false);
  const [copied, setCopied] = useState(false);

  // Set default tab to dinner if afternoon (after 13:30)
  useEffect(() => {
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    if (hour > 13 || (hour === 13 && minute >= 30)) {
      setActiveTab('dinner');
    } else {
      setActiveTab('lunch');
    }
  }, []);

  // Format date to YYYYMMDD
  const getYmd = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Fetch meal info from our /api/meal endpoint
  const fetchMeal = async (targetDate: Date) => {
    setLoading(true);
    const ymd = getYmd(targetDate);
    try {
      const res = await fetch(`/api/meal?date=${ymd}`);
      if (res.ok) {
        const json: MealApiResponse = await res.json();
        setMealData({
          lunch: json.lunch,
          dinner: json.dinner,
        });
      } else {
        // Fallback if available
        if (FALLBACK_MEALS[ymd]) {
          setMealData(FALLBACK_MEALS[ymd]);
        } else {
          setMealData({ lunch: null, dinner: null });
        }
      }
    } catch (e) {
      if (FALLBACK_MEALS[ymd]) {
        setMealData(FALLBACK_MEALS[ymd]);
      } else {
        setMealData({ lunch: null, dinner: null });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeal(currentDate);
  }, [currentDate]);

  // Navigate date
  const handlePrevDay = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return next;
    });
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isToday =
    currentDate.toDateString() === new Date().toDateString();

  const formattedDateStr = currentDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const activeMeal = activeTab === 'lunch' ? mealData.lunch : mealData.dinner;

  const handleCopyMenu = () => {
    if (!activeMeal || activeMeal.cleanMenu.length === 0) return;
    const text = `[순천복성고 ${formattedDateStr} ${activeTab === 'lunch' ? '점심(중식)' : '저녁(석식)'}]\n` +
      activeMeal.cleanMenu.join(', ') +
      ` (${activeMeal.cal || ''})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper food emoji matcher
  const getDishEmoji = (dish: string) => {
    if (dish.includes('밥') || dish.includes('볶음밥')) return '🍚';
    if (dish.includes('국') || dish.includes('찌개') || dish.includes('탕') || dish.includes('짬뽕')) return '🍲';
    if (dish.includes('고기') || dish.includes('육') || dish.includes('닭') || dish.includes('돈') || dish.includes('스테이크')) return '🍖';
    if (dish.includes('버거') || dish.includes('피자') || dish.includes('핫도그')) return '🍔';
    if (dish.includes('스파게티') || dish.includes('파스타') || dish.includes('면') || dish.includes('수제비')) return '🍝';
    if (dish.includes('샐러드') || dish.includes('나물') || dish.includes('겉절이') || dish.includes('무침')) return '🥗';
    if (dish.includes('김치') || dish.includes('깍두기')) return '🥬';
    if (dish.includes('주스') || dish.includes('쥬스') || dish.includes('우유') || dish.includes('요쿠르트')) return '🧃';
    if (dish.includes('사과') || dish.includes('토마토') || dish.includes('멜론') || dish.includes('과일') || dish.includes('포도')) return '🍎';
    if (dish.includes('떡볶이') || dish.includes('순대') || dish.includes('만두') || dish.includes('튀김') || dish.includes('전')) return '🍢';
    return '🍽️';
  };

  return (
    <div className="clay-card bg-white/80 dark:bg-slate-900/80 p-5 rounded-3xl transition-all duration-300 h-full flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                  순천복성고 급식 식단표
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> NEIS 실시간
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                교육부 전남교육청 나이스 공식 점심 & 석식
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchMeal(currentDate)}
            disabled={loading}
            title="나이스 최신 식단 새로고침"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-3">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="이전 날짜"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {formattedDateStr}
            </span>
            {isToday ? (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white">
                오늘
              </span>
            ) : (
              <button
                onClick={handleToday}
                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                오늘로
              </button>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="다음 날짜"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Meal Tabs: Lunch vs Dinner */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('lunch')}
            className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'lunch'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>점심 (중식)</span>
            {mealData.lunch?.cal && (
              <span className={`text-[10px] font-normal px-1.5 py-0.2 rounded-full ${activeTab === 'lunch' ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {mealData.lunch.cal.split(' ')[0]}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dinner')}
            className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'dinner'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>저녁 (석식)</span>
            {mealData.dinner?.cal && (
              <span className={`text-[10px] font-normal px-1.5 py-0.2 rounded-full ${activeTab === 'dinner' ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {mealData.dinner.cal.split(' ')[0]}
              </span>
            )}
          </button>
        </div>

        {/* Meal Content Body */}
        {loading ? (
          <div className="py-10 text-center text-slate-400 space-y-2">
            <RotateCw className="w-6 h-6 mx-auto animate-spin text-orange-500" />
            <p className="text-xs">나이스에서 식단을 불러오는 중...</p>
          </div>
        ) : activeMeal && activeMeal.cleanMenu.length > 0 ? (
          <div className="space-y-3">
            {/* Dish List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeMeal.cleanMenu.map((dish, idx) => {
                const isSignature =
                  dish.includes('버거') ||
                  dish.includes('고기') ||
                  dish.includes('육') ||
                  dish.includes('닭') ||
                  dish.includes('떡볶이') ||
                  dish.includes('파스타') ||
                  dish.includes('피자');

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSignature
                        ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800/60 text-slate-800 dark:text-orange-200 shadow-sm font-bold'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-sm">{getDishEmoji(dish)}</span>
                    <span className="flex-1 truncate">{dish}</span>
                    {isSignature && (
                      <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-orange-500 text-white">
                        인기
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calories & Nutrition Info Badge */}
            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>총 열량:</span>
                <span className="font-mono text-sm">{activeMeal.cal || '정보 없음'}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyMenu}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                title="식단 복사하기"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사됨!' : '식단 복사'}</span>
              </button>
            </div>

            {/* Allergen Information Details Toggle */}
            {activeMeal.allergens && activeMeal.allergens.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllergens(!showAllergens)}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  <span>{showAllergens ? '알레르기 정보 접기' : '알레르기 유발 식품 확인'}</span>
                </button>
                {showAllergens && (
                  <div className="mt-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap gap-1 animate-fadeIn">
                    {activeMeal.allergens.map((alg, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        {alg}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {activeTab === 'lunch' ? '등록된 점심(중식) 식단이 없습니다.' : '등록된 저녁(석식) 식단이 없습니다.'}
            </p>
            <p className="text-[11px] text-slate-400">
              주말, 공휴일 또는 나이스 식단 미등록일일 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span>🏫 순천복성고등학교 영양실</span>
        <span>출처: 나이스(NEIS) 교육정보개방</span>
      </div>
    </div>
  );
};
