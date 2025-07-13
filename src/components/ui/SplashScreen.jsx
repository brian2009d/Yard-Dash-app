import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete splash screen after fade out animation
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Animated Leaf Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-green-600 rounded-full w-24 h-24 mx-auto animate-ping opacity-20"></div>
          <div className="relative bg-gradient-to-br from-green-500 to-green-700 rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-2xl transform animate-pulse">
            <Leaf className="w-12 h-12 text-white animate-bounce" />
          </div>
        </div>
        
        {/* App Name with Animation */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-800 animate-fade-in">
            Yardash
          </h1>
          <p className="text-lg text-gray-600 animate-fade-in-delay">
            Quality Yard Work, On Demand
          </p>
        </div>
        
        {/* Loading Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.5s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}