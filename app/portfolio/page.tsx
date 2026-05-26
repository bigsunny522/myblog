import React from 'react';
import type { Metadata } from 'next';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import {
  Layers, Code2, Palette, Zap, Database, FileText, Server,
  Box, Globe, Cpu, ExternalLink, Mail, Twitter,
  Layout, Image, ChevronRight, Pencil, Terminal, Gamepad2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Portfolio | ざっくらぼ',
  description: 'フロントエンド開発を中心とした個人開発者のポートフォリオ。Next.js・React・TypeScript を使った Web アプリ開発が得意です。',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

// ────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────

const skillGroups = [
  {
    category: '言語',
    color: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    dot: 'bg-blue-400',
    items: ['TypeScript', 'JavaScript', 'HTML / CSS', 'Python'],
  },
  {
    category: 'フレームワーク',
    color: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    dot: 'bg-sky-400',
    items: ['Next.js (App Router)', 'React 19'],
  },
  {
    category: 'スタイリング',
    color: 'bg-teal-400/10 text-teal-400 border-teal-400/20',
    dot: 'bg-teal-400',
    items: ['Tailwind CSS v4', 'Framer Motion'],
  },
  {
    category: 'データ / BaaS',
    color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    dot: 'bg-emerald-400',
    items: ['Supabase (PostgreSQL)', 'Zustand'],
  },
  {
    category: 'コンテンツ / CMS',
    color: 'bg-fuchsia-400/10 text-fuchsia-400 border-fuchsia-400/20',
    dot: 'bg-fuchsia-400',
    items: ['MDX', 'TinaCMS', 'Shiki'],
  },
  {
    category: 'インフラ / ツール',
    color: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    dot: 'bg-orange-400',
    items: ['Cloudflare Pages', 'Git / GitHub', 'sharp'],
  },
  {
    category: 'デザイン系',
    color: 'bg-pink-400/10 text-pink-400 border-pink-400/20',
    dot: 'bg-pink-400',
    items: ['Illustrator', 'Photoshop', 'Lightroom', 'Affinity', 'Canva', 'Figma'],
  },
  {
    category: '映像系',
    color: 'bg-red-400/10 text-red-400 border-red-400/20',
    dot: 'bg-red-400',
    items: ['Premiere Pro', 'DaVinci Resolve'],
  },
];

const works = [
  {
    title: 'ざっくらぼ',
    subtitle: 'パーソナルテックブログ',
    desc: 'ターミナルテーマのパーソナルブログ。ゲームレビュー・ガジェット・開発メモを発信。Next.js App Router + MDX + TinaCMS による静的生成とブラウザ上での記事編集を両立。カスタムダッシュボード（11 種ウィジェット）や対話型 404 ターミナルなど独自機能を実装。',
    url: 'https://xyzack271.com',
    github: 'https://github.com/bigsunny0522',
    tech: ['Next.js 16', 'MDX', 'TinaCMS', 'Tailwind CSS v4', 'Framer Motion', 'Supabase'],
    icon: <Terminal size={24} />,
    iconColor: 'text-primary bg-primary/10',
    accentFrom: 'from-primary/20',
    accentTo: 'to-purple-500/10',
  },
  {
    title: '音骸シミュレーター',
    subtitle: '鳴潮（Wuthering Waves）ゲームツール',
    desc: '鳴潮（Wuthering Waves）プレイヤー向けの音骸ビルドシミュレーター。キャラクターに装備する音骸の組み合わせをシミュレーション・比較できる Web ツール。スマートフォンでも快適に操作できるレスポンシブ設計。',
    url: 'https://wuwaechosimu.xyzack271.com',
    github: null,
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    icon: <Gamepad2 size={24} />,
    iconColor: 'text-amber-400 bg-amber-400/10',
    accentFrom: 'from-amber-500/20',
    accentTo: 'to-orange-500/10',
  },
];

const commonTechStack = [
  {
    name: 'Next.js 16',
    role: 'フレームワーク',
    desc: 'App Router・SSG・React Server Components を活用した静的エクスポート構成。',
    icon: <Layers size={22} />,
    color: 'text-foreground bg-foreground/10',
  },
  {
    name: 'React 19',
    role: 'UI ライブラリ',
    desc: 'React Compiler（Babel）を導入し、自動メモ化による最適化を実現。',
    icon: <Cpu size={22} />,
    color: 'text-sky-400 bg-sky-400/10',
  },
  {
    name: 'TypeScript 5',
    role: '型システム',
    desc: 'Strict モード・インクリメンタルビルドでコード品質と開発体験を向上。',
    icon: <Code2 size={22} />,
    color: 'text-blue-400 bg-blue-400/10',
  },
  {
    name: 'Tailwind CSS v4',
    role: 'スタイリング',
    desc: 'PostCSS プラグイン経由で導入。CSS 変数によるダークモード対応テーマを構築。LiftKit デザイントークンを全コンポーネントに統一適用。',
    icon: <Palette size={22} />,
    color: 'text-teal-400 bg-teal-400/10',
  },
  {
    name: 'Framer Motion',
    role: 'アニメーション',
    desc: 'スクロール連動の ScrollReveal・3D チルトカード・ページトランジションをブログ・アプリ両方で活用。',
    icon: <Zap size={22} />,
    color: 'text-purple-400 bg-purple-400/10',
  },
  {
    name: 'Cloudflare Pages',
    role: 'ホスティング',
    desc: '静的エクスポートを Cloudflare Pages でホスティング。CI/CD パイプラインと環境変数管理を含む。',
    icon: <Server size={22} />,
    color: 'text-orange-500 bg-orange-500/10',
  },
];

const blogTechStack = [
  {
    name: 'MDX + Shiki',
    role: 'コンテンツ',
    desc: 'next-mdx-remote でサーバーサイドレンダリング。Shiki によるシンタックスハイライト。',
    icon: <FileText size={22} />,
    color: 'text-orange-400 bg-orange-400/10',
  },
  {
    name: 'TinaCMS',
    role: 'ビジュアル CMS',
    desc: 'Git ベースのヘッドレス CMS。静的エクスポート構成のまま iPad・外出先からブラウザ上で記事編集が可能。カスタムコンポーネントを Rich Text テンプレートとして登録。',
    icon: <Pencil size={22} />,
    color: 'text-fuchsia-400 bg-fuchsia-400/10',
  },
  {
    name: 'sharp / next-image-export-optimizer',
    role: '画像最適化',
    desc: 'WebP 変換・ブラープレースホルダー生成を静的エクスポートに対応した形で実装。',
    icon: <Image size={22} />,
    color: 'text-rose-400 bg-rose-400/10',
  },
];

const appTechStack = [
  {
    name: 'Zustand',
    role: '状態管理',
    desc: 'ダッシュボードレイアウト・ウィジェット設定・UI 状態を管理。localStorage への永続化も実装。',
    icon: <Box size={22} />,
    color: 'text-pink-400 bg-pink-400/10',
  },
  {
    name: 'react-grid-layout',
    role: 'ドラッグ&ドロップ',
    desc: 'ドラッグ＆ドロップで並べ替え・リサイズ可能な 11 種類のウィジェットレイアウトを実装。',
    icon: <Layout size={22} />,
    color: 'text-indigo-400 bg-indigo-400/10',
  },
  {
    name: 'Supabase',
    role: 'BaaS',
    desc: 'PostgreSQL ベースの BaaS をクライアント連携。閲覧数カウンターなどの動的機能に活用。',
    icon: <Database size={22} />,
    color: 'text-emerald-400 bg-emerald-400/10',
  },
];

const architectureItems = [
  { label: 'レンダリング戦略', value: 'SSG（静的エクスポート）+ React Server Components' },
  { label: 'コンテンツ取得', value: 'MDX ファイル + TinaCMS（Git ベース）→ 静的 HTML 生成' },
  { label: '状態管理', value: 'Zustand（ダッシュボード / UI）+ localStorage 永続化' },
  { label: '画像パイプライン', value: 'sharp WebP 変換 → ブラー Placeholder 生成' },
  { label: 'スタイリング設計', value: 'CSS 変数によるテーマ + Tailwind v4 + LiftKit デザインシステム' },
  { label: 'フォント', value: 'Outfit（見出し）/ LINE Seed JP（本文）/ keifont（ターミナル演出）' },
];

// ────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      <div className="space-y-24">

        {/* ── Hero ── */}
        <ScrollReveal className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
            <Globe size={14} />
            Personal Developer Portfolio
          </div>
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-purple-400 leading-tight pb-1">
            ざっくらぼ
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            フロントエンド開発を中心とした個人開発者。Next.js・React・TypeScript を主軸に、ブログシステムからゲーム向け Web ツールまで複数のプロダクトを設計・開発・運用しています。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="https://xyzack271.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Globe size={16} />
              サイトを見る
              <ExternalLink size={14} />
            </a>
            <a
              href="https://github.com/bigsunny0522"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full font-medium text-sm hover:border-primary/50 transition-colors"
            >
              GitHub
              <ExternalLink size={14} />
            </a>
          </div>
        </ScrollReveal>

        {/* ── Skills ── */}
        <section className="space-y-8">
          <ScrollReveal direction="left">
            <SectionTitle>Skills</SectionTitle>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillGroups.map((group, i) => (
              <ScrollReveal key={group.category} delay={Math.min(i * 0.06, 0.3)}>
                <div className="h-full p-5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/30 transition-colors duration-300">
                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mb-3 ${group.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${group.dot}`} />
                    {group.category}
                  </div>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight size={12} className="text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Works ── */}
        <section className="space-y-8">
          <ScrollReveal direction="right">
            <SectionTitle>Works</SectionTitle>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {works.map((work, i) => (
              <ScrollReveal key={work.title} delay={i * 0.1} className="h-full">
                <TiltCard>
                  <div className={`h-full bg-gradient-to-br ${work.accentFrom} ${work.accentTo} border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg flex flex-col gap-4 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="relative z-10 flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${work.iconColor}`}>
                        {work.icon}
                      </div>
                      <div>
                        <h3 className="font-bold font-outfit text-lg leading-tight">{work.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{work.subtitle}</p>
                      </div>
                    </div>
                    <p className="relative z-10 text-sm text-muted-foreground leading-relaxed flex-1">
                      {work.desc}
                    </p>
                    <div className="relative z-10 flex flex-wrap gap-1.5">
                      {work.tech.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 bg-background/50 border border-border/50 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="relative z-10 flex items-center gap-3 pt-1 border-t border-white/10">
                      <a
                        href={work.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <Globe size={12} />
                        サイトを見る
                        <ExternalLink size={11} />
                      </a>
                      {work.github && (
                        <a
                          href={work.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          GitHub
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="space-y-10">
          <ScrollReveal direction="left">
            <SectionTitle>Tech Stack</SectionTitle>
          </ScrollReveal>

          {/* 共通 */}
          <div className="space-y-4">
            <ScrollReveal delay={0.05}>
              <SubSectionLabel>共通（フレームワーク・インフラ）</SubSectionLabel>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonTechStack.map((tech, i) => (
                <ScrollReveal key={tech.name} delay={Math.min(i * 0.05, 0.3)} className="h-full">
                  <TechCard tech={tech} />
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* ブログ */}
          <div className="space-y-4">
            <ScrollReveal delay={0.05}>
              <SubSectionLabel>ざっくらぼ — ブログ・コンテンツ</SubSectionLabel>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {blogTechStack.map((tech, i) => (
                <ScrollReveal key={tech.name} delay={Math.min(i * 0.05, 0.2)} className="h-full">
                  <TechCard tech={tech} />
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* アプリ */}
          <div className="space-y-4">
            <ScrollReveal delay={0.05}>
              <SubSectionLabel>ざっくらぼ — アプリ・ダッシュボード</SubSectionLabel>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {appTechStack.map((tech, i) => (
                <ScrollReveal key={tech.name} delay={Math.min(i * 0.05, 0.2)} className="h-full">
                  <TechCard tech={tech} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Architecture ── */}
        <section className="space-y-8">
          <ScrollReveal direction="right">
            <SectionTitle>Architecture</SectionTitle>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <dl className="grid grid-cols-1 gap-3">
              {architectureItems.map((item) => (
                <div key={item.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-5 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
                  <dt className="text-xs font-semibold text-muted-foreground shrink-0 sm:w-44">{item.label}</dt>
                  <dd className="font-medium text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>
        </section>

        {/* ── Contact ── */}
        <section className="space-y-8">
          <ScrollReveal direction="up">
            <SectionTitle>Contact</SectionTitle>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="text-center space-y-6">
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              ご質問・採用のご連絡はこちらまでお気軽にどうぞ。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://x.com/xyzack271"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto"
              >
                <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                  <Twitter size={22} />
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">X (Twitter) DM</div>
                  <div className="font-bold font-outfit">@xyzack271</div>
                </div>
                <ExternalLink size={15} className="ml-auto text-muted-foreground" />
              </a>
              <a
                href="mailto:xyzack271@gmail.com"
                className="flex items-center gap-3 px-6 py-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto"
              >
                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                  <Mail size={22} />
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-bold font-outfit">xyzack271@gmail.com</div>
                </div>
                <ExternalLink size={15} className="ml-auto text-muted-foreground" />
              </a>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px bg-gradient-to-r from-transparent to-primary/50 flex-1" />
      <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold font-outfit shrink-0">{children}</h2>
      <div className="h-px bg-gradient-to-l from-transparent to-primary/50 flex-1" />
    </div>
  );
}

function SubSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
      <span className="inline-block w-4 h-px bg-primary/50" />
      {children}
    </p>
  );
}

function TechCard({ tech }: { tech: { name: string; role: string; desc: string; icon: React.ReactNode; color: string } }) {
  return (
    <div className="h-full p-5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/40 transition-colors duration-300 group">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tech.color}`}>
          {tech.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold font-outfit text-sm leading-tight">{tech.name}</span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded-full shrink-0">{tech.role}</span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">{tech.desc}</p>
        </div>
      </div>
    </div>
  );
}
