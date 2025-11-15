import React from 'react';

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  disabled: boolean;
}

const artStyles = [
    'Cinematic', 
    'Anime', 
    'Photorealistic', 
    'Fantasy Art', 
    'Cyberpunk', 
    'Watercolor',
    'Minimalist',
    'Pixar',
    'Ghibli'
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange, disabled }) => {
  return (
    <section>
      <label className="block text-xl font-semibold mb-4 text-gray-200">
        الأسلوب الفني
      </label>
      <div className="flex flex-wrap gap-3">
        {artStyles.map(style => (
          <button
            key={style}
            onClick={() => onStyleChange(style)}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 disabled:opacity-50
              ${selectedStyle === style 
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
              }
            `}
          >
            {style}
          </button>
        ))}
      </div>
    </section>
  );
};
