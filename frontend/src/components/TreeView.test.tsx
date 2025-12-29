import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TreeView } from './TreeView';

const mockTreeResponse = {
  tree: {
    name: 'entity',
    size: 21841,
    path: 'n00001740',
    children: [{ name: 'physical entity', size: 15388, path: 'n00001930', children: [] }],
  },
  totalSynsets: 21841,
};

const mockSearchResponse = {
  query: 'dog',
  count: 2,
  results: [
    {
      path: 'n02084071',
      size: 120,
      name: 'dog, domestic dog',
      pathParts: ['entity', 'physical entity', 'animal', 'dog'],
    },
    {
      path: 'n02085272',
      size: 50,
      name: 'hunting dog',
      pathParts: ['entity', 'physical entity', 'animal', 'dog', 'hunting dog'],
    },
  ],
};

const mockChildrenResponse = [
  { name: 'object', size: 10450, path: 'n00002684' },
  { name: 'matter', size: 1234, path: 'n00020827' },
];

const server = setupServer(
  http.get('/api/tree', () => {
    return HttpResponse.json(mockTreeResponse);
  }),
  http.get('/api/tree/children', ({ request }) => {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    if (path === 'n00001930') {
      return HttpResponse.json(mockChildrenResponse);
    }
    return HttpResponse.json([]);
  }),
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    if (query === 'dog') {
      return HttpResponse.json(mockSearchResponse);
    }
    return HttpResponse.json({ query: query || '', count: 0, results: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TreeView', () => {
  it('should show loading skeleton initially', () => {
    render(<TreeView />);

    // TreeSkeleton component should be rendered
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should load and display tree', async () => {
    render(<TreeView />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });
  });

  it('should call onTreeLoad callback with total synsets', async () => {
    const onTreeLoad = vi.fn();
    render(<TreeView onTreeLoad={onTreeLoad} />);

    await waitFor(() => {
      expect(onTreeLoad).toHaveBeenCalledWith(21841);
    });
  });

  it('should display error message when tree load fails', async () => {
    server.use(
      http.get('/api/tree', () => {
        return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
      })
    );

    render(<TreeView />);

    await waitFor(() => {
      expect(screen.getByText(/API error: 500/i)).toBeInTheDocument();
    });
  });

  it('should show error icon when error occurs', async () => {
    server.use(
      http.get('/api/tree', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<TreeView />);

    await waitFor(() => {
      const errorIcon = screen
        .getByText(/API error/i)
        .closest('div')
        ?.querySelector('svg');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  it('should display search results when searchQuery is provided', async () => {
    const { container } = render(<TreeView searchQuery="dog" />);

    await waitFor(() => {
      const text = container.textContent || '';
      expect(text).toContain('dog, domestic dog');
      expect(text).toContain('hunting dog');
    });
  });

  it('should call onSearchComplete with result count', async () => {
    const onSearchComplete = vi.fn();
    render(<TreeView searchQuery="dog" onSearchComplete={onSearchComplete} />);

    await waitFor(() => {
      expect(onSearchComplete).toHaveBeenCalledWith(2);
    });
  });

  it('should display path parts for search results', async () => {
    render(<TreeView searchQuery="dog" />);

    await waitFor(() => {
      expect(screen.getByText('entity > physical entity > animal > dog')).toBeInTheDocument();
    });
  });

  it('should clear search results when searchQuery becomes empty', async () => {
    const { rerender, container } = render(<TreeView searchQuery="dog" />);

    await waitFor(() => {
      expect(container.textContent).toContain('dog, domestic dog');
    });

    rerender(<TreeView searchQuery="" />);

    await waitFor(() => {
      const text = container.textContent || '';
      expect(text).not.toContain('dog, domestic dog');
      expect(text).toContain('entity');
    });
  });

  it('should handle search errors', async () => {
    server.use(
      http.get('/api/search', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const onSearchComplete = vi.fn();
    render(<TreeView searchQuery="error" onSearchComplete={onSearchComplete} />);

    await waitFor(() => {
      expect(screen.getByText(/Search failed|API error/i)).toBeInTheDocument();
      expect(onSearchComplete).toHaveBeenCalledWith(0);
    });
  });

  it('should load children when node is expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<TreeView />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    // First expand the entity node to see physical entity
    const entityNode = container.querySelector('.cursor-pointer');
    expect(entityNode).toBeDefined();
    await user.click(entityNode!);

    await waitFor(() => {
      expect(container.textContent).toContain('physical entity');
    });

    // Now find and expand the physical entity node
    const nodes = container.querySelectorAll('.cursor-pointer');
    const physicalEntityNode = Array.from(nodes).find((node) =>
      node.textContent?.includes('physical entity')
    );

    expect(physicalEntityNode).toBeDefined();
    await user.click(physicalEntityNode!);

    await waitFor(() => {
      expect(container.textContent).toContain('object');
      expect(container.textContent).toContain('matter');
    });
  });

  it('should handle children load errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    server.use(
      http.get('/api/tree/children', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { container } = render(<TreeView />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    // First expand entity to see physical entity
    const entityNode = container.querySelector('.cursor-pointer');
    expect(entityNode).toBeDefined();
    await user.click(entityNode!);

    await waitFor(() => {
      expect(container.textContent).toContain('physical entity');
    });

    // Find and click the physical entity node (need to wait for it to be rendered as clickable)
    await waitFor(() => {
      const nodes = container.querySelectorAll('.cursor-pointer');
      const physicalEntityNode = Array.from(nodes).find(
        (node, index) => index > 0 && node.textContent?.includes('physical entity')
      );
      expect(physicalEntityNode).toBeDefined();
      return physicalEntityNode;
    });

    const nodes = container.querySelectorAll('.cursor-pointer');
    const physicalEntityNode = Array.from(nodes).find(
      (node, index) => index > 0 && node.textContent?.includes('physical entity')
    );

    await user.click(physicalEntityNode!);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should show "No data available" when tree is null after loading', async () => {
    server.use(
      http.get('/api/tree', () => {
        return HttpResponse.json({ tree: null, totalSynsets: 0 });
      })
    );

    render(<TreeView />);

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  it('should not show loading skeleton once tree is loaded', async () => {
    render(<TreeView />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(0);
  });

  it('should pass searchQuery to TreeNode components', async () => {
    const { container } = render(<TreeView searchQuery="entity" />);

    // First wait for tree to load
    await waitFor(() => {
      expect(screen.getByText(/entity/i)).toBeInTheDocument();
    });

    // Check if the text is highlighted
    const highlightedText = container.querySelector('mark');
    expect(highlightedText).toBeInTheDocument();
  });

  it('should handle whitespace-only search query', async () => {
    render(<TreeView searchQuery="   " />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    // Should not perform search for whitespace-only query
    expect(screen.queryByText(/entity > physical/i)).not.toBeInTheDocument();
  });

  it('should handle rapid search query changes', async () => {
    const { rerender } = render(<TreeView searchQuery="dog" />);

    rerender(<TreeView searchQuery="cat" />);
    rerender(<TreeView searchQuery="bird" />);

    // Should handle without crashing
    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });
  });

  it('should display multiple search results correctly', async () => {
    render(<TreeView searchQuery="dog" />);

    await waitFor(() => {
      const results = screen.getAllByText(/dog/i);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty search results', async () => {
    render(<TreeView searchQuery="nonexistent" />);

    await waitFor(() => {
      // Should show tree when no results found
      expect(screen.getByText('entity')).toBeInTheDocument();
    });
  });

  it('should show loading state during search', async () => {
    const { rerender, container } = render(<TreeView />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    rerender(<TreeView searchQuery="dog" />);

    // Component should handle loading state
    await waitFor(() => {
      expect(container.textContent).toContain('dog, domestic dog');
    });
  });
});
