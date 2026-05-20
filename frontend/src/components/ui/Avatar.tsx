import { HTMLAttributes } from 'react';

const PALETTES: [string, string][] = [
  ['#d97757', '#a8442e'],
  ['#c98b5b', '#7a4321'],
  ['#a07434', '#5c3f15'],
  ['#9c6b3f', '#4e3520'],
  ['#b76448', '#6b2a16'],
  ['#cf8e63', '#8a4a26'],
  ['#7a6b4a', '#3e3520'],
  ['#996f5b', '#553124'],
];

function hash(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string;
  size?: AvatarSize;
}

export function Avatar({ name = '', size = 'md', style, ...rest }: AvatarProps) {
  const [a, b] = PALETTES[hash(name) % PALETTES.length];
  const cls = ['avatar', size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : size === 'xl' ? 'xl' : ''].filter(Boolean).join(' ');
  return (
    <span
      className={cls}
      style={{ background: `radial-gradient(120% 100% at 0% 0%, ${a} 0%, ${b} 100%)`, ...style }}
      {...rest}
    >
      {initials(name)}
    </span>
  );
}
