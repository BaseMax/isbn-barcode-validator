# ISBN Barcode Validator

A web-based tool that validates ISBN barcodes in PDF book covers, ensuring compliance with distribution requirements for retail scanning.

## Features

- 📄 **PDF Upload**: Drag-and-drop or browse to upload PDF cover files
- 📏 **Size Validation**: Checks barcode dimensions meet minimum requirements
- 🔲 **Quiet Zone Analysis**: Validates white space around barcode for optimal scanning
- 📐 **Scaling Compliance**: Ensures barcode magnification is within acceptable range
- ✓ **ISBN Format Check**: Verifies barcode format compatibility with ISBN standards
- 📊 **Detailed Reports**: Provides comprehensive validation results with measurements

## Usage

### Quick Start

1. Open `index.html` in a modern web browser
2. Drag and drop a PDF cover file or click to browse
3. Click "Validate Barcode" to analyze the ISBN barcode
4. Review the detailed validation results

### Running Locally

No build process required! Simply open the `index.html` file in your browser:

```bash
# Clone the repository
git clone https://github.com/BaseMax/isbn-barcode-validator.git

# Navigate to the directory
cd isbn-barcode-validator

# Open in browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

### Using a Local Server (Recommended)

For best results, serve the files using a local HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Then open http://localhost:8000 in your browser
```

## Validation Criteria

### Barcode Size Requirements
- **Minimum Width**: 1.02 inches (25.9mm)
- **Minimum Height**: 0.8 inches (20.3mm)
- **Maximum Magnification**: 200%

### Quiet Zone Standards
- **Left Zone**: 9X minimum (0.36 inches / 9.1mm)
- **Right Zone**: 7X minimum (0.28 inches / 7.1mm)
- **Top/Bottom**: 0.05 inches minimum (1.27mm)

### Scaling Guidelines
- **Recommended**: 100% (nominal size)
- **Minimum**: 80% magnification
- **Maximum**: 200% magnification
- Aspect ratio must be maintained

### ISBN Format
- **ISBN-10**: 10 digits
- **ISBN-13**: 13 digits (EAN-13 compatible)
- Standard barcode symbology required

## Technical Details

### Technologies Used
- **HTML5**: Structure and layout
- **CSS3**: Styling with responsive design
- **JavaScript (ES6+)**: Validation logic
- **PDF.js**: PDF rendering and parsing
- **Canvas API**: Image analysis

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dependencies
All dependencies are loaded via CDN:
- PDF.js v3.11.174 (for PDF rendering and parsing)

## How It Works

1. **PDF Loading**: The tool uses PDF.js to render the PDF cover on a canvas
2. **Barcode Detection**: Analyzes the rendered image to locate high-contrast regions (barcodes)
3. **Measurement**: Calculates physical dimensions using DPI standards (300 DPI assumed)
4. **Validation**: Compares measurements against industry standards
5. **Reporting**: Displays detailed results with pass/fail indicators

## Distribution Standards

This validator checks compliance with:
- **GS1 Standards**: Barcode specifications for retail
- **ISBN International**: ISBN barcode requirements
- **Book Industry Standards**: Recommended practices for book covers
- **Retail Requirements**: Amazon, Barnes & Noble, and other major retailers

## Limitations

- Assumes 300 DPI resolution for PDF rendering
- Barcode detection is based on contrast analysis (not full OCR)
- Cannot validate actual ISBN checksum without barcode reading library
- Best results with clear, high-quality PDF covers

## Security Considerations

For production deployment, consider:
- Hosting PDF.js library files locally instead of using CDN
- Adding Subresource Integrity (SRI) hashes to external script tags
- Implementing Content Security Policy (CSP) headers
- Running the application over HTTPS

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by [BaseMax](https://github.com/BaseMax)

## Support

For issues or questions, please open an issue on GitHub.
