import { ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';

interface CheckboxProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheck?: (checked: boolean) => void;
}

export function Checkbox({ checked, onCheck, ...rest }: CheckboxProps) {
  return (
    <button
      type="button"
      className={`checkbox ${checked ? 'checked' : ''}`}
      onClick={() => onCheck?.(!checked)}
      aria-checked={!!checked}
      role="checkbox"
      {...rest}
    >
      {checked && <Icon name="check" size={14} strokeWidth={2.4} />}
    </button>
  );
}
