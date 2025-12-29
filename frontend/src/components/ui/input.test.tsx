import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Input } from './input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should accept and display value', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');

    expect(input).toHaveValue('test value');
  });

  it('should handle onChange events', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should support placeholder', () => {
    render(<Input placeholder="Enter text..." />);

    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should not accept input when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input disabled onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('should support different input types', () => {
    render(<Input type="email" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('should support password type', () => {
    const { container } = render(<Input type="password" />);

    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('should support number type', () => {
    const { container } = render(<Input type="number" />);

    const input = container.querySelector('input[type="number"]');
    expect(input).toBeInTheDocument();
  });

  it('should merge custom className', () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('should have default styling classes', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('rounded-md', 'border', 'border-input');
  });

  it('should have focus ring styles', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-1');
  });

  it('should have disabled cursor style when disabled', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should support controlled input', async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      const [value, setValue] = React.useState('');
      return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
    };

    render(<TestComponent />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'controlled');

    expect(input).toHaveValue('controlled');
  });

  it('should support uncontrolled input', async () => {
    const user = userEvent.setup();
    render(<Input defaultValue="uncontrolled" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('uncontrolled');

    await user.type(input, ' value');
    expect(input).toHaveValue('uncontrolled value');
  });

  it('should support aria attributes', () => {
    render(<Input aria-label="Search input" />);

    expect(screen.getByLabelText('Search input')).toBeInTheDocument();
  });

  it('should support required attribute', () => {
    render(<Input required />);

    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('should support maxLength attribute', async () => {
    const user = userEvent.setup();
    render(<Input maxLength={5} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '123456789');

    expect(input).toHaveValue('12345');
  });

  it('should have transition styles', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('transition-colors');
  });

  it('should have shadow style', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('shadow-sm');
  });

  it('should support onFocus event', async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    render(<Input onFocus={handleFocus} />);

    const input = screen.getByRole('textbox');
    await user.click(input);

    expect(handleFocus).toHaveBeenCalled();
  });

  it('should support onBlur event', async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(<Input onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();

    expect(handleBlur).toHaveBeenCalled();
  });
});
