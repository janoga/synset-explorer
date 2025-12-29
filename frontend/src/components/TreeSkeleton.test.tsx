import { describe, it, expect } from 'vitest';
import { render } from '@/test/test-utils';
import { TreeSkeleton } from './TreeSkeleton';

describe('TreeSkeleton', () => {
  it('should render default number of skeleton items', () => {
    const { container } = render(<TreeSkeleton />);

    const skeletonItems = container.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBe(3); // default count
  });

  it('should render custom number of skeleton items', () => {
    const { container } = render(<TreeSkeleton count={5} />);

    const skeletonItems = container.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBe(5);
  });

  it('should render single skeleton item', () => {
    const { container } = render(<TreeSkeleton count={1} />);

    const skeletonItems = container.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBe(1);
  });

  it('should render many skeleton items', () => {
    const { container } = render(<TreeSkeleton count={10} />);

    const skeletonItems = container.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBe(10);
  });

  it('should apply default padding for level 0', () => {
    const { container } = render(<TreeSkeleton level={0} />);

    const firstItem = container.querySelector('.animate-pulse');
    expect(firstItem).toHaveStyle({ paddingLeft: '0.5rem' });
  });

  it('should apply correct padding for level 1', () => {
    const { container } = render(<TreeSkeleton level={1} />);

    const firstItem = container.querySelector('.animate-pulse');
    // level 1: 1 * 1.5 + 0.5 = 2rem
    expect(firstItem).toHaveStyle({ paddingLeft: '2rem' });
  });

  it('should apply correct padding for level 2', () => {
    const { container } = render(<TreeSkeleton level={2} />);

    const firstItem = container.querySelector('.animate-pulse');
    // level 2: 2 * 1.5 + 0.5 = 3.5rem
    expect(firstItem).toHaveStyle({ paddingLeft: '3.5rem' });
  });

  it('should apply correct padding for deep nesting', () => {
    const { container } = render(<TreeSkeleton level={5} />);

    const firstItem = container.querySelector('.animate-pulse');
    // level 5: 5 * 1.5 + 0.5 = 8rem
    expect(firstItem).toHaveStyle({ paddingLeft: '8rem' });
  });

  it('should have animation pulse class on all items', () => {
    const { container } = render(<TreeSkeleton count={4} />);

    const skeletonItems = container.querySelectorAll('.animate-pulse');
    skeletonItems.forEach((item) => {
      expect(item).toHaveClass('animate-pulse');
    });
  });

  it('should render expand icon skeleton', () => {
    const { container } = render(<TreeSkeleton />);

    const firstItem = container.querySelector('.animate-pulse');
    const expandIconSkeleton = firstItem?.querySelector('.w-4.h-4.bg-muted.rounded.flex-shrink-0');
    expect(expandIconSkeleton).toBeInTheDocument();
  });

  it('should render all skeleton elements in each item', () => {
    const { container } = render(<TreeSkeleton count={1} />);

    const skeletonItem = container.querySelector('.animate-pulse');

    // Should have multiple skeleton divs
    const skeletonDivs = skeletonItem?.querySelectorAll('.bg-muted');
    expect(skeletonDivs?.length).toBeGreaterThanOrEqual(4); // icons + name + badge
  });

  it('should have proper flexbox layout', () => {
    const { container } = render(<TreeSkeleton />);

    const firstItem = container.querySelector('.animate-pulse');
    expect(firstItem).toHaveClass('flex', 'items-center', 'gap-2');
  });

  it('should have proper spacing classes', () => {
    const { container } = render(<TreeSkeleton />);

    const wrapper = container.querySelector('.space-y-1');
    expect(wrapper).toBeInTheDocument();
  });

  it('should render name skeleton with flex-1', () => {
    const { container } = render(<TreeSkeleton />);

    const firstItem = container.querySelector('.animate-pulse');
    const nameSkeleton = firstItem?.querySelector('.flex-1');
    expect(nameSkeleton).toBeInTheDocument();
    expect(nameSkeleton).toHaveClass('h-4', 'bg-muted', 'rounded');
  });

  it('should render badge skeleton with fixed width', () => {
    const { container } = render(<TreeSkeleton />);

    const firstItem = container.querySelector('.animate-pulse');
    const badgeSkeleton = firstItem?.querySelector('.h-5.w-12');
    expect(badgeSkeleton).toBeInTheDocument();
    expect(badgeSkeleton).toHaveClass('bg-muted', 'rounded');
  });

  it('should apply consistent styling to all skeleton items', () => {
    const { container } = render(<TreeSkeleton count={3} />);

    const skeletonItems = container.querySelectorAll('.animate-pulse');
    skeletonItems.forEach((item) => {
      expect(item).toHaveClass('flex', 'items-center', 'gap-2', 'py-1', 'px-2');
    });
  });

  it('should render with both custom count and level', () => {
    const { container } = render(<TreeSkeleton count={7} level={3} />);

    const skeletonItems = container.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBe(7);

    const firstItem = skeletonItems[0];
    // level 3: 3 * 1.5 + 0.5 = 5rem
    expect(firstItem).toHaveStyle({ paddingLeft: '5rem' });
  });

  it('should render with zero level', () => {
    const { container } = render(<TreeSkeleton level={0} />);

    const skeletonItems = container.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBeGreaterThan(0);
  });

  it('should have proper vertical spacing between items', () => {
    const { container } = render(<TreeSkeleton count={3} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('space-y-1');
  });

  it('should render icon skeletons with shrink-0', () => {
    const { container } = render(<TreeSkeleton />);

    const firstItem = container.querySelector('.animate-pulse');
    const iconSkeletons = firstItem?.querySelectorAll('.flex-shrink-0');
    expect(iconSkeletons?.length).toBeGreaterThanOrEqual(2); // expand icon + folder icon
  });
});
