import { HTMLAttributes } from 'react';

type PillTone = 'neutral' | 'ok' | 'warn' | 'danger' | 'accent';

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
  dot?: boolean;
  mono?: boolean;
}

export function Pill({ tone = 'neutral', dot = false, mono = false, children, className = '', ...rest }: PillProps) {
  const toneClass = tone === 'neutral' ? '' : tone;
  const cls = ['pill', toneClass, mono ? 'mono' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
