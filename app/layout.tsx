import type { Metadata } from 'next';
import './globals.css';
import { Outfit } from 'next/font/google';
import localFont from 'next/font/local';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const keifont = localFont({ src: './fonts/keifont.ttf', variable: '--font-keifont' });

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'ざっくらぼ',
    template: '%s | ざっくらぼ',
  },
  description: 'The best gadget reviews and tech news.',
  openGraph: {
    title: 'ざっくらぼ',
    description: 'The best gadget reviews and tech news.',
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
    description: 'The best gadget reviews and tech news.',
    creator: '@xyzack271', // Assuming the twitter handle from previous context or generic
    images: ['/images/main/skyblue.png'],
  },
  icons: {
    icon: '/images/main/logo.svg',
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
        <link href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP:wght@100..900&display=swap" rel="stylesheet" />
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
