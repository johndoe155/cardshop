'use client';
import { useMagnetic } from '@/lib/magnetic';
import { useVaultStore } from '@/store/useVaultStore';
import { sounds } from '@/lib/sounds';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'light' | 'dark' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  /** Cursor context label shown in the hover ring. Defaults to 'GO'. */
  cursorLabel?: string;
  children: React.ReactNode;
}

export function MagneticButton({ variant = 'light', size = 'md', cursorLabel = 'GO', children, className = '', onMouseEnter, onMouseLeave, onClick, disabled, ...props }: Props) {
  const magneticRef = useMagnetic();
  const setCursor = useVaultStore((s) => s.setCursor);

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
      ref={(node) => {
        // useMagnetic's ref is a stable slot; assign imperatively (block body — no implicit return)
        (magneticRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onMouseEnter={(e) => {
        setCursor(true, cursorLabel);
        sounds.hover();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setCursor(false);
        onMouseLeave?.(e);
      }}
      onClick={(e) => {
        // Click sound must fire for every magnetic button; call site logic runs after.
        sounds.click();
        onClick?.(e);
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
