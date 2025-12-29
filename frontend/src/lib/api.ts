import type { TreeNode, TreeResponse, SearchResult, SearchResponse } from '@synset-explorer/shared';

export type { TreeNode, TreeResponse, SearchResult, SearchResponse };

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getTree(): Promise<TreeResponse> {
  return fetchAPI<TreeResponse>('/api/tree');
}

export async function getChildren(path: string): Promise<TreeNode[]> {
  const encodedPath = encodeURIComponent(path);
  return fetchAPI<TreeNode[]>(`/api/tree/children?path=${encodedPath}`);
}

export async function search(query: string): Promise<SearchResponse> {
  const encodedQuery = encodeURIComponent(query);
  return fetchAPI<SearchResponse>(`/api/search?q=${encodedQuery}`);
}
