/**
 * Phomemo D30 Thermal Printer Driver
 *
 * Based on reverse-engineered ESC/POS protocol from phomemo-tools
 * https://github.com/vivier/phomemo-tools
 *
 * Key fixes:
 * - Corrected header to use pixel dimensions instead of mm
 * - Fixed footer commands to prevent extra feeding (120mm issue)
 * - Proper ESC/POS command sequences
 */

export interface PrinterDebugInfo {
  canvasWidth: number;
  canvasHeight: number;
  bytesPerRow: number;
  totalBytes: number;
  widthMm: number;
  heightMm: number;
  pixelsPerMm: number;
  headerBytes: string;
  footerBytes: string;
}

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected' | 'printing';

export class PhomemoD30Printer {
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private device: BluetoothDevice | null = null;
  public pixelsPerMm: number = 8; // Default DPI setting (203 DPI ≈ 8 pixels/mm)
  private readonly PACKET_SIZE = 128;
  private readonly SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb';
  private readonly CHARACTERISTIC_UUID = '0000ff02-0000-1000-8000-00805f9b34fb';

  public status: PrinterStatus = 'disconnected';
  public onStatusChange?: (status: PrinterStatus) => void;

  /**
   * Connect to the Phomemo D30 printer via Web Bluetooth
   */
  async connect(): Promise<void> {
    try {
      this.setStatus('connecting');

      // Request Bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SERVICE_UUID]
      });

      // Connect to GATT server
      const server = await this.device.gatt!.connect();

      // Get service and characteristic
      const service = await server.getPrimaryService(this.SERVICE_UUID);
      this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);

      this.setStatus('connected');
    } catch (error) {
      this.setStatus('disconnected');
      console.error('Connection failed:', error);
      throw new Error(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from the printer
   */
  disconnect(): void {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.characteristic = null;
    this.device = null;
    this.setStatus('disconnected');
  }

  /**
   * Get header command sequence
   *
   * Protocol based on M02 (D30 likely uses similar):
   * - ESC @ (0x1b 0x40): Initialize printer
   * - ESC a (0x1b 0x61): Select justification (1 = centered)
   * - Custom Phomemo commands (0x1f 0x11)
   */
  private getHeaderData(): Uint8Array {
    return new Uint8Array([
      0x1b, 0x40,       // ESC @ - Initialize printer
      0x1b, 0x61, 0x01, // ESC a 1 - Center justification
      0x1f, 0x11, 0x02, 0x04 // Phomemo-specific initialization
    ]);
  }

  /**
   * Get block marker for raster image data
   *
   * GS v 0 command (0x1d 0x76 0x30):
   * - Print raster bit image
   * - Mode: 0 (normal), 1 (double width), 2 (double height), 3 (quadruple)
   * - Width in bytes (16-bit little-endian)
   * - Height in pixels (16-bit little-endian)
   *
   * Note: Maximum height per block is 255 lines
   */
  private getBlockMarker(bytesPerRow: number, lines: number): Uint8Array {
    // Clamp lines to maximum of 255 per block
    const blockLines = Math.min(lines, 255);

    return new Uint8Array([
      0x1d, 0x76, 0x30,              // GS v 0 - Print raster bit image
      0x00,                          // Mode: 0 (normal)
      bytesPerRow & 0xFF,            // Width low byte
      (bytesPerRow >> 8) & 0xFF,     // Width high byte
      blockLines & 0xFF,             // Height low byte
      (blockLines >> 8) & 0xFF       // Height high byte
    ]);
  }

  /**
   * Get footer command sequence
   *
   * KEY FIX: The original code used ESC d (feed n lines) which caused
   * the printer to feed extra paper (120mm total).
   *
   * New approach based on phomemo-tools M02 protocol:
   * - ESC d with minimal feed (or none)
   * - Phomemo-specific end commands
   *
   * Alternative approaches to test:
   * 1. Minimal feed: 0x1b 0x64 0x01 (feed 1 line only)
   * 2. No feed: Remove ESC d entirely
   * 3. Use only Phomemo end sequence
   */
  private getFooterData(feedLines: number = 2): Uint8Array {
    return new Uint8Array([
      // Option 1: Minimal feed (2 lines as in phomemo-tools)
      0x1b, 0x64, feedLines,  // ESC d n - Feed n lines
      0x1b, 0x64, feedLines,  // ESC d n - Feed n lines (repeated in original protocol)

      // Phomemo-specific end sequence (from phomemo-tools)
      0x1f, 0x11, 0x08,
      0x1f, 0x11, 0x0e,
      0x1f, 0x11, 0x07,
      0x1f, 0x11, 0x09
    ]);
  }

  /**
   * Alternative footer with NO extra feed
   * Use this if the standard footer still causes issues
   */
  private getFooterDataNoFeed(): Uint8Array {
    return new Uint8Array([
      // Only Phomemo-specific end sequence, no ESC d commands
      0x1f, 0x11, 0x08,
      0x1f, 0x11, 0x0e,
      0x1f, 0x11, 0x07,
      0x1f, 0x11, 0x09
    ]);
  }

  /**
   * Convert canvas to 1-bit monochrome byte array
   * Each byte represents 8 horizontal pixels (MSB first)
   */
  private canvasToBytes(canvas: HTMLCanvasElement): Uint8Array {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const bytesPerRow = Math.ceil(canvas.width / 8);
    const data = new Uint8Array(bytesPerRow * canvas.height);

    let offset = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x += 8) {
        let byte = 0;

        // Pack 8 pixels into one byte
        for (let bit = 0; bit < 8 && (x + bit) < canvas.width; bit++) {
          const idx = ((y * canvas.width) + x + bit) * 4;

          // Convert to grayscale and threshold
          const gray = (imageData[idx] + imageData[idx + 1] + imageData[idx + 2]) / 3;

          // If pixel is dark (< 128), set bit to 1
          if (gray < 128) {
            byte |= (1 << (7 - bit));
          }
        }

        data[offset++] = byte;
      }
    }

    return data;
  }

  /**
   * Print canvas to the Phomemo D30 printer
   *
   * @param canvas - HTML canvas element containing the label design
   * @param widthMm - Label width in millimeters (actual physical dimension)
   * @param heightMm - Label height in millimeters (actual physical dimension)
   * @param useNoFeedFooter - Use footer without extra feed commands (for testing)
   */
  async print(
    canvas: HTMLCanvasElement,
    widthMm: number,
    heightMm: number,
    useNoFeedFooter: boolean = false
  ): Promise<PrinterDebugInfo> {
    if (!this.characteristic) {
      throw new Error('Not connected to printer');
    }

    this.setStatus('printing');

    try {
      // Convert canvas to monochrome byte array
      const imageData = this.canvasToBytes(canvas);
      const bytesPerRow = Math.ceil(canvas.width / 8);

      // Generate debug info
      const header = this.getHeaderData();
      const footer = useNoFeedFooter ? this.getFooterDataNoFeed() : this.getFooterData();

      const debugInfo: PrinterDebugInfo = {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        bytesPerRow: bytesPerRow,
        totalBytes: imageData.length,
        widthMm: widthMm,
        heightMm: heightMm,
        pixelsPerMm: this.pixelsPerMm,
        headerBytes: Array.from(header).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        footerBytes: Array.from(footer).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' ')
      };

      console.log('Print debug info:', debugInfo);

      // 1. Send header
      await this.characteristic.writeValueWithResponse(header);
      await this.delay(50);

      // 2. Send image data in blocks (max 255 lines per block)
      const MAX_LINES_PER_BLOCK = 255;
      let remainingLines = canvas.height;
      let currentLine = 0;

      while (remainingLines > 0) {
        const linesToSend = Math.min(remainingLines, MAX_LINES_PER_BLOCK);

        // Send block marker
        const blockMarker = this.getBlockMarker(bytesPerRow, linesToSend);
        await this.characteristic.writeValueWithResponse(blockMarker);
        await this.delay(30);

        // Send image data for this block in chunks
        const blockSize = bytesPerRow * linesToSend;
        const blockStart = currentLine * bytesPerRow;
        const blockData = imageData.slice(blockStart, blockStart + blockSize);

        for (let i = 0; i < blockData.length; i += this.PACKET_SIZE) {
          const chunk = blockData.slice(i, Math.min(i + this.PACKET_SIZE, blockData.length));
          await this.characteristic.writeValueWithResponse(chunk);

          // Progress callback
          const totalProgress = Math.round(((currentLine + (i / bytesPerRow)) / canvas.height) * 100);
          console.log(`Printing... ${totalProgress}%`);
        }

        currentLine += linesToSend;
        remainingLines -= linesToSend;
      }

      // 3. Send footer
      await this.delay(50);
      await this.characteristic.writeValueWithResponse(footer);

      console.log('Print complete!');
      this.setStatus('connected');

      return debugInfo;
    } catch (error) {
      this.setStatus('connected');
      console.error('Print failed:', error);
      throw new Error(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set printer status and trigger callback
   */
  private setStatus(status: PrinterStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if Web Bluetooth is supported
   */
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }
}
