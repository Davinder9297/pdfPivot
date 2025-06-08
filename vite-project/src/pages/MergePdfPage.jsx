import { useState } from "react";

const MergePdfPage = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

  // Handle file input
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    if (newFiles.length === 0) {
      setError("Please select PDF files only.");
      return;
    }
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  // Remove file
  const handleRemove = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Drag and drop reordering
  const handleDragStart = (idx) => {
    setFiles(files => files.map((f, i) => ({ ...f, _dragging: i === idx })));
  };
  const handleDragOver = (idx) => {
    const draggingIdx = files.findIndex(f => f._dragging);
    if (draggingIdx === -1 || draggingIdx === idx) return;
    const reordered = [...files];
    const [dragged] = reordered.splice(draggingIdx, 1);
    reordered.splice(idx, 0, dragged);
    setFiles(reordered.map(f => ({ ...f, _dragging: false })));
  };
  const handleDragEnd = () => {
    setFiles(files => files.map(f => ({ ...f, _dragging: false })));
  };

  // Simulate merge (UI only)
  const handleMerge = async () => {
    setLoading(true);
    setError(null);
    setMergedPdfUrl(null);

    const formData = new FormData();
    files.forEach(file => formData.append('pdfs', file));

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL+'/api/merge-pdf', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to merge PDFs');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (err) {
      setError('Failed to merge PDFs. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">Merge PDF Files</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Combine multiple PDF files into a single document. Drag to reorder before merging.
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
                    Upload PDFs
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload-pdf" className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          <span>Upload PDF files</span>
                          <input
                            id="file-upload-pdf"
                            name="file-upload-pdf"
                            type="file"
                            accept="application/pdf"
                            multiple
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 20MB each</p>
                    </div>
                  </div>
                </div>
                {/* Uploaded Files List */}
                {files.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-4 mt-2">
                    <ul className="divide-y divide-gray-200">
                      {files.map((file, idx) => (
                        <li
                          key={idx}
                          className={`flex items-center py-2 ${file._dragging ? 'bg-yellow-100' : ''}`}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={() => handleDragOver(idx)}
                          onDragEnd={handleDragEnd}
                        >
                          <span className="flex-1 truncate text-gray-800 text-sm">
                            {file.name}
                          </span>
                          <button
                            onClick={() => handleRemove(idx)}
                            className="ml-4 text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Merge Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleMerge}
                    disabled={files.length < 2 || loading}
                    className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-forest hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                      files.length < 2 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Merging...
                      </>
                    ) : (
                      'Merge PDFs'
                    )}
                  </button>
                </div>
                {/* Download Button */}
                {mergedPdfUrl && !loading && (
                  <div className="flex justify-center mt-4">
                    <a
                      href={mergedPdfUrl}
                      download="merged.pdf"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Merged PDF
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

export default MergePdfPage; 