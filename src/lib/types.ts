/**
 * Type definitions for rich text labels with inline icons
 */

import { IconDefinition } from './iconLibraries';

export type SegmentType = 'text' | 'icon';

export interface TextSegment {
  type: 'text';
  content: string;
}

export interface IconSegment {
  type: 'icon';
  iconDef: IconDefinition;
  size?: number; // Size in pixels, defaults to current font size
}

export type RichTextSegment = TextSegment | IconSegment;

export interface RichTextContent {
  segments: RichTextSegment[];
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
}

/**
 * Helper function to create a text segment
 */
export function createTextSegment(content: string): TextSegment {
  return { type: 'text', content };
}

/**
 * Helper function to create an icon segment
 */
export function createIconSegment(iconDef: IconDefinition, size?: number): IconSegment {
  return { type: 'icon', iconDef, size };
}

/**
 * Parse plain text into segments (for initialization)
 */
export function textToSegments(text: string): TextSegment[] {
  return [{ type: 'text', content: text }];
}

/**
 * Convert segments back to plain text (for simple rendering)
 */
export function segmentsToPlainText(segments: RichTextSegment[]): string {
  return segments
    .filter((seg): seg is TextSegment => seg.type === 'text')
    .map(seg => seg.content)
    .join('');
}
