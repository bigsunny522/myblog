'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Download, ImageIcon, RotateCcw, Info, Trash2, Share2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type FrameStyle  = 'none' | 'minimal' | 'pro' | 'analog' | 'retro' | 'tech';
type FramePos    = 'surround' | 'bottom' | 'topbottom' | 'right';
type TabId       = 'info' | 'frame' | 'logo';

interface FrameConfig {
  style: FrameStyle; pos: FramePos;
  bgColor: string; accentColor: string; textColor: string; subColor: string;
  mainText: string; subTitle: string; cameraModel: string; lensName: string; shootInfo: string;
  shootDate: string; location: string;
  showCamera: boolean; showLens: boolean; showShootInfo: boolean; showDate: boolean; showLocation: boolean;
}

interface LogoConfig {
  src: string | null; sizePct: number; opacity: number;
  username: string;
}

interface ImageInfo {
  name: string; sizeKb: number; width: number; height: number; type: string;
}

type Pad = { top: number; bottom: number; left: number; right: number; };

// ─── Style defaults ───────────────────────────────────────────────────────────
const STYLE_DEFAULTS: Record<Exclude<FrameStyle,'none'>, Pick<FrameConfig,'bgColor'|'accentColor'|'textColor'|'subColor'>> = {
  minimal: { bgColor:'#1c1c1c', accentColor:'#e03030', textColor:'#ffffff', subColor:'#999999' },
  pro:     { bgColor:'#080808', accentColor:'#FF6900', textColor:'#ffffff', subColor:'#666666' },
  analog:  { bgColor:'#141210', accentColor:'#E8A020', textColor:'#E8A020', subColor:'#665544' },
  retro:   { bgColor:'#f0ece4', accentColor:'#2c2c2c', textColor:'#2c2c2c', subColor:'#888888' },
  tech:    { bgColor:'#0e1218', accentColor:'#00AADD', textColor:'#ffffff', subColor:'#445566' },
};

// ─── Pad calculator ───────────────────────────────────────────────────────────
function getPad(imgW: number, imgH: number, style: FrameStyle, pos: FramePos): Pad {
  if (style === 'none') return { top:0, bottom:0, left:0, right:0 };
  const sh   = Math.min(imgW, imgH);
  const base = Math.round(sh * 0.04);
  const btmH = style === 'retro' ? Math.round(sh * 0.22) : Math.round(sh * 0.135);
  const topH = Math.round(sh * 0.057);
  switch (pos) {
    case 'surround':  return { top:base, bottom:btmH, left:base,  right:base };
    case 'bottom':    return { top:0,    bottom:btmH, left:0,     right:0    };
    case 'topbottom': return { top:topH, bottom:btmH, left:0,     right:0    };
    case 'right':     return { top:0,    bottom:0,    left:0,     right:btmH };
  }
}

// ─── Canvas utilities ─────────────────────────────────────────────────────────
const SAN   = 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", "Palatino Linotype", serif';
const MONO  = '"Courier New", Consolas, "Lucida Console", monospace';

function roundRectPath(ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

function hairline(ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,color:string,alpha=0.22) {
  const prev = ctx.globalAlpha;
  ctx.strokeStyle=color; ctx.lineWidth=1; ctx.globalAlpha=alpha;
  ctx.strokeRect(x+.5,y+.5,w-1,h-1);
  ctx.globalAlpha=prev;
}

// Draw text centered at (cx, y) with extra letter-spacing. Returns half-width.
function drawSpaced(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number): number {
  if (!text) return 0;
  const chars = [...text];
  const widths = chars.map(c => ctx.measureText(c).width);
  const total  = widths.reduce((s,w)=>s+w,0) + Math.max(0, spacing*(chars.length-1));
  let x = cx - total/2;
  ctx.textAlign = 'left';
  chars.forEach((c,i) => { ctx.fillText(c,x,y); x += widths[i]+spacing; });
  return total/2;
}

// ─── Circle logo + username helper ───────────────────────────────────────────
function drawCircleLogo(
  ctx: CanvasRenderingContext2D, li: HTMLImageElement, logo: LogoConfig,
  x: number, yBottom: number, size: number, font: string, textColor: string) {
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = logo.opacity / 100;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size/2, yBottom - size/2, size/2, 0, Math.PI*2);
  ctx.clip();
  ctx.drawImage(li, x, yBottom - size, size, size);
  ctx.restore();
  if (logo.username) {
    ctx.globalAlpha = logo.opacity / 100;
    const sz = Math.round(size * 0.50);
    ctx.font = `bold ${sz}px ${font}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(logo.username, x + size + Math.round(size * 0.28), yBottom - size/2);
  }
  ctx.globalAlpha = prev;
}

// ─── Horizontal strip layout (3-column grid) ─────────────────────────────────
interface HResult { cx:number; rowA:number; rowB:number; mainHalfW:number; mainSz:number; leftX:number; rightX:number; }

function drawHContent(ctx: CanvasRenderingContext2D, cfg: FrameConfig,
  stripY: number, stripH: number, totalW: number, ox: number, font: string,
  logoImg?: HTMLImageElement | null, logo?: LogoConfig | null): HResult {
  const hMgn  = ox > 0 ? ox : Math.round(stripH * 0.20);
  const vPad  = Math.round(stripH * 0.16);
  const avH   = stripH - vPad * 2;
  const leftX = hMgn;
  const rightX= totalW - hMgn;
  const cx    = totalW / 2;

  const mainSz    = Math.round(avH * 0.46);
  const subSz     = Math.round(mainSz * 0.50);
  const tinySz    = Math.round(mainSz * 0.40);
  const subTitleSz = Math.round(mainSz * 0.34);

  // 3-slot vertical grid for side columns
  const slot = avH / 3;
  const s1Y  = stripY + vPad + slot * 0.55;
  const s2Y  = stripY + vPad + slot * 1.55;
  const s3Y  = stripY + vPad + slot * 2.55;

  // Main text centered at ~50% of avH — kept away from s1Y date text cap top
  const rowA = stripY + vPad + avH * 0.50;

  // ── Center: Main text + subtitle ─────────────────────────────────────────
  const label = (cfg.mainText || '').toUpperCase();
  ctx.font = `bold ${mainSz}px ${font}`;
  ctx.fillStyle = cfg.textColor;
  ctx.textBaseline = 'alphabetic';
  const mainHalfW = label ? drawSpaced(ctx, label, cx, rowA, mainSz * 0.1) : 0;

  if (cfg.subTitle) {
    ctx.font = `${subTitleSz}px ${font}`; ctx.fillStyle = cfg.subColor;
    ctx.textAlign = 'center';
    ctx.fillText(cfg.subTitle, cx, rowA + mainSz * 0.16 + subTitleSz);
  }

  // ── Left column: date (top) · logo+username or location (bottom) ─────────
  if (cfg.showDate && cfg.shootDate) {
    ctx.font = `${subSz}px ${font}`; ctx.fillStyle = cfg.subColor;
    ctx.textAlign = 'left'; ctx.fillText(cfg.shootDate, leftX, s1Y);
  }
  if (logoImg && logo) {
    const circleSize = Math.round(tinySz * 2.2 * (logo.sizePct / 55));
    drawCircleLogo(ctx, logoImg, logo, leftX, s3Y, circleSize, font, cfg.subColor);
  } else if (cfg.showLocation && cfg.location) {
    ctx.font = `${tinySz}px ${font}`; ctx.fillStyle = cfg.subColor;
    ctx.textAlign = 'left'; ctx.fillText(cfg.location, leftX, s3Y);
  }

  // ── Right column: camera model · lens · settings (3 lines) ───────────────
  if (cfg.showCamera && cfg.cameraModel) {
    ctx.font = `${subSz}px ${font}`; ctx.fillStyle = cfg.subColor;
    ctx.textAlign = 'right'; ctx.fillText(cfg.cameraModel, rightX, s1Y);
  }
  if (cfg.showLens && cfg.lensName) {
    ctx.font = `${tinySz}px ${font}`; ctx.fillStyle = cfg.subColor;
    ctx.textAlign = 'right'; ctx.fillText(cfg.lensName, rightX, s2Y);
  }
  if (cfg.showShootInfo && cfg.shootInfo) {
    const formatted = cfg.shootInfo.split(/\s+/).filter(Boolean).join(' · ');
    ctx.font = `${tinySz}px ${font}`; ctx.fillStyle = cfg.subColor;
    ctx.textAlign = 'right'; ctx.fillText(formatted, rightX, s3Y);
  }

  return { cx, rowA, rowB: s3Y, mainHalfW, mainSz, leftX, rightX };
}

// ─── Vertical strip (right side) with letter-spacing ─────────────────────────
function drawVContent(ctx: CanvasRenderingContext2D, cfg: FrameConfig,
  stripX: number, stripW: number, imgH: number, oy: number, font: string) {
  const mainSz  = Math.round(stripW * 0.27);
  const subSz   = Math.round(mainSz * 0.46);
  const spacing = mainSz * 0.1;

  ctx.save();
  ctx.translate(stripX + stripW/2, oy + imgH/2);
  ctx.rotate(-Math.PI/2);
  ctx.textBaseline = 'middle';

  // Main text centered with tracking
  ctx.font = `bold ${mainSz}px ${font}`;
  ctx.fillStyle = cfg.textColor;
  const mainHalfW = drawSpaced(ctx, (cfg.mainText || 'ORIGINAL').toUpperCase(), 0, 0, spacing);

  // Sub info offset from main text (toward top/bottom of image)
  const offset = Math.min(mainHalfW + mainSz * 0.55, imgH * 0.3);
  ctx.font = `${subSz}px ${font}`; ctx.fillStyle = cfg.subColor; ctx.textAlign = 'center';
  if (cfg.showDate && cfg.shootDate)         ctx.fillText(cfg.shootDate,  offset, 0);
  if (cfg.showLocation && cfg.location)      ctx.fillText(cfg.location,  -offset, 0);
  ctx.restore();
}

// ─── Frame decorators ─────────────────────────────────────────────────────────
function decorateMinimal(ctx: CanvasRenderingContext2D, cfg: FrameConfig,
  ox:number,oy:number,imgW:number,imgH:number,totalW:number,_totalH:number,pad:Pad,
  logoImg?: HTMLImageElement|null, logo?: LogoConfig|null) {
  hairline(ctx,ox,oy,imgW,imgH,cfg.accentColor,.3);

  if (pad.bottom>0) {
    const r = drawHContent(ctx,cfg,oy+imgH,pad.bottom,totalW,ox,SAN,logoImg,logo);

    // Accent dot: placed left of main text, vertically centered on cap height
    const dotR = r.mainSz * 0.32;
    const dotX = r.cx - r.mainHalfW - dotR * 2.4;
    const dotY = r.rowA - r.mainSz * 0.38;
    ctx.beginPath(); ctx.arc(dotX, dotY, dotR, 0, Math.PI*2);
    ctx.fillStyle = cfg.accentColor; ctx.fill();

    // Thin separator line under main text spanning from dot to text right edge
    const lineY = r.rowA + r.mainSz * 0.22;
    const lineX1 = dotX - dotR;
    const lineX2 = r.cx + r.mainHalfW;
    const prev = ctx.globalAlpha;
    ctx.globalAlpha = 0.2; ctx.strokeStyle = cfg.accentColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lineX1, lineY); ctx.lineTo(lineX2, lineY); ctx.stroke();
    ctx.globalAlpha = prev;
  }

  if (pad.right>0) {
    drawVContent(ctx,cfg,ox+imgW,pad.right,imgH,oy,SAN);
    // Dot at top of right strip
    const dotR = Math.round(pad.right * 0.11);
    ctx.beginPath(); ctx.arc(ox+imgW+pad.right/2, oy+dotR*2.5, dotR, 0, Math.PI*2);
    ctx.fillStyle = cfg.accentColor; ctx.fill();
  }

  if (pad.top>0 && cfg.showShootInfo) {
    const formatted = cfg.shootInfo.split(/\s+/).filter(Boolean).join(' · ');
    if (formatted) {
      ctx.font=`${Math.round(pad.top*.36)}px ${SAN}`; ctx.fillStyle=cfg.subColor;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(formatted, totalW/2, pad.top/2);
    }
  }
}

function decoratePro(ctx: CanvasRenderingContext2D, cfg: FrameConfig,
  ox:number,oy:number,imgW:number,imgH:number,totalW:number,_totalH:number,pad:Pad,
  logoImg?: HTMLImageElement|null, logo?: LogoConfig|null) {
  // L-corner markers
  const mLen = Math.round(Math.min(imgW,imgH)*0.044);
  const mT   = Math.max(2, Math.round(mLen*.1));
  ctx.fillStyle = cfg.accentColor;
  const corners: [number,number,number,number][] = [
    [ox,oy,1,1],[ox+imgW,oy,-1,1],[ox,oy+imgH,1,-1],[ox+imgW,oy+imgH,-1,-1],
  ];
  for (const [cx2,cy2,dx,dy] of corners) {
    ctx.fillRect(cx2,cy2,dx*mLen,mT*dy); ctx.fillRect(cx2,cy2,mT*dx,dy*mLen);
  }

  if (pad.bottom>0) {
    // Accent bar at top of strip
    const barH = Math.max(2, Math.round(pad.bottom*.022));
    ctx.fillStyle=cfg.accentColor;
    ctx.fillRect(ox, oy+imgH+Math.round(pad.bottom*.09), imgW, barH);
    drawHContent(ctx,cfg,oy+imgH,pad.bottom,totalW,ox,SAN,logoImg,logo);
  }
  if (pad.right>0) {
    const barW = Math.max(2, Math.round(pad.right*.022));
    ctx.fillStyle=cfg.accentColor;
    ctx.fillRect(ox+imgW+Math.round(pad.right*.09), oy, barW, imgH);
    drawVContent(ctx,cfg,ox+imgW,pad.right,imgH,oy,SAN);
  }
  if (pad.top>0) {
    const barH = Math.max(2, Math.round(pad.top*.022));
    ctx.fillStyle=cfg.accentColor;
    ctx.fillRect(ox, oy+pad.top-barH, imgW, barH);
  }
}

function decorateAnalog(ctx: CanvasRenderingContext2D, cfg: FrameConfig,
  ox:number,oy:number,imgW:number,imgH:number,totalW:number,_totalH:number,pad:Pad,
  logoImg?: HTMLImageElement|null, logo?: LogoConfig|null) {
  const drawPerfs=(baseY:number,areaH:number)=>{
    const hH=Math.round(areaH*.58), hW=Math.round(hH*.72), hR=Math.round(hH*.2);
    const gap=Math.round(hW*2.3); let hx=Math.round(gap*.45);
    ctx.fillStyle='#282420';
    while(hx+hW<totalW){roundRectPath(ctx,hx,baseY+Math.round((areaH-hH)/2),hW,hH,hR);ctx.fill();hx+=gap;}
  };
  const vTxt=(text:string,sx:number,sw:number,ht:number,startY:number,dir:number)=>{
    ctx.save(); ctx.translate(sx+sw/2,startY+ht/2); ctx.rotate(dir*-Math.PI/2);
    const sz=Math.round(sw*.48);
    ctx.font=`bold ${sz}px ${SAN}`; ctx.fillStyle=cfg.accentColor;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    drawSpaced(ctx,text.toUpperCase(),0,0,sz*.08);
    ctx.restore();
  };

  if (pad.top>0)    {
    drawPerfs(0,pad.top);
    if (cfg.showDate && cfg.shootDate) {
      ctx.font=`${Math.round(pad.top*.3)}px ${SAN}`; ctx.fillStyle=cfg.accentColor;
      ctx.textAlign='right'; ctx.textBaseline='middle';
      ctx.fillText(cfg.shootDate, totalW-Math.max(ox,pad.top)*.5, pad.top/2);
    }
  }
  if (pad.bottom>0) { drawPerfs(oy+imgH,pad.bottom); }
  if (pad.left>0)   vTxt(cfg.mainText||'ORIGINAL FILM',ox,pad.left,imgH,oy,-1);
  // right strip: show film name when there's no left/bottom content, otherwise show date
  if (pad.right>0)  vTxt(
    (pad.left===0&&pad.bottom===0) ? (cfg.mainText||'ORIGINAL FILM') : (cfg.shootDate||''),
    ox+imgW,pad.right,imgH,oy,1);

  // bottom strip text: show when no side strips (bottom-only or topbottom positions)
  if (pad.bottom>0&&pad.left===0&&pad.right===0) {
    const stripH=pad.bottom, avH=stripH*.74, stripY=oy+imgH;
    const mainSz=Math.round(avH*.52);
    const subSz =Math.round(mainSz*.42);
    ctx.fillStyle=cfg.accentColor; ctx.textBaseline='alphabetic';
    const cx=totalW/2, rowA=stripY+stripH*.44, rowB=stripY+stripH*.76;
    drawSpaced(ctx,(cfg.mainText||'ORIGINAL FILM').toUpperCase(),cx,rowA,mainSz*.09);
    if (cfg.showDate && cfg.shootDate) {
      ctx.font=`${subSz}px ${SAN}`; ctx.fillStyle=cfg.subColor;
      ctx.textAlign='right'; ctx.fillText(cfg.shootDate,totalW-Math.round(stripH*.12),rowB);
    }
    // Logo takes left slot; fall back to shootInfo only when no logo
    if (logoImg && logo) {
      const circleSize = Math.round(subSz * 1.8 * (logo.sizePct / 55));
      drawCircleLogo(ctx, logoImg, logo, Math.round(stripH*.12), rowB, circleSize, SAN, cfg.accentColor);
    } else if (cfg.showShootInfo && cfg.shootInfo) {
      const fmt=cfg.shootInfo.split(/\s+/).filter(Boolean).join(' · ');
      ctx.font=`${subSz}px ${SAN}`; ctx.fillStyle=cfg.subColor;
      ctx.textAlign='left'; ctx.fillText(fmt,Math.round(stripH*.12),rowB);
    }
  }
}

function decorateRetro(ctx: CanvasRenderingContext2D, cfg: FrameConfig,
  ox:number,oy:number,imgW:number,imgH:number,totalW:number,_totalH:number,pad:Pad,
  logoImg?: HTMLImageElement|null, logo?: LogoConfig|null) {
  hairline(ctx,ox,oy,imgW,imgH,cfg.accentColor,.15);

  // Top strip: ornamental rules + date (for topbottom / surround positions)
  if (pad.top>0) {
    const sz = Math.round(pad.top * 0.28);
    const prev = ctx.globalAlpha;
    ctx.globalAlpha = 0.22; ctx.strokeStyle = cfg.accentColor; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, Math.round(pad.top * 0.25)); ctx.lineTo(ox+imgW, Math.round(pad.top * 0.25));
    ctx.moveTo(ox, Math.round(pad.top * 0.75)); ctx.lineTo(ox+imgW, Math.round(pad.top * 0.75));
    ctx.stroke();
    ctx.globalAlpha = prev;
    if (cfg.showDate && cfg.shootDate) {
      ctx.font=`${sz}px ${SERIF}`; ctx.fillStyle=cfg.subColor;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(cfg.shootDate, totalW/2, pad.top/2);
    }
  }

  if (pad.bottom>0) {
    const stripY = oy+imgH, stripH = pad.bottom;
    const vPad   = Math.round(stripH * 0.14);
    const avH    = stripH - vPad * 2;
    const hMgn   = Math.round(stripH * 0.10);

    const titleSz    = Math.round(avH * 0.44);
    const subSz      = Math.round(titleSz * 0.46);
    const tinySz     = Math.round(titleSz * 0.36);
    const subTitleSz = Math.round(titleSz * 0.30);
    const titleY  = stripY + vPad + avH * 0.42;
    // subtitle row: same vertical zone as camera's "next line"
    const subRowY = titleY + titleSz * 0.28 + subTitleSz;
    const detailY = stripY + stripH - vPad;

    // ── Left column: title + subtitle ──────────────────────────────────────
    const main = cfg.mainText || '';
    if (main) {
      ctx.font=`${titleSz}px ${SERIF}`; ctx.fillStyle=cfg.textColor;
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      ctx.fillText(main, hMgn, titleY);
      // Ornamental line under title
      const tw  = ctx.measureText(main).width;
      const lnY = titleY + titleSz * 0.2;
      const prev = ctx.globalAlpha;
      ctx.globalAlpha=.18; ctx.strokeStyle=cfg.accentColor; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(hMgn, lnY); ctx.lineTo(hMgn + tw * 0.9, lnY); ctx.stroke();
      ctx.globalAlpha=prev;
    }
    if (cfg.subTitle) {
      ctx.font=`${subTitleSz}px ${SERIF}`; ctx.fillStyle=cfg.subColor;
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      ctx.fillText(cfg.subTitle, hMgn, subRowY);
    }

    // ── Right column: camera model + date/location ──────────────────────────
    const hasCamera = cfg.showCamera && cfg.cameraModel;
    const dateLoc   = [cfg.showDate?cfg.shootDate:'', cfg.showLocation?cfg.location:''].filter(Boolean).join('  ·  ');
    if (hasCamera) {
      ctx.font=`${subSz}px ${SERIF}`; ctx.fillStyle=cfg.subColor;
      ctx.textAlign='right'; ctx.textBaseline='alphabetic';
      ctx.fillText(cfg.cameraModel, totalW-hMgn, titleY);
    }
    if (dateLoc) {
      ctx.font=`${tinySz}px ${SERIF}`; ctx.fillStyle=cfg.subColor;
      ctx.textAlign='right'; ctx.textBaseline='alphabetic';
      ctx.fillText(dateLoc, totalW-hMgn, hasCamera ? subRowY : titleY);
    }

    // ── Bottom row: shoot info (right) + logo/lens (left) ───────────────────
    if (cfg.showShootInfo && cfg.shootInfo) {
      ctx.font=`italic ${tinySz}px ${SERIF}`; ctx.fillStyle=cfg.subColor;
      ctx.textAlign='right'; ctx.textBaseline='alphabetic';
      ctx.fillText(cfg.shootInfo, totalW-hMgn, detailY);
    }
    if (logoImg && logo) {
      const circleSize = Math.round(tinySz * 2.2 * (logo.sizePct / 55));
      drawCircleLogo(ctx, logoImg, logo, hMgn, detailY, circleSize, SERIF, cfg.subColor);
    } else if (cfg.showLens && cfg.lensName) {
      ctx.font=`${tinySz}px ${SERIF}`; ctx.fillStyle=cfg.subColor;
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      ctx.fillText(cfg.lensName, hMgn, detailY);
    }
  }

  if (pad.right>0) {
    hairline(ctx,ox,oy,imgW,imgH,cfg.accentColor,.15);
    drawVContent(ctx,cfg,ox+imgW,pad.right,imgH,oy,SERIF);
  }
}

function decorateTech(ctx: CanvasRenderingContext2D, cfg: FrameConfig,
  ox:number,oy:number,imgW:number,imgH:number,totalW:number,_totalH:number,pad:Pad,
  logoImg?: HTMLImageElement|null, logo?: LogoConfig|null) {
  hairline(ctx,ox,oy,imgW,imgH,cfg.accentColor,.2);

  if (pad.bottom>0) {
    // Accent bar
    const barH = Math.max(1, Math.round(pad.bottom*.018));
    ctx.fillStyle=cfg.accentColor;
    ctx.fillRect(ox, oy+imgH+Math.round(pad.bottom*.08), imgW, barH);

    const r = drawHContent(ctx,cfg,oy+imgH,pad.bottom,totalW,ox,MONO,logoImg,logo);

    // ‹ › brackets flanking main text in accent color
    const bSz = Math.round(r.mainSz * 0.82);
    ctx.font=`bold ${bSz}px ${SAN}`; ctx.fillStyle=cfg.accentColor; ctx.textBaseline='alphabetic';
    const gap = bSz * 0.35;
    ctx.textAlign='right'; ctx.fillText('‹', r.cx - r.mainHalfW - gap, r.rowA);
    ctx.textAlign='left';  ctx.fillText('›', r.cx + r.mainHalfW + gap * 0.3, r.rowA);
  }

  if (pad.top>0) {
    const barH = Math.max(1, Math.round(pad.top*.018));
    ctx.fillStyle=cfg.accentColor;
    ctx.fillRect(ox, oy+pad.top-barH, imgW, barH);
    if (cfg.showShootInfo) {
      const formatted = cfg.shootInfo.split(/\s+/).filter(Boolean).join(' · ');
      if (formatted) {
        ctx.font=`${Math.round(pad.top*.35)}px ${MONO}`; ctx.fillStyle=cfg.subColor;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(formatted, totalW/2, pad.top/2);
      }
    }
  }

  if (pad.right>0) {
    const barW = Math.max(1, Math.round(pad.right*.018));
    ctx.fillStyle=cfg.accentColor;
    ctx.fillRect(ox+imgW+Math.round(pad.right*.08), oy, barW, imgH);
    drawVContent(ctx,cfg,ox+imgW,pad.right,imgH,oy,MONO);
  }
}

function renderFrame(ctx: CanvasRenderingContext2D, ox:number,oy:number,
  imgW:number,imgH:number,totalW:number,totalH:number,pad:Pad,cfg:FrameConfig,
  logoImg?: HTMLImageElement|null, logo?: LogoConfig|null) {
  if (cfg.style==='none') return;
  ctx.textBaseline='alphabetic';
  const b=[ctx,cfg,ox,oy,imgW,imgH,totalW,totalH,pad] as const;
  switch (cfg.style) {
    case 'minimal': decorateMinimal(...b,logoImg,logo); break;
    case 'pro':     decoratePro(...b,logoImg,logo);     break;
    case 'analog':  decorateAnalog(...b,logoImg,logo);  break;
    case 'retro':   decorateRetro(...b,logoImg,logo);   break;
    case 'tech':    decorateTech(...b,logoImg,logo);    break;
  }
}

// ─── EXIF helpers ─────────────────────────────────────────────────────────────
function fmtExp(t: number): string {
  if (t >= 1) return `${t}s`;
  return `1/${Math.round(1/t)}s`;
}
function fmtF(f: number): string {
  return `f/${Number.isInteger(f)?f:f.toFixed(1)}`;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COLOR_PRESETS = ['#ffffff','#000000','#7BABFF','#f59e0b','#ef4444','#10b981','#8b5cf6','#ec4899','#e03030','#FF6900'];
const today = new Date();
const todayStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;

const DEFAULT_FRAME: FrameConfig = {
  style:'none', pos:'bottom', bgColor:'#1c1c1c', accentColor:'#e03030',
  textColor:'#ffffff', subColor:'#999999',
  mainText:'', subTitle:'', cameraModel:'', lensName:'', shootInfo:'', shootDate:todayStr, location:'',
  showCamera:true, showLens:true, showShootInfo:true, showDate:true, showLocation:true,
};
const DEFAULT_LOGO: LogoConfig = { src:null, sizePct:55, opacity:90, username:'' };

// ─── Sub-components ───────────────────────────────────────────────────────────
function Lbl({children}: {children:React.ReactNode}) {
  return <label className="text-xs text-muted-foreground mb-1 block">{children}</label>;
}
function Sel({value,onChange,children}: {value:string;onChange:(v:string)=>void;children:React.ReactNode}) {
  return <select value={value} onChange={e=>onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50">{children}</select>;
}
function Txt({value,onChange,placeholder}: {value:string;onChange:(v:string)=>void;placeholder?:string}) {
  return <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50"/>;
}
function Toggle({on, onChange}: {on:boolean; onChange:(v:boolean)=>void}) {
  return (
    <button onClick={()=>onChange(!on)} aria-pressed={on}
      className={`relative flex-shrink-0 w-8 h-4 rounded-full transition-colors ${on?'bg-primary':'bg-secondary border border-border/60'}`}>
      <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${on?'translate-x-4':''}`}/>
    </button>
  );
}
function ColorSwatches({colors,openKey,onToggle}: {
  colors:{key:string;label:string;value:string;onChange:(v:string)=>void}[];
  openKey:string|null; onToggle:(key:string)=>void;
}) {
  const active = colors.find(c=>c.key===openKey);
  return (
    <div className="bg-secondary/20 rounded-xl px-3 pt-2 pb-2">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">カラー</p>
      <div className="grid grid-cols-4 gap-2">
        {colors.map(({key,label,value})=>(
          <div key={key} className="flex flex-col items-center gap-1">
            <button onClick={()=>onToggle(key)} title={label}
              className={`w-full h-8 rounded-lg border-2 transition-all ${openKey===key?'border-primary ring-2 ring-primary/20':'border-border/50 hover:brightness-110'}`}
              style={{background:value}}/>
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">{label}</span>
          </div>
        ))}
      </div>
      {active&&(
        <div className="mt-2 pt-2 border-t border-border/20">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COLOR_PRESETS.map(c=>(
              <button key={c} onClick={()=>active.onChange(c)}
                className={`w-5 h-5 rounded border-2 transition-transform hover:scale-110 ${active.value===c?'border-primary scale-110':'border-transparent'}`}
                style={{backgroundColor:c}}/>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={active.value} onChange={e=>active.onChange(e.target.value)}
              className="w-7 h-7 rounded border border-border/50 cursor-pointer bg-transparent"/>
            <span className="text-xs font-mono text-muted-foreground">{active.value}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const logoRef   = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string|null>(null);
  const [imgInfo,  setImgInfo]  = useState<ImageInfo|null>(null);
  const [frame,    setFrame]    = useState<FrameConfig>(DEFAULT_FRAME);
  const [logo,     setLogo]     = useState<LogoConfig>(DEFAULT_LOGO);
  const [dragging,      setDragging]      = useState(false);
  const [logoDragging,  setLogoDragging]  = useState(false);
  const [tab,           setTab]           = useState<TabId>('info');
  const [exifLoading,   setExifLoading]   = useState(false);
  const [openColor,     setOpenColor]     = useState<string|null>(null);
  const [shareSupported,setShareSupported]= useState(false);

  useEffect(() => { setShareSupported(typeof navigator !== 'undefined' && 'share' in navigator); }, []);

  // ── Draw ────────────────────────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const pad    = getPad(img.width, img.height, frame.style, frame.pos);
      const totalW = img.width + pad.left + pad.right;
      const totalH = img.height + pad.top + pad.bottom;
      const ox = pad.left, oy = pad.top;

      canvas.width=totalW; canvas.height=totalH;
      ctx.fillStyle = frame.style==='none' ? '#000' : frame.bgColor;
      ctx.fillRect(0,0,totalW,totalH);
      ctx.drawImage(img,ox,oy);

      const drawRest = (li?: HTMLImageElement|null) =>
        renderFrame(ctx,ox,oy,img.width,img.height,totalW,totalH,pad,frame,li??null,logo);

      if (logo.src && frame.style!=='none') {
        const li = new Image();
        li.onload = () => drawRest(li);
        li.src = logo.src;
      } else {
        drawRest(null);
      }
    };
    img.src = imageSrc;
  }, [imageSrc, frame, logo]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  // ── File handler with EXIF ──────────────────────────────────────────────────
  const loadImg = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    // EXIF
    if (file.type === 'image/jpeg' || file.type === 'image/tiff') {
      setExifLoading(true);
      try {
        const exifr = (await import('exifr')).default;
        const exif = await exifr.parse(file, {
          pick: ['Make','Model','LensModel','Lens','FNumber','ExposureTime','ISO','DateTimeOriginal'],
        });
        if (exif) {
          const parts = [
            exif.FNumber ? fmtF(exif.FNumber) : '',
            exif.ExposureTime ? fmtExp(exif.ExposureTime) : '',
            exif.ISO ? `ISO ${exif.ISO}` : '',
          ].filter(Boolean);

          let dateStr = todayStr;
          if (exif.DateTimeOriginal) {
            const d = new Date(exif.DateTimeOriginal);
            if (!isNaN(d.getTime())) {
              dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
            }
          }

          const make  = String(exif.Make  || '').trim();
          const model = String(exif.Model || '').trim();
          // Avoid "SONY SONY Alpha 7 IV" — if model already starts with make, use model alone
          const camModel = (make && model && model.toLowerCase().startsWith(make.toLowerCase()))
            ? model
            : [make, model].filter(Boolean).join(' ').trim();
          const lensRaw = exif.LensModel || exif.Lens;

          setFrame(f => ({
            ...f,
            cameraModel: camModel || f.cameraModel,
            lensName:    lensRaw  ? String(lensRaw).trim() : f.lensName,
            shootInfo:   parts.length ? parts.join('  ')   : f.shootInfo,
            shootDate:   dateStr,
          }));
        }
      } catch { /* no EXIF */ }
      setExifLoading(false);
    }

    // Load image
    const r = new FileReader();
    r.onload = e => {
      const src = e.target?.result as string;
      setImageSrc(src);
      const i = new Image();
      i.onload = () => setImgInfo({ name:file.name, sizeKb:Math.round(file.size/1024), width:i.width, height:i.height, type:file.type });
      i.src = src;
    };
    r.readAsDataURL(file);
    setTab('info');
  };

  const loadLogo = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = e => setLogo(l=>({...l,src:e.target?.result as string}));
    r.readAsDataURL(file);
  };

  const download = () => {
    canvasRef.current?.toBlob(blob=>{
      if (!blob) return;
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url;
      a.download=imgInfo?`edited_${imgInfo.name.replace(/\.[^.]+$/,'.png')}`:'edited.png';
      a.click(); URL.revokeObjectURL(url);
    },'image/png');
  };

  const shareToSNS = async () => {
    if (!imageSrc || !canvasRef.current) return;
    canvasRef.current.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], 'photo.png', { type: 'image/png' });
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file] });
        } else if ('share' in navigator) {
          await navigator.share({ title: 'Photo' });
        }
      } catch { /* cancelled */ }
    }, 'image/png');
  };

  const reset = () => {
    setImageSrc(null); setImgInfo(null);
    setFrame(DEFAULT_FRAME); setLogo(DEFAULT_LOGO);
    if (fileRef.current) fileRef.current.value='';
    if (logoRef.current) logoRef.current.value='';
  };

  const setFF  = <K extends keyof FrameConfig>(k:K,v:FrameConfig[K]) => setFrame(f=>({...f,[k]:v}));
  const setLF  = <K extends keyof LogoConfig>(k:K,v:LogoConfig[K])   => setLogo(l=>({...l,[k]:v}));

  const changeStyle = (s:FrameStyle) => {
    if (s==='none') setFrame(f=>({...f,style:'none'}));
    else setFrame(f=>({...f,style:s,...STYLE_DEFAULTS[s]}));
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  const TABS: {id:TabId;label:string}[] = [
    {id:'info',label:'情報'},{id:'frame',label:'フレーム'},{id:'logo',label:'ロゴ'},
  ];

  const STYLES: [FrameStyle,string,string][] = [
    ['none','なし',''],['minimal','ミニマル','border-l-2 border-red-500'],
    ['pro','プロ','border-l-2 border-orange-500'],['analog','アナログ','border-l-2 border-yellow-500'],
    ['retro','レトロ','border-l-2 border-gray-400'],['tech','テック','border-l-2 border-sky-500'],
  ];

  const POSITIONS: [FramePos,string][] = [
    ['surround','全体'],['bottom','下のみ'],['topbottom','上下'],['right','右のみ'],
  ];


  const hasMeta = frame.style!=='none';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(380px,44%)_1fr] gap-5 items-start">
      {/* Controls — sticky scrollable panel on desktop */}
      <div className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pb-4"
        style={{scrollbarWidth:'thin'}}>
        {/* Upload */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <ImageIcon size={13} className="text-primary"/> 画像をアップロード
            {exifLoading && <span className="ml-auto text-primary animate-pulse">EXIF 取得中...</span>}
          </p>
          <div
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${dragging?'border-primary bg-primary/10':'border-border/60 hover:border-primary/50 hover:bg-primary/5'}`}
            onClick={()=>fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setDragging(true);}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f)loadImg(f);}}
          >
            <Upload size={22} className="mx-auto mb-2 text-muted-foreground"/>
            <p className="text-sm text-muted-foreground">クリック / ドラッグ＆ドロップ</p>
            <p className="text-xs text-muted-foreground/50 mt-1">JPEG の場合 EXIF を自動取得</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)loadImg(f);}}/>
        </div>

        {/* Tabs */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
          <div className="flex border-b border-border/50">
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${tab===t.id?'bg-primary/10 text-primary border-b-2 border-primary':'text-muted-foreground hover:text-foreground hover:bg-secondary/40'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── 情報 ── */}
            {tab==='info' && (
              imgInfo ? (
                <dl className="text-sm">
                  {([
                    ['ファイル名',imgInfo.name],
                    ['形式',imgInfo.type.replace('image/','').toUpperCase()],
                    ['解像度',`${imgInfo.width} × ${imgInfo.height} px`],
                    ['サイズ',`${imgInfo.sizeKb} KB`],
                    ['比率',(()=>{const g=(a:number,b:number):number=>b===0?a:g(b,a%b);const d=g(imgInfo.width,imgInfo.height);return `${imgInfo.width/d} : ${imgInfo.height/d}`;})()],
                    ['MP',`${(imgInfo.width*imgInfo.height/1_000_000).toFixed(1)} MP`],
                  ] as [string,string][]).map(([k,v])=>(
                    <div key={k} className="flex justify-between py-2 border-b border-border/30 last:border-0">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-mono font-bold text-xs">{v}</dd>
                    </div>
                  ))}
                  {(frame.cameraModel||frame.lensName||frame.shootInfo)&&(
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-xs text-primary font-bold mb-2.5">EXIF 取得済み</p>
                      {frame.cameraModel&&<p className="text-xs text-muted-foreground mb-1">カメラ: {frame.cameraModel}</p>}
                      {frame.lensName&&<p className="text-xs text-muted-foreground mb-1">レンズ: {frame.lensName}</p>}
                      {frame.shootInfo&&<p className="text-xs text-muted-foreground font-mono">{frame.shootInfo}</p>}
                    </div>
                  )}
                </dl>
              ) : <p className="text-sm text-muted-foreground text-center py-8">画像をアップロードすると<br/>情報が表示されます</p>
            )}

            {/* ── フレーム ── */}
            {tab==='frame' && (
              <div className="space-y-5">
                {/* Style */}
                <div>
                  <Lbl>スタイル</Lbl>
                  <div className="grid grid-cols-3 gap-2">
                    {STYLES.map(([v,label,accent])=>(
                      <button key={v} onClick={()=>changeStyle(v)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${accent} ${frame.style===v?'bg-primary/15 border-primary/50 text-primary':'bg-secondary/50 border-border/50 text-muted-foreground hover:border-primary/30'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {frame.style!=='none'&&(<>
                  {/* Position */}
                  <div>
                    <Lbl>配置</Lbl>
                    <div className="grid grid-cols-2 gap-2">
                      {POSITIONS.map(([v,label])=>(
                        <button key={v} onClick={()=>setFF('pos',v)}
                          className={`py-2 rounded-lg text-xs font-bold border transition-colors ${frame.pos===v?'bg-primary/15 border-primary/50 text-primary':'bg-secondary/50 border-border/50 text-muted-foreground hover:border-primary/30'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors — 4 swatches in one row, click to expand */}
                  <ColorSwatches
                    openKey={openColor}
                    onToggle={k=>setOpenColor(o=>o===k?null:k)}
                    colors={[
                      {key:'bg',     label:'背景',   value:frame.bgColor,     onChange:v=>setFF('bgColor',v)},
                      {key:'accent', label:'ACC',    value:frame.accentColor, onChange:v=>setFF('accentColor',v)},
                      {key:'text',   label:'文字',   value:frame.textColor,   onChange:v=>setFF('textColor',v)},
                      {key:'sub',    label:'サブ',   value:frame.subColor,    onChange:v=>setFF('subColor',v)},
                    ]}
                  />

                  {/* Text fields — compact */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      情報テキスト
                      {exifLoading&&<span className="text-primary animate-pulse text-[10px]">EXIF取得中</span>}
                    </p>
                    <div>
                      <Lbl>{frame.style==='analog'?'フィルム名':frame.style==='retro'?'タイトル':'メインテキスト'}</Lbl>
                      <Txt value={frame.mainText} onChange={v=>setFF('mainText',v)}
                        placeholder={frame.style==='analog'?'ORIGINAL FILM 400':frame.style==='retro'?'思い出のタイトル':'例: My Shot'}/>
                    </div>
                    <div>
                      <Lbl>サブタイトル</Lbl>
                      <Txt value={frame.subTitle} onChange={v=>setFF('subTitle',v)} placeholder="メインの下に小さく表示"/>
                    </div>
                    {frame.style!=='analog'&&(
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Lbl>カメラ機種</Lbl>
                          <Toggle on={frame.showCamera} onChange={v=>setFF('showCamera',v)}/>
                        </div>
                        <Txt value={frame.cameraModel} onChange={v=>setFF('cameraModel',v)} placeholder="SONY α7 IV"/>
                      </div>
                    )}
                    {hasMeta&&(
                      <div className="grid grid-cols-2 gap-2">
                        {frame.style!=='analog'&&(
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Lbl>レンズ</Lbl>
                              <Toggle on={frame.showLens} onChange={v=>setFF('showLens',v)}/>
                            </div>
                            <Txt value={frame.lensName} onChange={v=>setFF('lensName',v)} placeholder="50mm"/>
                          </div>
                        )}
                        <div className={frame.style==='analog'?'col-span-2':''}>
                          <div className="flex items-center justify-between mb-1">
                            <Lbl>設定値</Lbl>
                            <Toggle on={frame.showShootInfo} onChange={v=>setFF('showShootInfo',v)}/>
                          </div>
                          <Txt value={frame.shootInfo} onChange={v=>setFF('shootInfo',v)} placeholder="f/2 1/250"/>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Lbl>日付</Lbl>
                          <Toggle on={frame.showDate} onChange={v=>setFF('showDate',v)}/>
                        </div>
                        <Txt value={frame.shootDate} onChange={v=>setFF('shootDate',v)} placeholder={todayStr}/>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Lbl>{frame.style==='retro'?'サブ':'場所'}</Lbl>
                          <Toggle on={frame.showLocation} onChange={v=>setFF('showLocation',v)}/>
                        </div>
                        <Txt value={frame.location} onChange={v=>setFF('location',v)} placeholder="Tokyo"/>
                      </div>
                    </div>
                  </div>
                </>)}
              </div>
            )}

            {/* ── ロゴ ── */}
            {tab==='logo' && (
              <div className="space-y-4">
                {frame.style==='none'&&(
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-600 dark:text-amber-400">
                    フレームスタイルを選択するとロゴを配置できます
                  </div>
                )}

                {/* Upload area with D&D */}
                {logo.src ? (
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.src} alt="" className="w-12 h-12 object-contain rounded-lg" style={{background:'repeating-conic-gradient(#80808030 0% 25%,transparent 0% 50%) 0 0/12px 12px'}}/>
                    <span className="text-sm flex-1 text-muted-foreground">ロゴ設定済み</span>
                    <button onClick={()=>{setLogo(l=>({...l,src:null}));if(logoRef.current)logoRef.current.value='';}} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 size={13}/></button>
                  </div>
                ) : (
                  <div
                    onClick={()=>logoRef.current?.click()}
                    onDragOver={e=>{e.preventDefault();setLogoDragging(true);}}
                    onDragLeave={()=>setLogoDragging(false)}
                    onDrop={e=>{e.preventDefault();setLogoDragging(false);const f=e.dataTransfer.files[0];if(f)loadLogo(f);}}
                    className={`w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors select-none ${logoDragging?'border-primary bg-primary/10 text-primary':'border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary'}`}>
                    <Upload size={18}/>
                    <span className="text-sm font-medium">ロゴをアップロード</span>
                    <span className="text-xs opacity-60">クリック または ドラッグ＆ドロップ</span>
                  </div>
                )}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)loadLogo(f);}}/>

                {/* Username — always visible so user can set it before logo */}
                <div>
                  <Lbl>ユーザー名（ロゴの隣に表示）</Lbl>
                  <Txt value={logo.username} onChange={v=>setLF('username',v)} placeholder="@username"/>
                </div>

                {logo.src&&(<>
                  <div className="p-2.5 bg-secondary/30 rounded-lg text-xs text-muted-foreground/70 flex items-center gap-2">
                    <span className="text-primary">●</span>
                    日付の左下に円形で表示されます
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Lbl>サイズ: {logo.sizePct}%</Lbl><input type="range" min={20} max={90} value={logo.sizePct} onChange={e=>setLF('sizePct',+e.target.value)} className="w-full accent-primary"/></div>
                    <div><Lbl>不透明度: {logo.opacity}%</Lbl><input type="range" min={10} max={100} value={logo.opacity} onChange={e=>setLF('opacity',+e.target.value)} className="w-full accent-primary"/></div>
                  </div>
                </>)}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Preview */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 min-h-[500px] flex flex-col">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          プレビュー
          {imageSrc&&(
            <button onClick={()=>{setImageSrc(null);setImgInfo(null);if(fileRef.current)fileRef.current.value='';}}
              className="ml-auto p-1.5 rounded-lg hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors">
              <Trash2 size={12}/>
            </button>
          )}
        </p>
        {imageSrc ? (
          <div className="flex-1 flex items-center justify-center rounded-xl overflow-auto"
            style={{backgroundImage:'repeating-conic-gradient(#80808018 0% 25%,transparent 0% 50%)',backgroundSize:'16px 16px'}}>
            <canvas ref={canvasRef} className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-xl"/>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-xl border-2 border-dashed border-border/30">
            <ImageIcon size={48} strokeWidth={1}/>
            <div className="text-center">
              <p className="text-sm font-medium">画像をアップロードしてください</p>
              <p className="text-xs opacity-50 mt-1">JPEG は撮影情報を自動取得します</p>
            </div>
          </div>
        )}
        {/* Actions below preview */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
          <button onClick={reset} className="flex items-center gap-2 px-3 py-3 rounded-xl border border-border/50 bg-secondary/50 hover:bg-secondary text-sm font-bold transition-colors">
            <RotateCcw size={13}/>
          </button>
          {shareSupported&&(
            <button onClick={shareToSNS} disabled={!imageSrc}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border/50 bg-secondary/50 hover:bg-secondary text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Share2 size={14}/> 共有
            </button>
          )}
          <button onClick={download} disabled={!imageSrc}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Download size={14}/> 保存
          </button>
        </div>
      </div>
    </div>
  );
}
