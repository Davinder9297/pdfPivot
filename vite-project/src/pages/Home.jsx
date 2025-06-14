import { useState } from "react";
import OperationCard from "../components/OperationCard";
import DisplayPlans from "../components/DisplayPlans";
import WhyUsSection from "../components/WhyUsSection";
import Footer from "../components/Footer";
import HowItWorksSection from "../components/HowItWorksSection";
import FAQSection from "../components/FAQSection";
import TrustedBySection from "../components/TrustedBySection";
import HeroBanner from "../components/HeroBanner";
import OperationTabsWrapper from "../components/TabWrapper";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const categorizedOperations = {
  "PDF Page Management": [
    { title: "Merge PDF", description: "Combine multiple PDFs into one.", route: "/merge-pdf", icon: "🗂️" },
    { title: "Split PDF", description: "Split a PDF into separate files.", route: "/split-pdf", icon: "✂️" },
    { title: "Remove Pages", description: "Delete specific pages from a PDF.", route: "/remove-pages", icon: "❌" },
    { title: "Extract Pages", description: "Extract selected pages as a new PDF.", route: "/extract-pages", icon: "📄" },
    { title: "Organize PDF", description: "Reorder or arrange PDF pages.", route: "/organize-pdf", icon: "🗃️" },
    { title: "Rotate PDF", description: "Rotate pages in your PDF.", route: "/rotate-pdf", icon: "🔄" },
    { title: "Metadata Viewer", description: "View all details of any PDF.", route: "/view-metadata", icon: "📑" },
    { title: "Update Metadata", description: "Edit PDF author, title, and more", route: "/update-metadata", icon: "✏️" },
    { title: "Compare PDF", description: "Compare two PDF files for differences.", route: "/compare-pdf", icon: "🆚" },
    { title: "PDF to PDF/A", description: "Convert PDFs to PDF/A for archiving.", route: "/pdf-to-pdfa", icon: "🗄️" },

  ],
  "Format Conversions (To PDF)": [
    { title: "JPG to PDF", description: "Convert JPG images to PDF.", route: "/jpg-to-pdf", icon: "🖼️" },
    { title: "Word to PDF", description: "Convert Word documents to PDF.", route: "/word-to-pdf", icon: "📄" },
    { title: "PowerPoint to PDF", description: "Convert PowerPoint files to PDF.", route: "/ppt-to-pdf", icon: "📊" },
    { title: "Excel to PDF", description: "Convert Excel spreadsheets to PDF.", route: "/excel-to-pdf", icon: "📈" },
    { title: "HTML to PDF", description: "Convert HTML files to PDF.", route: "/html-to-pdf", icon: "🌐" },
  ],
  "Format Conversions (From PDF)": [
    { title: "PDF to JPG", description: "Convert PDF pages to JPG images.", route: "/pdf-to-jpg", icon: "🖼️" },
    { title: "PDF to Word", description: "Convert PDFs to editable Word documents.", route: "/pdf-to-word", icon: "📄" },
    { title: "PDF to PowerPoint", description: "Convert PDFs to PowerPoint presentations.", route: "/pdf-to-ppt", icon: "📊" },
    { title: "PDF to Excel", description: "Convert PDFs to Excel spreadsheets.", route: "/pdf-to-excel", icon: "📈" },
    { title: "PDF to Text Converter", description: "Extract plain text easily", route: "/pdf-to-text", icon: "📄" },
  ],
  "Security & Watermarking": [
    { title: "Unlock PDF", description: "Remove password protection from PDFs.", route: "/unlock-pdf", icon: "🔓" },
    { title: "Protect PDF", description: "Add password protection to your PDFs.", route: "/protect-pdf", icon: "🔒" },
    { title: "Add Page Numbers", description: "Add page numbers to your PDF.", route: "/add-page-numbers", icon: "🔢" },
    { title: "Add Watermark", description: "Add watermark text or image to your PDF.", route: "/add-watermark", icon: "💧" },
    { title: "Compress PDF", description: "Reduce PDF file size for easy sharing.", route: "/compress-pdf", icon: "📉" },

  ],

};

const Home = () => {
  const categories = Object.keys(categorizedOperations);
  const {activeCategory, setActiveCategory} = useAuth()


  return (
    <div className="min-h-screen bg-gray-50">
        {/* <h2 className="text-2xl md:text-3xl font-bold text-center text-forest mb-6 px-4">
          Everything You Need to Work with PDFs — All in One Place
        </h2> */}

        {/* Tabs */}
        {/* <div className="flex flex-wrap justify-center gap-3 px-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                activeCategory === cat
                  ? "bg-forest text-white border-forest"
                  : "bg-white text-forest border-gray-300 hover:bg-forest hover:text-white"
              } transition duration-200`}
            >
              {cat}
            </button>
          ))}
        </div> */}

        {/* Operation Cards */}
          <OperationTabsWrapper>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 justify-start items-stretch px-4">
            {categorizedOperations[activeCategory].map((op) => (
              <OperationCard
                key={op.route}
                title={op.title}
                description={op.description}
                route={op.route}
                icon={op.icon}
              />
            ))}
          </div>
          </OperationTabsWrapper>

      <div className="bg-[#FFF9E5]">
        <HowItWorksSection />
      </div>
      <div className="bg-[#FFF9E5]">
        <HeroBanner />
      </div>
      <div className="bg-white">
        <DisplayPlans />
      </div>
      <div className="bg-[#FFF9E5]">
        <WhyUsSection />
      </div>
      <div className="bg-white">
        <TrustedBySection />
      </div>
      <div className="bg-[#FFF9E5]">
        <FAQSection />
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
