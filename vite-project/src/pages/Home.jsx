import OperationCard from "../components/OperationCard";
import DisplayPlans from "../components/DisplayPlans";
import WhyUsSection from "../components/WhyUsSection";
import Footer from "../components/Footer";
import HowItWorksSection from "../components/HowItWorksSection";
import FAQSection from "../components/FAQSection";
import TrustedBySection from "../components/TrustedBySection";
import HeroBanner from "../components/HeroBanner";

const Home = () => {
  const operations = [
    { title: "Merge PDF", description: "Combine multiple PDFs into one.", route: "/merge-pdf", icon: "🗂️" },
    { title: "Split PDF", description: "Split a PDF into separate files.", route: "/split-pdf", icon: "✂️" },
    { title: "Remove Pages", description: "Delete specific pages from a PDF.", route: "/remove-pages", icon: "❌" },
    { title: "Extract Pages", description: "Extract selected pages as a new PDF.", route: "/extract-pages", icon: "📄" },
    { title: "Organize PDF ", description: "Reorder or arrange PDF pages.", route: "/organize-pdf", icon: "🗃️" },
    { title: "Rotate PDF", description: "Rotate pages in your PDF.", route: "/rotate-pdf", icon: "🔄" },
    { title: "Compress PDF", description: "Reduce PDF file size for easy sharing.", route: "/compress-pdf", icon: "📉" },
    { title: "JPG to PDF", description: "Convert JPG images to PDF.", route: "/jpg-to-pdf", icon: "🖼️" },
    { title: "Word to PDF", description: "Convert Word documents to PDF.", route: "/word-to-pdf", icon: "📄" },
    { title: "PowerPoint to PDF", description: "Convert PowerPoint files to PDF.", route: "/ppt-to-pdf", icon: "📊" },
    { title: "Excel to PDF", description: "Convert Excel spreadsheets to PDF.", route: "/excel-to-pdf", icon: "📈" },
    { title: "HTML to PDF", description: "Convert HTML files to PDF.", route: "/html-to-pdf", icon: "🌐" },
    { title: "PDF to JPG", description: "Convert PDF pages to JPG images.", route: "/pdf-to-jpg", icon: "🖼️" },
    { title: "PDF to Word", description: "Convert PDFs to editable Word documents.", route: "/pdf-to-word", icon: "📄" },
    { title: "PDF to PowerPoint", description: "Convert PDFs to PowerPoint presentations.", route: "/pdf-to-ppt", icon: "📊" },
    { title: "PDF to Excel", description: "Convert PDFs to Excel spreadsheets.", route: "/pdf-to-excel", icon: "📈" },
    { title: "PDF to PDF/A", description: "Convert PDFs to PDF/A for archiving.", route: "/pdf-to-pdfa", icon: "🗄️" },
    { title: "PDF Metadata Viewer", description: "View all properties and details of any PDF.", route: "/view-metadata", icon: "📑" },
    { title: "Add Page Numbers", description: "Add page numbers to your PDF.", route: "/add-page-numbers", icon: "🔢" },
    { title: "Add Watermark", description: "Add watermark text or image to your PDF.", route: "/add-watermark", icon: "💧" },
    { title: "Unlock PDF", description: "Remove password protection from PDFs.", route: "/unlock-pdf", icon: "🔓" },
    { title: "Protect PDF", description: "Add password protection to your PDFs.", route: "/protect-pdf", icon: "🔒" },
    { title: "Compare PDF", description: "Compare two PDF files for differences.", route: "/compare-pdf", icon: "🆚" },
    { title: "PDF to Text Converter", description: "Extract plain text easily", route: "/pdf-to-text", icon: "📄" },
    { title: "Update PDF Metadata", description: "Edit PDF author, title, and more", route: "/update-metadata", icon: "✏️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-forest mb-10 px-4">
          Everything You Need to Work with PDFs — All in One Place
        </h2>
        {/* Cards */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[8px] gap-y-[8px] justify-start items-stretch">
            {operations.map((op) => (
              <OperationCard
                key={op.route}
                title={op.title}
                description={op.description}
                route={op.route}
                icon={op.icon}
              />
            ))}
          </div>
        </div>
      </div>
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
