import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { RichTextSegment } from './types';

export interface LabelDimensions {
  widthMm: number;
  heightMm: number;
  pixelsPerMm: number;
}

export interface TextOptions {
  text: string;
  fontSize: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
}

export interface ImageOptions {
  file: File;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dimensions: LabelDimensions;

  constructor(canvas: HTMLCanvasElement, dimensions: LabelDimensions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dimensions = dimensions;
    this.updateSize();
  }

  /**
   * Update canvas size based on label dimensions
   */
  updateSize(): void {
    // Direct mapping (no rotation for preview)
    this.canvas.width = Math.round(this.dimensions.widthMm * this.dimensions.pixelsPerMm);
    this.canvas.height = Math.round(this.dimensions.heightMm * this.dimensions.pixelsPerMm);

    // Ensure width is multiple of 8 for proper byte alignment
    if (this.canvas.width % 8 !== 0) {
      this.canvas.width = Math.ceil(this.canvas.width / 8) * 8;
    }
  }

  /**
   * Set label dimensions and update canvas size
   */
  setDimensions(dimensions: LabelDimensions): void {
    this.dimensions = dimensions;
    this.updateSize();
  }

  /**
   * Clear canvas to white
   */
  clear(): void {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw text on the canvas
   */
  drawText(options: TextOptions): void {
    this.clear();

    this.ctx.save();

    // Center positioning (no rotation for preview)
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

    // Set text properties
    this.ctx.fillStyle = 'black';
    const weight = options.bold ? 'bold' : 'normal';
    const style = options.italic ? 'italic' : 'normal';
    this.ctx.font = `${style} ${weight} ${options.fontSize}px ${options.fontFamily || 'Arial'}`;
    this.ctx.textBaseline = 'alphabetic';

    // Handle text alignment
    switch (options.alignment) {
      case 'left':
        this.ctx.textAlign = 'left';
        break;
      case 'right':
        this.ctx.textAlign = 'right';
        break;
      case 'center':
      default:
        this.ctx.textAlign = 'center';
        break;
    }

    // No wrapping - keep text on single line
    const lines = [options.text];

    // Calculate actual text bounds for proper centering
    const lineHeight = options.fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;

    // Measure the actual bounds of all text to center based on actual content
    let maxAscent = 0;
    let maxDescent = 0;

    lines.forEach(line => {
      const metrics = this.ctx.measureText(line);
      maxAscent = Math.max(maxAscent, metrics.actualBoundingBoxAscent || metrics.fontBoundingBoxAscent || options.fontSize * 0.8);
      maxDescent = Math.max(maxDescent, metrics.actualBoundingBoxDescent || metrics.fontBoundingBoxDescent || options.fontSize * 0.2);
    });

    // Center based on actual text bounds, not font metrics
    const actualTextHeight = maxAscent + maxDescent;
    const verticalOffset = -actualTextHeight / 2 + maxAscent;
    const startY = verticalOffset - (lines.length - 1) * lineHeight / 2;

    // Debug logging
    console.log('Text-only font:', this.ctx.font);
    console.log('Text-only centering:', {
      text: options.text,
      fontFamily: options.fontFamily,
      fontSize: options.fontSize,
      actualBoundingBoxAscent: lines.map(l => this.ctx.measureText(l).actualBoundingBoxAscent),
      fontBoundingBoxAscent: lines.map(l => this.ctx.measureText(l).fontBoundingBoxAscent),
      actualBoundingBoxDescent: lines.map(l => this.ctx.measureText(l).actualBoundingBoxDescent),
      fontBoundingBoxDescent: lines.map(l => this.ctx.measureText(l).fontBoundingBoxDescent),
      maxAscent,
      maxDescent,
      actualTextHeight,
      verticalOffset,
      startY
    });

    lines.forEach((line, i) => {
      this.ctx.fillText(line, 0, startY + i * lineHeight);
    });

    this.ctx.restore();
  }

  /**
   * Word wrap text to fit within maximum width
   */
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
  }

  /**
   * Draw SVG icon on the canvas with optional label
   */
  async drawIcon(svgContent: string, label?: string): Promise<void> {
    this.clear();

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        const iconSize = Math.min(this.canvas.width, this.canvas.height) * 0.6;
        const yOffset = label ? -20 : 0;

        // Draw icon
        this.ctx.drawImage(img, -iconSize / 2, -iconSize / 2 + yOffset, iconSize, iconSize);

        // Draw label if provided
        if (label) {
          this.ctx.fillStyle = 'black';
          this.ctx.font = '16px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'top';
          this.ctx.fillText(label, 0, iconSize / 2 + yOffset + 10);
        }

        this.ctx.restore();
        URL.revokeObjectURL(img.src);
        resolve();
      };

      img.onerror = () => {
        reject(new Error('Failed to load icon'));
      };

      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(svgBlob);
    });
  }

  /**
   * Draw barcode (CODE128)
   */
  async drawBarcode(data: string): Promise<void> {
    this.clear();

    return new Promise((resolve, reject) => {
      try {
        const tempCanvas = document.createElement('canvas');
        JsBarcode(tempCanvas, data, {
          format: 'CODE128',
          width: 2,
          height: Math.floor(this.canvas.height * 0.7),
          displayValue: true,
          fontSize: 14,
          margin: 10
        });

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        const scale = Math.min(
          (this.canvas.width * 0.9) / tempCanvas.width,
          (this.canvas.height * 0.9) / tempCanvas.height
        );

        const drawWidth = tempCanvas.width * scale;
        const drawHeight = tempCanvas.height * scale;

        this.ctx.drawImage(
          tempCanvas,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );

        this.ctx.restore();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Draw QR code
   */
  async drawQRCode(data: string): Promise<void> {
    this.clear();

    try {
      const size = Math.min(this.canvas.width, this.canvas.height) * 0.8;
      const qrDataUrl = await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'M'
      });

      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          this.ctx.save();
          this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

          this.ctx.drawImage(img, -size / 2, -size / 2, size, size);

          this.ctx.restore();
          resolve();
        };

        img.onerror = () => {
          reject(new Error('Failed to load QR code'));
        };

        img.src = qrDataUrl;
      });
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`);
    }
  }

  /**
   * Draw uploaded image
   */
  async drawImage(file: File): Promise<void> {
    this.clear();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          this.ctx.save();
          this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

          // Calculate scale to fit image within canvas
          const scale = Math.min(
            this.canvas.width / img.width,
            this.canvas.height / img.height
          ) * 0.9;

          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;

          this.ctx.drawImage(
            img,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
          );

          this.ctx.restore();
          resolve();
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Draw text followed by an icon (simple single-line layout)
   */
  async drawTextWithIcon(
    text: string,
    fontSize: number,
    fontFamily: string,
    iconSvg: string,
    iconSize: number
  ): Promise<void> {
    this.clear();

    if (!text && !iconSvg) {
      return;
    }

    this.ctx.save();

    // Center positioning
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

    // Set text properties
    this.ctx.fillStyle = 'black';
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.textBaseline = 'alphabetic';

    // Debug: log the font being used
    console.log('Text+Icon font:', this.ctx.font);

    // Measure text (same logic as drawText method)
    const textMetrics = this.ctx.measureText(text);
    const textWidth = textMetrics.width;

    // Use actualBoundingBox metrics (can be 0), fallback to fontBoundingBox only if undefined
    const maxAscent = textMetrics.actualBoundingBoxAscent ?? textMetrics.fontBoundingBoxAscent ?? fontSize * 0.8;
    const maxDescent = textMetrics.actualBoundingBoxDescent ?? textMetrics.fontBoundingBoxDescent ?? fontSize * 0.2;

    // Calculate text height (same as drawText)
    const actualTextHeight = maxAscent + maxDescent;
    const verticalOffset = -actualTextHeight / 2 + maxAscent;

    // Debug logging
    console.log('Text+Icon centering:', {
      text,
      fontFamily,
      fontSize,
      actualBoundingBoxAscent: textMetrics.actualBoundingBoxAscent,
      fontBoundingBoxAscent: textMetrics.fontBoundingBoxAscent,
      actualBoundingBoxDescent: textMetrics.actualBoundingBoxDescent,
      fontBoundingBoxDescent: textMetrics.fontBoundingBoxDescent,
      maxAscent,
      maxDescent,
      actualTextHeight,
      verticalOffset
    });

    // Calculate total width
    const totalWidth = textWidth + iconSize;

    // Start from left (centered horizontally)
    const startX = -totalWidth / 2;

    // Draw text (using exact same Y position as drawText for single line)
    this.ctx.textAlign = 'left';
    this.ctx.fillText(text, startX, verticalOffset);

    // Draw icon after text, centered vertically (independent of text)
    const iconX = startX + textWidth;

    // Load and draw icon with preserved aspect ratio
    try {
      console.log('Drawing icon, SVG length:', iconSvg?.length, 'Preview:', iconSvg?.substring(0, 100));
      const img = await this.loadSvgImage(iconSvg);

      // Calculate aspect ratio and preserve it
      const aspectRatio = img.width / img.height;
      let drawWidth = iconSize;
      let drawHeight = iconSize;

      if (aspectRatio > 1) {
        // Wide icon - constrain width, reduce height
        drawHeight = iconSize / aspectRatio;
      } else if (aspectRatio < 1) {
        // Tall icon - constrain height, reduce width
        drawWidth = iconSize * aspectRatio;
      }

      // Center the icon vertically based on its actual height
      const iconY = -drawHeight / 2;

      this.ctx.drawImage(img, iconX, iconY, drawWidth, drawHeight);
    } catch (error) {
      console.error('Failed to draw icon:', error, 'SVG:', iconSvg?.substring(0, 200));
      // Draw placeholder if icon fails
      this.ctx.fillRect(iconX, -iconSize / 2, iconSize, iconSize);
    }

    this.ctx.restore();
  }

  /**
   * Load SVG as an image (helper method)
   */
  private loadSvgImage(svgContent: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error('Failed to load SVG'));
      };

      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(svgBlob);
    });
  }

  /**
   * Draw rich text with inline icons
   */
  async drawRichText(segments: RichTextSegment[], fontSize: number, fontFamily: string = 'Arial'): Promise<void> {
    this.clear();

    if (segments.length === 0) {
      return;
    }

    this.ctx.save();

    // Center positioning (no rotation for preview)
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

    // Set text properties
    this.ctx.fillStyle = 'black';
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.textBaseline = 'alphabetic';

    // Measure total width and actual text bounds
    let totalWidth = 0;
    const segmentWidths: number[] = [];
    let maxAscent = 0;
    let maxDescent = 0;

    for (const segment of segments) {
      if (segment.type === 'text') {
        const metrics = this.ctx.measureText(segment.content);
        const width = metrics.width;
        segmentWidths.push(width);
        totalWidth += width;

        // Track actual bounds
        maxAscent = Math.max(maxAscent, metrics.actualBoundingBoxAscent || metrics.fontBoundingBoxAscent || fontSize * 0.8);
        maxDescent = Math.max(maxDescent, metrics.actualBoundingBoxDescent || metrics.fontBoundingBoxDescent || fontSize * 0.2);
      } else if (segment.type === 'icon') {
        const iconSize = segment.size || fontSize;
        segmentWidths.push(iconSize);
        totalWidth += iconSize;
        // Icons take full height
        maxAscent = Math.max(maxAscent, iconSize * 0.8);
        maxDescent = Math.max(maxDescent, iconSize * 0.2);
      }
    }

    // Calculate vertical offset based on actual text bounds
    const actualTextHeight = maxAscent + maxDescent;
    const verticalOffset = -actualTextHeight / 2 + maxAscent;

    // Start drawing from left (centered horizontally)
    let currentX = -totalWidth / 2;

    // Draw each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const segmentWidth = segmentWidths[i];

      if (segment.type === 'text') {
        // Draw text at baseline
        this.ctx.textAlign = 'left';
        this.ctx.fillText(segment.content, currentX, verticalOffset);
      } else if (segment.type === 'icon') {
        // Draw icon aligned with text
        const iconSize = segment.size || fontSize;
        try {
          // Align icon baseline with text baseline
          await this.drawInlineIcon(segment.iconDef.svg, currentX, verticalOffset - iconSize * 0.8, iconSize);
        } catch (error) {
          console.error('Failed to draw icon:', error);
          // Draw placeholder if icon fails
          this.ctx.fillRect(currentX, verticalOffset - iconSize * 0.8, iconSize, iconSize);
        }
      }

      currentX += segmentWidth;
    }

    this.ctx.restore();
  }

  /**
   * Draw an SVG icon inline at a specific position
   */
  private async drawInlineIcon(
    svgContent: string,
    x: number,
    y: number,
    size: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        // Calculate aspect ratio and preserve it
        const aspectRatio = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;

        if (aspectRatio > 1) {
          // Wide icon - constrain width, reduce height
          drawHeight = size / aspectRatio;
        } else if (aspectRatio < 1) {
          // Tall icon - constrain height, reduce width
          drawWidth = size * aspectRatio;
        }

        this.ctx.drawImage(img, x, y - drawHeight / 2, drawWidth, drawHeight);
        URL.revokeObjectURL(img.src);
        resolve();
      };

      img.onerror = () => {
        reject(new Error('Failed to load icon'));
      };

      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(svgBlob);
    });
  }

  /**
   * Draw test pattern with ruler marks
   */
  drawTestPattern(): void {
    this.clear();

    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

    // Draw border
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      -this.canvas.width / 2 + 5,
      -this.canvas.height / 2 + 5,
      this.canvas.width - 10,
      this.canvas.height - 10
    );

    // Draw ruler marks every 10mm
    this.ctx.font = '10px Arial';
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const widthMm = this.dimensions.widthMm;
    for (let i = 0; i <= widthMm; i += 10) {
      const x = -this.canvas.width / 2 + (i / widthMm) * this.canvas.width;
      this.ctx.beginPath();
      this.ctx.moveTo(x, -this.canvas.height / 2 + 5);
      this.ctx.lineTo(x, -this.canvas.height / 2 + 15);
      this.ctx.stroke();
      this.ctx.fillText(`${i}mm`, x, -this.canvas.height / 2 + 25);
    }

    // Draw labels
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillText('TEST PATTERN', 0, -10);
    this.ctx.font = '12px Arial';
    this.ctx.fillText(
      `${this.canvas.width}×${this.canvas.height}px`,
      0,
      10
    );
    this.ctx.fillText(
      `${this.dimensions.widthMm}×${this.dimensions.heightMm}mm @ ${this.dimensions.pixelsPerMm}px/mm`,
      0,
      25
    );

    this.ctx.restore();
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get canvas dimensions info
   */
  getDimensionsInfo(): string {
    return `${this.canvas.width}×${this.canvas.height}px`;
  }
}
