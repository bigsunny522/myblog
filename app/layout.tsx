import type { Metadata } from 'next';
import './globals.css';
import { Outfit } from 'next/font/google';
import localFont from 'next/font/local';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const keifont = localFont({ src: './fonts/keifont.ttf', variable: '--font-keifont' });

import { getBaseUrl } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'ざっくらぼ',
    template: '%s | ざっくらぼ',
  },
  description: 'デスクも、持ち歩きも、使い心地で選ぶ。ガジェットの実体験と、AI・プログラミングで日常を快適にする工夫を紹介します。',
  openGraph: {
    title: 'ざっくらぼ',
    description: 'デスクも、持ち歩きも、使い心地で選ぶ。ガジェットの実体験と、AI・プログラミングで日常を快適にする工夫を紹介します。',
    url: '/',
    siteName: 'ざっくらぼ',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/images/main/skyblue.png',
        width: 1200,
        height: 630,
        alt: 'ざっくらぼ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ざっくらぼ',
    description: 'デスクも、持ち歩きも、使い心地で選ぶ。ガジェットの実体験と、AI・プログラミングで日常を快適にする工夫を紹介します。',
    creator: '@xyzack271',
    images: ['/images/main/skyblue.png'],
  },
  icons: {
    icon: [
      { url: '/images/main/logo.svg', type: 'image/svg+xml' },
      { url: '/images/main/skyblue.png', type: 'image/png' },
    ],
    apple: '/images/main/skyblue.png',
    shortcut: '/images/main/logo.svg',
  },
};

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GlobalUIController } from '@/components/GlobalUIController';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP:wght@300;400;700&display=swap" rel="stylesheet" />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6628382645135412"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${outfit.variable} ${keifont.variable} antialiased min-h-screen flex flex-col font-line`} suppressHydrationWarning>
        <GoogleAnalytics />
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
