const sharp = require('sharp');
const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

/**
 * Save debug file with timestamp
 * @param {string} prefix - File prefix
 * @param {string} ext - File extension
 * @returns {string} - Debug file path
 */
async function getDebugFilePath(prefix, ext) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const debugDir = path.join(__dirname, '../../debug');
    if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
    }
    return path.join(debugDir, `${prefix}_${timestamp}.${ext}`);
}

/**
 * Preprocesses an image to optimize it for OCR
 * @param {Buffer} imageBuffer - The image buffer
 * @returns {Promise<Buffer>} - The preprocessed image buffer
 */
async function preprocessImage(imageBuffer) {
    try {
        console.log('Starting image preprocessing...');
        
        // Get image metadata first
        const metadata = await sharp(imageBuffer).metadata();
        console.log('Original image dimensions:', metadata.width, 'x', metadata.height);
        
        // Initial grayscale conversion and resize
        let grayscale = await sharp(imageBuffer)
            .grayscale()
            .resize({ 
                width: 2048, 
                height: 2048, 
                fit: 'inside', 
                withoutEnlargement: false 
            })
            .toBuffer();

        // Save original grayscale for debugging
        const grayscalePath = await getDebugFilePath('01_grayscale', 'png');
        await sharp(grayscale).toFile(grayscalePath);
        console.log('Saved grayscale image:', grayscalePath);

        // Check if it's a dark theme
        const stats = await sharp(grayscale).stats();
        const isDarkBackground = stats.channels[0].mean < 128;
        console.log('Image stats:', {
            mean: stats.channels[0].mean,
            isDarkBackground
        });

        let processed;
        if (isDarkBackground) {
            // For dark themes:
            // 1. Invert first
            // 2. Normalize with wider range to preserve highlights
            // 3. Apply very gentle contrast to maintain highlight differences
            processed = await sharp(grayscale)
                .negate()
                .normalize({ lower: 5, upper: 95 }) // Wider normalization range to preserve highlights
                .linear(1.1, 0) // Very gentle contrast, no offset
                .toBuffer();
            
            // Save inverted image for debugging
            const invertedPath = await getDebugFilePath('02_inverted', 'png');
            await sharp(processed).toFile(invertedPath);
            console.log('Saved inverted image:', invertedPath);
        } else {
            // For light themes:
            // 1. Normalize with wider range
            // 2. Apply gentle contrast
            processed = await sharp(grayscale)
                .normalize({ lower: 5, upper: 95 }) // Wider normalization range
                .linear(1.2, 0) // Gentle contrast, no offset
                .toBuffer();
        }

        // Final enhancement with gentler sharpening
        const enhanced = await sharp(processed)
            .sharpen({
                sigma: isDarkBackground ? 0.8 : 0.6,  // Even softer sharpening
                m1: 0.2,  // Very gentle sharpening
                m2: 0.3,  // Reduced edge enhancement
                x1: 2,
                y2: 8,
                y3: 10
            })
            .toBuffer();

        // Save final preprocessed image for debugging
        const enhancedPath = await getDebugFilePath('03_enhanced', 'png');
        await sharp(enhanced).toFile(enhancedPath);
        console.log('Saved enhanced image:', enhancedPath);

        return enhanced;
    } catch (error) {
        console.error('Error in image preprocessing:', error);
        throw error;
    }
}

/**
 * Post-processes OCR output to clean it up
 * @param {string} text - The OCR output text
 * @returns {string} - The cleaned up text
 */
function postProcessText(text) {
    return text
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Preserve indentation
        .replace(/^\s+/gm, match => match.replace(/ /g, '\t'))
        // Trim leading/trailing whitespace
        .trim();
}

/**
 * Process an image to extract text using OCR
 * @param {Buffer} imageBuffer - The image buffer
 * @returns {Promise<{text: string, confidence: number}>} - The extracted text and confidence score
 */
async function processImage(imageBuffer) {
    let worker = null;
    try {
        console.log('Starting OCR processing...');
        
        // Preprocess the image
        const preprocessedBuffer = await preprocessImage(imageBuffer);

        // Create and initialize Tesseract worker
        worker = await createWorker('eng');
        console.log('Tesseract worker initialized');

        // Configure worker for code recognition
        await worker.setParameters({
            tessedit_pageseg_mode: '6', // Assume uniform block of text
            tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]()=+-*/<>!&|%#.,;:_/',
            tessedit_ocr_engine_mode: '2', // Use neural nets mode
            textord_heavy_nr: '0', // Disable heavy noise removal to preserve details
            textord_min_linesize: '1.5', // Lower minimum text size to catch all characters
            tessedit_write_images: '0',
            tessedit_write_params_to_file: '0',
            textord_force_make_prop_words: '1', // Force proportional word spacing
            textord_heavy_nr: '0', // Disable heavy noise removal to preserve comments
            textord_min_linesize: '1.5', // Lower minimum text size to catch comments
            tessedit_do_invert: '1', // Enable automatic inversion
            tessedit_ocr_engine_mode: '3' // Use LSTM mode for better accuracy
        });
        console.log('Tesseract parameters configured');

        // Perform OCR
        console.log('Starting text recognition...');
        const { data } = await worker.recognize(preprocessedBuffer);
        console.log('Raw OCR data:', {
            confidence: data.confidence,
            textLength: data.text.length,
            words: data.words?.length || 0
        });

        // Save raw text for debugging
        const rawTextPath = await getDebugFilePath('raw_text', 'txt');
        await fsPromises.writeFile(rawTextPath, data.text);
        console.log('Saved raw text:', rawTextPath);

        // Post-process the text
        const processedText = postProcessText(data.text);

        // Save processed text for debugging
        const processedTextPath = await getDebugFilePath('processed_text', 'txt');
        await fsPromises.writeFile(processedTextPath, processedText);
        console.log('Saved processed text:', processedTextPath);

        return {
            text: processedText,
            confidence: data.confidence || 0
        };
    } catch (error) {
        console.error('Error in OCR processing:', error);
        throw error;
    } finally {
        if (worker) {
            await worker.terminate();
            console.log('Tesseract worker terminated');
        }
    }
}

/**
 * Function to save uploaded image
 * @param {Object} file - The uploaded file object
 * @returns {Promise<string>} - The path to the saved image
 */
async function saveImage(file) {
    try {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        await fsPromises.writeFile(filePath, file.buffer);
        return filePath;
    } catch (error) {
        console.error('Error saving image:', error);
        throw error;
    }
}

module.exports = {
  processImage,
  saveImage
}; 