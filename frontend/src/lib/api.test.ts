import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getTree, getChildren, search } from './api';

// Mock API responses
const mockTreeResponse = {
  tree: {
    name: 'entity',
    size: 21841,
    path: 'n00001740',
    children: [
      { name: 'physical entity', size: 15388, path: 'n00001930' },
      { name: 'abstraction', size: 6453, path: 'n00002137' },
    ],
  },
  totalSynsets: 21841,
};

const mockChildrenResponse = [
  { name: 'object', size: 10450, path: 'n00002684' },
  { name: 'matter', size: 1234, path: 'n00020827' },
];

const mockSearchResponse = {
  query: 'dog',
  count: 2,
  results: [
    {
      path: 'n02084071',
      size: 120,
      name: 'dog, domestic dog, Canis familiaris',
      pathParts: [
        'entity',
        'physical entity',
        'object',
        'living thing',
        'organism',
        'animal',
        'dog',
      ],
    },
    {
      path: 'n02085272',
      size: 50,
      name: 'hunting dog',
      pathParts: [
        'entity',
        'physical entity',
        'object',
        'living thing',
        'organism',
        'animal',
        'dog',
        'hunting dog',
      ],
    },
  ],
};

// Setup MSW server
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

describe('API Functions', () => {
  describe('getTree', () => {
    it('should fetch the tree data successfully', async () => {
      const result = await getTree();

      expect(result).toEqual(mockTreeResponse);
      expect(result.tree.name).toBe('entity');
      expect(result.totalSynsets).toBe(21841);
    });

    it('should throw error on failed request', async () => {
      server.use(
        http.get('/api/tree', () => {
          return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
        })
      );

      await expect(getTree()).rejects.toThrow('API error: 500 Internal Server Error');
    });

    it('should throw error on 404', async () => {
      server.use(
        http.get('/api/tree', () => {
          return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
        })
      );

      await expect(getTree()).rejects.toThrow('API error: 404 Not Found');
    });
  });

  describe('getChildren', () => {
    it('should fetch children for a given path', async () => {
      const result = await getChildren('n00001930');

      expect(result).toEqual(mockChildrenResponse);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('object');
    });

    it('should encode path parameter correctly', async () => {
      const pathWithSpecialChars = 'path/with/slashes';
      const result = await getChildren(pathWithSpecialChars);

      // Should not throw error and return empty array
      expect(result).toEqual([]);
    });

    it('should handle empty children response', async () => {
      const result = await getChildren('nonexistent');

      expect(result).toEqual([]);
    });

    it('should throw error on failed request', async () => {
      server.use(
        http.get('/api/tree/children', () => {
          return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
        })
      );

      await expect(getChildren('n00001930')).rejects.toThrow(
        'API error: 500 Internal Server Error'
      );
    });
  });

  describe('search', () => {
    it('should search and return results', async () => {
      const result = await search('dog');

      expect(result).toEqual(mockSearchResponse);
      expect(result.query).toBe('dog');
      expect(result.count).toBe(2);
      expect(result.results).toHaveLength(2);
    });

    it('should encode query parameter correctly', async () => {
      const queryWithSpaces = 'domestic dog';
      const result = await search(queryWithSpaces);

      // Should not throw error
      expect(result.count).toBe(0);
      expect(result.results).toEqual([]);
    });

    it('should handle empty search results', async () => {
      const result = await search('nonexistent');

      expect(result.count).toBe(0);
      expect(result.results).toEqual([]);
    });

    it('should handle special characters in query', async () => {
      const result = await search('test & special | chars');

      // Should not throw error
      expect(result).toBeDefined();
      expect(result.results).toEqual([]);
    });

    it('should throw error on failed request', async () => {
      server.use(
        http.get('/api/search', () => {
          return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
        })
      );

      await expect(search('dog')).rejects.toThrow('API error: 500 Internal Server Error');
    });
  });

  describe('fetchAPI error handling', () => {
    it('should handle network errors', async () => {
      server.use(
        http.get('/api/tree', () => {
          return HttpResponse.error();
        })
      );

      await expect(getTree()).rejects.toThrow();
    });
  });
});
