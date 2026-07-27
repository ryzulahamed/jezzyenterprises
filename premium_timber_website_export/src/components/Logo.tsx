import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-9 w-9" }: LogoProps) {
  return (
    <div className={`${className} flex-shrink-0 transition-all duration-300 hover:scale-105`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cyan Swoosh Wave (J/E Monogram background) - Fully detailed fill path */}
        <path 
          d="M54.5,12.5 C53.5,14 49.5,28.5 46.2,42 C42.8,55.5 45.5,71 52.8,82.5 C54.5,85.2 53.5,87 49.8,89.5 C48,88.2 45.8,84.5 45.2,80 C44.5,75.5 47.8,61 49.5,47.5 C51.2,34 50.5,18.5 54.5,12.5 Z" 
          fill="#00afd5" 
        />
        
        {/* Dark Navy Blue Cursive Monogram - Upper Loop (Tapered Filled Path for high fidelity) */}
        <path 
          d="M38.8,51 C43.2,50.8 48.5,48.2 51.5,43.2 C54.2,38.2 54.8,32.8 51.5,29.2 C47.8,25.2 42.5,28.2 41.5,35.2 C40.8,40.8 44.5,49.2 51.8,51.8 C48.5,51.2 44.2,51.2 38.8,51 Z" 
          fill="#0c2340"
          className="dark:fill-zinc-100"
        />
        
        {/* Dark Navy Blue Cursive Monogram - Lower Loop (Tapered Filled Path for high fidelity) */}
        <path 
          d="M39.8,53 C44.5,53.2 49.2,55.8 51.8,61.8 C54.2,67.8 52.8,73.5 48.5,76 C43.5,79 38.8,75.5 37.8,68.5 C36.8,62.2 40.2,55.2 48.2,53 C44.2,53 41.2,53 39.8,53 Z" 
          fill="#0c2340"
          className="dark:fill-zinc-100"
        />

        {/* Fine horizontal line extensions on the left side (exactly like the logo) */}
        <path 
          d="M38.8,51 L44,51" 
          stroke="#0c2340" 
          strokeWidth="1.8" 
          strokeLinecap="round"
          className="stroke-[#0c2340] dark:stroke-zinc-100"
        />
        <path 
          d="M39.8,53 L45,53" 
          stroke="#0c2340" 
          strokeWidth="1.8" 
          strokeLinecap="round"
          className="stroke-[#0c2340] dark:stroke-zinc-100"
        />
      </svg>
    </div>
  );
}
