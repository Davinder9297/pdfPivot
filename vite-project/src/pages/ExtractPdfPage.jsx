import { useState } from "react";
import { PDFDocument } from 'pdf-lib';
import axios from "axios";

const ExtractPdfPage = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pageNumbers, setPageNumbers] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f || f.type !== 'application/pdf') {
      setError("Please select a PDF file only.");
      setFile(null);
      setTotalPages(0);
      return;
    }
    setFile(f);
    setError(null);
    setPageNumbers("");
    setPdfUrl(null);

    // Get total pages
    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError("Failed to load PDF. Please try another file.");
      setFile(null);
      setTotalPages(0);
    }
  };

  const handlePageNumbersChange = (e) => {
    setPageNumbers(e.target.value);
  };

  const handleExtractPages = async () => {
    setLoading(true);
    setError(null);
    setPdfUrl(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Please login to use this feature");
      setLoading(false);
      return;
    }
    try {
         const trackRes = await axios.post('/api/user/track', {
        service: 'extract-pages',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Validate page numbers input
      const pages = pageNumbers.split(',').map(p => p.trim()).filter(p => p);
      if (pages.length === 0) {
        setError("Please enter at least one page number to extract.");
        setLoading(false);
        return;
      }

      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Validate page numbers
      const pagesToExtract = pages.map(p => parseInt(p)).filter(p => p > 0 && p <= totalPages);
      if (pagesToExtract.length === 0) {
        setError(`Invalid page numbers. Please enter numbers between 1 and ${totalPages}`);
        setLoading(false);
        return;
      }

      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();

      // Copy only the selected pages
      for (const pageNum of pagesToExtract) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
      }

      // Save the new PDF
      const newPdfBytes = await newPdfDoc.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
        console.error("Extract failed:", err);
      if (err.response?.status === 401) {
        setError("Please login to use this feature");
      } else if (err.response?.status === 403) {
        setError("You have reached your pdf processing limit. Please upgrade your plan.");
      } else {
        setError("Failed to extract pdf. Please try again.");
      }
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">Extract PDF Pages</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Upload a PDF and extract specific pages into a new PDF. Enter page numbers separated by commas (e.g., 1,3,5).
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
                        <label htmlFor="file-upload-extract" className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          <span>Upload PDF file</span>
                          <input
                            id="file-upload-extract"
                            name="file-upload-extract"
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
                          Selected: {file.name} ({totalPages} pages)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Page Numbers Input */}
                <div>
                  <label htmlFor="page-numbers" className="block text-sm font-medium text-gray-700 mb-2">
                    Pages to Extract (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="page-numbers"
                    value={pageNumbers}
                    onChange={handlePageNumbersChange}
                    placeholder="e.g., 1,3,5"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                  />
                  {totalPages > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      Enter page numbers between 1 and {totalPages}
                    </p>
                  )}
                </div>
                {/* Extract Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleExtractPages}
                    disabled={!file || loading}
                    className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-forest hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                      !file || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extracting...
                      </>
                    ) : (
                      'Extract Pages'
                    )}
                  </button>
                </div>
                {/* Download Button */}
                {pdfUrl && !loading && (
                  <div className="flex justify-center mt-4">
                    <a
                      href={pdfUrl}
                      download="extracted-pages.pdf"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Extracted Pages
                    </a>
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

export default ExtractPdfPage; 