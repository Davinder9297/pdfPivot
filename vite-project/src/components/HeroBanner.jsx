import React from "react";

const HeroBanner = () => {
  return (
    <section className="w-full bg-[#FFDFCC] py-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-4">
        {/* Left: Text and CTA */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold text-forest mb-4 leading-tight">
            Fast, Secure & <span className="text-gold">Powerful</span> <br />
            <span className="text-forest">PDF tools Online</span>
          </h1>
          <p className="text-forest mb-8 text-lg">
            Edit, convert, compress, and secure your PDFs with ease — all in your browser. Trusted by professionals worldwide.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-center md:justify-start">
            <a
              href="https://wa.me/910000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gold text-forest font-semibold px-4 py-2 rounded-lg shadow hover:bg-orangeweb hover:text-forest transition"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 z-10" />
              <span>Live Chat</span>
            </a>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex justify-center mt-10 md:mt-0">
          <img
            src="/image2.jpg"
            alt="Image editing illustration"
            className="w-80 h-80 object-contain rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroBanner; 