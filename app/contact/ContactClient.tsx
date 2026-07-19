'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { BudouxText } from '@/components/ui/BudouxText';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

// https://web3forms.com で無料登録して取得したアクセスキーを .env.local に設定してください
// NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? '';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const CATEGORY_OPTIONS = [
  '記事内容の誤り・修正依頼',
  'レビュー・PR のご依頼',
  'サイトの不具合報告',
  '広告に関するお問い合わせ',
  'その他',
];

const TOPICS = [
  '記事内容の誤字脱字・情報の誤りについて',
  '製品レビュー・PR のご依頼',
  'サイトの表示崩れ・動作不具合の報告',
  '広告表示に関するお問い合わせ',
  'その他ご要望・ご意見',
];

export default function ContactClient() {
  const [state, setState] = useState<SubmitState>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!WEB3FORMS_ACCESS_KEY) {
      setState('error');
      return;
    }
    setState('submitting');
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', '【ざっくらぼ】お問い合わせ');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setState('success');
        form.reset();
      } else {
        console.error('Web3Forms submission rejected:', json);
        setState('error');
      }
    } catch (err) {
      console.error('Web3Forms submission failed:', err);
      setState('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <div className="space-y-16">

        {/* Header */}
        <ScrollReveal className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Mail size={16} />
            <span>Contact</span>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 leading-tight">
            お問い合わせ
          </h1>
          <BudouxText as="p" className="text-muted-foreground leading-relaxed text-pretty max-w-md mx-auto">
            記事内容の誤り・レビュー依頼・不具合報告などがございましたら、下記フォームよりお気軽にご連絡ください。内容を確認の上、可能な範囲で対応いたします。
          </BudouxText>
        </ScrollReveal>

        {/* Form */}
        <ScrollReveal delay={0.1}>
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8">
            {state === 'success' ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 size={32} className="text-primary" />
                <p className="text-sm font-medium text-foreground">
                  送信が完了しました。お問い合わせありがとうございます。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Honeypot（スパム対策・非表示） */}
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-muted-foreground mb-1.5">
                    お名前
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="例）山田太郎"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border/50 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-muted-foreground mb-1.5">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="reply@example.com"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border/50 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-xs font-medium text-muted-foreground mb-1.5">
                    お問い合わせ種別
                  </label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={CATEGORY_OPTIONS[0]}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border/50 focus:outline-none focus:border-primary transition-colors"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-muted-foreground mb-1.5">
                    お問い合わせ内容
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="内容をできるだけ詳しくご記入ください"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border/50 focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {state === 'error' && (
                  <p className="text-xs text-red-500">
                    {WEB3FORMS_ACCESS_KEY
                      ? '送信に失敗しました。時間をおいて再度お試しください。'
                      : '現在フォームの準備中です。時間をおいて再度お試しください。'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === 'submitting'}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Send size={16} />
                  {state === 'submitting' ? '送信中…' : '送信する'}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>

        {/* Topics */}
        <ScrollReveal delay={0.2}>
          <h2 className="text-sm font-semibold text-foreground mb-3">よくあるお問い合わせ内容</h2>
          <ul className="flex flex-col gap-2">
            {TOPICS.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                <span className="text-primary">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        {/* Note */}
        <ScrollReveal delay={0.3}>
          <p className="text-xs text-muted-foreground leading-relaxed">
            いただいたお問い合わせ内容は、返信対応の目的にのみ使用します。詳しくは「プライバシーポリシー」をご確認ください。
          </p>
          <Link href="/privacy-policy" className="inline-block mt-2 text-sm font-medium text-primary hover:underline">
            プライバシーポリシーを見る →
          </Link>
        </ScrollReveal>

      </div>
    </div>
  );
}
