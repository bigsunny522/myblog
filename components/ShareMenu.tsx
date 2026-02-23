'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLine, faFacebookF, faXTwitter } from '@fortawesome/free-brands-svg-icons';

interface ShareMenuProps {
  title: string;
  slug: string;
  label?: string;
  variant?: 'default' | 'primary';
  popupPosition?: 'top' | 'bottom';
}

export const ShareMenu = ({ title, slug, label = "Share", variant = 'default', popupPosition = 'bottom' }: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use window.location.origin only on client side
  const getUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/blog/${slug}`;
    }
    return '';
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error('Clipboard API not available');
    } catch (err) {
      // Fallback for non-secure contexts (e.g., local network HTTP)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Ensure it's not visible but part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) return true;
        return false;
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        return false;
      }
    }
  };

  const shareLinks = [
    {
      name: 'X (Twitter)',
      icon: <FontAwesomeIcon icon={faXTwitter} />,
      color: 'hover:text-foreground',
      action: () => {
        const url = getUrl();
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
      },
    },
    {
      name: 'LINE',
      icon: <FontAwesomeIcon icon={faLine} />,
      color: 'hover:text-[#00B900]',
      action: () => {
        const url = getUrl();
        window.open(
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
          '_blank'
        );
      },
    },
    {
      name: 'Facebook',
      icon: <FontAwesomeIcon icon={faFacebookF} />,
      color: 'hover:text-[#1877F2]',
      action: () => {
        const url = getUrl();
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
      },
    },
    {
      name: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />,
      color: copied ? 'text-green-500' : 'hover:text-foreground',
      action: async () => {
        const url = getUrl();
        const success = await copyToClipboard(url);
        
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          alert('Copy failed. Please copy the URL manually.');
        }
      },
    },
  ];

  // Button styles based on variant
  const baseStyles = "flex items-center gap-2 rounded-full font-medium transition-all duration-300";
  const variants = {
    default: `
      px-4 py-1.5 text-sm border
      ${isOpen 
        ? 'bg-primary text-primary-foreground border-primary shadow-md' 
        : 'bg-secondary/30 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground hover:border-border'}
    `,
    primary: `
      px-8 py-3 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold
      ${isOpen
        ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
        : 'bg-gradient-to-r from-primary to-blue-400 text-primary-foreground hover:opacity-90'}
    `
  };

  const placementClasses = popupPosition === 'top' 
    ? "md:bottom-full md:mb-2 md:top-auto md:mt-0"
    : "md:top-full md:mt-2 md:bottom-auto md:mb-0";

  return (
    <div className="relative inline-block text-left">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseStyles} ${variants[variant]}`}
        aria-label="Share this post"
      >
        <Share2 className={variant === 'primary' ? "w-5 h-5" : "w-3.5 h-3.5"} />
        <span>{label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop: Mobile = dark overlay, Desktop = transparent click handler */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:bg-transparent bg-black/40"
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Wrapper: Handles centering on Mobile (Fixed Flex), disappears on Desktop (Contents) */}
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none md:contents">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`
                  pointer-events-auto
                  overflow-hidden bg-background border border-border/50 shadow-xl backdrop-blur-md
                  
                  /* Mobile: Simple sizing (centering handled by wrapper) */
                  w-[90vw] max-w-sm rounded-2xl p-2
                  
                  /* Desktop (md): Absolute popup dropdown */
                  md:absolute md:left-0 md:w-48 md:rounded-xl md:p-0 md:z-50
                  ${placementClasses}
                `}
              >
                <div className="py-1">
                  {shareLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => {
                        link.action();
                        if (link.name !== 'Copy Link') setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 md:py-2 text-base md:text-sm transition-colors flex items-center gap-3 text-muted-foreground ${link.color} hover:bg-muted/50 rounded-lg md:rounded-none`}
                    >
                      <span className="w-8 md:w-5 flex justify-center items-center text-xl md:text-lg">
                        {link.icon}
                      </span>
                      {link.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
