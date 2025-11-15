import React from 'react';
import { PencilIcon } from './icons/PencilIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-black/30 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <PencilIcon className="w-7 h-7 ml-3 text-purple-400" />
        <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          منتج القصة
        </h1>
      </div>
    </header>
  );
};