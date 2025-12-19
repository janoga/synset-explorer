import { useState } from 'react';
import { ChevronRight, ChevronDown, Loader2, Folder, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TreeNode as TreeNodeType } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TreeNodeProps {
  node: TreeNodeType;
  level: number;
  onExpand: (path: string) => Promise<TreeNodeType[]>;
  searchQuery?: string;
  isExpanded?: boolean;
}

export function TreeNode({
  node,
  level,
  onExpand,
  searchQuery,
  isExpanded: forceExpanded,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(forceExpanded || false);
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<TreeNodeType[] | undefined>(node.children);

  const hasChildren = children !== undefined && children.length > 0;
  const canExpand = node.children !== undefined || (node.path && hasChildren);

  const handleToggle = async () => {
    if (!canExpand || !node.path) return;

    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    // If children not loaded yet, fetch them
    if (children === undefined || children.length === 0) {
      setIsLoading(true);
      try {
        const loadedChildren = await onExpand(node.path);
        setChildren(loadedChildren);
        setIsExpanded(true);
      } catch (error) {
        console.error('Failed to load children:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsExpanded(true);
    }
  };

  const highlightText = (text: string, query?: string) => {
    if (!query) return text;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <mark className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded">
          {text.slice(index, index + query.length)}
        </mark>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent/50 transition-colors group',
          canExpand && 'cursor-pointer'
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={canExpand ? handleToggle : undefined}
      >
        {/* Expand/collapse icon */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : canExpand ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : null}
        </div>

        {/* Folder icon */}
        <div className="flex-shrink-0">
          {canExpand ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-400" />
            )
          ) : (
            <div className="h-4 w-4 rounded-full bg-muted" />
          )}
        </div>

        {/* Node name */}
        <span className="text-sm font-medium flex-1 truncate">
          {highlightText(node.name, searchQuery)}
        </span>

        {/* Size badge */}
        <Badge variant="secondary" className="text-xs">
          {node.size.toLocaleString()}
        </Badge>
      </div>

      {/* Children */}
      {isExpanded && children && children.length > 0 && (
        <div className="border-l border-border/50 ml-3">
          {children.map((child, index) => (
            <TreeNode
              key={child.path || `${node.path}-${index}`}
              node={child}
              level={level + 1}
              onExpand={onExpand}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
