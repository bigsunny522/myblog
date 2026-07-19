import type { Metadata } from 'next';
import ContactClient from './ContactClient';
import { getBaseUrl } from '@/lib/utils';

const siteImage = `${getBaseUrl()}/images/main/skyblue.png`;

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'ざっくらぼへのお問い合わせはこちらから。記事内容の誤り・レビュー依頼・不具合報告などお気軽にご連絡ください。',
  openGraph: {
    title: 'お問い合わせ | ざっくらぼ',
    description: 'ざっくらぼへのお問い合わせはこちらから。記事内容の誤り・レビュー依頼・不具合報告などお気軽にご連絡ください。',
    url: '/contact',
    siteName: 'ざっくらぼ',
    type: 'website',
    images: [{ url: siteImage, width: 1200, height: 630, alt: 'ざっくらぼ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'お問い合わせ | ざっくらぼ',
    description: 'ざっくらぼへのお問い合わせはこちらから。',
    images: [siteImage],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
