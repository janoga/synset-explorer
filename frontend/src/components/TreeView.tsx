import { getChildren, getTree, search, SearchResult, TreeNode as TreeNodeType } from '@/lib/api';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TreeNode } from './TreeNode';
import { TreeSkeleton } from './TreeSkeleton';

interface TreeViewProps {
  searchQuery?: string;
  onSearchComplete?: (count: number) => void;
  onTreeLoad?: (totalSynsets: number) => void;
}

export function TreeView({ searchQuery, onSearchComplete, onTreeLoad }: TreeViewProps) {
  const [rootNode, setRootNode] = useState<TreeNodeType | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial tree
  useEffect(() => {
    loadTree();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTree();
      setRootNode(response.tree);
      onTreeLoad?.(response.totalSynsets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tree');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await search(query);
      setSearchResults(response.results);
      onSearchComplete?.(response.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
      onSearchComplete?.(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpand = async (path: string): Promise<TreeNodeType[]> => {
    try {
      return await getChildren(path);
    } catch (err) {
      console.error('Failed to load children:', err);
      return [];
    }
  };

  if (isLoading && !rootNode) {
    return <TreeSkeleton count={5} />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-md">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (!rootNode) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  // Display search results
  if (searchResults.length > 0) {
    return (
      <div className="space-y-1">
        {searchResults.map((result, index) => {
          // Create a node structure for each search result
          const node: TreeNodeType = {
            name: result.name,
            size: result.size,
            path: result.path,
          };

          return (
            <div key={index} className="border-l-2 border-primary/50 pl-2">
              <div className="text-xs text-muted-foreground mb-1 font-mono">
                {result.pathParts.join(' > ')}
              </div>
              <TreeNode node={node} level={0} onExpand={handleExpand} searchQuery={searchQuery} />
            </div>
          );
        })}
      </div>
    );
  }

  // Display full tree
  return (
    <div className="space-y-1">
      <TreeNode node={rootNode} level={0} onExpand={handleExpand} searchQuery={searchQuery} />
    </div>
  );
}
