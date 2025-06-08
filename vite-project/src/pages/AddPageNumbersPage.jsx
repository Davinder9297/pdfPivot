import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaHashtag } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AddPageNumbersPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    position: 'bottom-center',
    format: 'Page {n} of {total}',
    fontSize: 12,
    color: '#000000',
    margin: 20
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
      }
    }
  });

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: name === 'fontSize' || name === 'margin' ? Number(value) : value
    }));
  };

  const handleAddPageNumbers = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('pdf', file);
    
    // Add options to formData
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await fetch('http://localhost:5000/api/add-page-numbers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Check if we got a PDF file
      const contentType = response.headers.get('content-type');
      if (contentType === 'application/pdf') {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'numbered.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Page numbers added successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Add page numbers error:', error);
      setError(error.message || 'Failed to add page numbers. Please make sure the server is running.');
      toast.error('Failed to add page numbers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">Add Page Numbers to PDF</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Upload a PDF and add customizable page numbers to each page.
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
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200 cursor-pointer ${
                      isDragActive ? 'border-gold bg-gold/10' : ''
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <FaFilePdf className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          Upload PDF file
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 20MB</p>
                      {file && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">
                          Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    <input {...getInputProps()} className="sr-only" />
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      name="position"
                      value={options.position}
                      onChange={handleOptionChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-center">Top Center</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format
                    </label>
                    <input
                      type="text"
                      name="format"
                      value={options.format}
                      onChange={handleOptionChange}
                      placeholder="Page {n} of {total}"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use {'{n}'} for page number and {'{total}'} for total pages
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      type="number"
                      name="fontSize"
                      value={options.fontSize}
                      onChange={handleOptionChange}
                      min="8"
                      max="72"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        name="color"
                        value={options.color}
                        onChange={handleOptionChange}
                        className="h-8 w-8 rounded-md border border-gray-300"
                      />
                      <input
                        type="text"
                        name="color"
                        value={options.color}
                        onChange={handleOptionChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Margin (points)
                    </label>
                    <input
                      type="number"
                      name="margin"
                      value={options.margin}
                      onChange={handleOptionChange}
                      min="0"
                      max="100"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                    />
                  </div>
                </div>

                {/* Add Page Numbers Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleAddPageNumbers}
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
                        Adding Page Numbers...
                      </>
                    ) : (
                      <>
                        <FaHashtag className="mr-2" />
                        Add Page Numbers
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPageNumbersPage; 