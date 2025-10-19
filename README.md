# Phomemo D30 Label Editor

A modern, web-based label editor for the Phomemo D30 thermal label printer. This application uses Web Bluetooth to connect directly to your printer from the browser, eliminating the need for the official app and its paywalls.

## Features

- **Multiple Label Types**
  - Text labels with customizable fonts and sizes
  - Icons from built-in library
  - Barcodes (CODE128)
  - QR codes
  - Custom images

- **Direct Browser Printing**
  - Web Bluetooth connection
  - No drivers or apps required
  - Works in Chrome and Edge browsers

- **Advanced Calibration**
  - Adjustable DPI/scaling
  - Test pattern printing
  - Real-time preview

- **Fixed Printing Issues**
  - Solved the 120mm extra feed problem
  - Proper ESC/POS command sequences
  - Based on reverse-engineered protocol from [phomemo-tools](https://github.com/vivier/phomemo-tools)

## Installation

### Prerequisites

- Node.js 18+ and npm
- Chrome or Edge browser (for Web Bluetooth support)
- Phomemo D30 printer

### Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Usage

### First Time Setup

1. **Enable Bluetooth** on your computer
2. **Turn on your Phomemo D30** printer
3. Open the application in Chrome or Edge
4. Click "Connect & Print"
5. Select your printer from the Bluetooth pairing dialog

### Creating Labels

#### Text Labels
1. Select the "Text" tab
2. Enter your text in the textarea
3. Adjust font size with the slider
4. Preview updates automatically

#### Icons
1. Select the "Icons" tab
2. Choose an icon from the grid
3. Optionally add a text label below the icon

#### Barcodes
1. Select the "Barcode" tab
2. Enter barcode data (numbers/text)
3. CODE128 format is used

#### QR Codes
1. Select the "QR Code" tab
2. Enter URL or text data
3. Adjust label size for better scanning

#### Images
1. Select the "Image" tab
2. Upload an image file
3. Image will be automatically scaled and rotated

### Calibration

If your labels are printing too long or too short:

1. Scroll to the "Printer Calibration" section
2. Print a test pattern first:
   - Click "Test Pattern"
   - Print it
   - Measure the ruler marks
3. Adjust the "DPI / Scaling Factor" slider:
   - If 40mm prints as 50mm, decrease the value
   - If 40mm prints as 30mm, increase the value
   - Default is 8 px/mm (203 DPI)

### Fixing the 120mm Feed Issue

The original implementation had a bug where printing a 40mm label would result in 120mm of feed (80mm wasted). This has been fixed with corrected ESC/POS commands.

If you still experience extra feeding:

1. Check the "Use No-Feed Footer" checkbox
2. Try printing again
3. This uses an alternative footer command sequence

## Technical Details

### Protocol Implementation

Based on reverse-engineered ESC/POS commands from the [phomemo-tools](https://github.com/vivier/phomemo-tools) project:

**Header:**
```
0x1b 0x40          // ESC @ - Initialize printer
0x1b 0x61 0x01     // ESC a 1 - Center justification
0x1f 0x11 0x02 0x04 // Phomemo-specific init
```

**Block Marker (per image block):**
```
0x1d 0x76 0x30     // GS v 0 - Print raster bit image
0x00               // Mode: 0 (normal)
[width_low] [width_high]   // Width in bytes (16-bit LE)
[height_low] [height_high] // Height in pixels (16-bit LE, max 255)
```

**Footer:**
```
0x1b 0x64 0x02     // ESC d 2 - Feed 2 lines
0x1b 0x64 0x02     // ESC d 2 - Feed 2 lines (repeated)
0x1f 0x11 0x08     // Phomemo-specific end sequence
0x1f 0x11 0x0e
0x1f 0x11 0x07
0x1f 0x11 0x09
```

**Alternative No-Feed Footer:**
```
0x1f 0x11 0x08     // Only Phomemo end sequence
0x1f 0x11 0x0e     // No ESC d commands
0x1f 0x11 0x07
0x1f 0x11 0x09
```

### Key Fixes

1. **Corrected header dimensions**: Now uses actual pixel dimensions instead of mm
2. **Fixed footer commands**: Reduced feed from indefinite to 2 lines
3. **Proper byte alignment**: Canvas width is always a multiple of 8
4. **Block-based sending**: Images are sent in 255-line blocks as per protocol

### File Structure

```
phomemo-d30/
├── src/
│   ├── lib/
│   │   ├── PhomemoD30Printer.ts   # Printer protocol & Bluetooth
│   │   ├── CanvasRenderer.ts       # Canvas drawing utilities
│   │   └── icons.ts                # Icon library
│   ├── App.tsx                     # Main React component
│   ├── App.css                     # Styles
│   └── main.tsx                    # Entry point
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory. Deploy them to any static hosting service.

## Browser Compatibility

- ✅ Chrome 56+ (recommended)
- ✅ Edge 79+
- ❌ Firefox (no Web Bluetooth support)
- ❌ Safari (no Web Bluetooth support)

## Troubleshooting

### Printer not connecting
- Ensure Bluetooth is enabled on your computer
- Make sure the printer is turned on
- Try turning the printer off and on again
- Refresh the browser page

### Labels printing too long/short
- Use the calibration slider to adjust pixels per mm
- Print a test pattern to measure accurately
- Default is 8 px/mm, try values between 7-9

### Still getting 120mm feed
- Enable "Use No-Feed Footer" checkbox
- This may indicate the printer is using different commands
- Try different label size settings

### Preview not updating
- Make sure you've entered content (text, selected icon, etc.)
- Check browser console for errors
- Try refreshing the page

## Credits

- Based on the original HTML example from the community
- Protocol information from [phomemo-tools](https://github.com/vivier/phomemo-tools) by vivier
- ESC/POS command reference from EPSON and Star Micronics documentation

## License

MIT License - feel free to use and modify for your needs.

## Contributing

Contributions are welcome! If you've found other solutions to the feed issue or discovered additional Phomemo D30 commands, please share.

## Future Enhancements

Potential features to add:
- Label templates library
- Print history
- Multi-label printing
- Export labels as images
- Cloud sync for designs
- Support for other Phomemo models (M02, M110, M120)
