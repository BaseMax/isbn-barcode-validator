if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

let currentPdfDoc = null;
let currentImageData = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const validateBtn = document.getElementById('validateBtn');
const clearBtn = document.getElementById('clearBtn');
const pdfCanvas = document.getElementById('pdfCanvas');

const STANDARDS = {
    minWidth: 1.02,      // inches
    minHeight: 0.8,      // inches
    maxMagnification: 2.0, // 200%
    minMagnification: 0.8, // 80%
    leftQuietZone: 0.36,   // inches (9X where X=0.04)
    rightQuietZone: 0.28,  // inches (7X where X=0.04)
    verticalQuietZone: 0.05, // inches
    nominalWidth: 1.469,   // inches (standard EAN-13)
    nominalHeight: 1.02,   // inches (standard EAN-13)
    dpi: 300              // Standard print resolution
};

// Barcode detection constants
const DETECTION_CONSTANTS = {
    blockSize: 50,              // Size of analysis blocks in pixels for contrast detection
    contrastThreshold: 80,      // Minimum contrast value to identify barcode regions
    regionExpandX: 100,         // Horizontal expansion in pixels to capture full barcode
    regionExpandY: 50,          // Vertical expansion in pixels to capture full barcode
    maxRegionWidth: 400,        // Maximum barcode width in pixels
    maxRegionHeight: 200,       // Maximum barcode height in pixels
    maxAspectRatioDeviation: 0.15 // Allow 15% deviation in aspect ratio
};

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
validateBtn.addEventListener('click', validateBarcode);
clearBtn.addEventListener('click', clearAll);

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        loadPDF(files[0]);
    } else {
        showNotification('Please drop a PDF file', 'error');
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        loadPDF(file);
    } else {
        showNotification('Please select a PDF file', 'error');
    }
}

async function loadPDF(file) {
    try {
        if (typeof pdfjsLib === 'undefined') {
            showNotification('PDF.js library failed to load. Please check your internet connection and refresh the page.', 'error');
            return;
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        currentPdfDoc = await loadingTask.promise;
        
        const page = await currentPdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = pdfCanvas;
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        previewSection.style.display = 'block';
        resultsSection.style.display = 'none';
        showNotification('PDF loaded successfully! Click "Validate Barcode" to analyze.', 'success');
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        showNotification('Error loading PDF file. Please try another file.', 'error');
    }
}

function validateBarcode() {
    if (!currentImageData) {
        showNotification('Please load a PDF file first', 'error');
        return;
    }
    
    resultsContent.innerHTML = '<div class="loading"></div><p style="text-align: center;">Analyzing barcode...</p>';
    resultsSection.style.display = 'block';
    
    setTimeout(() => {
        performValidation();
    }, 500);
}

function performValidation() {
    const results = [];
    let overallPass = true;
    
    const barcodeRegion = detectBarcodeRegion(currentImageData);
    
    if (!barcodeRegion) {
        displayResults([{
            type: 'error',
            title: 'No Barcode Detected',
            message: 'Could not detect a barcode in the PDF. Please ensure the PDF contains a visible ISBN barcode.',
            icon: '❌'
        }], false);
        return;
    }
    
    const sizeValidation = validateBarcodeSize(barcodeRegion);
    results.push(sizeValidation);
    if (!sizeValidation.pass) overallPass = false;
    
    const quietZoneValidation = validateQuietZones(barcodeRegion);
    results.push(quietZoneValidation);
    if (!quietZoneValidation.pass) overallPass = false;
    
    const scalingValidation = validateScaling(barcodeRegion);
    results.push(scalingValidation);
    if (!scalingValidation.pass) overallPass = false;
    
    const isbnValidation = validateISBNFormat(barcodeRegion);
    results.push(isbnValidation);
    if (!isbnValidation.pass) overallPass = false;
    
    const aspectRatioValidation = validateAspectRatio(barcodeRegion);
    results.push(aspectRatioValidation);
    if (!aspectRatioValidation.pass) overallPass = false;
    
    displayResults(results, overallPass);
}

function detectBarcodeRegion(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    const regions = [];
    const blockSize = DETECTION_CONSTANTS.blockSize;
    
    for (let y = 0; y < height - blockSize; y += blockSize) {
        for (let x = 0; x < width - blockSize; x += blockSize) {
            const contrast = calculateBlockContrast(data, x, y, blockSize, width);
            if (contrast > DETECTION_CONSTANTS.contrastThreshold) {
                regions.push({ x, y, width: blockSize, height: blockSize, contrast });
            }
        }
    }
    
    if (regions.length === 0) {
        return null;
    }
    
    regions.sort((a, b) => b.contrast - a.contrast);
    const bestRegion = regions[0];
    
    const expandedRegion = {
        x: Math.max(0, bestRegion.x - DETECTION_CONSTANTS.regionExpandX),
        y: Math.max(0, bestRegion.y - DETECTION_CONSTANTS.regionExpandY),
        width: Math.min(width - bestRegion.x + DETECTION_CONSTANTS.regionExpandX, DETECTION_CONSTANTS.maxRegionWidth),
        height: Math.min(height - bestRegion.y + DETECTION_CONSTANTS.regionExpandY, DETECTION_CONSTANTS.maxRegionHeight),
        pixelsPerInch: STANDARDS.dpi
    };
    
    return expandedRegion;
}

function calculateBlockContrast(data, x, y, blockSize, imageWidth) {
    let min = 255;
    let max = 0;
    
    for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
            const i = ((y + dy) * imageWidth + (x + dx)) * 4;
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            min = Math.min(min, brightness);
            max = Math.max(max, brightness);
        }
    }
    
    return max - min;
}

function validateBarcodeSize(region) {
    const widthInches = region.width / region.pixelsPerInch;
    const heightInches = region.height / region.pixelsPerInch;
    
    const widthPass = widthInches >= STANDARDS.minWidth;
    const heightPass = heightInches >= STANDARDS.minHeight;
    const pass = widthPass && heightPass;
    
    return {
        type: pass ? 'success' : 'error',
        pass: pass,
        title: pass ? '✓ Barcode Size Compliance' : '✗ Barcode Size Issue',
        icon: pass ? '✅' : '❌',
        message: `
            <p>Detected barcode dimensions:</p>
            <div class="barcode-details">
                <strong>Width:</strong> <span class="metric-value">${widthInches.toFixed(2)}"</span> 
                (Minimum: ${STANDARDS.minWidth}") ${widthPass ? '✓' : '✗'}<br>
                <strong>Height:</strong> <span class="metric-value">${heightInches.toFixed(2)}"</span> 
                (Minimum: ${STANDARDS.minHeight}") ${heightPass ? '✓' : '✗'}
            </div>
            ${!pass ? '<p style="color: #ef4444; margin-top: 10px;">⚠️ Barcode is too small for reliable scanning.</p>' : ''}
        `
    };
}

function validateQuietZones(region) {
    const leftZone = region.x / region.pixelsPerInch;
    const rightZone = (pdfCanvas.width - (region.x + region.width)) / region.pixelsPerInch;
    const topZone = region.y / region.pixelsPerInch;
    const bottomZone = (pdfCanvas.height - (region.y + region.height)) / region.pixelsPerInch;
    
    const leftPass = leftZone >= STANDARDS.leftQuietZone;
    const rightPass = rightZone >= STANDARDS.rightQuietZone;
    const topPass = topZone >= STANDARDS.verticalQuietZone;
    const bottomPass = bottomZone >= STANDARDS.verticalQuietZone;
    
    const pass = leftPass && rightPass && topPass && bottomPass;
    
    return {
        type: pass ? 'success' : 'warning',
        pass: pass,
        title: pass ? '✓ Quiet Zones Adequate' : '⚠ Quiet Zone Issues',
        icon: pass ? '✅' : '⚠️',
        message: `
            <p>Quiet zone measurements:</p>
            <div class="barcode-details">
                <strong>Left:</strong> <span class="metric-value">${leftZone.toFixed(2)}"</span> 
                (Required: ${STANDARDS.leftQuietZone}") ${leftPass ? '✓' : '✗'}<br>
                <strong>Right:</strong> <span class="metric-value">${rightZone.toFixed(2)}"</span> 
                (Required: ${STANDARDS.rightQuietZone}") ${rightPass ? '✓' : '✗'}<br>
                <strong>Top:</strong> <span class="metric-value">${topZone.toFixed(2)}"</span> 
                (Required: ${STANDARDS.verticalQuietZone}") ${topPass ? '✓' : '✗'}<br>
                <strong>Bottom:</strong> <span class="metric-value">${bottomZone.toFixed(2)}"</span> 
                (Required: ${STANDARDS.verticalQuietZone}") ${bottomPass ? '✓' : '✗'}
            </div>
            ${!pass ? '<p style="color: #f59e0b; margin-top: 10px;">⚠️ Insufficient quiet zones may affect scannability.</p>' : ''}
        `
    };
}

function validateScaling(region) {
    const widthInches = region.width / region.pixelsPerInch;
    const heightInches = region.height / region.pixelsPerInch;
    
    const widthScaling = widthInches / STANDARDS.nominalWidth;
    const heightScaling = heightInches / STANDARDS.nominalHeight;
    const avgScaling = (widthScaling + heightScaling) / 2;
    
    const scalingPercent = Math.round(avgScaling * 100);
    const pass = avgScaling >= STANDARDS.minMagnification && avgScaling <= STANDARDS.maxMagnification;
    
    let message = `
        <p>Barcode scaling analysis:</p>
        <div class="barcode-details">
            <strong>Current Scale:</strong> <span class="metric-value">${scalingPercent}%</span><br>
            <strong>Acceptable Range:</strong> ${STANDARDS.minMagnification * 100}% - ${STANDARDS.maxMagnification * 100}%<br>
            <strong>Recommended:</strong> 100%
        </div>
    `;
    
    if (avgScaling < STANDARDS.minMagnification) {
        message += '<p style="color: #ef4444; margin-top: 10px;">⚠️ Barcode is scaled too small.</p>';
    } else if (avgScaling > STANDARDS.maxMagnification) {
        message += '<p style="color: #ef4444; margin-top: 10px;">⚠️ Barcode is scaled too large.</p>';
    } else if (Math.abs(avgScaling - 1.0) < 0.1) {
        message += '<p style="color: #10b981; margin-top: 10px;">✓ Scaling is optimal.</p>';
    }
    
    return {
        type: pass ? 'success' : 'error',
        pass: pass,
        title: pass ? '✓ Scaling Compliance' : '✗ Scaling Issue',
        icon: pass ? '✅' : '❌',
        message: message
    };
}

function validateISBNFormat(region) {
    const isLikelyISBN = region.width / region.height > 1.2 && region.width / region.height < 2.0;
    
    const pass = isLikelyISBN;
    
    return {
        type: pass ? 'success' : 'warning',
        pass: pass,
        title: pass ? '✓ ISBN Format Valid' : '⚠ ISBN Format Check',
        icon: pass ? '✅' : '⚠️',
        message: `
            <p>ISBN barcode format analysis:</p>
            <div class="barcode-details">
                <strong>Expected Format:</strong> EAN-13 (ISBN-13)<br>
                <strong>Aspect Ratio:</strong> ${(region.width / region.height).toFixed(2)}<br>
                <strong>Pattern:</strong> ${pass ? 'Compatible with EAN-13' : 'May not be standard ISBN barcode'}
            </div>
            ${!pass ? '<p style="color: #f59e0b; margin-top: 10px;">⚠️ Barcode may not be in standard ISBN format.</p>' : ''}
            <p style="margin-top: 10px;"><em>Note: Full validation requires actual barcode scanning and checksum verification.</em></p>
        `
    };
}

function validateAspectRatio(region) {
    const aspectRatio = region.width / region.height;
    const expectedRatio = STANDARDS.nominalWidth / STANDARDS.nominalHeight;
    const deviation = Math.abs(aspectRatio - expectedRatio) / expectedRatio;
    
    const pass = deviation < DETECTION_CONSTANTS.maxAspectRatioDeviation;
    
    return {
        type: pass ? 'success' : 'warning',
        pass: pass,
        title: pass ? '✓ Aspect Ratio Maintained' : '⚠ Aspect Ratio Issue',
        icon: pass ? '✅' : '⚠️',
        message: `
            <p>Aspect ratio validation:</p>
            <div class="barcode-details">
                <strong>Current Ratio:</strong> <span class="metric-value">${aspectRatio.toFixed(2)}</span><br>
                <strong>Expected Ratio:</strong> ${expectedRatio.toFixed(2)}<br>
                <strong>Deviation:</strong> ${(deviation * 100).toFixed(1)}%
            </div>
            ${!pass ? '<p style="color: #f59e0b; margin-top: 10px;">⚠️ Aspect ratio distortion may affect readability.</p>' : ''}
        `
    };
}

function displayResults(results, overallPass) {
    let html = `
        <div class="result-summary ${overallPass ? 'pass' : 'fail'}">
            ${overallPass ? '✓ VALIDATION PASSED' : '✗ VALIDATION FAILED'}
        </div>
    `;
    
    results.forEach(result => {
        html += `
            <div class="result-item ${result.type}">
                <h3>${result.icon} ${result.title}</h3>
                ${result.message}
            </div>
        `;
    });
    
    if (overallPass) {
        html += `
            <div class="result-item success">
                <h3>✅ Distribution Ready</h3>
                <p>This barcode meets all distribution requirements and should scan reliably across different retail environments.</p>
            </div>
        `;
    } else {
        html += `
            <div class="result-item error">
                <h3>❌ Action Required</h3>
                <p>Please address the issues identified above before submitting for distribution. Non-compliant barcodes may be rejected by retailers.</p>
            </div>
        `;
    }
    
    resultsContent.innerHTML = html;
}

function clearAll() {
    currentPdfDoc = null;
    currentImageData = null;
    fileInput.value = '';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
    
    const context = pdfCanvas.getContext('2d');
    context.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
