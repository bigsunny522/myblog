import React from 'react';
import type { Metadata } from 'next';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import {
  Layers, Code2, Palette, Zap, Database, FileText, Server,
  Box, Globe, BookOpen, Cpu, ExternalLink, Mail, Twitter,
  GitBranch, Layout, Sparkles, Shield, Image, Package,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Portfolio | ざっくらぼ',
  description: 'ざっくらぼ（Zack Lab）の技術構成・実装内容のポートフォリオページです。',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

// ────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────

const techStack = [
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
    desc: 'PostCSS プラグイン経由で導入。CSS 変数によるダークモード対応テーマを構築。',
    icon: <Palette size={22} />,
    color: 'text-teal-400 bg-teal-400/10',
  },
  {
    name: 'Framer Motion',
    role: 'アニメーション',
    desc: 'スクロール連動アニメーション・3D チルトカード・ページトランジションを実装。',
    icon: <Zap size={22} />,
    color: 'text-purple-400 bg-purple-400/10',
  },
  {
    name: 'Notion API',
    role: 'CMS',
    desc: 'Notion データベースをヘッドレス CMS として活用。ブロックを JSX に変換する独自パーサーを実装。',
    icon: <BookOpen size={22} />,
    color: 'text-amber-400 bg-amber-400/10',
  },
  {
    name: 'MDX + Shiki',
    role: 'コンテンツ',
    desc: 'next-mdx-remote でサーバーサイドレンダリング。Shiki によるシンタックスハイライト。',
    icon: <FileText size={22} />,
    color: 'text-orange-400 bg-orange-400/10',
  },
  {
    name: 'Zustand',
    role: '状態管理',
    desc: 'ダッシュボードレイアウト・UI 状態を管理。localStorage への永続化も実装。',
    icon: <Box size={22} />,
    color: 'text-pink-400 bg-pink-400/10',
  },
  {
    name: 'Supabase',
    role: 'BaaS',
    desc: 'PostgreSQL ベースの BaaS をクライアント連携。将来的な機能拡張を見据えた構成。',
    icon: <Database size={22} />,
    color: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    name: 'react-grid-layout',
    role: 'ダッシュボード',
    desc: 'ドラッグ＆ドロップで並べ替え可能な 11 種類のウィジェットシステムを実装。',
    icon: <Layout size={22} />,
    color: 'text-indigo-400 bg-indigo-400/10',
  },
  {
    name: 'sharp / next-image-export-optimizer',
    role: '画像最適化',
    desc: 'WebP 変換・ブラープレースホルダー生成を静的エクスポートに対応した形で実装。',
    icon: <Image size={22} />,
    color: 'text-rose-400 bg-rose-400/10',
  },
  {
    name: 'Cloudflare Pages',
    role: 'デプロイ',
    desc: '静的エクスポートを Cloudflare Pages でホスティング。CI/CD パイプラインと環境変数管理を含む。',
    icon: <Server size={22} />,
    color: 'text-orange-500 bg-orange-500/10',
  },
];

const features = [
  {
    title: 'デュアルコンテンツソース',
    desc: 'Notion API をプライマリ CMS、ローカル MDX ファイルをフォールバックとして機能するハイブリッド構成。ビルド時に Notion 画像を自動ダウンロード・ハッシュキャッシュする仕組みを独自実装。',
    icon: <GitBranch size={20} />,
    color: 'text-primary bg-primary/10',
  },
  {
    title: 'カスタム Notion ブロックパーサー',
    desc: 'Notion API のブロックを Markdown・JSX へ変換する 500 行超の独自パーサーを実装。コールアウト → `<FeaturePoint>`、2 カラムテーブル → `<Specs>`、購入リンクセクション → `<BuyLinks>` など、コンテンツ構造をパターンマッチングで解析。',
    icon: <Code2 size={20} />,
    color: 'text-blue-400 bg-blue-400/10',
  },
  {
    title: 'カスタマイズ可能なダッシュボード',
    desc: '11 種類のウィジェット（時計・天気・Todo・ポモドーロ・カウントダウン・年間進捗など）をドラッグ＆ドロップで配置できるダッシュボードを実装。設定は Zustand + localStorage で永続化。',
    icon: <Layout size={20} />,
    color: 'text-purple-400 bg-purple-400/10',
  },
  {
    title: 'インタラクティブ 404 ターミナル',
    desc: 'ターミナルテーマに合わせた 404 ページ。`help`・`dir`・`whoami`・`date`・`type` などのコマンドを実際に実行できるインタラクティブな UI を React で実装。',
    icon: <Sparkles size={20} />,
    color: 'text-amber-400 bg-amber-400/10',
  },
  {
    title: 'カスタム MDX コンポーネント',
    desc: '`<ReviewPoint>` `<Specs>` `<BuyLinks>` `<CouponBox>` `<FeaturePoint>` `<ImageGrid>` など、レビュー記事に特化した再利用可能コンポーネントを設計・実装。',
    icon: <Package size={20} />,
    color: 'text-teal-400 bg-teal-400/10',
  },
  {
    title: 'SEO・パフォーマンス最適化',
    desc: '動的メタデータ生成・OpenGraph 対応・`generateStaticParams` による完全 SSG。WebP 変換・ブラープレースホルダー・React Compiler による自動最適化を組み合わせた構成。',
    icon: <Shield size={20} />,
    color: 'text-emerald-400 bg-emerald-400/10',
  },
];

const architectureItems = [
  { label: 'レンダリング戦略', value: 'SSG（静的エクスポート）+ React Server Components' },
  { label: 'コンテンツ取得', value: 'ビルド時 Notion API → ローカルキャッシュ → 静的 HTML 生成' },
  { label: '状態管理', value: 'Zustand（ダッシュボード / UI）+ localStorage 永続化' },
  { label: '画像パイプライン', value: 'Notion 画像自動 DL → sharp WebP 変換 → ブラー Placeholder 生成' },
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
            Technical Portfolio
          </div>
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-purple-400 leading-tight pb-1">
            ざっくらぼ
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            ターミナルテーマのパーソナルテックブログ。<br className="hidden md:block" />
            Next.js App Router・Notion API・カスタムダッシュボードを中心とした<br className="hidden md:block" />
            フルスタックの個人開発プロジェクトです。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="https://zaclab.jp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Globe size={16} />
              サイトを見る
              <ExternalLink size={14} />
            </a>
            <a
              href="https://github.com/bigsunny"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full font-medium text-sm hover:border-primary/50 transition-colors"
            >
              GitHub
              <ExternalLink size={14} />
            </a>
          </div>
        </ScrollReveal>

        {/* ── Overview ── */}
        <section className="space-y-8">
          <ScrollReveal direction="left">
            <SectionTitle>Overview</SectionTitle>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <TiltCard>
              <div className="bg-gradient-to-br from-card to-secondary/50 border border-white/10 p-8 md:p-10 rounded-2xl shadow-xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <OverviewStat label="フレームワーク" value="Next.js 16" sub="App Router / SSG" />
                  <OverviewStat label="コンテンツソース" value="Notion + MDX" sub="デュアルソース構成" />
                  <OverviewStat label="ウィジェット数" value="11種類" sub="ダッシュボードシステム" />
                </div>
              </div>
            </TiltCard>
          </ScrollReveal>
        </section>

        {/* ── Tech Stack ── */}
        <section className="space-y-8">
          <ScrollReveal direction="right">
            <SectionTitle>Tech Stack</SectionTitle>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech, i) => (
              <ScrollReveal key={tech.name} delay={Math.min(i * 0.05, 0.4)} className="h-full">
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
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Key Features ── */}
        <section className="space-y-8">
          <ScrollReveal direction="left">
            <SectionTitle>Key Features</SectionTitle>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feat, i) => (
              <ScrollReveal key={feat.title} delay={Math.min(i * 0.08, 0.4)} className="h-full">
                <div className="h-full p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/40 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${feat.color}`}>
                      {feat.icon}
                    </div>
                    <h3 className="font-bold font-outfit text-base">{feat.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Architecture ── */}
        <section className="space-y-8">
          <ScrollReveal direction="right">
            <SectionTitle>Architecture</SectionTitle>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
              {architectureItems.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-6 py-4 ${
                    i < architectureItems.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <dt className="text-xs font-medium text-muted-foreground shrink-0 sm:w-40 flex items-center gap-1.5">
                    <ChevronRight size={12} className="text-primary" />
                    {item.label}
                  </dt>
                  <dd className="font-medium text-sm">{item.value}</dd>
                </div>
              ))}
            </div>
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

function OverviewStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold font-outfit text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
