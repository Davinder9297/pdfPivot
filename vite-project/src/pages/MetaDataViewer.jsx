import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const PdfMetadataViewer = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setMetadata(null);
        setError(null);
      }
    }
  });

  const handleViewMetadata = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);
        const token = localStorage.getItem('token');
    if (!token) {
      setError("Please login to use this feature");
      setLoading(false);
      return;
    }
    try {
         const trackRes = await axios.post('/api/user/track', {
        service: 'view-metadata',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL + '/api/view-metadata', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setMetadata(data.metadata);
      toast.success('Metadata retrieved successfully!');
    } catch (err) {
       console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError("Please login to use this feature");
      } else if (err.response?.status === 403) {
        setError("You have reached your pdf processing limit. Please upgrade your plan.");
      } else {
        setError("Failed to view metadata pdf. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-3xl font-bold text-center text-forest mb-4">PDF Metadata Viewer</h1>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* File Upload */}
          <div {...getRootProps()} className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-gold transition-colors ${isDragActive ? 'border-gold bg-gold/10' : 'border-gray-300'}`}>
            <FaFilePdf className="text-6xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Upload a PDF file or drag & drop here</p>
            <input {...getInputProps()} className="sr-only" />
            {file && (
              <p className="mt-2 text-sm text-indigo-600">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
            )}
          </div>

          {/* View Metadata Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleViewMetadata}
              disabled={!file || loading}
              className="px-6 py-3 bg-forest text-white rounded-lg shadow hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {loading ? 'Fetching...' : 'View Metadata'}
            </button>
          </div>

          {/* Display Metadata */}
          {metadata && (
            <div className="mt-6 bg-[#F4EDE4] rounded-lg p-4 overflow-x-auto">
              <h2 className="text-xl font-semibold mb-2">Metadata:</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfMetadataViewer;