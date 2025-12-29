/**
 * Represents a node in the synset tree
 */
export interface TreeNode {
  name: string;
  size: number;
  path?: string;
  children?: TreeNode[];
}

/**
 * Response for the tree API endpoint
 */
export interface TreeResponse {
  tree: TreeNode;
  totalSynsets: number;
}

/**
 * A single search result
 */
export interface SearchResult {
  path: string;
  size: number;
  name: string;
  pathParts: string[];
}

/**
 * Response for the search API endpoint
 */
export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
}
