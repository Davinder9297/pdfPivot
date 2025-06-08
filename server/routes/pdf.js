const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PDFDocument, PDFName, PDFDict, PDFStream, PDFNumber,rgb,degrees,StandardFonts  } = require('pdf-lib');
const archiver = require('archiver');
const sharp = require('sharp');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const libre = require('libreoffice-convert');
const router = express.Router();
const puppeteer = require('puppeteer');
const PptxGenJS = require('pptxgenjs');
const upload = multer({ dest: 'uploads/' });
const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');

// Set LibreOffice path for Windows
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to compress images in PDF
async function compressImages(pdfDoc, compressionLevel) {
  console.log('Starting image compression...');
  const pages = pdfDoc.getPages();
  const quality = compressionLevel === 'low' ? 80 : compressionLevel === 'medium' ? 60 : 40;
  console.log(`Compression quality set to: ${quality}`);

  for (let i = 0; i < pages.length; i++) {
    console.log(`Processing page ${i + 1} of ${pages.length}`);
    const page = pages[i];
    const { width, height } = page.getSize();
    
    // Get all images on the page
    const images = await page.node.Resources().lookup(PDFName.of('XObject'), PDFDict);
    if (!images) {
      console.log(`No images found on page ${i + 1}`);
      continue;
    }

    console.log(`Found ${Object.keys(images.dict).length} images on page ${i + 1}`);
    for (const [name, image] of Object.entries(images.dict)) {
      if (image instanceof PDFStream) {
        console.log(`Compressing image ${name} on page ${i + 1}`);
        const imageData = await image.getBytes();
        const compressedImage = await sharp(imageData)
          .jpeg({ quality })
          .toBuffer();
        
        // Replace the original image with compressed version
        image.dict.set(PDFName.of('Length'), PDFNumber.of(compressedImage.length));
        image.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
        image.dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
        image.dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
        image.dict.set(PDFName.of('Width'), PDFNumber.of(width));
        image.dict.set(PDFName.of('Height'), PDFNumber.of(height));
        image.dict.set(PDFName.of('Data'), compressedImage);
        console.log(`Successfully compressed image ${name}`);
      }
    }
  }
  console.log('Image compression completed');
}

// JPG to PDF Route
router.post('/jpg-to-pdf', upload.array('images'), async (req, res) => {
  console.log('JPG to PDF conversion route accessed');
  try {
    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ error: 'No images uploaded' });
    }

    console.log('Files received:', req.files.length);
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Process each image
    for (const file of req.files) {
      console.log('Processing file:', file.originalname);
      
      // Read the image file
      const imageBytes = fs.readFileSync(file.path);
      
      // Convert image to JPEG if needed
      const jpegImage = await sharp(imageBytes)
        .jpeg()
        .toBuffer();
      
      // Embed the image in the PDF
      const image = await pdfDoc.embedJpg(jpegImage);
      
      // Add a new page with the image
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      
      // Clean up the temporary file
      fs.unlinkSync(file.path);
    }

    // Save the PDF
    console.log('Saving PDF...');
    const pdfBytes = await pdfDoc.save();
    console.log('PDF created successfully');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');

    // Send the PDF
    console.log('Sending response...');
    res.send(Buffer.from(pdfBytes));
    console.log('Response sent successfully');

  } catch (error) {
    console.error('JPG to PDF conversion error:', error);
    res.status(500).json({ error: 'Failed to convert images to PDF: ' + error.message });
  }
});

// PDF Compression Route
router.post('/pdf/compress', upload.single('pdf'), async (req, res) => {
  console.log('PDF compression route accessed');
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const compressionLevel = req.body.compressionLevel || 'screen'; // screen, ebook, printer, prepress
    console.log('Compression level:', compressionLevel);

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `compressed_${Date.now()}.pdf`);

    // Ghostscript command for PDF compression
const compressionLevels = {
  low: '/screen',
  medium: '/ebook',
  high: '/printer'
};

const gsLevel = compressionLevels[compressionLevel] || '/screen';

const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${gsLevel} -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`;

    console.log('Running Ghostscript command:', command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Ghostscript error:', stderr);
        fs.unlinkSync(inputPath); // Clean up
        return res.status(500).json({ error: 'Failed to compress PDF' });
      }

      console.log('Compression complete.');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=compressed.pdf');

      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res).on('finish', () => {
        console.log('Compressed PDF sent to client.');
        // Clean up
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: 'Failed to compress PDF: ' + error.message });
  }
});

router.post('/merge-pdf', upload.array('pdfs'), async (req, res) => {
  try {
    const PDFMerger = (await import('pdf-merger-js')).default;
    console.log('Files received:', req.files);
    const merger = new PDFMerger();
    for (const file of req.files) {
      console.log('Adding file:', file.path);
      await merger.add(file.path);
    }
    const mergedPath = path.join(__dirname, '../uploads/merged.pdf');
    await merger.save(mergedPath);
    console.log('Merged PDF saved at:', mergedPath);

    res.download(mergedPath, 'merged.pdf', (err) => {
      req.files.forEach(f => fs.unlinkSync(f.path));
      fs.unlinkSync(mergedPath);
    });
  } catch (err) {
    console.error('Merge PDF error:', err);
    res.status(500).json({ error: 'Failed to merge PDFs.' });
  }
});

router.post('/split-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Example: Split into individual pages
    const outputDir = path.join(__dirname, '../uploads/split');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const archive = archiver('zip');
    res.attachment('split-pages.zip');
    archive.pipe(res);

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      const newPdfBytes = await newPdf.save();
      archive.append(Buffer.from(newPdfBytes), { name: `page-${i + 1}.pdf` });
    }

    archive.finalize();

    // Clean up
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Split PDF error:', err);
    res.status(500).json({ error: 'Failed to split PDF.' });
  }
});

// PDF to JPG Route
router.post('/pdf-to-jpg', upload.single('pdf'), async (req, res) => {
  console.log('PDF to JPG conversion route accessed');
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const outputDir = path.join(__dirname, '../uploads', `${Date.now()}_jpgs`);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    // Build the pdftoppm command
    // -jpeg: output JPEG format
    // -r 300: 300 DPI for good quality
    // output files will be named page-1.jpg, page-2.jpg, etc.
    const cmd = `pdftoppm -jpeg -r 300 "${pdfPath}" "${path.join(outputDir, 'page')}"`;

    console.log('Running command:', cmd);

    // Wrap exec in a Promise
    await new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('pdftoppm error:', stderr || error);
          return reject(error);
        }
        resolve();
      });
    });

    console.log('Conversion completed');

    // Collect all generated JPG files
    const imageFiles = fs.readdirSync(outputDir)
      .filter(file => file.toLowerCase().endsWith('.jpg'))
      .map(file => path.join(outputDir, file));

    // Create a ZIP archive of all images
    const zipPath = path.join(__dirname, '../uploads', `${Date.now()}_jpgs.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', err => {
      console.error('Archive error:', err);
      throw err;
    });

    archive.pipe(output);

    imageFiles.forEach(imgPath => {
      archive.file(imgPath, { name: path.basename(imgPath) });
    });

    await archive.finalize();

    await new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log('Archive created successfully');
        resolve();
      });
      output.on('error', err => {
        console.error('Output stream error:', err);
        reject(err);
      });
    });

    // Set response headers to serve ZIP file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=pdf_pages.zip');
    res.setHeader('Content-Length', fs.statSync(zipPath).size);

    // Stream ZIP file to client
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(res);

    // Clean up after sending file
    fileStream.on('end', () => {
      try {
        fs.unlinkSync(pdfPath);
      } catch {}
      imageFiles.forEach(img => {
        try { fs.unlinkSync(img); } catch {}
      });
      try {
        fs.rmdirSync(outputDir);
        fs.unlinkSync(zipPath);
      } catch {}
    });

  } catch (error) {
    console.error('PDF to JPG conversion error:', error);
    res.status(500).json({ error: 'Failed to convert PDF to JPG: ' + error.message });
  }
});;

// Add Page Numbers Route
router.post('/add-page-numbers', upload.single('pdf'), async (req, res) => {
  console.log('Add page numbers route accessed');
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Get options from request body with defaults
    let {
      position = 'bottom-center', // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
      format = 'Page {n} of {total}', // {n} for current page, {total} for total pages
      fontSize = 12,
      color = '#000000', // hex color
      margin = 20 // margin from edge in points
    } = req.body;
fontSize = Number(fontSize);
margin = Number(margin);
    // Convert hex color to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      } : { r: 0, g: 0, b: 0 };
    };
    const rgbColor = hexToRgb(color);

    // Calculate position coordinates
    const getPosition = (page, position) => {
      const { width, height } = page.getSize();
      switch (position) {
        case 'top-left':
          return { x: margin, y: height - margin };
        case 'top-center':
          return { x: width / 2, y: height - margin };
        case 'top-right':
          return { x: width - margin, y: height - margin };
        case 'bottom-left':
          return { x: margin, y: margin };
        case 'bottom-center':
          return { x: width / 2, y: margin };
        case 'bottom-right':
          return { x: width - margin, y: margin };
        default:
          return { x: width / 2, y: margin };
      }
    };

    // Embed font (you must embed font for drawText)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add page numbers to each page
    pages.forEach((page, index) => {
      const pageNumber = index + 1;
      const totalPages = pages.length;
      const text = format
        .replace('{n}', pageNumber)
        .replace('{total}', totalPages);

      let { x, y } = getPosition(page, position);

      // Adjust x for center and right align manually:
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      if (position.includes('center')) {
        x = x - textWidth / 2;
      } else if (position.includes('right')) {
        x = x - textWidth;
      }
      
      // Adjust y for top so text is not cut off:
      if (position.startsWith('top')) {
        y = y - fontSize;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
      });
    });

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=numbered.pdf');

    // Send the PDF
    res.send(Buffer.from(modifiedPdfBytes));

    // Clean up
    fs.unlinkSync(pdfPath);

  } catch (error) {
    console.error('Add page numbers error:', error);
    res.status(500).json({ 
      error: 'Failed to add page numbers: ' + error.message,
      details: error.stack
    });
  }
});

// HTML to PDF Route
router.post('/html-to-pdf', async (req, res) => {
  try {
    console.log('req.headers:', req.headers);
    console.log('req.body:', req.body);

    let html, fileName;
    if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        html = parsed.html;
        fileName = parsed.fileName;
      } catch (e) {
        html = req.body;
        fileName = 'converted';
      }
    } else if (req.body && typeof req.body === 'object') {
      html = req.body.html;
      fileName = req.body.fileName;
    } else {
      html = undefined;
      fileName = 'converted';
    }

    console.log('Parsed html:', html);

    if (!html) {
      console.log('No HTML content provided');
      return res.status(400).json({ error: 'No HTML content provided' });
    }

    // Launch Puppeteer
    let browser;
    try {
      console.log('Puppeteer executable path:', puppeteer.executablePath && puppeteer.executablePath());
      browser = await puppeteer.launch({
        executablePath: puppeteer.executablePath && puppeteer.executablePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (err) {
      console.error('Puppeteer launch error:', err);
      return res.status(500).json({ error: 'Failed to launch Puppeteer: ' + err.message });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate the PDF as a buffer
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    console.log('PDF buffer size:', pdfBuffer.length);

    // Remove writing to disk (optional for debugging only)
    // fs.writeFileSync('debug-server.pdf', pdfBuffer);

    // Send the PDF buffer as a response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'converted'}.pdf"`);
    res.end(pdfBuffer); // Important: use res.end for binary data
  } catch (error) {
    console.error('HTML to PDF conversion error:', error);
    res.status(500).json({ error: 'Failed to convert HTML to PDF: ' + error.message });
  }
});

router.post('/organize-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    let newOrder;
    if (typeof req.body.order === 'string') {
      try {
        newOrder = JSON.parse(req.body.order);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid order format' });
      }
    } else {
      newOrder = req.body.order;
    }
    if (!Array.isArray(newOrder) || newOrder.length === 0) {
      return res.status(400).json({ error: 'No page order provided' });
    }
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    // Validate order
    if (newOrder.some(idx => typeof idx !== 'number' || idx < 0 || idx >= totalPages)) {
      return res.status(400).json({ error: 'Invalid page indices in order' });
    }
    const newPdf = await PDFDocument.create();
    for (const idx of newOrder) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [idx]);
      newPdf.addPage(copiedPage);
    }
    const newPdfBytes = await newPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reordered.pdf');
    res.send(Buffer.from(newPdfBytes));
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error('Organize PDF error:', error);
    res.status(500).json({ error: 'Failed to reorder PDF: ' + error.message });
  }
});
router.post('/ppt-to-pdf', upload.single('ppt'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PPT file uploaded' });
  }

  const inputFile = req.file.path;
  const outputDir = path.resolve('uploads');

  const cmd = `soffice --headless --convert-to pdf "${inputFile}" --outdir "${outputDir}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Conversion error:', stderr || error.message);
      // Delete uploaded file on error
      fs.unlink(inputFile, () => {});
      return res.status(500).json({ error: 'Failed to convert PPT to PDF' });
    }

    const pdfFilePath = path.join(
      outputDir,
      path.basename(inputFile, path.extname(inputFile)) + '.pdf'
    );

    res.download(pdfFilePath, (err) => {
      // Clean up files after sending response
      fs.unlink(inputFile, () => {});
      fs.unlink(pdfFilePath, () => {});
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  });
});
router.post('/excel-to-pdf', upload.single('excel'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No Excel file uploaded' });
  }

  const inputFile = req.file.path;
  const outputDir = path.resolve('uploads');

  // LibreOffice command to convert Excel to PDF
  const cmd = `soffice --headless --convert-to pdf "${inputFile}" --outdir "${outputDir}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Conversion error:', stderr || error.message);
      fs.unlink(inputFile, () => {});
      return res.status(500).json({ error: 'Failed to convert Excel to PDF' });
    }

    const pdfFilePath = path.join(
      outputDir,
      path.basename(inputFile, path.extname(inputFile)) + '.pdf'
    );

    res.download(pdfFilePath, (err) => {
      // Clean up files after sending response
      fs.unlink(inputFile, () => {});
      fs.unlink(pdfFilePath, () => {});
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  });
});
router.post('/pdf-to-word', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const docxFileName = `${path.basename(pdfPath, path.extname(pdfPath))}.docx`;
    const docxPath = path.join('uploads', docxFileName);

    console.log('PDF uploaded at:', pdfPath);

    const pythonPath = './venv/bin/python'; // Adjust if your venv is in another location

    // Execute the Python script to convert PDF to DOCX
    exec(
      `${pythonPath} convert_pdf_to_docx.py ${pdfPath} ${docxPath}`,
      (error, stdout, stderr) => {
        console.log('Python stdout:', stdout);
        console.log('Python stderr:', stderr);

        // Check for errors
        if (error || !fs.existsSync(docxPath)) {
          console.error('Conversion error:', error || 'DOCX file not created');
          return res.status(500).json({ error: 'Failed to convert PDF to DOCX' });
        }

        // Send the DOCX file for download
        res.download(docxPath, path.basename(docxPath), (err) => {
          // Cleanup
          [pdfPath, docxPath].forEach((file) => {
            try {
              if (fs.existsSync(file)) fs.unlinkSync(file);
            } catch (err) {
              console.warn('Failed to delete:', file, err);
            }
          });

          if (err) {
            console.error('Download error:', err);
          } else {
            console.log('Conversion complete, file sent to client.');
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in /pdf-to-word:', err);
    res.status(500).json({ error: err.message });
  }
});
router.post('/pdf-to-ppt', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const pdfPath = req.file.path;
  const imagesDir = path.join('uploads', `images_${Date.now()}`);
  fs.mkdirSync(imagesDir, { recursive: true });

  try {
    // Convert PDF pages to PNG images
    console.log('Converting PDF to images...');
    await new Promise((resolve, reject) => {
      const cmd = `pdftoppm -png ${pdfPath} ${path.join(imagesDir, 'page')}`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          reject(new Error('Failed to convert PDF to images.'));
        } else {
          resolve();
        }
      });
    });

    // Create a new PowerPoint
    let pptx = new PptxGenJS();

    // Add each PNG image as a slide
    const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png')).sort();

    if (images.length === 0) throw new Error('No images generated from PDF.');

    console.log(`Adding ${images.length} images to PPTX...`);

    images.forEach(imageFile => {
      const slide = pptx.addSlide();
      slide.addImage({
        path: path.join(imagesDir, imageFile),
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    });

    // Save PPTX to a file
    const pptxFileName = `${Date.now()}.pptx`;
    const pptxFilePath = path.join('uploads', pptxFileName);

    await pptx.writeFile({ fileName: pptxFilePath });

    // Send PPTX file
    res.download(pptxFilePath, 'converted.pptx', err => {
      // Cleanup
      [pdfPath, pptxFilePath].forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      });
      fs.rmSync(imagesDir, { recursive: true, force: true });
      if (err) console.error('Download error:', err);
    });
  } catch (err) {
    console.error('Error in /pdf-to-ppt:', err);
    res.status(500).json({ error: err.message });
  }
});
router.post('/pdf-to-excel', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const pdfPath = path.resolve(req.file.path);

  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    // Basic example: extract text lines
    const lines = data.text.split('\n').filter(line => line.trim() !== '');
    
    // Example table extraction (assumes tab-delimited or space-delimited tables)
    const tableRows = lines.map(line =>
      line.trim().split(/\s{2,}|\t+/).join(',') // convert to CSV row
    );

    const csvContent = tableRows.join('\n');

    // Save to CSV file
    const csvPath = path.resolve('uploads', `${Date.now()}.csv`);
    fs.writeFileSync(csvPath, csvContent);

    // Send the CSV file
    res.download(csvPath, 'converted.csv', err => {
      if (err) console.error('Error sending file:', err);
      fs.unlink(pdfPath, () => {});
      fs.unlink(csvPath, () => {});
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to extract tables from PDF.' });
    fs.unlink(pdfPath, () => {});
  }
});
router.post('/pdf-to-pdfa', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;

    // Create output path: uploads/{fileName}_pdfa.pdf
    const pdfaPath = path.join(
      path.dirname(pdfPath),
      `${path.basename(pdfPath, path.extname(pdfPath))}_pdfa.pdf`
    );

    const gsCommand = `gs -dPDFA=2 -dBATCH -dNOPAUSE -dNOOUTERSAVE -sProcessColorModel=DeviceCMYK -sDEVICE=pdfwrite -sPDFACompatibilityPolicy=1 -sOutputFile=${pdfaPath} ${pdfPath}`;
    console.log('Running ghostscript command:', gsCommand);

    // Run Ghostscript
    await new Promise((resolve, reject) => {
      exec(gsCommand, (err, stdout, stderr) => {
        if (err) {
          console.error('Ghostscript error:', stderr);
          return reject(new Error('Failed to convert to PDF/A'));
        }
        console.log('Ghostscript output:', stdout);
        resolve();
      });
    });

    // Verify output file exists
    if (!fs.existsSync(pdfaPath)) {
      throw new Error('PDF/A file not found');
    }

    // Send the converted file as response
    res.download(pdfaPath, 'converted_pdfa.pdf', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }

      // Clean up after sending
      fs.unlinkSync(pdfPath);
      fs.unlinkSync(pdfaPath);
    });
  } catch (error) {
    console.error('Error in /pdf-to-pdfa:', error);
    res.status(500).json({ error: error.message || 'Failed to convert to PDF/A' });
  }
});
router.post('/compare-pdf', upload.fields([{ name: 'file1' }, { name: 'file2' }]), (req, res) => {
  if (!req.files || !req.files.file1 || !req.files.file2) {
    return res.status(400).json({ error: 'Please upload two PDF files.' });
  }

  const file1Path = req.files.file1[0].path;
  const file2Path = req.files.file2[0].path;
  const diffOutputPath = path.join('uploads', `${Date.now()}_diff.pdf`);

  // Run diff-pdf command to output differences to a PDF
  const cmd = `diff-pdf --output-diff=${diffOutputPath} ${file1Path} ${file2Path}`;

  exec(cmd, (error, stdout, stderr) => {
    // Clean up uploaded files after processing
    fs.unlinkSync(file1Path);
    fs.unlinkSync(file2Path);

    if (error) {
      // diff-pdf returns error if files differ, so we check stdout/stderr to distinguish error types
      if (stderr.includes('could not open')) {
        return res.status(500).json({ error: 'Error comparing PDFs.' });
      }
      // Files differ — send diff PDF back
      return res.download(diffOutputPath, 'diff.pdf', (err) => {
        if (!err) fs.unlinkSync(diffOutputPath); // remove diff after sending
      });
    } else {
      // Files are identical — no diff output created
      return res.json({ message: 'PDFs are identical.' });
    }
  });
});
router.post('/pdf-watermark', upload.single('pdf'), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const watermarkText = req.body.watermark;

    // Load the PDF
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - watermarkText.length * 2.5,
        y: height / 2,
        size: 50,
        opacity: 0.3,
        color: rgb(0.95, 0.1, 0.1),
        rotate: degrees(45),
      });
    });

    // Save watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();
    const watermarkedPath = path.join(uploadDir, `watermarked_${req.file.filename}`);
    fs.writeFileSync(watermarkedPath, watermarkedPdfBytes);

    // Send file
    res.sendFile(watermarkedPath, () => {
      // Cleanup
      fs.unlinkSync(pdfPath);
      fs.unlinkSync(watermarkedPath);
    });
  } catch (err) {
    console.error('Watermark error:', err);
    res.status(500).json({ error: 'Failed to add watermark' });
  }
});
router.post('/unlock-pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const inputPath = req.file.path;
  const outputPath = inputPath + '_unlocked.pdf';
  const password = req.body.password || '';

  // qpdf command to remove password (decrypt)
  // --password=PASSWORD : provide the password
  // --decrypt : remove encryption
  const cmd = `qpdf --password=${password} --decrypt ${inputPath} ${outputPath}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('qpdf error:', error);
      // Clean up
      fs.unlinkSync(inputPath);
      return res.status(400).json({ error: 'Failed to unlock PDF. Incorrect password or corrupted file.' });
    }

    // Send unlocked PDF file as response
    res.download(outputPath, 'unlocked.pdf', (err) => {
      // Clean up both files after sending
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  });
});
router.post('/protect-pdf', upload.single('pdf'), (req, res) => {
  const { password } = req.body;
  if (!password || !req.file) {
    return res.status(400).json({ error: 'PDF file and password are required.' });
  }

  const inputPath = req.file.path;
  const outputPath = path.join('uploads', `protected_${Date.now()}.pdf`);

  // qpdf command to add password protection
  const command = `qpdf --encrypt ${password} ${password} 256 -- ${inputPath} ${outputPath}`;

  exec(command, (error, stdout, stderr) => {
    // Clean up the original file
    fs.unlinkSync(inputPath);

    if (error) {
      console.error('qpdf error:', error, stderr);
      return res.status(500).json({ error: 'Failed to protect PDF.' });
    }

    // Send back the protected PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=protected.pdf'
    });

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res).on('finish', () => {
      // Clean up protected PDF file
      fs.unlinkSync(outputPath);
    });
  });
});
router.post('/word-to-pdf', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputPath = req.file.path;
  const outputPath = inputPath + '.pdf';

  // Read the Word file
  const fileBuffer = fs.readFileSync(inputPath);

  // Convert to PDF (output format: pdf)
  libre.convert(fileBuffer, '.pdf', undefined, (err, done) => {
    // Delete the uploaded docx file after conversion
    fs.unlinkSync(inputPath);

    if (err) {
      console.error(`Error converting file: ${err}`);
      return res.status(500).json({ error: 'Conversion failed' });
    }

    // Save converted PDF temporarily
    fs.writeFileSync(outputPath, done);

    // Send the PDF file to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.parse(req.file.originalname).name}.pdf"`);

    // Read PDF and pipe to response
    const pdfStream = fs.createReadStream(outputPath);
    pdfStream.pipe(res);

    // Delete the temporary PDF file after sending response
    pdfStream.on('close', () => {
      fs.unlinkSync(outputPath);
    });
  });
});


module.exports = router;