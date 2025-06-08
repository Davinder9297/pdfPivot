import React, { useState } from "react";

const faqs = [
  {
    question: "How do I convert a file to PDF?",
    answer:
      "Select a conversion tool like Word to PDF, upload your file, and click Convert. Your PDF will be ready for download instantly.",
  },
  {
    question: "Is there a limit to the number of PDF tasks I can do?",
    answer:
      "Yes, each subscription plan comes with monthly quotas. Free users get limited conversions. Paid plans offer more or unlimited usage.",
  },
  {
    question: "Is my PDF data secure?",
    answer:
      "Absolutely. All files are processed with secure encryption and automatically deleted after processing. We never store your data.",
  },
  {
    question: "Can I use PdfPivot on my phone?",
    answer:
      "Yes! PdfPivot is fully responsive and works on all modern mobile browsers.",
  },
  {
    question: "Which file formats can I convert to and from PDF?",
    answer:
      "You can convert Word, Excel, PowerPoint, JPG, and HTML to PDF — and vice versa. We also support PDF to PDF/A and OCR for scanned files.",
  },
  {
    question: "How does the OCR feature work?",
    answer:
      "OCR automatically extracts text from scanned PDFs, allowing you to search and edit content. It's available for all PDF tools.",
  },
  
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="w-full py-16 bg-[#FFF0F0] flex flex-col items-center ">
      <h2 className="text-3xl font-bold text-forest mb-8 text-center">PdfPivot FAQ</h2>
      <div className="w-full max-w-2xl bg-[#525266] text-white rounded-xl shadow border border-forest divide-y divide-red-500">
        {faqs.map((faq, idx) => (
          <div key={idx}>
            <button
              className={`w-full text-left px-6 py-4 flex justify-between  text-white items-center focus:outline-none transition-colors ${
                openIndex === idx ? 'bg-red-500' : 'bg-[#525266]'
              }`}
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            >
              <span className="text-white font-semibold">{faq.question}</span>
              <span className={`ml-4 transition-transform text-white ${openIndex === idx ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-4 pt-2 text-white animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection; 