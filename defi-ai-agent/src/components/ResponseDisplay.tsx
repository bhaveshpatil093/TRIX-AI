/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CircleOff, BrainCircuit } from 'lucide-react';

interface ResponseDisplayProps {
  response: any;
  isLoading?: boolean;
}

export default function ResponseDisplay({ response, isLoading = false }: ResponseDisplayProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Text streaming effect when new response comes in
  useEffect(() => {
    if (isLoading) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }
    
    if (!response) return;
    
    const content = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
    
    if (displayedText === content) {
      setIsComplete(true);
      return;
    }
    
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedText(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 1); // Adjust speed as needed
    
    return () => clearInterval(interval);
  }, [response, isLoading, currentIndex]);
  
  // Reset when response changes
  useEffect(() => {
    if (response) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsComplete(false);
    }
  }, [response]);

  // Loading states - improved with more sophisticated animation
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 w-full min-h-24">
        <div className="flex items-center space-x-3 text-gray-400">
          <BrainCircuit className="text-gray-300 animate-pulse" size={20} />
          <span className="text-sm font-medium">Thinking</span>
        </div>
        
        <div className="flex flex-col space-y-6 w-full">
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-2 w-2 rounded-full bg-gray-500 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          
          <div className="space-y-3 w-full">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-3 bg-gradient-to-r from-gray-700 to-gray-500 animate-pulse rounded-full opacity-60"
                style={{ 
                  width: `${85 - (i * 20)}%`, 
                  animationDelay: `${i * 0.2}s` 
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!response) return null;

  // Render NFT/image response with monochrome styling
  if (response.imageSrc) {
    return (
      <div className="flex flex-col items-start space-y-4 transition-all duration-500">
        <p className="text-gray-200">{response.text}</p>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <div className="relative">
            <img 
              src={response.imageSrc} 
              alt="Generated NFT" 
              className="w-48 h-48 object-cover rounded-lg shadow-2xl transition-all duration-300 hover:scale-105 "
            />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2 bg-gray-800/80 rounded-md px-4 py-2 text-sm border border-gray-700">
          <CircleOff size={16} className="text-gray-400" />
          <p className="text-gray-200">Ready to mint as NFT</p>
        </div>
      </div>
    );
  }

  // Text response with typing effect
  return (
    <div className="text-gray-200 rounded-lg transition-all duration-500 prose prose-invert max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
        {displayedText}
      </ReactMarkdown>
      
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
      )}
    </div>
  );
}