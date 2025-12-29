import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('should render with placeholder text', () => {
    render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} />);

    expect(screen.getByPlaceholderText(/Search synsets/i)).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} />);

    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should update input value when typing', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'dog');

    expect(input).toHaveValue('dog');
  });

  it('should call onSearch with trimmed query on form submit', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onClear={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, '  dog  ');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith('dog');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('should call onSearch when pressing Enter', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onClear={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'cat{Enter}');

    expect(onSearch).toHaveBeenCalledWith('cat');
  });

  it('should not call onSearch with empty query', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onClear={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should not call onSearch with whitespace-only query', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onClear={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should disable submit button when query is empty', () => {
    render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} />);

    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });

  it('should enable submit button when query has value', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'test');

    expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled();
  });

  it('should show clear button when query has value', async () => {
    const user = userEvent.setup();
    const { container } = render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'test');

    const clearButton = container.querySelector('button[type="button"]');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when query is empty', () => {
    const { container } = render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} />);

    // Should only have the submit button
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(1); // only submit button
  });

  it('should clear input and call onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const { container } = render(<SearchBar onSearch={vi.fn()} onClear={onClear} />);

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'test');

    const clearButton = container.querySelector('button[type="button"]')!;
    await user.click(clearButton);

    expect(input).toHaveValue('');
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('should disable input when loading', () => {
    render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} isLoading={true} />);

    expect(screen.getByPlaceholderText(/Search synsets/i)).toBeDisabled();
  });

  it('should disable submit button when loading', () => {
    render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} isLoading={true} />);

    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();
  });

  it('should show "Searching..." text when loading', () => {
    render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} isLoading={true} />);

    expect(screen.getByRole('button', { name: /searching/i })).toBeInTheDocument();
  });

  it('should show "Search" text when not loading', () => {
    render(<SearchBar onSearch={vi.fn()} onClear={vi.fn()} isLoading={false} />);

    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
  });

  it('should handle rapid typing and submission', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onClear={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'quick test');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith('quick test');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('should prevent form submission when disabled', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onClear={vi.fn()} isLoading={true} />);

    // Try to submit while loading
    const button = screen.getByRole('button', { name: /searching/i });
    await user.click(button);

    expect(onSearch).not.toHaveBeenCalled();
  });
});
