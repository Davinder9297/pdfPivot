const WhyUsSection = () => {
  const features = [
    {
      title: "All-in-One PDF Toolkit",
      description:
        "Merge, split, convert, compress, secure, and edit your PDFs — all from a single, easy-to-use platform.",
    },
    {
      title: "Fast & Reliable Conversions",
      description:
        "Convert files to and from PDF formats in seconds. OCR is automatically applied to scanned documents.",
    },
    {
      title: "Smart Quota-Based Access",
      description:
        "Enjoy flexible subscription plans with monthly quotas or unlimited usage — built for individuals and teams.",
    },
  ];

  return (
    <section className="bg-[#FFF9E5] border-t-4 border-gold py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-forest mb-16">
         PDFPivot, Your Complete PDF Toolkit in One Place
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 ">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center px-4 bg-[#cbbeb5] border border-forest rounded-xl p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-black text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
