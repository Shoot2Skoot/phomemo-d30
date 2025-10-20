import { useState, useEffect } from 'react';
import './IconSearch.css';

interface IconSearchResult {
  name: string;
  library: 'fa' | 'lucide' | 'ph';
  svg: string;
}

interface IconSearchProps {
  onIconSelect: (svg: string) => void;
}

export function IconSearch({ onIconSelect }: IconSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<'fa' | 'lucide' | 'ph' | 'all'>('all');
  const [results, setResults] = useState<IconSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch icons from Iconify API
  const searchIcons = async (query: string, library: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const collections = library === 'all'
        ? ['fa-solid', 'lucide', 'ph']
        : library === 'fa'
          ? ['fa-solid', 'fa-regular']
          : [library];

      const allResults: IconSearchResult[] = [];

      for (const collection of collections) {
        try {
          // Search for icons
          const searchResponse = await fetch(
            `https://api.iconify.design/search?query=${encodeURIComponent(query)}&collection=${collection}&limit=20`
          );
          const searchData = await searchResponse.json();

          if (searchData.icons && searchData.icons.length > 0) {
            // Fetch SVG for each icon
            for (const iconName of searchData.icons.slice(0, 10)) {
              try {
                // Check if iconName already includes the collection prefix
                const fullIconId = iconName.includes(':')
                  ? iconName  // Already has collection prefix
                  : `${collection}:${iconName}`;  // Add collection prefix

                const svgResponse = await fetch(
                  `https://api.iconify.design/${fullIconId}.svg?color=currentColor`
                );

                if (!svgResponse.ok) {
                  console.error(`Failed to fetch ${fullIconId}: ${svgResponse.status}`);
                  continue;
                }

                const svgText = await svgResponse.text();

                // Verify we got valid SVG
                if (!svgText || !svgText.includes('<svg')) {
                  console.error(`Invalid SVG for ${fullIconId}`);
                  continue;
                }

                const libraryType = collection.startsWith('fa-') ? 'fa' :
                                   collection === 'lucide' ? 'lucide' : 'ph';

                // Extract just the icon name (without collection prefix)
                const displayName = iconName.includes(':')
                  ? iconName.split(':')[1]
                  : iconName;

                console.log(`Loaded icon: ${fullIconId}`);
                allResults.push({
                  name: displayName,
                  library: libraryType,
                  svg: svgText
                });
              } catch (err) {
                console.error(`Failed to fetch ${iconName}:`, err);
              }
            }
          }
        } catch (err) {
          console.error(`Failed to search ${collection}:`, err);
        }
      }

      setResults(allResults);
    } catch (error) {
      console.error('Icon search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchIcons(searchTerm, selectedLibrary);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedLibrary]);

  const getLibraryLabel = (lib: 'fa' | 'lucide' | 'ph') => {
    switch (lib) {
      case 'fa': return 'Font Awesome';
      case 'lucide': return 'Lucide';
      case 'ph': return 'Phosphor';
    }
  };

  return (
    <div className="icon-search">
      <div className="icon-search-controls">
        <input
          type="text"
          className="form-control"
          placeholder="Search icons (e.g., 'star', 'home', 'user')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-control"
          value={selectedLibrary}
          onChange={(e) => setSelectedLibrary(e.target.value as any)}
        >
          <option value="all">All Libraries</option>
          <option value="fa">Font Awesome</option>
          <option value="lucide">Lucide</option>
          <option value="ph">Phosphor</option>
        </select>
      </div>

      {loading && (
        <div className="icon-search-loading">Searching icons...</div>
      )}

      {!loading && searchTerm && results.length === 0 && (
        <div className="icon-search-empty">
          No icons found. Try a different search term.
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="icon-search-results">
          {results.map((result, index) => (
            <div
              key={`${result.library}-${result.name}-${index}`}
              className="icon-search-result"
              onClick={() => onIconSelect(result.svg)}
              title={`${getLibraryLabel(result.library)}: ${result.name}`}
            >
              <div
                className="icon-search-result-svg"
                dangerouslySetInnerHTML={{ __html: result.svg }}
              />
              <div className="icon-search-result-info">
                <span className="icon-search-result-name">{result.name}</span>
                <span className={`icon-search-result-badge ${result.library}`}>
                  {result.library.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searchTerm && (
        <div className="icon-search-hint">
          <p>🔍 Search for icons from Font Awesome, Lucide, and Phosphor libraries</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
            Try searching for: star, home, user, heart, settings, check, arrow, etc.
          </p>
        </div>
      )}
    </div>
  );
}
