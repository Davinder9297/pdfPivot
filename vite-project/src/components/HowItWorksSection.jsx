import React from "react";

const HowItWorksSection = () => {
  return (
    <section className="bg-gray-50  py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-forest mb-16">
          PdfPivot, Your all-in-one PDF toolkit.
        </h2>
        <div className="w-full flex justify-center ">
          <div className="flex flex-col md:flex-row bg-[#e12c12] items-center max-w-4xl w-full mx-auto p-8 rounded-xl shadow-lg" style={{ boxShadow: '0 4px 24px 0 #FFD70022' }}>
            {/* Illustration/Image */}
            <div className="flex-shrink-0 flex justify-center w-full md:w-auto mb-8 md:mb-0 md:mr-16">
              <img
                src="/image1.jpg"
                alt="How to convert"
                className="w-56 h-56 object-contain rounded-lg shadow"
              />
            </div>
            {/* Text Content */}
            <div className="flex-1 text-left">
              <h3 className="text-2xl font-bold text-gold mb-3">How to convert PDF to Word</h3>
              <p className="text-white  font-semibold mb-4">
                Follow these simple steps to convert a PDF to Word using Xodo:
              </p>
              <ol className="list-decimal list-inside text-white  space-y-2 font-medium text-base">
                <li>Upload your PDF to the free online PDF to Word converter.</li>
                <li>Click "Convert" – OCR is automatically applied to scanned PDFs.</li>
                <li>Download your editable Word (.docx) file.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 