import React, { useRef } from 'react';
import type { Character } from '../types';
import { ImagePlaceholder, ErrorPlaceholder } from './ImagePlaceholders';
import { PersonalityIcon } from './icons/PersonalityIcon';
import { EyeIcon } from './icons/EyeIcon';

interface CharacterCardProps {
  character: Character;
  onRetry: (characterId: number) => void;
  onDescriptionChange: (characterId: number, newDescription: string) => void;
  onImageUpload: (characterId: number, file: File) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onRetry, onDescriptionChange, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(character.id, file);
    }
  };
  
  const handleDownload = () => {
    if (!character.imageUrl || character.errorReason) return;
    const link = document.createElement('a');
    link.href = character.imageUrl;
    link.download = `${character.name.replace(/\s+/g, '_')}_portrait.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="bg-gray-900/80 rounded-lg overflow-hidden border border-gray-700 flex flex-col shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-800">
      <div className="relative">
        {character.isLoadingImage ? (
          <ImagePlaceholder aspectRatio="1/1" />
        ) : character.errorReason ? (
          <ErrorPlaceholder onRetry={() => onRetry(character.id)} aspectRatio="1/1" reason={character.errorReason} />
        ) : (
          <img src={character.imageUrl ?? ''} alt={`Portrait of ${character.name}`} className="w-full h-64 object-cover object-top" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-purple-400 mb-2">{character.name}</h3>
        
        <div className="my-2">
            <label className="text-sm font-semibold text-purple-400 mb-1 block">الوصف البصري (للتوليد)</label>
            <textarea
                value={character.visualDescription}
                onChange={(e) => onDescriptionChange(character.id, e.target.value)}
                className="w-full h-20 p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 transition duration-200 resize-y text-sm text-gray-300"
            />
        </div>
        
        <div className="space-y-3 text-xs text-gray-400 border-t border-gray-800 pt-4 mt-2">
            <div className="flex items-start">
                <PersonalityIcon className="w-4 h-4 ml-2 text-gray-500 shrink-0 mt-0.5" />
                <strong className="shrink-0">الشخصية:</strong>
                <span className="mr-2 break-words">{character.personality || 'غير محدد'}</span>
            </div>
            <div className="flex items-start">
                <EyeIcon className="w-4 h-4 ml-2 text-gray-500 shrink-0 mt-0.5" />
                <strong className="shrink-0">المظهر:</strong>
                <span className="mr-2 break-words">{character.visuals || 'غير محدد'}</span>
            </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-700 flex flex-wrap gap-2 justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg"
            />
            <button onClick={() => onRetry(character.id)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors">إعادة إنشاء</button>
            <button onClick={handleUploadClick} className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors">رفع صورة</button>
            <button onClick={handleDownload} disabled={!character.imageUrl || !!character.errorReason} className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">تحميل</button>
        </div>
      </div>
    </div>
  );
};