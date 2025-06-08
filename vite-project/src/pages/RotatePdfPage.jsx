import { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, degrees } from 'pdf-lib';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const RotatePdfPage = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f || f.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      setFile(null);
      setNumPages(null);
      setDownloadUrl(null);
      return;
    }
    setFile(f);
    setError(null);
    setNumPages(null);
    setRotation(0);
    setDownloadUrl(null);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const rotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleDownload = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setDownloadUrl(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        // Get current rotation, add the selected rotation, and normalize
        const current = pages[i].getRotation().angle;
        const newAngle = (current + rotation + 360) % 360;
        pages[i].setRotation(degrees(newAngle));
      }
      const newPdfBytes = await pdfDoc.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError('Failed to generate rotated PDF. ' + (err.message || 'Please try again.'));
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">Rotate PDF Page</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Upload a PDF and preview the first page. Use the buttons to rotate the preview left or right. Download the rotated PDF.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F4EDE4] rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload PDF
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload-rotate" className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          <span>Upload PDF file</span>
                          <input
                            id="file-upload-rotate"
                            name="file-upload-rotate"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 20MB</p>
                      {file && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">
                          Selected: {file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Preview and Rotate Buttons */}
                {file && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                      <div className="w-[200px] h-[250px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative">
                        <div className="text-center">
                          <svg 
                            className="w-16 h-16 text-gray-400 mx-auto mb-3"
                            style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-600 font-medium text-sm">PDF Preview</p>
                          <p className="text-xs text-gray-500 mt-1">Rotation: {rotation}°</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-6 mt-4">
                      <button
                        onClick={rotateLeft}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-8 py-3 text-lg font-bold flex items-center gap-2 shadow"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.636 5.636L7.222 7.05A9 9 0 1012 3v3m0 0v4m0-4H8" />
                        </svg>
                        Rotate Left
                      </button>
                      <button
                        onClick={rotateRight}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-8 py-3 text-lg font-bold flex items-center gap-2 shadow"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.364 5.636l1.414 1.414A9 9 0 1112 3v3m0 0v4m0-4h4" />
                        </svg>
                        Rotate Right
                      </button>
                    </div>
                    <div className="flex flex-col items-center gap-2 mt-4">
                      <div className="text-sm text-gray-500">Current rotation: {rotation}&deg;</div>
                      <button
                        onClick={handleDownload}
                        disabled={processing}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-forest hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 mt-2"
                      >
                        {processing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          'Download Rotated PDF'
                        )}
                      </button>
                      {downloadUrl && !processing && (
                        <a
                          href={downloadUrl}
                          download="rotated.pdf"
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105 mt-2"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Click here to download
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatePdfPage;
