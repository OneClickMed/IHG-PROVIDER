// src/components/ui/Button.tsx
'use client';

import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps {
  onClick?: () => void;
  title: string;
  variant?: 'filled' | 'outline';
  size?: 'small' | 'medium' | 'large';
  logo?: ReactNode;
  className?: string;
  disabled?: boolean;
  color?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  onClick,
  title,
  disabled = false,
  variant = 'filled',
  size = 'medium',
  logo,
  className = '',
  color,
  type = 'button',
}: ButtonProps) {
  const sizeStyles = {
    small: 'py-2 px-4 text-sm',
    medium: 'py-3 px-6 text-base',
    large: 'py-4 px-8 text-lg',
  };

  // 🔹 Base button styling
  const baseStyles = clsx(
    'w-full rounded-sm flex items-center justify-center gap-2 font-semibold transition-all duration-200',
    disabled && 'opacity-50 cursor-not-allowed',
    sizeStyles[size],
    className
  );

  // 🔹 Handle filled/outlined variants
  let variantClasses = '';
  let textColor = '';

  if (variant === 'filled') {
    variantClasses = disabled
      ? 'bg-gray-400 text-white'
      : color
      ? ''
      : 'bg-primary text-white hover:opacity-90';
    textColor = 'text-white';
  } else {
    variantClasses = disabled
      ? 'border-2 border-gray-400 text-gray-400 bg-transparent'
      : color
      ? 'border-2'
      : 'border-2 border-primary text-primary bg-transparent hover:bg-primary/10';
  }

  // 🔹 Inline color overrides
  const dynamicStyles: React.CSSProperties = {};
  if (color && !disabled) {
    if (variant === 'filled') {
      dynamicStyles.backgroundColor = color;
      dynamicStyles.borderColor = color;
      dynamicStyles.color = '#fff';
    } else {
      dynamicStyles.borderColor = color;
      dynamicStyles.color = color;
    }
  }

  return (
    <button
      type={type}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={clsx(baseStyles, variantClasses)}
      style={dynamicStyles}
    >
      {logo && <span className="flex items-center">{logo}</span>}
      <span>{title}</span>
    </button>
  );
}
