'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useVaultStore } from '@/store/useVaultStore';
import { sounds } from '@/lib/sounds';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'light' | 'dark' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function MagneticButton({ variant = 'light', size = 'md', children, className = '', onMouseEnter, onMouseLeave, ...props }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const { setCursor } = useVaultStore();

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const xTo = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3' });

    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = btn.getBoundingClientRect();
      const x = e.clientX - (left + width / 2);
      const y = e.clientY - (top + height / 2);
      const dist = Math.sqrt(x * x + y * y);
      if (dist < 200) {
        xTo(x * 0.3);
        yTo(y * 0.4);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      btn.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const base = 'magnetic-btn inline-flex items-center justify-center font-bold tracking-widest uppercase relative overflow-hidden rounded-none';
  const variants = {
    light: 'bg-[#F5F3EF] text-[#080808] hover:text-white',
    dark: 'magnetic-btn--dark bg-[#1A1A1A] text-[#F5F3EF] border border-[#2A2A2A]',
    orange: 'bg-[#FF4D00] text-white hover:bg-white hover:text-black',
  };
  const sizes = {
    sm: 'h-9 px-5 text-[11px]',
    md: 'h-12 px-8 text-[12px]',
    lg: 'h-14 px-10 text-[13px]',
  };

  return (
    <button
      ref={btnRef}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onMouseEnter={(e) => {
        setCursor(true, 'GO');
        sounds.hover();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setCursor(false);
        onMouseLeave?.(e);
      }}
      onClick={(e) => {
        sounds.click();
        props.onClick?.(e);
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
