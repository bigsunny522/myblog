import React from 'react';
import ExportedImage from "next-image-export-optimizer";
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import { Scale, Camera, Code, Twitter, Instagram, Youtube, Mail, ExternalLink } from 'lucide-react';
import { BudouxText } from '@/components/ui/BudouxText';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      <div className="space-y-24">
        
        {/* Header */}
        <ScrollReveal className="text-center space-y-6">
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 leading-tight">
            About
          </h1>
          <BudouxText as="p" className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-balance">
            ざっくらぼは、テクノロジーとデザインの融合を探求するデジタルライフスタイル・ブログです。
          </BudouxText>
        </ScrollReveal>

        {/* Website Section */}
        <section className="space-y-12">
          <ScrollReveal direction="left">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px bg-gradient-to-r from-transparent to-primary/50 flex-1" />
               <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold font-outfit shrink-0">Website</h2>
               <div className="h-px bg-gradient-to-l from-transparent to-primary/50 flex-1" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <BudouxText as="p" className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 leading-relaxed text-pretty">
              「テクノロジーの力で、毎日をスマートに、もっと豊かに。」<br className="hidden md:block"/>
              このブログは、私の愛するガジェットやデスク環境、<br className="hidden md:block"/>
              そしてそれらを支える技術について深掘りして発信する場所です。
            </BudouxText>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0.1} className="h-full">
              <div className="h-full p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <Scale size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Fair Review</h3>
                <BudouxText as="p" className="text-muted-foreground text-sm leading-relaxed text-pretty">
                  良い点も気になった点も、実際の体験に基づいたリアルな使用感をありのままにお届けします。
                </BudouxText>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="h-full">
              <div className="h-full p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-500">
                  <Camera size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Visuals</h3>
                <BudouxText as="p" className="text-muted-foreground text-sm leading-relaxed text-pretty">
                  製品の魅力が直感的に伝わるよう、自ら撮影したこだわりの写真を使用し、視覚的にも楽しめる記事を目指します。
                </BudouxText>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} className="h-full">
               <div className="h-full p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-500">
                  <Code size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Tech Stack</h3>
                <BudouxText as="p" className="text-muted-foreground text-sm leading-relaxed text-pretty">
                  このサイト自体を技術的な実験場とし、学習した内容を反映させながら継続的にアップデートしていきます。
                </BudouxText>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.4}>
            {/* Affiliate Disclaimer */}
            <div className="pt-6">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                     <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                        <Scale size={20} />
                     </div>
                     <h3 className="text-lg font-bold font-outfit text-primary tracking-wide">
                       About Affiliate Links
                     </h3>
                  </div>
                  
                  <div className="text-sm md:text-base text-foreground/80 space-y-4 leading-relaxed text-pretty text-center md:text-left">
                    <p>
                      当サイト「ざっくらぼ / Zack Lab」は、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
                    </p>
                    <p>
                      また、楽天アフィリエイトなどの各種アフィリエイトプログラムに参加しており、適格販売により紹介料を得ています。
                    </p>
                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-primary/10">
                      ※これらのリンクを通じて購入された場合でも、購入者の負担額が増えることはありません。得られた収益は、新たなガジェットの購入やサーバー維持費など、ブログ運営の活動資金として大切に使わせていただきます。
                    </p>
                  </div>
                </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Operator Section */}
        <section className="space-y-12">
          <ScrollReveal direction="right">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px bg-gradient-to-r from-transparent to-primary/50 flex-1" />
               <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold font-outfit shrink-0">Operator</h2>
               <div className="h-px bg-gradient-to-l from-transparent to-primary/50 flex-1" />
            </div>
          </ScrollReveal>

          <div className="flex justify-center">
            <ScrollReveal direction="up" className="w-full max-w-2xl">
              <TiltCard className="w-full">
                <div className="bg-gradient-to-br from-card to-secondary/50 border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                    {/* Avatar */}
                    <div className="shrink-0 relative group">
                       <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-primary to-purple-400 p-[3px] shadow-lg group-hover:shadow-primary/50 transition-shadow duration-500">
                         <div className="w-full h-full rounded-full bg-card overflow-hidden relative">
                            <ExportedImage 
                              src="/images/main/skyblue.png" 
                              alt="Operator Avatar" 
                              fill 
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                         </div>
                       </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                       <div>
                          <h3 className="text-3xl font-bold font-outfit mb-2">ざいざっく/xyzack</h3>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-primary font-medium text-sm">
                            <span className="px-3 py-1 bg-primary/10 rounded-full">#DeskSetup</span>
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full">#GadgetLover</span>
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full">#Developer</span>
                          </div>
                       </div>

                       <BudouxText as="p" className="text-muted-foreground leading-relaxed text-pretty">
                         デバイスとガジェットをこよなく愛する大学生。<br /> 
                         将来はフロントエンドエンジニアを目指しています。<br /> 
                         「デザイン」と「体験」を重視したモノ選びを心がけています。<br /> 
                         理想のホワイトデスク環境を構築中です。
                       </BudouxText>
                       
                       {/* SNS Links */}
                       <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                          <SocialLink href="https://x.com/xyzack271" icon={<Twitter size={20} />} label="Twitter" />
                          <SocialLink href="https://www.instagram.com/xyzack271/" icon={<Instagram size={20} />} label="Instagram" />
                          <SocialLink href="https://www.youtube.com/@xyzack271" icon={<Youtube size={20} />} label="YouTube" />
                          <SocialLink href="https://mail.google.com/mail/?view=cm&to=xyzack271@gmail.com" icon={<Mail size={20} />} label="Contact" />
                       </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </section>

        {/* Contact Section */}
        <section className="space-y-12">
          <ScrollReveal direction="up">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px bg-gradient-to-r from-transparent to-primary/50 flex-1" />
               <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold font-outfit shrink-0">Contact</h2>
               <div className="h-px bg-gradient-to-l from-transparent to-primary/50 flex-1" />
            </div>

            <div className="text-center space-y-8">
              <BudouxText as="p" className="text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
                当ブログに関するご感想、ご質問、お仕事のご依頼などは、<br className="hidden md:block" />
                X(Twitter)のDM、または下記メールアドレスまでお気軽にご連絡ください。
              </BudouxText>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                 <a 
                   href="https://x.com/xyzack271" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-3 px-6 py-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 w-full md:w-auto"
                 >
                   <div className="p-2 bg-black/5 rounded-lg text-foreground">
                     <Twitter size={24} />
                   </div>
                   <div className="text-left">
                     <div className="text-xs text-muted-foreground">Direct Message</div>
                     <div className="font-bold font-outfit">@xyzack271</div>
                   </div>
                   <ExternalLink size={16} className="ml-auto text-muted-foreground" />
                 </a>

                 <a 
                   href="mailto:xyzack271@gmail.com" 
                   className="flex items-center gap-3 px-6 py-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 w-full md:w-auto"
                 >
                   <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                     <Mail size={24} />
                   </div>
                   <div className="text-left">
                     <div className="text-xs text-muted-foreground">Email</div>
                     <div className="font-bold font-outfit">xyzack271@gmail.com</div>
                   </div>
                   <ExternalLink size={16} className="ml-auto text-muted-foreground" />
                 </a>
              </div>
            </div>
          </ScrollReveal>
        </section>




      </div>
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-3 bg-secondary/50 hover:bg-primary/20 hover:text-primary rounded-full transition-all duration-300 border border-transparent hover:border-primary/30 group"
      aria-label={label}
    >
      <span className="group-hover:scale-110 block transition-transform duration-300">
        {icon}
      </span>
    </a>
  );
}
