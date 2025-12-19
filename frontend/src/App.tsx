import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SearchBar } from './components/SearchBar';
import { TreeView } from './components/TreeView';
import { Badge } from './components/ui/badge';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [totalSynsets, setTotalSynsets] = useState<number | null>(null);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    setSearchCount(null);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchCount(null);
  };

  const handleSearchComplete = (count: number) => {
    setSearchCount(count);
    setIsSearching(false);
  };

  const handleTreeLoad = (count: number) => {
    setTotalSynsets(count);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Synset Explorer</h1>
                <p className="text-sm text-muted-foreground">ImageNet Taxonomy Browser</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {totalSynsets !== null ? `${totalSynsets.toLocaleString()} synsets` : 'Loading...'}
              </Badge>
            </div>

            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              isLoading={isSearching}
            />

            {searchCount !== null && (
              <div className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{searchCount}</span> result
                {searchCount !== 1 ? 's' : ''}
                {searchQuery && (
                  <>
                    {' '}
                    for "<span className="font-medium">{searchQuery}</span>"
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <ErrorBoundary>
          <div className="bg-card rounded-lg border p-4">
            <TreeView
              searchQuery={searchQuery}
              onSearchComplete={handleSearchComplete}
              onTreeLoad={handleTreeLoad}
            />
          </div>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Data from{' '}
            <a
              href="https://www.image-net.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ImageNet
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
