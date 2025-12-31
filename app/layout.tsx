import type { Metadata } from 'next';
import './globals.css';
import { Outfit } from 'next/font/google';
import localFont from 'next/font/local';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const keifont = localFont({ src: './fonts/keifont.ttf', variable: '--font-keifont' });

export const metadata: Metadata = {
  title: 'ざっくらぼ',
  description: 'The best gadget reviews and tech news.',
};

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GlobalUIController } from '@/components/GlobalUIController';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="stylesheet" href="https://seed-cdn.line-scdn.net/seed/css/LineSeed.css" />
      </head>
      <body className={`${outfit.variable} ${keifont.variable} antialiased min-h-screen flex flex-col font-line`} suppressHydrationWarning>
        <GlobalUIController />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
