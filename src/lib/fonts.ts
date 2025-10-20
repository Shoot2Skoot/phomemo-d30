/**
 * Font management utilities for Google Fonts and web-safe fonts
 */

export interface FontDefinition {
  name: string;
  family: string;
  source: 'google' | 'bunny' | 'system';
  category?: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  variants?: string[];
  loadUrl?: string;
}

// Popular Google Fonts (we'll load these on demand)
export const GOOGLE_FONTS: FontDefinition[] = [
  // Sans-serif fonts
  { name: 'Roboto', family: 'Roboto', source: 'google', category: 'sans-serif', variants: ['regular', '700'] },
  { name: 'Open Sans', family: 'Open Sans', source: 'google', category: 'sans-serif', variants: ['regular', '700'] },
  { name: 'Lato', family: 'Lato', source: 'google', category: 'sans-serif', variants: ['regular', '700'] },
  { name: 'Montserrat', family: 'Montserrat', source: 'google', category: 'sans-serif', variants: ['regular', '700'] },
  { name: 'Poppins', family: 'Poppins', source: 'google', category: 'sans-serif', variants: ['regular', '700'] },
  { name: 'Raleway', family: 'Raleway', source: 'google', category: 'sans-serif', variants: ['regular', '700'] },
  { name: 'Inter', family: 'Inter', source: 'google', category: 'sans-serif', variants: ['regular', '700'] },
  { name: 'Nunito', family: 'Nunito', source: 'google', category: 'sans-serif', variants: ['regular', '700'] },
  { name: 'Rubik', family: 'Rubik', source: 'google', category: 'sans-serif', variants: ['regular', '700'] },

  // Serif fonts
  { name: 'Playfair Display', family: 'Playfair Display', source: 'google', category: 'serif', variants: ['regular', '700'] },
  { name: 'Merriweather', family: 'Merriweather', source: 'google', category: 'serif', variants: ['regular', '700'] },
  { name: 'PT Serif', family: 'PT Serif', source: 'google', category: 'serif', variants: ['regular', '700'] },
  { name: 'Lora', family: 'Lora', source: 'google', category: 'serif', variants: ['regular', '700'] },
  { name: 'Crimson Text', family: 'Crimson Text', source: 'google', category: 'serif', variants: ['regular', '700'] },

  // Display fonts
  { name: 'Bebas Neue', family: 'Bebas Neue', source: 'google', category: 'display', variants: ['regular'] },
  { name: 'Anton', family: 'Anton', source: 'google', category: 'display', variants: ['regular'] },
  { name: 'Oswald', family: 'Oswald', source: 'google', category: 'display', variants: ['regular', '700'] },
  { name: 'Archivo Black', family: 'Archivo Black', source: 'google', category: 'display', variants: ['regular'] },

  // Handwriting fonts
  { name: 'Pacifico', family: 'Pacifico', source: 'google', category: 'handwriting', variants: ['regular'] },
  { name: 'Dancing Script', family: 'Dancing Script', source: 'google', category: 'handwriting', variants: ['regular', '700'] },
  { name: 'Caveat', family: 'Caveat', source: 'google', category: 'handwriting', variants: ['regular', '700'] },
  { name: 'Satisfy', family: 'Satisfy', source: 'google', category: 'handwriting', variants: ['regular'] },

  // Monospace fonts
  { name: 'Roboto Mono', family: 'Roboto Mono', source: 'google', category: 'monospace', variants: ['regular', '700'] },
  { name: 'Source Code Pro', family: 'Source Code Pro', source: 'google', category: 'monospace', variants: ['regular', '700'] },
  { name: 'JetBrains Mono', family: 'JetBrains Mono', source: 'google', category: 'monospace', variants: ['regular', '700'] },
];

// Web-safe system fonts (no loading required)
export const SYSTEM_FONTS: FontDefinition[] = [
  { name: 'Arial', family: 'Arial, sans-serif', source: 'system', category: 'sans-serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', source: 'system', category: 'sans-serif' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif', source: 'system', category: 'sans-serif' },
  { name: 'Tahoma', family: 'Tahoma, Geneva, sans-serif', source: 'system', category: 'sans-serif' },
  { name: 'Times New Roman', family: '"Times New Roman", Times, serif', source: 'system', category: 'serif' },
  { name: 'Georgia', family: 'Georgia, serif', source: 'system', category: 'serif' },
  { name: 'Garamond', family: 'Garamond, serif', source: 'system', category: 'serif' },
  { name: 'Courier New', family: '"Courier New", Courier, monospace', source: 'system', category: 'monospace' },
  { name: 'Monaco', family: 'Monaco, "Courier New", monospace', source: 'system', category: 'monospace' },
  { name: 'Comic Sans MS', family: '"Comic Sans MS", cursive', source: 'system', category: 'handwriting' },
  { name: 'Impact', family: 'Impact, Charcoal, sans-serif', source: 'system', category: 'display' },
  { name: 'Trebuchet MS', family: '"Trebuchet MS", Helvetica, sans-serif', source: 'system', category: 'sans-serif' },
];

// Combine all fonts
export const ALL_FONTS: FontDefinition[] = [
  ...SYSTEM_FONTS,
  ...GOOGLE_FONTS,
];

/**
 * Font loader class to manage loading fonts from different sources
 */
export class FontLoader {
  private loadedFonts: Set<string> = new Set();
  private fontSource: 'google' | 'bunny' = 'google'; // Default to Google Fonts

  constructor(source: 'google' | 'bunny' = 'google') {
    this.fontSource = source;
  }

  /**
   * Set the font source (Google Fonts or Bunny Fonts)
   */
  setSource(source: 'google' | 'bunny'): void {
    this.fontSource = source;
  }

  /**
   * Get the API URL for the current font source
   */
  private getApiUrl(fontFamily: string, variants: string[] = ['regular', '700']): string {
    const familyParam = fontFamily.replace(/ /g, '+');
    const weightsParam = variants.map(v => v === 'regular' ? '400' : v).join(',');

    if (this.fontSource === 'bunny') {
      // Bunny Fonts (privacy-focused, GDPR-compliant alternative)
      return `https://fonts.bunny.net/css?family=${familyParam}:${weightsParam}&display=swap`;
    } else {
      // Google Fonts
      return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&display=swap`;
    }
  }

  /**
   * Load a font from Google Fonts or Bunny Fonts
   */
  async loadFont(font: FontDefinition): Promise<void> {
    if (font.source === 'system') {
      // System fonts don't need loading
      return;
    }

    const fontKey = `${this.fontSource}-${font.family}`;
    if (this.loadedFonts.has(fontKey)) {
      // Already loaded
      return;
    }

    try {
      // Create a link element to load the font
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = this.getApiUrl(font.family, font.variants);

      // Wait for the font to load
      await new Promise<void>((resolve, reject) => {
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load font: ${font.name}`));
        document.head.appendChild(link);
      });

      // Use the Font Loading API to ensure the font is ready
      if ('fonts' in document) {
        await document.fonts.load(`16px "${font.family}"`);
      }

      this.loadedFonts.add(fontKey);
    } catch (error) {
      console.error(`Error loading font ${font.name}:`, error);
      throw error;
    }
  }

  /**
   * Check if a font is loaded
   */
  isLoaded(font: FontDefinition): boolean {
    if (font.source === 'system') {
      return true; // System fonts are always available
    }
    const fontKey = `${this.fontSource}-${font.family}`;
    return this.loadedFonts.has(fontKey);
  }

  /**
   * Preload multiple fonts
   */
  async preloadFonts(fonts: FontDefinition[]): Promise<void> {
    const loadPromises = fonts
      .filter(f => f.source !== 'system')
      .map(font => this.loadFont(font).catch(err => {
        console.warn(`Failed to preload ${font.name}:`, err);
      }));

    await Promise.all(loadPromises);
  }
}

// Singleton instance
export const fontLoader = new FontLoader('google');

/**
 * Find a font by name
 */
export function findFont(name: string): FontDefinition | undefined {
  return ALL_FONTS.find(f => f.name === name);
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(category: FontDefinition['category']): FontDefinition[] {
  return ALL_FONTS.filter(f => f.category === category);
}

/**
 * Get fonts by source
 */
export function getFontsBySource(source: FontDefinition['source']): FontDefinition[] {
  return ALL_FONTS.filter(f => f.source === source);
}
