/**
 * Print history management for storing and retrieving print jobs
 */

import { FontDefinition } from './fonts';

export interface PrintHistoryItem {
  id: string;
  timestamp: number;
  tab: 'text' | 'texticon' | 'icons' | 'barcode' | 'qr' | 'image';

  // Label dimensions
  dimensions: {
    widthMm: number;
    heightMm: number;
    pixelsPerMm: number;
  };
  autoWidth: boolean;

  // Tab-specific data
  text?: string;
  fontSize?: number;
  selectedFont?: FontDefinition;

  textIconText?: string;
  textIconFont?: FontDefinition;
  textIconFontSize?: number;
  textIconIconSvg?: string;
  textIconIconSize?: number;
  textIconAllCaps?: boolean;
  textIconSmallCaps?: boolean;
  textIconItalic?: boolean;
  textIconFontWeight?: number;

  selectedIcon?: { name: string; svg: string };
  iconLabel?: string;

  barcodeData?: string;
  qrData?: string;

  // Image data stored as base64
  imageDataUrl?: string;

  // Printer settings
  footerMode?: 'standard' | 'nofeed' | 'formfeed' | 'cut' | 'simple' | 'reset' | 'multi' | 'none';
  mediaType?: 'gaps' | 'continuous' | 'marks';
  extraFeedMm?: number;
}

const STORAGE_KEY = 'phomemo-print-history';
const MAX_HISTORY_ITEMS = 50;

/**
 * Get all print history items from localStorage
 */
export function getPrintHistory(): PrintHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load print history:', error);
    return [];
  }
}

/**
 * Save a print job to history
 */
export function savePrintJob(item: Omit<PrintHistoryItem, 'id' | 'timestamp'>): void {
  try {
    const history = getPrintHistory();

    const newItem: PrintHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    // Add to beginning and limit to MAX_HISTORY_ITEMS
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save print job:', error);
  }
}

/**
 * Delete a print history item
 */
export function deletePrintJob(id: string): void {
  try {
    const history = getPrintHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to delete print job:', error);
  }
}

/**
 * Clear all print history
 */
export function clearPrintHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear print history:', error);
  }
}

/**
 * Get a preview label for a print history item
 */
export function getPreviewLabel(item: PrintHistoryItem): string {
  switch (item.tab) {
    case 'text':
      return item.text?.slice(0, 30) || 'Text label';
    case 'texticon':
      return item.textIconText?.slice(0, 30) || 'Text + Icon';
    case 'icons':
      return item.iconLabel || item.selectedIcon?.name || 'Icon';
    case 'barcode':
      return `Barcode: ${item.barcodeData?.slice(0, 20)}`;
    case 'qr':
      return `QR: ${item.qrData?.slice(0, 20)}`;
    case 'image':
      return 'Image label';
    default:
      return 'Unknown';
  }
}
