import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('should merge Tailwind classes correctly', () => {
    // twMerge should deduplicate conflicting Tailwind classes
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('should handle undefined and null', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
  });

  it('should handle arrays', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('should handle objects', () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3');
  });

  it('should handle complex combinations', () => {
    expect(
      cn('base-class', { active: true, disabled: false }, ['extra-class'], undefined, 'final-class')
    ).toBe('base-class active extra-class final-class');
  });
});
