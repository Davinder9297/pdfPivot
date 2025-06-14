import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categories = {
  "PDF Page Management": [],
  "Format Conversions (To PDF)": [],
  "Format Conversions (From PDF)": [],
  "Security & Watermarking": [],
};

const OperationTabsWrapper = ({ children }) => {
  const {activeCategory, setActiveCategory} = useAuth()
const navigate=useNavigate()
  const location = useLocation();

const handleClick=(cat)=>{
    setActiveCategory(cat)
    if(location.pathname!=='/'){
        navigate('/')
    }
}
  return (
    <div className='py-8'>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 border-2 border-forest max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 px-4 mb-6">
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              onClick={() => handleClick(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                activeCategory === cat
                  ? "bg-forest text-white border-forest"
                  : "bg-white text-forest border-gray-300 hover:bg-forest hover:text-white"
              } transition duration-200`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Children content passed as render function */}
        <div className="">
          {children}
        </div>
      </div>
    </div>
    </div>
  );
};

export default OperationTabsWrapper;
