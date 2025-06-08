import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function PdfComparePage() {
  const [files, setFiles] = useState([]);
  const [diffPdf, setDiffPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length !== 2) {
        setError('Please upload exactly two PDF files.');
        return;
      }
      setFiles(acceptedFiles);
      setError(null);
    },
  });

  const handleCompare = async () => {
    if (files.length !== 2) {
      setError('Please upload exactly two PDF files.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file1', files[0]);
    formData.append('file2', files[1]);

    try {
      const response = await fetch('/api/compare-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Server error');
      }

      const blob = await response.blob();
      setDiffPdf(blob);
      toast.success('Comparison done!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to compare PDFs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (diffPdf) {
      const url = URL.createObjectURL(diffPdf);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'diff.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-indigo-700">Compare Two PDFs</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-400 rounded-md p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors"
        >
          <input {...getInputProps()} />
          <FaFilePdf className="mx-auto text-indigo-600 h-10 w-10 mb-2" />
          <p className="text-gray-600 text-sm">
            Drag and drop exactly two PDF files, or click to select.
          </p>
          {files.length === 2 && (
            <ul className="mt-2 text-sm text-gray-700">
              {files.map(file => (
                <li key={file.name}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCompare}
            disabled={loading || files.length !== 2}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>

        {diffPdf && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
            >
              <FaDownload /> Download Diff PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
