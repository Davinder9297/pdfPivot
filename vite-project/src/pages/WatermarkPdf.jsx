// components/PdfWatermarkPage.js

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const PdfWatermarkPage = () => {
  const [file, setFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkedFile, setWatermarkedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setWatermarkedFile(null);
        setError(null);
      }
    }
  });

  const handleWatermark = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    if (!watermarkText.trim()) {
      setError('Please enter a watermark text');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('watermark', watermarkText);

    try {
      const response = await fetch('/api/pdf-watermark', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      setWatermarkedFile(blob);
      toast.success('Watermark added successfully!');
    } catch (err) {
      console.error('Watermark error:', err);
      setError(err.message || 'Failed to add watermark. Please check the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (watermarkedFile) {
      const url = URL.createObjectURL(watermarkedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'watermarked.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Add Watermark to PDF</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Upload a PDF and add a custom watermark text to each page.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Upload */}
            <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'} cursor-pointer`}>
              <input {...getInputProps()} className="sr-only" />
              <div className="text-center">
                <FaFilePdf className="mx-auto h-12 w-12 text-indigo-600" />
                <p className="text-sm text-gray-600">Upload PDF file or drag and drop here</p>
                {file && <p className="mt-2 text-sm text-gray-700">{file.name}</p>}
              </div>
            </div>

            {/* Watermark input */}
            <div className="mt-4">
              <label htmlFor="watermark" className="block text-sm font-medium text-gray-700 mb-1">
                Watermark Text
              </label>
              <input
                id="watermark"
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="e.g., Confidential"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            {/* Add watermark button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleWatermark}
                disabled={!file || loading}
                className={`px-8 py-3 rounded-lg text-white bg-indigo-700 hover:bg-indigo-800 transition duration-200 ${(!file || loading) && 'opacity-50 cursor-not-allowed'}`}
              >
                {loading ? 'Adding...' : 'Add Watermark'}
              </button>
            </div>

            {/* Download button */}
            {watermarkedFile && !loading && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200"
                >
                  <FaDownload className="inline-block mr-2" />
                  Download Watermarked PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfWatermarkPage;