import { useState, useEffect, useRef } from 'react';
import { PhomemoD30Printer, PrinterDebugInfo } from './lib/PhomemoD30Printer';
import { CanvasRenderer, LabelDimensions } from './lib/CanvasRenderer';
import { iconLibrary } from './lib/icons';
import { FontSelector } from './components/FontSelector';
import { IconSearch } from './components/IconSearch';
import { FontDefinition } from './lib/fonts';
import './App.css';

type Tab = 'text' | 'texticon' | 'icons' | 'barcode' | 'qr' | 'image';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const printerRef = useRef<PhomemoD30Printer | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('texticon');
  const [dimensions, setDimensions] = useState<LabelDimensions>({
    widthMm: 40,
    heightMm: 12, // Printable area (what gets sent to printer)
    pixelsPerMm: 8
  });
  const [autoWidth, setAutoWidth] = useState(true);
  const [minWidthMm, setMinWidthMm] = useState(20);

  // Physical label is 15mm but only 12mm is printable
  const labelHeightMm = 15; // Physical label height
  const printableHeightMm = 12; // Printable area
  const marginMm = 2; // Horizontal margins on each side

  // Text tab state
  const [text, setText] = useState('Hello World!');
  const [fontSize, setFontSize] = useState(120);
  const [selectedFont, setSelectedFont] = useState<FontDefinition>(
    { name: 'Bebas Neue', family: 'Bebas Neue', source: 'google', category: 'display', variants: ['regular'] }
  );

  // Text + Icon tab state
  const [textIconText, setTextIconText] = useState('Label');
  const [textIconFont, setTextIconFont] = useState<FontDefinition>(
    { name: 'Bebas Neue', family: 'Bebas Neue', source: 'google', category: 'display', variants: ['regular'] }
  );
  const [textIconFontSize, setTextIconFontSize] = useState(120);
  const [textIconIconSvg, setTextIconIconSvg] = useState<string>('<!-- font-awesome --><svg xmlns="http://www.w3.org/2000/svg" width="1.13em" height="1em" viewBox="0 0 576 512"><path fill="currentColor" d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0M571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93"/></svg>');
  const [textIconIconSize, setTextIconIconSize] = useState(120);
  const [textIconAllCaps, setTextIconAllCaps] = useState(false);
  const [textIconSmallCaps, setTextIconSmallCaps] = useState(false);
  const [textIconItalic, setTextIconItalic] = useState(false);
  const [textIconFontWeight, setTextIconFontWeight] = useState(400);

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
  const [footerMode, setFooterMode] = useState<'standard' | 'nofeed' | 'formfeed' | 'cut' | 'simple' | 'reset' | 'multi' | 'none'>('standard');
  const [mediaType, setMediaType] = useState<'gaps' | 'continuous' | 'marks'>('continuous');
  const [extraFeedMm, setExtraFeedMm] = useState(2);

  // Accordion state
  const [dimensionsExpanded, setDimensionsExpanded] = useState(false);
  const [calibrationExpanded, setCalibrationExpanded] = useState(false);
  const [textIconStyleExpanded, setTextIconStyleExpanded] = useState(false);

  // Initialize canvas renderer and printer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current, dimensions);
      printerRef.current = new PhomemoD30Printer();
      printerRef.current.onStatusChange = (status) => {
        setprinterConnected(status === 'connected' || status === 'printing');
      };

      // Preload default font (Bebas Neue)
      import('./lib/fonts').then(({ fontLoader }) => {
        fontLoader.loadFont(selectedFont).catch(err => {
          console.warn('Failed to preload default font:', err);
        });
      });

      updatePreview();
    }
  }, []);

  // Update preview when inputs change
  useEffect(() => {
    updatePreview();
  }, [activeTab, text, fontSize, selectedFont, textIconText, textIconFont, textIconFontSize, textIconIconSvg, textIconIconSize, textIconAllCaps, textIconSmallCaps, textIconItalic, textIconFontWeight, selectedIcon, iconLabel, barcodeData, qrData, imageFile, dimensions, autoWidth]);

  const calculateAutoWidth = (): number => {
    if (!canvasRef.current) return dimensions.widthMm;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return dimensions.widthMm;

    let contentWidthPx = 0;

    switch (activeTab) {
      case 'text':
        ctx.font = `${fontSize}px ${selectedFont.family}`;
        const lines = text.split('\n');
        contentWidthPx = Math.max(...lines.map(line => ctx.measureText(line).width));
        break;
      case 'texticon': {
        // Calculate width for text + icon
        const fontStyle = textIconItalic ? 'italic' : 'normal';
        const fontVariant = textIconSmallCaps ? 'small-caps' : 'normal';
        ctx.font = `${fontStyle} ${fontVariant} ${textIconFontWeight} ${textIconFontSize}px ${textIconFont.family}`;
        const displayText = textIconAllCaps ? textIconText.toUpperCase() : textIconText;
        const textWidth = ctx.measureText(displayText).width;
        const iconWidth = textIconIconSize;
        contentWidthPx = textWidth + iconWidth;
        break;
      }
      case 'icons':
      case 'qr':
        // Icons and QR codes are roughly square, use height as width
        contentWidthPx = dimensions.heightMm * dimensions.pixelsPerMm;
        break;
      case 'barcode':
        // Barcodes need more width, estimate based on data length
        contentWidthPx = Math.max(barcodeData.length * 12, 100);
        break;
      case 'image':
        // For images, use minimum width
        contentWidthPx = minWidthMm * dimensions.pixelsPerMm;
        break;
    }

    // Convert to mm (no padding)
    const widthMm = Math.ceil(contentWidthPx / dimensions.pixelsPerMm);

    // Ensure minimum width
    return Math.max(widthMm, minWidthMm);
  };

  const updatePreview = async () => {
    if (!rendererRef.current) return;

    // Ensure fonts are loaded before rendering
    try {
      const { fontLoader } = await import('./lib/fonts');
      if (activeTab === 'text' && selectedFont.source !== 'system' && !fontLoader.isLoaded(selectedFont)) {
        await fontLoader.loadFont(selectedFont);
      }
      if (activeTab === 'texticon' && textIconFont.source !== 'system' && !fontLoader.isLoaded(textIconFont)) {
        await fontLoader.loadFont(textIconFont);
      }
    } catch (error) {
      console.error('Failed to load font:', error);
    }

    // Calculate auto width if enabled
    let effectiveDimensions = dimensions;
    if (autoWidth) {
      const calculatedWidth = calculateAutoWidth();
      effectiveDimensions = { ...dimensions, widthMm: calculatedWidth };
    }

    rendererRef.current.setDimensions(effectiveDimensions);

    try {
      switch (activeTab) {
        case 'text':
          rendererRef.current.drawText({ text, fontSize, fontFamily: selectedFont.family });
          break;
        case 'texticon':
          if (textIconIconSvg) {
            await rendererRef.current.drawTextWithIcon(
              textIconText,
              textIconFontSize,
              textIconFont.family,
              textIconIconSvg,
              textIconIconSize,
              {
                allCaps: textIconAllCaps,
                smallCaps: textIconSmallCaps,
                italic: textIconItalic,
                fontWeight: textIconFontWeight
              }
            );
          }
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
      // Use auto-calculated width if enabled
      const printWidth = autoWidth ? calculateAutoWidth() : dimensions.widthMm;

      showStatus('Printing...', 'info');
      // Note: dimensions are swapped because the printer rotates the canvas 90°
      // Preview shows: width × height (horizontal)
      // Printer receives: height × width (rotated vertical)
      const debug = await printerRef.current.print(
        canvasRef.current,
        dimensions.heightMm, // Swapped: preview height becomes print width
        printWidth,          // Swapped: preview width becomes print height
        footerMode,
        mediaType,
        extraFeedMm
      );

      setDebugInfo(debug);
      showStatus('Print complete!', 'success');
    } catch (error) {
      showStatus(`Error: ${error}`, 'error');
      console.error(error);
    }
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
          <div className="tabs">
            {(['text', 'texticon', 'icons', 'barcode', 'qr', 'image'] as Tab[]).map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'text' && '📝 Text'}
                {tab === 'texticon' && '🏷️ Text + Icon'}
                {tab === 'icons' && '🎨 Icons'}
                {tab === 'barcode' && '📊 Barcode'}
                {tab === 'qr' && '📱 QR Code'}
                {tab === 'image' && '🖼️ Image'}
              </button>
            ))}
          </div>

          <div className="card">
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
                    <label>Font Family</label>
                    <FontSelector
                      selectedFont={selectedFont}
                      onFontChange={setSelectedFont}
                      fontSize={fontSize}
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

              {activeTab === 'texticon' && (
                <div>
                  <div className="form-group">
                    <label htmlFor="texticon-input">Label Text</label>
                    <input
                      type="text"
                      id="texticon-input"
                      className="form-control"
                      value={textIconText}
                      onChange={(e) => setTextIconText(e.target.value)}
                      placeholder="Enter text..."
                    />
                  </div>

                  <div className={`settings-panel ${!textIconStyleExpanded ? 'collapsed' : ''}`}>
                    <div
                      className="settings-title"
                      onClick={() => setTextIconStyleExpanded(!textIconStyleExpanded)}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <span>{textIconStyleExpanded ? '▼' : '▶'}</span> 🎨 Text Style
                    </div>
                    {textIconStyleExpanded && (
                      <>
                        <div className="form-group">
                          <label>Font Family</label>
                          <FontSelector
                            selectedFont={textIconFont}
                            onFontChange={setTextIconFont}
                            fontSize={textIconFontSize}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="texticon-font-size">
                            Font Size: <span>{textIconFontSize}px</span>
                          </label>
                          <input
                            type="range"
                            id="texticon-font-size"
                            className="slider"
                            min="12"
                            max="120"
                            value={textIconFontSize}
                            onChange={(e) => setTextIconFontSize(Number(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="texticon-icon-size">
                            Icon Size: <span>{textIconIconSize}px</span>
                          </label>
                          <input
                            type="range"
                            id="texticon-icon-size"
                            className="slider"
                            min="20"
                            max="150"
                            value={textIconIconSize}
                            onChange={(e) => setTextIconIconSize(Number(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="texticon-font-weight">
                            Font Weight: <span>{textIconFontWeight}</span>
                          </label>
                          <input
                            type="range"
                            id="texticon-font-weight"
                            className="slider"
                            min="100"
                            max="900"
                            step="100"
                            value={textIconFontWeight}
                            onChange={(e) => setTextIconFontWeight(Number(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={textIconItalic}
                              onChange={(e) => setTextIconItalic(e.target.checked)}
                            />
                            Italic
                          </label>
                        </div>
                        <div className="form-group">
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={textIconAllCaps}
                              onChange={(e) => {
                                setTextIconAllCaps(e.target.checked);
                                if (e.target.checked) setTextIconSmallCaps(false);
                              }}
                            />
                            All Caps
                          </label>
                        </div>
                        <div className="form-group">
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={textIconSmallCaps}
                              onChange={(e) => {
                                setTextIconSmallCaps(e.target.checked);
                                if (e.target.checked) setTextIconAllCaps(false);
                              }}
                            />
                            Small Caps
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Search Icon</label>
                    <IconSearch onIconSelect={setTextIconIconSvg} />
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
              <div
                className="settings-title"
                onClick={() => setDimensionsExpanded(!dimensionsExpanded)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <span>{dimensionsExpanded ? '▼' : '▶'}</span> 📐 Label Dimensions
              </div>

              {dimensionsExpanded && (<>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={autoWidth}
                    onChange={(e) => setAutoWidth(e.target.checked)}
                  />
                  {' '}Auto-size width to content
                </label>
                <small style={{ display: 'block', marginTop: '4px' }}>
                  Automatically calculates label width based on content size.
                </small>
              </div>

              {autoWidth ? (
                <div className="form-group">
                  <label htmlFor="min-width">Minimum Width (mm)</label>
                  <input
                    type="number"
                    id="min-width"
                    className="form-control"
                    value={minWidthMm}
                    onChange={(e) => setMinWidthMm(Number(e.target.value))}
                    min="10"
                    max="100"
                  />
                  <small style={{ display: 'block', marginTop: '4px' }}>
                    Calculated width: ~{calculateAutoWidth()}mm
                  </small>
                </div>
              ) : (
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
              )}

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
              </>)}
            </div>

            <div className="calibration-section">
              <h3
                onClick={() => setCalibrationExpanded(!calibrationExpanded)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <span>{calibrationExpanded ? '▼' : '▶'}</span> 🔧 Printer Calibration
              </h3>
              {calibrationExpanded && (<>
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
                <label htmlFor="media-type">Media Type</label>
                <select
                  id="media-type"
                  className="form-control"
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                >
                  <option value="gaps">Label with Gaps (standard labels)</option>
                  <option value="continuous">Continuous (no gaps)</option>
                  <option value="marks">Label with Black Marks</option>
                </select>
                <small style={{ display: 'block', marginTop: '4px' }}>
                  Select the type of label roll you're using. "Label with Gaps" is most common for D30.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="extra-feed">
                  Extra Feed After Label: <span>{extraFeedMm}mm</span>
                </label>
                <input
                  type="range"
                  id="extra-feed"
                  className="slider"
                  min="0"
                  max="20"
                  value={extraFeedMm}
                  onChange={(e) => setExtraFeedMm(Number(e.target.value))}
                />
                <small>Add extra paper feed after printing for easier tearing. 0mm = no extra feed.</small>
              </div>

              <div className="form-group">
                <label htmlFor="footer-mode">Footer Command Mode</label>
                <select
                  id="footer-mode"
                  className="form-control"
                  value={footerMode}
                  onChange={(e) => setFooterMode(e.target.value as any)}
                >
                  <option value="standard">⭐ Standard (M110 protocol - try this first!)</option>
                  <option value="none">None (NO footer command)</option>
                  <option value="reset">Reset (ESC @ to reset printer)</option>
                  <option value="multi">Multi (ESC d 0 + ESC @ + FF)</option>
                  <option value="simple">Simple (ESC d 0 only)</option>
                  <option value="nofeed">No Feed (ESC d 0 + Phomemo M02)</option>
                  <option value="formfeed">Form Feed (FF + Phomemo M02)</option>
                  <option value="cut">Cut (GS V + Phomemo M02)</option>
                </select>
                <small style={{ display: 'block', marginTop: '4px' }}>
                  <strong>Start with "Standard"</strong> - uses M110/M120/M220 protocol footer (0x1f 0xf0 sequences).
                  This should match the D30's protocol better than M02.
                </small>
              </div>
              </>)}
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
            </div>
            <div className="canvas-container">
              <div
                className="label-wrapper"
                style={{
                  paddingTop: `${((labelHeightMm - printableHeightMm) / 2) * dimensions.pixelsPerMm}px`,
                  paddingBottom: `${((labelHeightMm - printableHeightMm) / 2) * dimensions.pixelsPerMm}px`,
                  paddingLeft: `${marginMm * dimensions.pixelsPerMm}px`,
                  paddingRight: `${marginMm * dimensions.pixelsPerMm}px`
                }}
              >
                <div className="printable-area">
                  <canvas ref={canvasRef} id="canvas"></canvas>
                </div>
              </div>
            </div>
            <div className="preview-info">
              <p>📐 Label Size: {(() => {
                const width = autoWidth ? calculateAutoWidth() : dimensions.widthMm;
                const widthInches = (width / 25.4).toFixed(2);
                const labelHeightInches = (labelHeightMm / 25.4).toFixed(2);
                return `${width}×${labelHeightMm}mm (${widthInches}×${labelHeightInches}″)`;
              })()} • <span style={{color: '#5abdff'}}>Margins Shown with Blue</span></p>

              <div className="button-group">
                {!printerConnected ? (
                  <button className="btn btn-connect" onClick={async () => {
                    try {
                      showStatus('Connecting to printer...', 'info');
                      await printerRef.current?.connect();
                      showStatus('Connected!', 'success');
                    } catch (error) {
                      showStatus(`Connection error: ${error}`, 'error');
                    }
                  }}>
                    🔌 Connect Printer
                  </button>
                ) : (
                  <button className="btn btn-print" onClick={handlePrint}>
                    🖨️ Print Label
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
