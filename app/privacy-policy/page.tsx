import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { BudouxText } from '@/components/ui/BudouxText';
import { Shield, Cookie, BarChart2, Link2, Mail, ExternalLink } from 'lucide-react';

const BASE_URL = getBaseUrl();
const siteImage = `${BASE_URL}/images/main/skyblue.png`;

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'ざっくらぼのプライバシーポリシーです。個人情報の取り扱い、Cookie・広告・アフィリエイトについて説明しています。',
  openGraph: {
    title: 'プライバシーポリシー | ざっくらぼ',
    description: 'ざっくらぼのプライバシーポリシーです。個人情報の取り扱い、Cookie・広告・アフィリエイトについて説明しています。',
    url: '/privacy-policy',
    siteName: 'ざっくらぼ',
    type: 'website',
    images: [{ url: siteImage, width: 1200, height: 630, alt: 'ざっくらぼ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プライバシーポリシー | ざっくらぼ',
    description: 'ざっくらぼのプライバシーポリシーです。',
    images: [siteImage],
  },
};

const LAST_UPDATED = '2025年5月16日';
const EFFECTIVE_DATE = '2025年5月16日';
const SITE_NAME = 'ざっくらぼ';
const SITE_URL = 'https://zacklabo.com';
const OPERATOR_NAME = 'ざいざっく（xyzack）';
const CONTACT_EMAIL = 'xyzack271@gmail.com';
const CONTACT_TWITTER = 'https://x.com/xyzack271';

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
          {icon}
        </div>
        <h2 className="text-xl md:text-2xl font-bold font-outfit">{title}</h2>
      </div>
      <div className="pl-0 md:pl-11 space-y-3 text-foreground/80 leading-relaxed text-sm md:text-base">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <div className="space-y-16">

        {/* Header */}
        <ScrollReveal className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Shield size={16} />
            <span>Privacy Policy</span>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 leading-tight">
            プライバシーポリシー
          </h1>
          <p className="text-muted-foreground text-sm">
            制定日：{EFFECTIVE_DATE}　／　最終更新日：{LAST_UPDATED}
          </p>
        </ScrollReveal>

        {/* Intro */}
        <ScrollReveal>
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8">
            <BudouxText as="p" className="text-foreground/80 leading-relaxed text-pretty text-sm md:text-base">
              {SITE_NAME}（以下「当サイト」）は、{SITE_URL} にて運営するブログサービスです。
              当サイトの運営者（以下「管理者」）は、ユーザーの個人情報の保護を重要視し、
              以下のプライバシーポリシー（以下「本ポリシー」）を定めます。
              当サイトをご利用いただく前に、必ず本ポリシーをお読みください。
            </BudouxText>
          </div>
        </ScrollReveal>

        {/* Sections */}
        <div className="space-y-12">

          {/* 1. 個人情報の収集 */}
          <ScrollReveal>
            <Section title="個人情報の収集について" icon={<Shield size={18} />}>
              <p>
                当サイトでは、お問い合わせやコメント等の際に、お名前・メールアドレスなどの個人情報をご入力いただく場合があります。
                取得した個人情報は、お問い合わせへの回答や必要な情報のご連絡のみに使用し、第三者への開示・提供は行いません。
              </p>
              <p>
                ただし、法令に基づく開示が必要な場合、または人の生命・身体・財産の保護のために必要な場合はこの限りではありません。
              </p>
            </Section>
          </ScrollReveal>

          {/* 2. Cookie・アクセス解析 */}
          <ScrollReveal>
            <Section title="Cookie（クッキー）およびアクセス解析について" icon={<Cookie size={18} />}>
              <p>
                当サイトは、ユーザー体験の向上および利用状況の分析を目的として、Cookie を使用しています。
                Cookie とは、ウェブサイトがブラウザを通じてお使いのデバイスに保存する小さなテキストファイルです。
              </p>
              <p>
                Cookie の使用を希望されない場合は、ブラウザの設定から Cookie を無効にすることができます。
                ただし、一部の機能が正しく動作しなくなる場合があります。
              </p>

              {/* Google Analytics */}
              <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 size={16} className="text-blue-500 shrink-0" />
                  <h3 className="font-bold text-foreground">Google アナリティクス</h3>
                </div>
                <p>
                  当サイトは、アクセス解析のために Google LLC が提供する「Google アナリティクス」を利用しています。
                  Google アナリティクスは Cookie を使用してアクセス情報を収集しますが、個人を特定する情報は含まれません。
                  収集されたデータは Google のプライバシーポリシーに基づき管理されます。
                </p>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-blue-500 hover:underline text-xs"
                >
                  Google プライバシーポリシー <ExternalLink size={12} />
                </a>
                <span className="mx-2 text-muted-foreground text-xs">|</span>
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-blue-500 hover:underline text-xs"
                >
                  Google アナリティクス オプトアウト <ExternalLink size={12} />
                </a>
              </div>
            </Section>
          </ScrollReveal>

          {/* 3. 広告（Google AdSense） */}
          <ScrollReveal>
            <Section title="広告の配信について（Google AdSense）" icon={<BarChart2 size={18} />}>
              <p>
                当サイトは、Google LLC が提供する広告配信サービス「Google AdSense」を利用しています。
                Google AdSense は、ユーザーの興味・関心に基づいた広告（インタレストベース広告）を表示するために Cookie を使用します。
              </p>
              <p>
                Google AdSense の Cookie により、当サイトおよびその他のウェブサイトへの過去のアクセス情報が広告配信に利用される場合があります。
                これらの情報に個人を特定できるものは含まれていません。
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  インタレストベース広告の無効化は
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mx-1 text-primary hover:underline"
                  >
                    広告設定ページ <ExternalLink size={12} />
                  </a>
                  から行えます。
                </li>
                <li>
                  Cookie の使用に関する詳細は
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mx-1 text-primary hover:underline"
                  >
                    Google の広告に関するポリシー <ExternalLink size={12} />
                  </a>
                  をご参照ください。
                </li>
              </ul>
            </Section>
          </ScrollReveal>

          {/* 4. アフィリエイト */}
          <ScrollReveal>
            <Section title="アフィリエイトプログラムについて" icon={<Link2 size={18} />}>
              <p>
                当サイトは、以下のアフィリエイトプログラムに参加しており、紹介リンクを通じた購入により紹介料を得ることがあります。
                読者の方の購入金額が増えることはなく、サービス内容にも影響はありません。
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <span className="font-semibold">Amazon アソシエイト・プログラム</span>
                  ：Amazon.co.jp を宣伝しリンクすることで紹介料を得る、Amazon のアフィリエイトプログラムの参加者です。
                </li>
                <li>
                  <span className="font-semibold">楽天アフィリエイト</span>
                  ：楽天グループが提供するアフィリエイトプログラムに参加しており、適格販売により紹介料を得ています。
                </li>
                <li>
                  その他、各種アフィリエイトプログラムに参加する場合があります。
                </li>
              </ul>
              <p>
                なお、掲載している商品・サービスのレビュー内容はアフィリエイト契約の有無にかかわらず、管理者の独自の見解に基づいています。
              </p>
            </Section>
          </ScrollReveal>

          {/* 5. 免責事項 */}
          <ScrollReveal>
            <Section title="免責事項" icon={<Shield size={18} />}>
              <p>
                当サイトのコンテンツ・情報については、できる限り正確な情報を提供するよう努めておりますが、
                正確性・安全性を保証するものではありません。
                当サイトに掲載された情報によって生じた損害等については、管理者は一切の責任を負いかねます。
              </p>
              <p>
                当サイトからリンクしている外部サイトの内容については、管理者は責任を負いません。
                リンク先のコンテンツは各サイトの運営者が管理しており、当サイトとは独立した存在です。
              </p>
            </Section>
          </ScrollReveal>

          {/* 6. 著作権 */}
          <ScrollReveal>
            <Section title="著作権について" icon={<Shield size={18} />}>
              <p>
                当サイトに掲載されているコンテンツ（文章・画像・動画等）の著作権は、管理者または正当な権利を有する第三者に帰属します。
                無断転載・複製・改変・再配布は固く禁じます。
              </p>
              <p>
                引用・参照を行う場合は、出典元の明記を必ず行い、引用元の URL を記載してください。
              </p>
            </Section>
          </ScrollReveal>

          {/* 7. ポリシーの変更 */}
          <ScrollReveal>
            <Section title="プライバシーポリシーの変更について" icon={<Shield size={18} />}>
              <p>
                管理者は、法令の変更やサービス内容の変更等に伴い、本ポリシーを予告なく変更する場合があります。
                変更後のプライバシーポリシーは、当ページに掲載した時点より効力を生じるものとします。
                定期的に本ページをご確認いただくことをお勧めします。
              </p>
            </Section>
          </ScrollReveal>

          {/* 8. お問い合わせ */}
          <ScrollReveal>
            <Section title="お問い合わせ" icon={<Mail size={18} />}>
              <p>
                本ポリシーに関するご質問・ご意見、または個人情報の開示・訂正・削除のご依頼は、下記までお問い合わせください。
              </p>
              <div className="mt-4 bg-card/50 border border-border/50 rounded-xl p-5 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">運営者</p>
                  <p className="font-semibold">{OPERATOR_NAME}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">サイト名</p>
                  <p className="font-semibold">{SITE_NAME}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">メール</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                  >
                    {CONTACT_EMAIL} <ExternalLink size={13} />
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">X (Twitter)</p>
                  <a
                    href={CONTACT_TWITTER}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                  >
                    @xyzack271 <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </Section>
          </ScrollReveal>

        </div>

        {/* Footer note */}
        <ScrollReveal>
          <p className="text-center text-xs text-muted-foreground border-t border-border/50 pt-8">
            制定日：{EFFECTIVE_DATE}　最終更新日：{LAST_UPDATED}<br />
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </ScrollReveal>

      </div>
    </div>
  );
}
