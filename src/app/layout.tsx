import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '학급운영 | 고등학교 학급 대시보드 & 생산성 도구',
  description: '클레이모피즘과 벤토 그리드로 디자인된 고등학교 학급운영 올인원 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f0f4f9] dark:bg-[#0c1222] transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
