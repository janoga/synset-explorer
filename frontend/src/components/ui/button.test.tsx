import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Button } from './button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );

    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply default variant classes', () => {
    render(<Button>Default</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('should apply outline variant classes', () => {
    render(<Button variant="outline">Outline</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border');
  });

  it('should apply ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('should apply link variant classes', () => {
    render(<Button variant="link">Link</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('underline-offset-4');
  });

  it('should apply default size classes', () => {
    render(<Button>Default Size</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-9', 'px-4');
  });

  it('should apply small size classes', () => {
    render(<Button size="sm">Small</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8', 'text-xs');
  });

  it('should apply large size classes', () => {
    render(<Button size="lg">Large</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
  });

  it('should apply icon size classes', () => {
    render(<Button size="icon">🔍</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-9', 'w-9');
  });

  it('should merge custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should support type attribute', () => {
    render(<Button type="submit">Submit</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('should support button type', () => {
    render(<Button type="button">Button</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should support aria attributes', () => {
    render(<Button aria-label="Test button">Button</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Test button');
  });

  it('should have focus-visible ring styles', () => {
    render(<Button>Focus</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-1');
  });

  it('should have transition classes', () => {
    render(<Button>Transition</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-colors');
  });

  it('should render children correctly', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('should have gap for multiple children', () => {
    render(<Button>Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('gap-2');
  });

  it('should have disabled opacity when disabled', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('should have pointer-events-none when disabled', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled:pointer-events-none');
  });
});
