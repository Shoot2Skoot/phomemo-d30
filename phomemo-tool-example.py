<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phomemo D30 Label Printer</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 20px;
            margin-bottom: 30px;
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
        }

        .card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            padding: 24px;
            backdrop-filter: blur(10px);
        }

        .tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 2px;
        }

        .tab-button {
            padding: 10px 20px;
            background: none;
            border: none;
            font-size: 1rem;
            color: #64748b;
            cursor: pointer;
            position: relative;
            transition: color 0.3s;
        }

        .tab-button:hover {
            color: #475569;
        }

        .tab-button.active {
            color: #667eea;
            font-weight: 600;
        }

        .tab-button.active::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            right: 0;
            height: 3px;
            background: #667eea;
            border-radius: 3px 3px 0 0;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
            animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #334155;
            font-weight: 500;
            font-size: 0.95rem;
        }

        .form-control {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-control:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-group {
            display: flex;
            gap: 10px;
        }

        .input-group .form-control {
            flex: 1;
        }

        textarea.form-control {
            min-height: 100px;
            resize: vertical;
            font-family: inherit;
        }

        .preview-section {
            position: sticky;
            top: 20px;
        }

        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .preview-header h2 {
            color: #334155;
            font-size: 1.3rem;
        }

        .canvas-container {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
            position: relative;
            overflow: hidden;
        }

        #canvas {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background: white;
        }

        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 24px;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn:hover {
            transform: translateY(-2px);
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: #f1f5f9;
            color: #475569;
        }

        .btn-secondary:hover {
            background: #e2e8f0;
        }

        .settings-panel {
            background: #f8fafc;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
        }

        .settings-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #334155;
            margin-bottom: 16px;
        }

        .slider-container {
            margin-bottom: 16px;
        }

        .slider-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            color: #64748b;
            font-size: 0.9rem;
        }

        .slider {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #e2e8f0;
            outline: none;
            -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #667eea;
            cursor: pointer;
        }

        .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #667eea;
            cursor: pointer;
            border: none;
        }

        .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 12px;
            max-height: 300px;
            overflow-y: auto;
            padding: 4px;
        }

        .icon-item {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            border: 2px solid transparent;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .icon-item:hover {
            background: white;
            border-color: #667eea;
            transform: scale(1.05);
        }

        .icon-item svg {
            width: 40px;
            height: 40px;
            color: #475569;
        }

        .status-message {
            padding: 12px 16px;
            border-radius: 8px;
            margin-top: 16px;
            display: none;
            align-items: center;
            gap: 8px;
        }

        .status-message.success {
            background: #10b981;
            color: white;
            display: flex;
        }

        .status-message.error {
            background: #ef4444;
            color: white;
            display: flex;
        }

        .status-message.info {
            background: #3b82f6;
            color: white;
            display: flex;
        }

        .debug-panel {
            margin-top: 20px;
            padding: 16px;
            background: #fef3c7;
            border: 2px solid #fbbf24;
            border-radius: 8px;
        }

        .debug-panel h3 {
            color: #92400e;
            margin-bottom: 12px;
            font-size: 1.1rem;
        }

        .debug-info {
            background: white;
            padding: 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            color: #1f2937;
            line-height: 1.6;
        }

        .calibration-section {
            background: #eff6ff;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
        }

        .calibration-section h3 {
            color: #1e40af;
            margin-bottom: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏷️ Phomemo D30 Label Printer</h1>
            <p>Advanced label printing with Web Bluetooth</p>
        </div>

        <div class="main-content">
            <div class="card">
                <div class="tabs">
                    <button class="tab-button active" data-tab="text">📝 Text</button>
                    <button class="tab-button" data-tab="icons">🎨 Icons</button>
                    <button class="tab-button" data-tab="barcode">📊 Barcode</button>
                    <button class="tab-button" data-tab="qr">📱 QR Code</button>
                    <button class="tab-button" data-tab="image">🖼️ Image</button>
                </div>

                <div class="tab-content active" id="text-tab">
                    <div class="form-group">
                        <label for="text-input">Label Text</label>
                        <textarea class="form-control" id="text-input" placeholder="Enter your label text here...">Hello World!</textarea>
                    </div>
                    <div class="form-group">
                        <label for="font-size">Font Size</label>
                        <div class="slider-container">
                            <div class="slider-label">
                                <span>Size</span>
                                <span id="font-size-value">48px</span>
                            </div>
                            <input type="range" class="slider" id="font-size" min="12" max="120" value="48">
                        </div>
                    </div>
                </div>

                <div class="tab-content" id="icons-tab">
                    <div class="form-group">
                        <label>Select an Icon</label>
                        <div class="icon-grid" id="icon-grid">
                            <!-- Icons will be populated here -->
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="icon-text">Icon Label (Optional)</label>
                        <input type="text" class="form-control" id="icon-text" placeholder="Add text below icon...">
                    </div>
                </div>

                <div class="tab-content" id="barcode-tab">
                    <div class="form-group">
                        <label for="barcode-input">Barcode Data (CODE128)</label>
                        <input type="text" class="form-control" id="barcode-input" value="123456789">
                    </div>
                </div>

                <div class="tab-content" id="qr-tab">
                    <div class="form-group">
                        <label for="qr-input">QR Code Data</label>
                        <input type="text" class="form-control" id="qr-input" value="https://example.com">
                    </div>
                </div>

                <div class="tab-content" id="image-tab">
                    <div class="form-group">
                        <label for="image-input">Upload Image</label>
                        <input type="file" class="form-control" id="image-input" accept="image/*">
                    </div>
                </div>

                <div class="settings-panel">
                    <div class="settings-title">📐 Label Dimensions</div>
                    <div class="input-group">
                        <div class="form-group">
                            <label for="label-width">Width (mm)</label>
                            <input type="number" class="form-control" id="label-width" value="40" min="10" max="100">
                        </div>
                        <div class="form-group">
                            <label for="label-height">Height (mm)</label>
                            <input type="number" class="form-control" id="label-height" value="12" min="10" max="100">
                        </div>
                    </div>
                </div>

                <div class="calibration-section">
                    <h3>🔧 Printer Calibration</h3>
                    <div class="form-group">
                        <label for="dpi-setting">DPI / Scaling Factor</label>
                        <div class="slider-container">
                            <div class="slider-label">
                                <span>Pixels per mm</span>
                                <span id="dpi-value">8</span>
                            </div>
                            <input type="range" class="slider" id="dpi-setting" min="4" max="16" value="8" step="0.5">
                        </div>
                        <small style="color: #64748b;">Adjust if labels print too long/short. Default is 8.</small>
                    </div>
                </div>

                <div class="button-group">
                    <button class="btn btn-primary" id="print-btn">
                        🖨️ Connect & Print
                    </button>
                    <button class="btn btn-secondary" id="test-btn">
                        🧪 Test Pattern
                    </button>
                </div>

                <div class="status-message" id="status-message"></div>

                <div class="debug-panel">
                    <h3>🐛 Debug Information</h3>
                    <div class="debug-info" id="debug-info">
                        Ready for connection...
                    </div>
                </div>
            </div>

            <div class="card preview-section">
                <div class="preview-header">
                    <h2>Preview</h2>
                    <small style="color: #64748b;">↻ Rotated 90°</small>
                </div>
                <div class="canvas-container">
                    <canvas id="canvas"></canvas>
                </div>
                <div style="margin-top: 12px; color: #64748b; font-size: 0.9rem;">
                    <p>📍 Label feeds vertically through printer</p>
                    <p>📏 Canvas: <span id="canvas-size">-</span></p>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js"></script>
    <script>
        // Printer communication class
        class PhomemoD30Printer {
            constructor() {
                this.characteristic = null;
                this.pixelsPerMm = 8; // Default, adjustable for calibration
                this.PACKET_SIZE = 128;
            }

            async connect() {
                try {
                    const device = await navigator.bluetooth.requestDevice({
                        acceptAllDevices: true,
                        optionalServices: ["0000ff00-0000-1000-8000-00805f9b34fb"]
                    });
                    
                    const server = await device.gatt.connect();
                    const service = await server.getPrimaryService("0000ff00-0000-1000-8000-00805f9b34fb");
                    this.characteristic = await service.getCharacteristic("0000ff02-0000-1000-8000-00805f9b34fb");
                    
                    return true;
                } catch (error) {
                    console.error('Connection failed:', error);
                    throw error;
                }
            }

            getHeaderData(widthMm, bytesPerRow, heightMm) {
                // Try sending actual mm dimensions
                return new Uint8Array([
                    0x1b, 0x40, // Initialize printer
                    0x1d, 0x76, 0x30, 0x00, // Print raster bit image
                    widthMm % 256,
                    Math.floor(widthMm / 256),
                    bytesPerRow % 256,
                    Math.floor(bytesPerRow / 256)
                ]);
            }

            getEndData() {
                // Try different end sequences
                return new Uint8Array([0x1b, 0x64, 0x00]); // Feed and cut
            }

            canvasToBytes(canvas) {
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                const data = new Uint8Array((canvas.width / 8) * canvas.height);
                
                let offset = 0;
                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x += 8) {
                        let byte = 0;
                        for (let bit = 0; bit < 8; bit++) {
                            const idx = ((y * canvas.width) + x + bit) * 4;
                            const gray = (imageData[idx] + imageData[idx + 1] + imageData[idx + 2]) / 3;
                            if (gray < 128) byte |= (1 << (7 - bit));
                        }
                        data[offset++] = byte;
                    }
                }
                
                return data;
            }

            async print(canvas, widthMm, heightMm) {
                if (!this.characteristic) {
                    throw new Error('Not connected to printer');
                }

                const data = this.canvasToBytes(canvas);
                const bytesPerRow = canvas.width / 8;
                
                // Log debug info
                const debugInfo = {
                    canvasWidth: canvas.width,
                    canvasHeight: canvas.height,
                    bytesPerRow: bytesPerRow,
                    totalBytes: data.length,
                    widthMm: widthMm,
                    heightMm: heightMm,
                    pixelsPerMm: this.pixelsPerMm
                };
                console.log('Print debug:', debugInfo);
                updateDebugInfo(debugInfo);

                // Send header
                const header = this.getHeaderData(widthMm, bytesPerRow, heightMm);
                await this.characteristic.writeValueWithResponse(header);

                // Send data in chunks
                for (let i = 0; i < data.length; i += this.PACKET_SIZE) {
                    const chunk = data.slice(i, Math.min(i + this.PACKET_SIZE, data.length));
                    await this.characteristic.writeValueWithResponse(chunk);
                    
                    const progress = Math.round((i / data.length) * 100);
                    showStatus(`Printing... ${progress}%`, 'info');
                }

                // Send end command
                await this.characteristic.writeValueWithResponse(this.getEndData());
                
                showStatus('Print complete!', 'success');
            }
        }

        // Global printer instance
        const printer = new PhomemoD30Printer();

        // Canvas management
        class CanvasManager {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.ctx = this.canvas.getContext('2d');
            }

            updateSize(widthMm, heightMm, pixelsPerMm) {
                // Swap dimensions for vertical printing
                this.canvas.width = Math.round(heightMm * pixelsPerMm);
                this.canvas.height = Math.round(widthMm * pixelsPerMm);
                
                // Update display info
                document.getElementById('canvas-size').textContent = 
                    `${this.canvas.width}×${this.canvas.height}px`;
            }

            clear() {
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }

            drawText(text, fontSize) {
                this.clear();
                
                // Rotate for vertical printing
                this.ctx.save();
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.rotate(Math.PI / 2);
                
                this.ctx.fillStyle = 'black';
                this.ctx.font = `${fontSize}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                // Word wrap if needed
                const maxWidth = this.canvas.height * 0.9;
                const words = text.split(' ');
                const lines = [];
                let currentLine = '';
                
                for (let word of words) {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const metrics = this.ctx.measureText(testLine);
                    
                    if (metrics.width > maxWidth && currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine) lines.push(currentLine);
                
                const lineHeight = fontSize * 1.2;
                const startY = -(lines.length - 1) * lineHeight / 2;
                
                lines.forEach((line, i) => {
                    this.ctx.fillText(line, 0, startY + i * lineHeight);
                });
                
                this.ctx.restore();
            }

            drawIcon(iconSvg, label = '') {
                this.clear();
                
                const img = new Image();
                img.onload = () => {
                    this.ctx.save();
                    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                    this.ctx.rotate(Math.PI / 2);
                    
                    const iconSize = Math.min(this.canvas.width, this.canvas.height) * 0.6;
                    const yOffset = label ? -20 : 0;
                    
                    this.ctx.drawImage(img, -iconSize/2, -iconSize/2 + yOffset, iconSize, iconSize);
                    
                    if (label) {
                        this.ctx.fillStyle = 'black';
                        this.ctx.font = '16px Arial';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText(label, 0, iconSize/2 + yOffset + 20);
                    }
                    
                    this.ctx.restore();
                };
                
                const svgBlob = new Blob([iconSvg], {type: 'image/svg+xml'});
                img.src = URL.createObjectURL(svgBlob);
            }

            async drawBarcode(data) {
                this.clear();
                
                const tempCanvas = document.createElement('canvas');
                JsBarcode(tempCanvas, data, {
                    format: "CODE128",
                    width: 2,
                    height: this.canvas.width * 0.7,
                    displayValue: false
                });
                
                this.ctx.save();
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.rotate(Math.PI / 2);
                
                this.ctx.drawImage(tempCanvas, -tempCanvas.width/2, -tempCanvas.height/2);
                
                this.ctx.restore();
            }

            async drawQRCode(data) {
                this.clear();
                
                const qrDataUrl = await QRCode.toDataURL(data, {
                    width: Math.min(this.canvas.width, this.canvas.height) * 0.8,
                    margin: 2
                });
                
                const img = new Image();
                img.onload = () => {
                    this.ctx.save();
                    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                    this.ctx.rotate(Math.PI / 2);
                    
                    const size = Math.min(this.canvas.width, this.canvas.height) * 0.8;
                    this.ctx.drawImage(img, -size/2, -size/2, size, size);
                    
                    this.ctx.restore();
                };
                img.src = qrDataUrl;
            }

            drawTestPattern() {
                this.clear();
                
                this.ctx.save();
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.rotate(Math.PI / 2);
                
                // Draw measurement marks
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 2;
                
                // Border
                this.ctx.strokeRect(-this.canvas.height/2 + 5, -this.canvas.width/2 + 5, 
                                   this.canvas.height - 10, this.canvas.width - 10);
                
                // Ruler marks every 10mm
                this.ctx.font = '10px Arial';
                this.ctx.fillStyle = 'black';
                this.ctx.textAlign = 'center';
                
                for (let i = 0; i <= 40; i += 10) {
                    const x = -this.canvas.height/2 + (i / 40) * this.canvas.height;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, -this.canvas.width/2 + 5);
                    this.ctx.lineTo(x, -this.canvas.width/2 + 15);
                    this.ctx.stroke();
                    this.ctx.fillText(`${i}mm`, x, -this.canvas.width/2 + 25);
                }
                
                this.ctx.fillText('TEST PATTERN', 0, 0);
                this.ctx.fillText(`${Math.round(this.canvas.height)}×${Math.round(this.canvas.width)}px`, 0, 20);
                
                this.ctx.restore();
            }
        }

        // Icon library (simplified - in production, use actual icon API)
        const iconLibrary = [
            { name: 'home', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>' },
            { name: 'star', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' },
            { name: 'heart', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
            { name: 'check', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' },
            { name: 'warning', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>' },
            { name: 'info', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>' },
            { name: 'settings', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>' },
            { name: 'folder', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/></svg>' }
        ];

        // Initialize canvas manager
        const canvasManager = new CanvasManager('canvas');

        // UI State
        let currentTab = 'text';
        let selectedIcon = null;

        // Helper functions
        function showStatus(message, type = 'info') {
            const statusEl = document.getElementById('status-message');
            statusEl.textContent = message;
            statusEl.className = `status-message ${type}`;
            
            if (type !== 'error') {
                setTimeout(() => {
                    statusEl.className = 'status-message';
                }, 3000);
            }
        }

        function updateDebugInfo(info) {
            const debugEl = document.getElementById('debug-info');
            debugEl.innerHTML = Object.entries(info)
                .map(([key, value]) => `${key}: ${value}`)
                .join('<br>');
        }

        // Initialize UI
        function initializeUI() {
            // Tab switching
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    btn.classList.add('active');
                    currentTab = btn.dataset.tab;
                    document.getElementById(`${currentTab}-tab`).classList.add('active');
                    
                    updatePreview();
                });
            });

            // Populate icon grid
            const iconGrid = document.getElementById('icon-grid');
            iconLibrary.forEach(icon => {
                const div = document.createElement('div');
                div.className = 'icon-item';
                div.innerHTML = icon.svg;
                div.onclick = () => {
                    selectedIcon = icon;
                    document.querySelectorAll('.icon-item').forEach(i => i.style.borderColor = 'transparent');
                    div.style.borderColor = '#667eea';
                    updatePreview();
                };
                iconGrid.appendChild(div);
            });

            // Input listeners
            document.getElementById('text-input').addEventListener('input', updatePreview);
            document.getElementById('font-size').addEventListener('input', (e) => {
                document.getElementById('font-size-value').textContent = e.target.value + 'px';
                updatePreview();
            });
            document.getElementById('icon-text').addEventListener('input', updatePreview);
            document.getElementById('barcode-input').addEventListener('input', updatePreview);
            document.getElementById('qr-input').addEventListener('input', updatePreview);
            document.getElementById('image-input').addEventListener('change', handleImageUpload);
            document.getElementById('label-width').addEventListener('input', updatePreview);
            document.getElementById('label-height').addEventListener('input', updatePreview);
            document.getElementById('dpi-setting').addEventListener('input', (e) => {
                document.getElementById('dpi-value').textContent = e.target.value;
                printer.pixelsPerMm = parseFloat(e.target.value);
                updatePreview();
            });

            // Button listeners
            document.getElementById('print-btn').addEventListener('click', handlePrint);
            document.getElementById('test-btn').addEventListener('click', handleTestPattern);

            // Initial preview
            updatePreview();
        }

        function updatePreview() {
            const widthMm = parseInt(document.getElementById('label-width').value);
            const heightMm = parseInt(document.getElementById('label-height').value);
            
            canvasManager.updateSize(widthMm, heightMm, printer.pixelsPerMm);

            switch (currentTab) {
                case 'text':
                    const text = document.getElementById('text-input').value;
                    const fontSize = parseInt(document.getElementById('font-size').value);
                    canvasManager.drawText(text, fontSize);
                    break;
                
                case 'icons':
                    if (selectedIcon) {
                        const label = document.getElementById('icon-text').value;
                        canvasManager.drawIcon(selectedIcon.svg, label);
                    }
                    break;
                
                case 'barcode':
                    const barcodeData = document.getElementById('barcode-input').value;
                    if (barcodeData) canvasManager.drawBarcode(barcodeData);
                    break;
                
                case 'qr':
                    const qrData = document.getElementById('qr-input').value;
                    if (qrData) canvasManager.drawQRCode(qrData);
                    break;
                
                case 'image':
                    // Handled by file upload
                    break;
            }
        }

        function handleImageUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    canvasManager.clear();
                    const ctx = canvasManager.ctx;
                    
                    ctx.save();
                    ctx.translate(canvasManager.canvas.width / 2, canvasManager.canvas.height / 2);
                    ctx.rotate(Math.PI / 2);
                    
                    const scale = Math.min(
                        canvasManager.canvas.height / img.width,
                        canvasManager.canvas.width / img.height
                    ) * 0.9;
                    
                    const width = img.width * scale;
                    const height = img.height * scale;
                    
                    ctx.drawImage(img, -width/2, -height/2, width, height);
                    ctx.restore();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }

        async function handlePrint() {
            try {
                showStatus('Connecting to printer...', 'info');
                await printer.connect();
                
                const widthMm = parseInt(document.getElementById('label-width').value);
                const heightMm = parseInt(document.getElementById('label-height').value);
                
                showStatus('Printing...', 'info');
                await printer.print(canvasManager.canvas, heightMm, widthMm); // Note: swapped for vertical
            } catch (error) {
                showStatus(`Error: ${error.message}`, 'error');
                console.error(error);
            }
        }

        function handleTestPattern() {
            canvasManager.drawTestPattern();
            showStatus('Test pattern ready. Measure the printed output to calibrate.', 'info');
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', initializeUI);

        // Check for Web Bluetooth support
        if (!navigator.bluetooth) {
            showStatus('Web Bluetooth is not supported in this browser. Please use Chrome/Edge.', 'error');
        }
    </script>
</body>
</html>