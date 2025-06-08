import React, { useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PdfToJpgPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setError(null);
    setImages([]);
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const imgArray = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        imgArray.push(imgData);
      }

      setImages(imgArray);
    } catch (err) {
      setError('Failed to convert PDF. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    images.forEach((imgData, index) => {
      const base64Data = imgData.split(',')[1];
      zip.file(`page-${index + 1}.jpg`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'converted-images.zip');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">Convert PDF to JPG</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Upload a PDF and convert each page to a JPG image. Download all images as a ZIP file.
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
                        <label htmlFor="file-upload-pdf2jpg" className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          <span>Upload PDF file</span>
                          <input
                            id="file-upload-pdf2jpg"
                            name="file-upload-pdf2jpg"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 20MB</p>
                    </div>
                  </div>
                </div>
                {/* Preview Images */}
                {loading && <p className="text-center text-gray-600">Converting PDF to images...</p>}
                {!loading && images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Page ${idx + 1}`}
                        className="border rounded shadow mx-auto"
                        style={{ maxWidth: 300 }}
                      />
                    ))}
                  </div>
                )}
                {/* Download Button */}
                {images.length > 0 && !loading && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleDownloadZip}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                    >
                      Download JPG ZIP
                    </button>
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

export default PdfToJpgPage;
