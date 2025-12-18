# ISBN Barcode Validator - Usage Guide

## Quick Start

1. **Open the Application**
   - Open `index.html` in any modern web browser
   - Or visit `demo.html` to see example validation results

2. **Upload a PDF**
   - Drag and drop a PDF book cover file onto the upload area
   - Or click "Choose PDF File" to browse your files
   - The PDF should contain an ISBN barcode on the cover

3. **Validate the Barcode**
   - Once the PDF is loaded, you'll see a preview
   - Click the "Validate Barcode" button to analyze
   - Wait for the validation results (typically 1-2 seconds)

4. **Review Results**
   - Check each validation criterion
   - Green checkmarks (✓) indicate passed tests
   - Yellow warnings (⚠) suggest potential issues
   - Red X marks (✗) indicate failed requirements

## Understanding Validation Results

### 1. Barcode Size Compliance
**What it checks:** Physical dimensions of the barcode
- ✓ **Passed**: Barcode meets minimum size requirements
- ✗ **Failed**: Barcode is too small for reliable scanning

**Requirements:**
- Minimum width: 1.02 inches (25.9mm)
- Minimum height: 0.8 inches (20.3mm)

**Why it matters:** Barcodes that are too small may not scan properly at retail checkouts.

### 2. Quiet Zones
**What it checks:** White space margins around the barcode
- ✓ **Passed**: Adequate margins on all sides
- ⚠ **Warning**: Insufficient quiet zones detected

**Requirements:**
- Left zone: 0.36 inches (9.1mm)
- Right zone: 0.28 inches (7.1mm)
- Top/Bottom: 0.05 inches (1.27mm)

**Why it matters:** Quiet zones prevent interference from nearby text or graphics during scanning.

### 3. Scaling Compliance
**What it checks:** Barcode magnification percentage
- ✓ **Passed**: Scaling is within acceptable range
- ✗ **Failed**: Barcode is scaled too small or too large

**Requirements:**
- Minimum: 80% magnification
- Maximum: 200% magnification
- Recommended: 100% (nominal size)

**Why it matters:** Improper scaling can distort the barcode pattern and prevent scanning.

### 4. ISBN Format
**What it checks:** Barcode format compatibility
- ✓ **Passed**: Compatible with EAN-13/ISBN standards
- ⚠ **Warning**: May not be standard ISBN format

**Requirements:**
- Must be EAN-13 compatible
- Appropriate aspect ratio for book barcodes

**Why it matters:** ISBN barcodes must follow specific format standards for book distribution.

### 5. Aspect Ratio
**What it checks:** Proportional relationship between width and height
- ✓ **Passed**: Aspect ratio maintained properly
- ⚠ **Warning**: Aspect ratio distortion detected

**Requirements:**
- Expected ratio: 1.44:1 (width:height)
- Maximum deviation: 15%

**Why it matters:** Distorted barcodes may be difficult or impossible to scan.

## Common Issues and Solutions

### Issue: "No Barcode Detected"
**Causes:**
- PDF doesn't contain a visible barcode
- Barcode is too faint or low contrast
- PDF quality is too low

**Solutions:**
- Ensure the PDF has a clear, high-contrast barcode
- Use a higher resolution PDF (300 DPI or better)
- Verify the barcode is visible in the PDF preview

### Issue: "Barcode Size Too Small"
**Causes:**
- Barcode was scaled down too much
- Source barcode was created at wrong size

**Solutions:**
- Recreate the barcode at proper size (1.02" × 0.8" minimum)
- Scale up the barcode in your design software
- Use 100% magnification for best results

### Issue: "Insufficient Quiet Zones"
**Causes:**
- Text or graphics too close to barcode
- Barcode placed at edge of cover
- Design doesn't account for margins

**Solutions:**
- Move barcode away from edge of cover
- Remove text/graphics near the barcode
- Add at least 0.36" white space on left side

### Issue: "Scaling Issue"
**Causes:**
- Barcode stretched or compressed
- Incorrect DPI settings
- Design software scaling problems

**Solutions:**
- Use 100% scale (recommended)
- Maintain aspect ratio when resizing
- Verify DPI settings in design software

## Best Practices

### For Publishers
1. **Standard Size**: Use nominal size (1.469" × 1.02") for ISBN-13 barcodes
2. **100% Scale**: Avoid scaling unless necessary
3. **High Resolution**: Create PDFs at 300 DPI or higher
4. **Test Early**: Validate barcodes before final printing
5. **White Background**: Ensure clean white quiet zones

### For Designers
1. **Placement**: Position barcode on back cover, bottom right corner
2. **Margins**: Leave generous white space around barcode
3. **Contrast**: Use 100% black bars on 100% white background
4. **No Modifications**: Don't add effects, shadows, or gradients
5. **Vector Format**: Use vector barcodes when possible

### For Self-Publishers
1. **Use This Tool**: Validate your cover before ordering prints
2. **Follow Standards**: Stick to recommended sizes and scaling
3. **Professional Barcodes**: Use reputable barcode generators
4. **Test Prints**: Order a proof copy and test barcode scanning
5. **Distribution Ready**: Ensure all checks pass before distribution

## Technical Notes

### PDF Requirements
- Format: Standard PDF (not image-only)
- Resolution: 300 DPI recommended
- Color Mode: RGB or CMYK
- Version: PDF 1.4 or newer

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Limitations
- Assumes 300 DPI for measurement calculations
- Detection based on contrast analysis (not OCR)
- Cannot verify ISBN checksum digits
- Best with clear, high-quality barcodes

## Support and Troubleshooting

### Getting Help
1. Check this usage guide first
2. Review the README.md file
3. Check browser console for error messages
4. Try the demo.html to see expected results
5. Open an issue on GitHub if problems persist

### Reporting Issues
When reporting issues, please include:
- Browser name and version
- PDF file specifications (if possible)
- Screenshot of the problem
- Error messages from browser console

## Additional Resources

### Standards References
- **GS1 General Specifications**: Official barcode standards
- **ISBN International**: ISBN barcode requirements
- **Book Industry Study Group**: Publishing standards

### Related Tools
- **Barcode Generators**: Tools to create ISBN barcodes
- **PDF Editors**: Software to adjust barcode placement
- **Online Validators**: Alternative validation services

## Frequently Asked Questions

**Q: Can I validate multiple pages?**
A: Currently, only the first page is analyzed. Place your barcode on the first page.

**Q: Why does my barcode pass here but fail at the printer?**
A: This tool validates visual appearance. Printers may have additional requirements about file format, color profiles, or specific positioning.

**Q: Do I need an internet connection?**
A: Yes, the tool requires internet to load the PDF.js library from CDN.

**Q: Can I use this for other types of barcodes?**
A: This tool is optimized for ISBN/EAN-13 barcodes. Other formats may not validate correctly.

**Q: Is my PDF data safe?**
A: Yes, all processing happens in your browser. PDFs are not uploaded to any server.

**Q: Can I run this offline?**
A: You would need to download the PDF.js library and host it locally, then update the script references.
