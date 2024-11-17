import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import './App.css';

function App() {
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setOriginalSize((file.size / 1024 / 1024).toFixed(2) + ' MB');

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const scaleFactor = 0.1; // Adjust for more compression (0.5 = 50% of original resolution)
        page.scaleContent(scaleFactor, scaleFactor);

        // Optionally, set a white background to reduce ink density
        page.drawRectangle({
          x: 0,
          y: 0,
          width: page.getWidth(),
          height: page.getHeight(),
          color: rgb(1, 1, 1),
        });
      }

      // Remove metadata and optimize the file
      pdfDoc.setTitle('Compressed PDF');
      pdfDoc.setSubject('Optimized and Compressed PDF');
      pdfDoc.setKeywords(['compressed', 'optimized', 'PDF']);

      const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
      setCompressedSize((compressedPdfBytes.byteLength / 1024 / 1024).toFixed(2) + ' MB');
      const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const compressedUrl = URL.createObjectURL(compressedBlob);
      setCompressedPdfUrl(compressedUrl);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>PDF Compressor</h2>
        <input type="file" accept="application/pdf" onChange={handleFileUpload} />
        {originalSize && <p>Original Size: {originalSize}</p>}
        {compressedSize && <p>Compressed Size: {compressedSize}</p>}
        {compressedPdfUrl && (
          <a href={compressedPdfUrl} download="compressed.pdf">
            Download Compressed PDF
          </a>
        )}
      </header>
    </div>
  );
}

export default App;
