import React from 'react';
import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import { Scale, Camera, Code, Twitter, Instagram, Youtube, Mail, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      <div className="space-y-24">
        
        {/* Header */}
        <ScrollReveal className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            About
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-balance">
            ざっくらぼは、テクノロジーとデザインの融合を探求するデジタルライフスタイル・ブログです。
          </p>
        </ScrollReveal>

        {/* Website Section */}
        <section className="space-y-12">
          <ScrollReveal direction="left">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px bg-gradient-to-r from-transparent to-primary/50 flex-1" />
               <h2 className="text-3xl font-bold font-outfit shrink-0">Website</h2>
               <div className="h-px bg-gradient-to-l from-transparent to-primary/50 flex-1" />
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0.1} className="h-full">
              <div className="h-full p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <Scale size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Fair Review</h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                  メリットだけでなくデメリットも含め、実際に使用して感じた「体験」や「変化」をありのままにお届けします。
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="h-full">
              <div className="h-full p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-500">
                  <Camera size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Visuals</h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                  製品のデザインや質感が手に取るように伝わるよう、こだわりの機材で撮影したオリジナル写真を使用しています。
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} className="h-full">
               <div className="h-full p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-500">
                  <Code size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Tech Stack</h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                  Next.js, TailwindCSS, Framer Motionを駆使し、高速で快適な閲覧体験と、洗練されたデザインの両立を目指しています。
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Operator Section */}
        <section className="space-y-12">
          <ScrollReveal direction="right">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px bg-gradient-to-r from-transparent to-primary/50 flex-1" />
               <h2 className="text-3xl font-bold font-outfit shrink-0">Operator</h2>
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
                            <Image 
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

                       <p className="text-muted-foreground leading-relaxed text-pretty">
                         デバイスとガジェットをこよなく愛する大学生。<br /> 
                         将来はフロントエンドエンジニアを目指しています。<br /> 
                         「デザイン」と「体験」を重視したモノ選びを心がけています。<br /> 
                         理想のホワイトデスク環境を構築中です。
                       </p>
                       
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
