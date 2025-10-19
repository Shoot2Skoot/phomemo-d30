import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

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
   * Note: Canvas is rotated 90° for vertical printing
   */
  updateSize(): void {
    // Swap dimensions for vertical printing (label feeds vertically)
    this.canvas.width = Math.round(this.dimensions.heightMm * this.dimensions.pixelsPerMm);
    this.canvas.height = Math.round(this.dimensions.widthMm * this.dimensions.pixelsPerMm);

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
   * Draw text on the canvas (rotated 90° for vertical printing)
   */
  drawText(options: TextOptions): void {
    this.clear();

    this.ctx.save();

    // Rotate for vertical printing
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(Math.PI / 2);

    // Set text properties
    this.ctx.fillStyle = 'black';
    const weight = options.bold ? 'bold' : 'normal';
    const style = options.italic ? 'italic' : 'normal';
    this.ctx.font = `${style} ${weight} ${options.fontSize}px ${options.fontFamily || 'Arial'}`;
    this.ctx.textBaseline = 'middle';

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

    // Word wrap if needed
    const maxWidth = this.canvas.height * 0.9;
    const lines = this.wrapText(options.text, maxWidth);

    // Draw text lines
    const lineHeight = options.fontSize * 1.2;
    const startY = -(lines.length - 1) * lineHeight / 2;

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
        this.ctx.rotate(Math.PI / 2);

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
          height: Math.floor(this.canvas.width * 0.7),
          displayValue: true,
          fontSize: 14,
          margin: 10
        });

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(Math.PI / 2);

        const scale = Math.min(
          (this.canvas.height * 0.9) / tempCanvas.width,
          (this.canvas.width * 0.9) / tempCanvas.height
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
          this.ctx.rotate(Math.PI / 2);

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
          this.ctx.rotate(Math.PI / 2);

          // Calculate scale to fit image within canvas
          const scale = Math.min(
            this.canvas.height / img.width,
            this.canvas.width / img.height
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
   * Draw test pattern with ruler marks
   */
  drawTestPattern(): void {
    this.clear();

    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(Math.PI / 2);

    // Draw border
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      -this.canvas.height / 2 + 5,
      -this.canvas.width / 2 + 5,
      this.canvas.height - 10,
      this.canvas.width - 10
    );

    // Draw ruler marks every 10mm
    this.ctx.font = '10px Arial';
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const heightMm = this.dimensions.heightMm;
    for (let i = 0; i <= heightMm; i += 10) {
      const x = -this.canvas.height / 2 + (i / heightMm) * this.canvas.height;
      this.ctx.beginPath();
      this.ctx.moveTo(x, -this.canvas.width / 2 + 5);
      this.ctx.lineTo(x, -this.canvas.width / 2 + 15);
      this.ctx.stroke();
      this.ctx.fillText(`${i}mm`, x, -this.canvas.width / 2 + 25);
    }

    // Draw labels
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillText('TEST PATTERN', 0, -10);
    this.ctx.font = '12px Arial';
    this.ctx.fillText(
      `${this.canvas.height}×${this.canvas.width}px`,
      0,
      10
    );
    this.ctx.fillText(
      `${this.dimensions.heightMm}×${this.dimensions.widthMm}mm @ ${this.dimensions.pixelsPerMm}px/mm`,
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
