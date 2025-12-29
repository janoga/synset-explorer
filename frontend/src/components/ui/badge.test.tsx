import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Badge } from './badge';

describe('Badge', () => {
  it('should render badge with text', () => {
    render(<Badge>Badge Text</Badge>);

    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('should apply default variant classes', () => {
    render(<Badge>Default</Badge>);

    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should apply secondary variant classes', () => {
    render(<Badge variant="secondary">Secondary</Badge>);

    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('should apply outline variant classes', () => {
    render(<Badge variant="outline">Outline</Badge>);

    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('text-foreground');
  });

  it('should merge custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);

    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-class');
  });

  it('should have base styling classes', () => {
    render(<Badge>Badge</Badge>);

    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'border');
  });

  it('should have proper padding', () => {
    render(<Badge>Badge</Badge>);

    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('px-2.5', 'py-0.5');
  });

  it('should have text size class', () => {
    render(<Badge>Badge</Badge>);

    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('text-xs', 'font-semibold');
  });

  it('should have transition classes', () => {
    render(<Badge>Badge</Badge>);

    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('transition-colors');
  });

  it('should have focus ring classes', () => {
    render(<Badge>Badge</Badge>);

    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('should render children correctly', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('should support onClick events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Badge onClick={handleClick}>Clickable</Badge>);

    await user.click(screen.getByText('Clickable'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be a div element', () => {
    const { container } = render(<Badge>Badge</Badge>);

    const badge = container.querySelector('div');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Badge');
  });

  it('should support data attributes', () => {
    render(<Badge data-testid="test-badge">Badge</Badge>);

    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });

  it('should render with number content', () => {
    render(<Badge>42</Badge>);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should handle empty content', () => {
    const { container } = render(<Badge />);

    const badge = container.querySelector('div');
    expect(badge).toBeInTheDocument();
  });

  it('should have border-transparent for default variant', () => {
    render(<Badge>Default</Badge>);

    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('border-transparent');
  });

  it('should have shadow for default variant', () => {
    render(<Badge>Default</Badge>);

    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('shadow');
  });

  it('should support combining with other elements', () => {
    render(
      <div>
        <Badge>Badge 1</Badge>
        <Badge variant="secondary">Badge 2</Badge>
        <Badge variant="outline">Badge 3</Badge>
      </div>
    );

    expect(screen.getByText('Badge 1')).toBeInTheDocument();
    expect(screen.getByText('Badge 2')).toBeInTheDocument();
    expect(screen.getByText('Badge 3')).toBeInTheDocument();
  });

  it('should maintain inline-flex layout', () => {
    render(
      <div>
        <Badge>First</Badge>
        <Badge>Second</Badge>
      </div>
    );

    const badges = screen.getAllByText(/First|Second/);
    badges.forEach((badge) => {
      expect(badge).toHaveClass('inline-flex');
    });
  });
});
