import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const PdfToPdfaPage = () => {
  const [file, setFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setConvertedFile(null);
        setError(null);
      }
    }
  });

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a PDF file');
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
        service: 'pdf-to-pdfa',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL+'/api/pdf-to-pdfa', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      setConvertedFile(blob);
      toast.success('PDF converted to PDF/A successfully!');
    } catch (err) {
       console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError("Please login to use this feature");
      } else if (err.response?.status === 403) {
        setError("You have reached your pdf processing limit. Please upgrade your plan.");
      } else {
        setError("Failed to convert into pdfa. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (convertedFile) {
      const url = URL.createObjectURL(convertedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted_pdfa.pdf';
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
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Convert PDF to PDF/A</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Upload a PDF and convert it to an archival-standard PDF/A file.
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

            {/* Convert button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleConvert}
                disabled={!file || loading}
                className={`px-8 py-3 rounded-lg text-white bg-indigo-700 hover:bg-indigo-800 transition duration-200 ${(!file || loading) && 'opacity-50 cursor-not-allowed'}`}
              >
                {loading ? 'Converting...' : 'Convert to PDF/A'}
              </button>
            </div>

            {/* Download button */}
            {convertedFile && !loading && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200"
                >
                  <FaDownload className="inline-block mr-2" />
                  Download PDF/A
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfToPdfaPage;