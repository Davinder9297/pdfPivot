import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";

const HtmlToPdfPage = () => {
  const [html, setHtml] = useState("");
  const [fileName, setFileName] = useState("converted");
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!html.trim()) {
      toast.error("Please enter HTML content.");
      return;
    }
    setLoading(true);
        const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
         const trackRes = await axios.post('/api/user/track', {
        service: 'html-to-pdf',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch("/api/html-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, fileName }),
      });
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        // Try to parse error message from backend
        let errorMsg = 'Failed to convert HTML to PDF';
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } else {
          const text = await response.text();
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }
      if (!contentType || !contentType.includes('application/pdf')) {
        const text = await response.text();
        throw new Error('Server did not return a PDF. Response: ' + text);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName || "converted"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF downloaded!");
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">HTML to PDF</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Paste your HTML code below and download it as a PDF.
          </p>
        </div>
        <div className="bg-[#F4EDE4] rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTML Content
            </label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold min-h-[200px] font-mono"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<html><body><h1>Hello PDF!</h1></body></html>"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File Name
            </label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="converted"
            />
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleConvert}
              disabled={loading}
              className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-forest hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting...
                </>
              ) : (
                "Convert to PDF"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlToPdfPage; 