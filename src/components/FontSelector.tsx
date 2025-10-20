import { useState, useEffect } from 'react';
import { FontDefinition, ALL_FONTS, fontLoader } from '../lib/fonts';
import './FontSelector.css';

interface FontSelectorProps {
  selectedFont: FontDefinition;
  onFontChange: (font: FontDefinition) => void;
  fontSize?: number;
}

export function FontSelector({ selectedFont, onFontChange, fontSize = 48 }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FontDefinition['category'] | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<FontDefinition['source'] | 'all'>('all');
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
  const [fontSource, setFontSource] = useState<'google' | 'bunny'>('google');

  useEffect(() => {
    // Update font loader source when changed
    fontLoader.setSource(fontSource);
  }, [fontSource]);

  const filteredFonts = ALL_FONTS.filter(font => {
    const matchesSearch = font.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || font.category === categoryFilter;
    const matchesSource = sourceFilter === 'all' || font.source === sourceFilter;
    return matchesSearch && matchesCategory && matchesSource;
  });

  const handleFontSelect = async (font: FontDefinition) => {
    if (font.source !== 'system' && !fontLoader.isLoaded(font)) {
      setLoadingFonts(prev => new Set(prev).add(font.name));
      try {
        await fontLoader.loadFont(font);
      } catch (error) {
        console.error('Failed to load font:', error);
        alert(`Failed to load font: ${font.name}. Please try again.`);
        setLoadingFonts(prev => {
          const next = new Set(prev);
          next.delete(font.name);
          return next;
        });
        return;
      }
      setLoadingFonts(prev => {
        const next = new Set(prev);
        next.delete(font.name);
        return next;
      });
    }

    onFontChange(font);
    setIsOpen(false);
  };

  const categories: Array<{ value: FontDefinition['category'] | 'all'; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'sans-serif', label: 'Sans Serif' },
    { value: 'serif', label: 'Serif' },
    { value: 'display', label: 'Display' },
    { value: 'handwriting', label: 'Handwriting' },
    { value: 'monospace', label: 'Monospace' },
  ];

  const sources: Array<{ value: FontDefinition['source'] | 'all'; label: string }> = [
    { value: 'all', label: 'All Sources' },
    { value: 'system', label: 'System Fonts' },
    { value: 'google', label: 'Google Fonts' },
  ];

  return (
    <div className="font-selector">
      <div className="font-selector-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="font-preview" style={{ fontFamily: selectedFont.family, fontSize: Math.min(fontSize, 24) }}>
          {selectedFont.name}
        </div>
        <span className="font-source-badge">{selectedFont.source}</span>
        <button className="dropdown-arrow">{isOpen ? '▲' : '▼'}</button>
      </div>

      {isOpen && (
        <div className="font-selector-dropdown">
          <div className="font-selector-header">
            <h3>Select Font</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="font-selector-filters">
            <div className="form-group">
              <label htmlFor="font-search">Search</label>
              <input
                type="text"
                id="font-search"
                className="form-control"
                placeholder="Search fonts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category-filter">Category</label>
              <select
                id="category-filter"
                className="form-control"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="source-filter">Source</label>
              <select
                id="source-filter"
                className="form-control"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
              >
                {sources.map(src => (
                  <option key={src.value} value={src.value}>{src.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="font-api-source">Font API</label>
              <select
                id="font-api-source"
                className="form-control"
                value={fontSource}
                onChange={(e) => setFontSource(e.target.value as 'google' | 'bunny')}
              >
                <option value="google">Google Fonts</option>
                <option value="bunny">Bunny Fonts (Privacy)</option>
              </select>
              <small style={{ display: 'block', marginTop: '4px' }}>
                Bunny Fonts is a GDPR-compliant alternative to Google Fonts
              </small>
            </div>
          </div>

          <div className="font-list">
            {filteredFonts.length === 0 ? (
              <div className="no-fonts-message">
                No fonts found matching your filters
              </div>
            ) : (
              filteredFonts.map(font => {
                const isLoading = loadingFonts.has(font.name);
                const isSelected = font.name === selectedFont.name;

                return (
                  <div
                    key={font.name}
                    className={`font-list-item ${isSelected ? 'selected' : ''} ${isLoading ? 'loading' : ''}`}
                    onClick={() => !isLoading && handleFontSelect(font)}
                  >
                    <div className="font-item-preview" style={{ fontFamily: font.family }}>
                      {font.name}
                    </div>
                    <div className="font-item-info">
                      <span className="font-category">{font.category}</span>
                      <span className={`font-source-badge ${font.source}`}>{font.source}</span>
                    </div>
                    {isLoading && <div className="loading-spinner">Loading...</div>}
                    {isSelected && <div className="selected-indicator">✓</div>}
                  </div>
                );
              })
            )}
          </div>

          <div className="font-selector-footer">
            <small>
              {filteredFonts.length} font{filteredFonts.length !== 1 ? 's' : ''} available
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
