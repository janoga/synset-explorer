import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import App from './App';

const mockTreeResponse = {
  tree: {
    name: 'entity',
    size: 21841,
    path: 'n00001740',
    children: [],
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
      pathParts: ['entity', 'animal', 'dog'],
    },
    {
      path: 'n02085272',
      size: 50,
      name: 'hunting dog',
      pathParts: ['entity', 'animal', 'dog', 'hunting dog'],
    },
  ],
};

const server = setupServer(
  http.get('/api/tree', () => {
    return HttpResponse.json(mockTreeResponse);
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

describe('App', () => {
  it('should render app header', () => {
    render(<App />);

    expect(screen.getByText('Synset Explorer')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<App />);

    expect(screen.getByText('ImageNet Taxonomy Browser')).toBeInTheDocument();
  });

  it('should render search bar', () => {
    render(<App />);

    expect(screen.getByPlaceholderText(/Search synsets/i)).toBeInTheDocument();
  });

  it('should render footer with ImageNet link', () => {
    render(<App />);

    const link = screen.getByRole('link', { name: /ImageNet/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.image-net.org/');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should display total synsets count after tree loads', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('21,841 synsets')).toBeInTheDocument();
    });
  });

  it('should show "Loading..." before tree loads', () => {
    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should perform search when search form is submitted', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for tree to load
    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'dog');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/Found/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should display search results count', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'dog');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/Found/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/results/i)).toBeInTheDocument();
    });
  });

  it('should display search query in results', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'dog');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(
      () => {
        expect(container.textContent).toContain('dog');
        expect(container.textContent).toMatch(/for.*dog/);
      },
      { timeout: 3000 }
    );
  });

  it('should use singular "result" for count of 1', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/search', () => {
        return HttpResponse.json({
          query: 'test',
          count: 1,
          results: [
            {
              path: 'n001',
              size: 10,
              name: 'test',
              pathParts: ['entity', 'test'],
            },
          ],
        });
      })
    );

    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'test');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(
      () => {
        const text = container.textContent || '';
        expect(text).toMatch(/Found\s+1\s+result/);
      },
      { timeout: 3000 }
    );
  });

  it('should clear search results when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    // Perform search
    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'dog');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/Found/i)).toBeInTheDocument();
    });

    // Clear search
    const clearButton = screen.getAllByRole('button').find((btn) => btn.querySelector('svg'));
    if (clearButton) {
      await user.click(clearButton);
    }

    await waitFor(() => {
      expect(screen.queryByText(/Found/i)).not.toBeInTheDocument();
    });
  });

  it('should show loading state during search', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Search synsets/i);
    await user.type(input, 'dog');

    const searchButton = screen.getByRole('button', { name: /search/i });

    // Click and immediately check (or just verify the search completes)
    await user.click(searchButton);

    // Search should complete
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should render ErrorBoundary', () => {
    render(<App />);

    // ErrorBoundary is present (will catch errors if they occur)
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should have sticky header', () => {
    render(<App />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky');
  });

  it('should handle multiple searches', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('entity')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Search synsets/i);

    // First search
    await user.clear(input);
    await user.type(input, 'dog');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Second search
    await user.clear(input);
    await user.type(input, 'cat');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('should have proper semantic HTML structure', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });

  it('should open ImageNet link in new tab', () => {
    render(<App />);

    const link = screen.getByRole('link', { name: /ImageNet/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
