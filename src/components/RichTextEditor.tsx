/**
 * Rich Text Editor component for creating labels with inline icons
 */

import { useState, useRef } from 'react';
import { RichTextSegment, createTextSegment, createIconSegment } from '../lib/types';
import { IconDefinition, iconLibraries, searchIcons } from '../lib/iconLibraries';
import './RichTextEditor.css';

interface RichTextEditorProps {
  segments: RichTextSegment[];
  onChange: (segments: RichTextSegment[]) => void;
  fontSize: number;
}

export function RichTextEditor({ segments, onChange, fontSize }: RichTextEditorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState('built-in');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(segments.length);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Get available icons based on search and library filter
  const getAvailableIcons = (): IconDefinition[] => {
    if (iconSearchQuery) {
      return searchIcons(iconSearchQuery).filter(icon =>
        selectedLibrary === 'all' || icon.library === selectedLibrary
      );
    }

    if (selectedLibrary === 'all') {
      return iconLibraries.flatMap(lib => lib.icons);
    }

    const library = iconLibraries.find(lib => lib.id === selectedLibrary);
    return library ? library.icons : [];
  };

  const availableIcons = getAvailableIcons();

  // Insert an icon at the current cursor position
  const insertIcon = (iconDef: IconDefinition) => {
    const newSegments = [...segments];
    const iconSegment = createIconSegment(iconDef, fontSize);
    newSegments.splice(cursorPosition, 0, iconSegment);
    onChange(newSegments);
    setCursorPosition(cursorPosition + 1);
    setShowIconPicker(false);
    setIconSearchQuery('');
  };

  // Remove a segment at the given index
  const removeSegment = (index: number) => {
    const newSegments = segments.filter((_, i) => i !== index);
    onChange(newSegments);
    if (cursorPosition > index) {
      setCursorPosition(cursorPosition - 1);
    }
  };

  // Update text segment content
  const updateTextSegment = (index: number, content: string) => {
    const newSegments = [...segments];
    if (newSegments[index].type === 'text') {
      newSegments[index] = createTextSegment(content);
      onChange(newSegments);
    }
  };

  // Add text at cursor position
  const addText = () => {
    const newSegments = [...segments];
    newSegments.splice(cursorPosition, 0, createTextSegment(''));
    onChange(newSegments);
    setCursorPosition(cursorPosition + 1);

    // Focus the newly created text input
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button
          className="btn btn-secondary btn-sm"
          onClick={addText}
          title="Add text"
        >
          ➕ Text
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowIconPicker(!showIconPicker)}
          title="Insert icon"
        >
          🎨 Icon
        </button>
        <span className="toolbar-info">
          {segments.length} segment{segments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Segments display */}
      <div className="segments-container">
        {segments.length === 0 ? (
          <div className="empty-state">
            Click "➕ Text" to add text or "🎨 Icon" to insert an icon
          </div>
        ) : (
          segments.map((segment, index) => (
            <div
              key={index}
              className={`segment-item ${cursorPosition === index ? 'cursor-before' : ''}`}
              onClick={() => setCursorPosition(index)}
            >
              {segment.type === 'text' ? (
                <div className="text-segment">
                  <input
                    ref={index === segments.length - 1 ? textInputRef : null}
                    type="text"
                    className="text-segment-input"
                    value={segment.content}
                    onChange={(e) => updateTextSegment(index, e.target.value)}
                    placeholder="Enter text..."
                    style={{ fontSize: `${Math.min(fontSize / 3, 16)}px` }}
                  />
                </div>
              ) : (
                <div className="icon-segment">
                  <div
                    className="icon-segment-preview"
                    dangerouslySetInnerHTML={{ __html: segment.iconDef.svg }}
                    title={segment.iconDef.name}
                  />
                  <span className="icon-segment-name">{segment.iconDef.name}</span>
                </div>
              )}
              <button
                className="segment-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSegment(index);
                }}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))
        )}
        {/* Cursor at end */}
        {cursorPosition === segments.length && (
          <div className="cursor-indicator">|</div>
        )}
      </div>

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <div className="icon-picker-modal">
          <div className="icon-picker-header">
            <h3>Insert Icon</h3>
            <button
              className="close-btn"
              onClick={() => {
                setShowIconPicker(false);
                setIconSearchQuery('');
              }}
            >
              ✕
            </button>
          </div>

          <div className="icon-picker-filters">
            <div className="form-group">
              <label>Library</label>
              <select
                className="form-control"
                value={selectedLibrary}
                onChange={(e) => setSelectedLibrary(e.target.value)}
              >
                <option value="all">All Libraries</option>
                {iconLibraries.map(lib => (
                  <option key={lib.id} value={lib.id}>
                    {lib.name} ({lib.icons.length})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search icons..."
                value={iconSearchQuery}
                onChange={(e) => setIconSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="icon-picker-grid">
            {availableIcons.length === 0 ? (
              <div className="no-icons-message">
                {iconSearchQuery ? 'No icons found matching your search' : 'No icons available in this library'}
              </div>
            ) : (
              availableIcons.map((icon, idx) => (
                <div
                  key={`${icon.library}-${icon.name}-${idx}`}
                  className="icon-picker-item"
                  onClick={() => insertIcon(icon)}
                  title={`${icon.name} (${icon.library})`}
                >
                  <div dangerouslySetInnerHTML={{ __html: icon.svg }} />
                  <span className="icon-picker-name">{icon.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
