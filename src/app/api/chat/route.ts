import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [], posts = [], timetable = [], classSettings } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: '질문 메시지를 입력해주세요.' }, { status: 400 });
    }

    const apiKey =
      process.env.OPENAI_API_KEY ||
      process.env.CHATGPT_APIKEY ||
      process.env.GPT_API_KEY;

    // 1. Build context from current posts and timetable
    const grade = classSettings?.grade || 3;
    const classNum = classSettings?.classNum || 7;

    const postsContext = posts.length > 0
      ? posts
          .map(
            (p: any, i: number) =>
              `[공지 ${i + 1}] 분류: ${p.category || '일반'}, 제목: ${p.title}, 작성자: ${p.author}, 등록일시: ${p.created_at}\n내용: ${p.content}`
          )
          .join('\n\n')
      : '현재 등록된 공지사항이 없습니다.';

    // Fetch today's meal info from NEIS to include in AI system prompt context
    let mealContext = '';
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const ymd = `${year}${month}${day}`;
      const neisRes = await fetch(
        `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=Q10&SD_SCHUL_CODE=7140281&MLSV_YMD=${ymd}`,
        { next: { revalidate: 3600 } }
      );
      const neisJson = await neisRes.json();
      const rows = neisJson?.mealServiceDietInfo?.[1]?.row || [];
      const lunch = rows.find((r: any) => r.MMEAL_SC_CODE === '2');
      const dinner = rows.find((r: any) => r.MMEAL_SC_CODE === '3');
      mealContext = `[순천복성고 오늘의 급식 (${month}월 ${day}일)]\n- 점심(중식): ${lunch ? lunch.DDISH_NM.replace(/<br\s*\/?>/g, ', ').replace(/\([\d\.]+\)/g, '') + ' (' + lunch.CAL_INFO + ')' : '등록된 식단 없음'}\n- 저녁(석식): ${dinner ? dinner.DDISH_NM.replace(/<br\s*\/?>/g, ', ').replace(/\([\d\.]+\)/g, '') + ' (' + dinner.CAL_INFO + ')' : '등록된 식단 없음'}`;
    } catch (e) {}

    // Build real-time timetable context
    let timetableContext = '';
    if (Array.isArray(timetable) && timetable.length > 0) {
      const dayNames = [
        { key: 'monday', name: '월요일' },
        { key: 'tuesday', name: '화요일' },
        { key: 'wednesday', name: '수요일' },
        { key: 'thursday', name: '목요일' },
        { key: 'friday', name: '금요일' },
      ];
      timetableContext = dayNames
        .map(({ key, name }) => {
          const dayPeriods = timetable
            .map((item: any) => {
              const slot = item[key];
              return slot?.subject ? `${item.period}교시: ${slot.subject}${slot.teacher ? ' (' + slot.teacher + ')' : ''}` : null;
            })
            .filter(Boolean)
            .join(', ');
          return `* ${name}: ${dayPeriods || '수업 없음'}`;
        })
        .join('\n');
    }

    const systemPrompt = `당신은 ${grade}학년 ${classNum}반의 친절하고 똑똑한 '학급 AI 알리미'입니다.
학생들이 학급 공지사항, 학사일정, 수행평가 과제/마감일, 축제 및 학급 행사, 시간표(과목/교시/선생님), 순천복성고등학교 오늘 급식(점심/저녁) 등에 대해 질문하면 아래에 제공된 [우리 반 실시간 공지사항 및 학급 데이터]를 바탕으로 정확하고 친절하게 답변해주세요.

[답변 원칙]
1. 학생들에게 친절하고 따뜻한 어조(존댓말)와 귀여운 이모지를 적절히 사용하여 답변해주세요.
2. 공지사항, 시간표, 급식 정보에 적힌 날짜, 메뉴, 마감 시간, 교시별 과목, 유의사항 등의 핵심 정보를 명확히 강조해주세요.
3. 만약 공지사항이나 학급 데이터에 없는 내용이라면 거짓으로 지어내지 말고, "현재 등록된 학급 공지사항이나 시간표에는 해당 내용이 없습니다. 담임선생님이나 반장에게 확인해 주세요!"라고 정직하게 안내해주세요.
4. 답변은 간결하고 가독성 좋게 글머리 기호(불릿 포인트) 등을 활용해 작성해주세요.

[우리 반 실시간 공지사항 목록]
${postsContext}

[순천복성고등학교 ${grade}학년 ${classNum}반 실시간 주간 시간표 (나이스 NEIS 연동)]
${timetableContext || '등록된 시간표 정보 없음'}

[순천복성고등학교 오늘자 실시간 급식 식단표]
${mealContext || '급식 데이터 없음'}

[학급 기본 정보]
- 학교명: 순천복성고등학교
- 학년/반: ${grade}학년 ${classNum}반
- 담임교사: ${classSettings?.teacherName || '담임선생님'}
`;

    // 2. If OpenAI API Key is present, call OpenAI API
    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map((h: any) => ({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: h.content,
          })),
          { role: 'user', content: message },
        ];

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.5,
            max_tokens: 600,
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply, source: 'openai' });
          }
        } else {
          const errBody = await openAiRes.text();
          console.warn('OpenAI API returned non-200:', errBody);
        }
      } catch (err: any) {
        console.warn('OpenAI fetch error, falling back:', err.message);
      }
    }

    // 3. Fallback Response Generator based on keyword matching
    let matchedPost = null;
    const lowerQ = message.toLowerCase();

    // Check meal question
    if (
      lowerQ.includes('급식') ||
      lowerQ.includes('점심') ||
      lowerQ.includes('중식') ||
      lowerQ.includes('저녁') ||
      lowerQ.includes('석식') ||
      lowerQ.includes('식단') ||
      lowerQ.includes('밥') ||
      lowerQ.includes('메뉴')
    ) {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const ymd = `${year}${month}${day}`;

        const neisRes = await fetch(
          `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=Q10&SD_SCHUL_CODE=7140281&MLSV_YMD=${ymd}`,
          { next: { revalidate: 3600 } }
        );
        const neisJson = await neisRes.json();
        const rows = neisJson?.mealServiceDietInfo?.[1]?.row || [];

        const lunch = rows.find((r: any) => r.MMEAL_SC_CODE === '2');
        const dinner = rows.find((r: any) => r.MMEAL_SC_CODE === '3');

        let reply = `🍱 **순천복성고 오늘의 급식 안내** (${month}월 ${day}일)\n\n`;
        if (lunch) {
          const dishes = lunch.DDISH_NM.replace(/<br\s*\/?>/g, ', ').replace(/\([\d\.]+\)/g, '').trim();
          reply += `☀️ **점심(중식)** [${lunch.CAL_INFO || ''}]\n• ${dishes}\n\n`;
        } else {
          reply += `☀️ **점심(중식)**: 등록된 식단이 없습니다.\n\n`;
        }

        if (dinner) {
          const dishes = dinner.DDISH_NM.replace(/<br\s*\/?>/g, ', ').replace(/\([\d\.]+\)/g, '').trim();
          reply += `🌙 **저녁(석식)** [${dinner.CAL_INFO || ''}]\n• ${dishes}\n\n`;
        } else {
          reply += `🌙 **저녁(석식)**: 등록된 식단이 없습니다.\n\n`;
        }

        reply += `맛있게 드시고 오늘도 즐겁고 활기찬 하루 보내세요! 😋`;
        return NextResponse.json({ reply, source: 'neis_meal' });
      } catch (e) {
        // Continue to posts matching
      }
    }

    for (const post of posts) {
      const titleLower = (post.title || '').toLowerCase();
      const contentLower = (post.content || '').toLowerCase();
      const catLower = (post.category || '').toLowerCase();

      if (
        (lowerQ.includes('중간고사') || lowerQ.includes('시험')) &&
        (titleLower.includes('시험') || contentLower.includes('시험') || titleLower.includes('중간고사'))
      ) {
        matchedPost = post;
        break;
      }
      if (
        (lowerQ.includes('과학') || lowerQ.includes('보고서') || lowerQ.includes('수행평가')) &&
        (titleLower.includes('과학') || contentLower.includes('보고서'))
      ) {
        matchedPost = post;
        break;
      }
      if (
        (lowerQ.includes('부스') || lowerQ.includes('축제') || lowerQ.includes('투표')) &&
        (titleLower.includes('부스') || contentLower.includes('투표'))
      ) {
        matchedPost = post;
        break;
      }
      if (
        (lowerQ.includes('청소') || lowerQ.includes('분리수거')) &&
        (titleLower.includes('청소') || contentLower.includes('청소'))
      ) {
        matchedPost = post;
        break;
      }
    }

    if (matchedPost) {
      return NextResponse.json({
        reply: `📢 **[${matchedPost.title}]** 관련 안내입니다!\n\n${matchedPost.content}\n\n• 작성자: ${matchedPost.author}\n• 등록일시: ${matchedPost.created_at}\n\n더 궁금한 점이 있으면 언제든 물어보세요! 😊`,
        source: 'local_search',
      });
    }

    return NextResponse.json({
      reply: `안녕하세요! ${grade}학년 ${classNum}반 학급 AI 알리미입니다. 🤖\n\n질문해주신 **"${message}"**에 대한 내용은 현재 등록된 공지사항에서 직접 확인되지 않았습니다.\n\n중간고사 일정, 수행평가 마감, 축제 부스 투표 등 게시판에 올라온 내용에 대해 물어보시면 자세히 답변해 드릴 수 있어요!\n상세한 사항은 담임선생님(${classSettings?.teacherName || '선생님'}) 또는 반장에게 문의해 주세요. ✨`,
      source: 'local_search',
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: '답변을 생성하는 도중 오류가 발생했습니다: ' + error.message },
      { status: 500 }
    );
  }
}
