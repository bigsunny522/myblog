import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faInstagram, faYoutube, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { SectionDivider } from './ui/SectionDivider';
import { BudouxText } from './ui/BudouxText';

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-primary/10 bg-blue-50 dark:bg-[#0B1120] pt-lk-2xl pb-lk-xl">
      <SectionDivider type="curve" position="top" fill="fill-blue-50 dark:fill-[#0B1120]" height="h-16 md:h-24" />
      
      <div className="container mx-auto flex flex-col items-center gap-6 px-4 relative z-10">
        
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-lk-xl text-sm font-medium text-foreground/80">
          <Link href="/reviews" className="hover:text-primary transition-colors">
            Reviews
          </Link>
          <Link href="/gear" className="hover:text-primary transition-colors">
            Gear
          </Link>
<Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex gap-lk-lg">
          <a href="https://x.com/xyzack271" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-lk-xs rounded-full hover:bg-secondary">
            <FontAwesomeIcon icon={faXTwitter} className="w-5 h-5" />
            <span className="sr-only">X (Twitter)</span>
          </a>
          <a href="https://www.instagram.com/xyzack271/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-lk-xs rounded-full hover:bg-secondary">
            <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
            <span className="sr-only">Instagram</span>
          </a>
          <a href="https://www.youtube.com/@xyzack271" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-lk-xs rounded-full hover:bg-secondary">
            <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
            <span className="sr-only">YouTube</span>
          </a>
          <a href="https://www.tiktok.com/@xyzack271" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-lk-xs rounded-full hover:bg-secondary">
            <FontAwesomeIcon icon={faTiktok} className="w-5 h-5" />
            <span className="sr-only">TikTok</span>
          </a>
          <a href="https://mail.google.com/mail/?view=cm&to=xyzack271@gmail.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-lk-xs rounded-full hover:bg-secondary">
            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
            <span className="sr-only">Contact</span>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} <BudouxText>ざっくらぼ</BudouxText>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
