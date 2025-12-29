import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { TreeNode } from './TreeNode';
import { TreeNode as TreeNodeType } from '@/lib/api';

const mockNode: TreeNodeType = {
  name: 'entity',
  size: 21841,
  path: 'n00001740',
  children: [
    { name: 'physical entity', size: 15388, path: 'n00001930' },
    { name: 'abstraction', size: 6453, path: 'n00002137' },
  ],
};

const mockLeafNode: TreeNodeType = {
  name: 'dog',
  size: 120,
  path: 'n02084071',
};

const mockNodeWithoutPath: TreeNodeType = {
  name: 'no path node',
  size: 10,
};

describe('TreeNode', () => {
  it('should render node name', () => {
    render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} />);

    expect(screen.getByText('entity')).toBeInTheDocument();
  });

  it('should render node size', () => {
    render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} />);

    expect(screen.getByText('21,841')).toBeInTheDocument();
  });

  it('should render expand icon for node with children', () => {
    render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} />);

    const expandIcon = screen.getByText('entity').closest('div')?.querySelector('svg');
    expect(expandIcon).toBeInTheDocument();
  });

  it('should not render expand icon for leaf node', () => {
    render(<TreeNode node={mockLeafNode} level={0} onExpand={vi.fn()} />);

    // Should not have ChevronRight or ChevronDown icons
    const nodeContainer = screen.getByText('dog').closest('div');
    const chevrons = nodeContainer?.querySelectorAll('svg[class*="h-4 w-4 text-muted-foreground"]');
    expect(chevrons).toHaveLength(0);
  });

  it('should render folder icon for expandable node', () => {
    render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} />);

    const folderIcon = screen
      .getByText('entity')
      .closest('div')
      ?.querySelector('svg.text-blue-400');
    expect(folderIcon).toBeInTheDocument();
  });

  it('should expand node when clicked', async () => {
    const user = userEvent.setup();
    render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} />);

    const nodeElement = screen.getByText('entity').closest('div')!;
    await user.click(nodeElement);

    // Children should be visible
    await waitFor(() => {
      expect(screen.getByText('physical entity')).toBeInTheDocument();
      expect(screen.getByText('abstraction')).toBeInTheDocument();
    });
  });

  it('should collapse node when clicked again', async () => {
    const user = userEvent.setup();
    render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} />);

    const nodeElement = screen.getByText('entity').closest('div')!;

    // Expand
    await user.click(nodeElement);
    await waitFor(() => {
      expect(screen.getByText('physical entity')).toBeInTheDocument();
    });

    // Collapse
    await user.click(nodeElement);
    await waitFor(() => {
      expect(screen.queryByText('physical entity')).not.toBeInTheDocument();
    });
  });

  it('should call onExpand when expanding node without loaded children', async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn().mockResolvedValue([{ name: 'child 1', size: 100, path: 'n001' }]);

    const nodeWithoutChildren: TreeNodeType = {
      name: 'parent',
      size: 100,
      path: 'n00001',
      children: [],
    };

    render(<TreeNode node={nodeWithoutChildren} level={0} onExpand={onExpand} />);

    const nodeElement = screen.getByText('parent').closest('div')!;
    await user.click(nodeElement);

    await waitFor(() => {
      expect(onExpand).toHaveBeenCalledWith('n00001');
    });
  });

  it('should show loading spinner while fetching children', async () => {
    const user = userEvent.setup();
    const onExpand = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([]), 100)));

    const nodeWithoutChildren: TreeNodeType = {
      name: 'parent',
      size: 100,
      path: 'n00001',
      children: [],
    };

    render(<TreeNode node={nodeWithoutChildren} level={0} onExpand={onExpand} />);

    const nodeElement = screen.getByText('parent').closest('div')!;
    await user.click(nodeElement);

    // Should show loading spinner
    const spinner = screen.getByText('parent').closest('div')?.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should highlight search query in node name', () => {
    const { container } = render(
      <TreeNode node={mockNode} level={0} onExpand={vi.fn()} searchQuery="ent" />
    );

    const highlightedText = container.querySelector('mark');
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText).toHaveTextContent('ent');
  });

  it('should be case-insensitive when highlighting', () => {
    const { container } = render(
      <TreeNode node={mockNode} level={0} onExpand={vi.fn()} searchQuery="ENT" />
    );

    const highlightedText = container.querySelector('mark');
    expect(highlightedText).toBeInTheDocument();
  });

  it('should not highlight when search query not found', () => {
    const { container } = render(
      <TreeNode node={mockNode} level={0} onExpand={vi.fn()} searchQuery="xyz" />
    );

    const highlightedText = container.querySelector('mark');
    expect(highlightedText).not.toBeInTheDocument();
  });

  it('should apply correct indentation based on level', () => {
    const { container } = render(<TreeNode node={mockNode} level={2} onExpand={vi.fn()} />);

    const nodeElement = container.querySelector('[style*="padding-left"]');
    expect(nodeElement).toBeInTheDocument();
    // Level 2 should have 2 * 1.5 + 0.5 = 3.5rem padding
    expect(nodeElement).toHaveStyle({ paddingLeft: '3.5rem' });
  });

  it('should apply level 0 indentation', () => {
    const { container } = render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} />);

    const nodeElement = container.querySelector('[style*="padding-left"]');
    expect(nodeElement).toHaveStyle({ paddingLeft: '0.5rem' });
  });

  it('should show open folder icon when expanded', async () => {
    const user = userEvent.setup();
    render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} />);

    const nodeElement = screen.getByText('entity').closest('div')!;
    await user.click(nodeElement);

    await waitFor(() => {
      const openFolderIcon = screen
        .getByText('entity')
        .closest('div')
        ?.querySelector('svg.text-blue-500');
      expect(openFolderIcon).toBeInTheDocument();
    });
  });

  it('should render nested children correctly', async () => {
    const user = userEvent.setup();
    render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} />);

    await user.click(screen.getByText('entity').closest('div')!);

    await waitFor(() => {
      expect(screen.getByText('physical entity')).toBeInTheDocument();
      expect(screen.getByText('15,388')).toBeInTheDocument();
    });
  });

  it('should not be clickable for nodes without path', () => {
    render(<TreeNode node={mockNodeWithoutPath} level={0} onExpand={vi.fn()} />);

    const nodeElement = screen.getByText('no path node').closest('div')!;
    // Should not have cursor-pointer class
    expect(nodeElement).not.toHaveClass('cursor-pointer');
  });

  it('should handle expand errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onExpand = vi.fn().mockRejectedValue(new Error('API Error'));

    const nodeWithoutChildren: TreeNodeType = {
      name: 'parent',
      size: 100,
      path: 'n00001',
      children: [],
    };

    render(<TreeNode node={nodeWithoutChildren} level={0} onExpand={onExpand} />);

    const nodeElement = screen.getByText('parent').closest('div')!;
    await user.click(nodeElement);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should be forcefully expanded when isExpanded prop is true', () => {
    render(<TreeNode node={mockNode} level={0} onExpand={vi.fn()} isExpanded={true} />);

    // Children should be visible immediately
    expect(screen.getByText('physical entity')).toBeInTheDocument();
  });

  it('should display correct size format with thousands separator', () => {
    const largeNode: TreeNodeType = {
      name: 'large node',
      size: 1234567,
      path: 'n001',
    };

    render(<TreeNode node={largeNode} level={0} onExpand={vi.fn()} />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('should pass searchQuery to child nodes', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TreeNode node={mockNode} level={0} onExpand={vi.fn()} searchQuery="physical" />
    );

    const nodeElement = screen.getByText('entity').closest('div')!;
    await user.click(nodeElement);

    await waitFor(() => {
      const marks = container.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
      expect(Array.from(marks).some((mark) => mark.textContent === 'physical')).toBe(true);
    });
  });
});
