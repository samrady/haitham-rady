import React from 'react';
import type { Character } from '../types';
import { CharacterCard } from './CharacterCard';
import { LoadingSpinner } from './LoadingSpinner';

interface CharacterStudioProps {
  characters: Character[];
  isLoading: boolean;
  onRetryImage: (characterId: number) => void;
  onDescriptionChange: (characterId: number, newDescription: string) => void;
  onImageUpload: (characterId: number, file: File) => void;
}

export const CharacterStudio: React.FC<CharacterStudioProps> = ({ characters, isLoading, onRetryImage, onDescriptionChange, onImageUpload }) => {
  if (isLoading && characters.length === 0) {
    // This state is handled by SceneStudio's loading message
    return null;
  }
  
  if (characters.length === 0) {
     return (
      <div className="text-center py-16 px-6 bg-gray-900/50 mt-8 rounded-lg border-2 border-dashed border-gray-700">
        <h2 className="text-xl font-semibold text-gray-300">استوديو الشخصيات</h2>
        <p className="mt-2 text-gray-500">سيتم عرض صور الشخصيات الرئيسية هنا.</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-200">3. الشخصيات الرئيسية</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {characters.map((character) => (
          <CharacterCard 
            key={character.id} 
            character={character} 
            onRetry={onRetryImage}
            onDescriptionChange={onDescriptionChange}
            onImageUpload={onImageUpload}
          />
        ))}
      </div>
    </div>
  );
};