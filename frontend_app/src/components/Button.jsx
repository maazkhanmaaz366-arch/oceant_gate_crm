import React from 'react';

export const Button = ({ children, variant = 'primary', onClick, type = 'button', fullWidth = false }) => {
  const baseClass = "px-6 py-3 text-base font-semibold rounded-lg transition-all ease-in-out duration-200 inline-flex items-center justify-center cursor-pointer";
  
  const variants = {
    primary: "bg-yellow text-navy hover:bg-[#e6bd1f] hover:-translate-y-[1px]",
    secondary: "bg-ocean text-white hover:bg-[#0099d3]",
    outline: "bg-transparent text-navy border border-ocean hover:bg-[#f0f9ff]"
  };
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
