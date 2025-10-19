import { useState, useEffect, useRef } from 'react';
import { PhomemoD30Printer, PrinterDebugInfo } from './lib/PhomemoD30Printer';
import { CanvasRenderer, LabelDimensions } from './lib/CanvasRenderer';
import { iconLibrary } from './lib/icons';
import './App.css';

type Tab = 'text' | 'icons' | 'barcode' | 'qr' | 'image';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const printerRef = useRef<PhomemoD30Printer | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [dimensions, setDimensions] = useState<LabelDimensions>({
    widthMm: 40,
    heightMm: 12,
    pixelsPerMm: 8
  });

  // Text tab state
  const [text, setText] = useState('Hello World!');
  const [fontSize, setFontSize] = useState(48);

  // Icons tab state
  const [selectedIcon, setSelectedIcon] = useState<typeof iconLibrary[0] | null>(null);
  const [iconLabel, setIconLabel] = useState('');

  // Barcode tab state
  const [barcodeData, setBarcodeData] = useState('123456789');

  // QR tab state
  const [qrData, setQrData] = useState('https://example.com');

  // Image tab state
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Printer state
  const [printerConnected, setprinterConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [debugInfo, setDebugInfo] = useState<PrinterDebugInfo | null>(null);
  const [useNoFeedFooter, setUseNoFeedFooter] = useState(false);

  // Initialize canvas renderer and printer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current, dimensions);
      printerRef.current = new PhomemoD30Printer();
      printerRef.current.onStatusChange = (status) => {
        setprinterConnected(status === 'connected' || status === 'printing');
      };
      updatePreview();
    }
  }, []);

  // Update preview when inputs change
  useEffect(() => {
    updatePreview();
  }, [activeTab, text, fontSize, selectedIcon, iconLabel, barcodeData, qrData, imageFile, dimensions]);

  const updatePreview = async () => {
    if (!rendererRef.current) return;

    rendererRef.current.setDimensions(dimensions);

    try {
      switch (activeTab) {
        case 'text':
          rendererRef.current.drawText({ text, fontSize });
          break;
        case 'icons':
          if (selectedIcon) {
            await rendererRef.current.drawIcon(selectedIcon.svg, iconLabel);
          }
          break;
        case 'barcode':
          if (barcodeData) {
            await rendererRef.current.drawBarcode(barcodeData);
          }
          break;
        case 'qr':
          if (qrData) {
            await rendererRef.current.drawQRCode(qrData);
          }
          break;
        case 'image':
          if (imageFile) {
            await rendererRef.current.drawImage(imageFile);
          }
          break;
      }
    } catch (error) {
      console.error('Preview error:', error);
      showStatus(`Preview error: ${error}`, 'error');
    }
  };

  const handlePrint = async () => {
    if (!printerRef.current || !canvasRef.current) return;

    try {
      showStatus('Connecting to printer...', 'info');
      await printerRef.current.connect();

      showStatus('Printing...', 'info');
      const debug = await printerRef.current.print(
        canvasRef.current,
        dimensions.widthMm,
        dimensions.heightMm,
        useNoFeedFooter
      );

      setDebugInfo(debug);
      showStatus('Print complete!', 'success');
    } catch (error) {
      showStatus(`Error: ${error}`, 'error');
      console.error(error);
    }
  };

  const handleTestPattern = () => {
    if (!rendererRef.current) return;
    rendererRef.current.drawTestPattern();
    showStatus('Test pattern ready. Measure the printed output to calibrate.', 'info');
  };

  const showStatus = (message: string, type: 'info' | 'success' | 'error') => {
    setStatusMessage(message);
    setStatusType(type);

    if (type !== 'error') {
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🏷️ Phomemo D30 Label Editor</h1>
          <p>Advanced label printing with Web Bluetooth</p>
          {!PhomemoD30Printer.isSupported() && (
            <div className="warning">
              ⚠️ Web Bluetooth not supported. Please use Chrome or Edge.
            </div>
          )}
        </header>

        <div className="main-content">
          <div className="card">
            <div className="tabs">
              {(['text', 'icons', 'barcode', 'qr', 'image'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'text' && '📝 Text'}
                  {tab === 'icons' && '🎨 Icons'}
                  {tab === 'barcode' && '📊 Barcode'}
                  {tab === 'qr' && '📱 QR Code'}
                  {tab === 'image' && '🖼️ Image'}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'text' && (
                <div>
                  <div className="form-group">
                    <label htmlFor="text-input">Label Text</label>
                    <textarea
                      id="text-input"
                      className="form-control"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter your label text here..."
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="font-size">
                      Font Size: <span>{fontSize}px</span>
                    </label>
                    <input
                      type="range"
                      id="font-size"
                      className="slider"
                      min="12"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'icons' && (
                <div>
                  <div className="form-group">
                    <label>Select an Icon</label>
                    <div className="icon-grid">
                      {iconLibrary.map((icon) => (
                        <div
                          key={icon.name}
                          className={`icon-item ${selectedIcon?.name === icon.name ? 'selected' : ''}`}
                          onClick={() => setSelectedIcon(icon)}
                          dangerouslySetInnerHTML={{ __html: icon.svg }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="icon-text">Icon Label (Optional)</label>
                    <input
                      type="text"
                      id="icon-text"
                      className="form-control"
                      value={iconLabel}
                      onChange={(e) => setIconLabel(e.target.value)}
                      placeholder="Add text below icon..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'barcode' && (
                <div className="form-group">
                  <label htmlFor="barcode-input">Barcode Data (CODE128)</label>
                  <input
                    type="text"
                    id="barcode-input"
                    className="form-control"
                    value={barcodeData}
                    onChange={(e) => setBarcodeData(e.target.value)}
                  />
                </div>
              )}

              {activeTab === 'qr' && (
                <div className="form-group">
                  <label htmlFor="qr-input">QR Code Data</label>
                  <input
                    type="text"
                    id="qr-input"
                    className="form-control"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                  />
                </div>
              )}

              {activeTab === 'image' && (
                <div className="form-group">
                  <label htmlFor="image-input">Upload Image</label>
                  <input
                    type="file"
                    id="image-input"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>

            <div className="settings-panel">
              <div className="settings-title">📐 Label Dimensions</div>
              <div className="input-group">
                <div className="form-group">
                  <label htmlFor="label-width">Width (mm)</label>
                  <input
                    type="number"
                    id="label-width"
                    className="form-control"
                    value={dimensions.widthMm}
                    onChange={(e) => setDimensions({ ...dimensions, widthMm: Number(e.target.value) })}
                    min="10"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="label-height">Height (mm)</label>
                  <input
                    type="number"
                    id="label-height"
                    className="form-control"
                    value={dimensions.heightMm}
                    onChange={(e) => setDimensions({ ...dimensions, heightMm: Number(e.target.value) })}
                    min="10"
                    max="100"
                  />
                </div>
              </div>
            </div>

            <div className="calibration-section">
              <h3>🔧 Printer Calibration</h3>
              <div className="form-group">
                <label htmlFor="dpi-setting">
                  DPI / Scaling Factor: <span>{dimensions.pixelsPerMm}</span> px/mm
                </label>
                <input
                  type="range"
                  id="dpi-setting"
                  className="slider"
                  min="4"
                  max="16"
                  step="0.5"
                  value={dimensions.pixelsPerMm}
                  onChange={(e) => {
                    const newPixelsPerMm = Number(e.target.value);
                    setDimensions({ ...dimensions, pixelsPerMm: newPixelsPerMm });
                    if (printerRef.current) {
                      printerRef.current.pixelsPerMm = newPixelsPerMm;
                    }
                  }}
                />
                <small>Adjust if labels print too long/short. Default is 8.</small>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={useNoFeedFooter}
                    onChange={(e) => setUseNoFeedFooter(e.target.checked)}
                  />
                  {' '}Use No-Feed Footer (experimental fix for 120mm issue)
                </label>
                <small style={{ display: 'block', marginTop: '4px' }}>
                  Try this if your labels still feed extra paper after printing.
                </small>
              </div>
            </div>

            <div className="button-group">
              <button className="btn btn-primary" onClick={handlePrint}>
                🖨️ {printerConnected ? 'Print' : 'Connect & Print'}
              </button>
              <button className="btn btn-secondary" onClick={handleTestPattern}>
                🧪 Test Pattern
              </button>
            </div>

            {statusMessage && (
              <div className={`status-message ${statusType}`}>
                {statusMessage}
              </div>
            )}

            {debugInfo && (
              <div className="debug-panel">
                <h3>🐛 Debug Information</h3>
                <div className="debug-info">
                  <div>Canvas: {debugInfo.canvasWidth}×{debugInfo.canvasHeight}px</div>
                  <div>Label: {debugInfo.widthMm}×{debugInfo.heightMm}mm</div>
                  <div>Bytes per row: {debugInfo.bytesPerRow}</div>
                  <div>Total bytes: {debugInfo.totalBytes}</div>
                  <div>Pixels/mm: {debugInfo.pixelsPerMm}</div>
                  <div>Header: {debugInfo.headerBytes}</div>
                  <div>Footer: {debugInfo.footerBytes}</div>
                </div>
              </div>
            )}
          </div>

          <div className="card preview-section">
            <div className="preview-header">
              <h2>Preview</h2>
              <small>↻ Rotated 90°</small>
            </div>
            <div className="canvas-container">
              <canvas ref={canvasRef} id="canvas"></canvas>
            </div>
            <div className="preview-info">
              <p>📍 Label feeds vertically through printer</p>
              <p>📏 Canvas: {rendererRef.current?.getDimensionsInfo() || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
