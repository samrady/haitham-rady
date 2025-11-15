import React from 'react';
import type { Scene } from '../types';
import { SceneCard } from './SceneCard';
import { LoadingSpinner } from './LoadingSpinner';

interface SceneStudioProps {
  scenes: Scene[];
  isLoading: boolean;
  onPromptChange: (sceneId: number, newPrompt: string) => void;
  onAspectRatioChange: (sceneId: number, newAspectRatio: string) => void;
  onGenerateImage: (sceneId: number) => void;
  onGenerateVideo: (sceneId: number) => void;
  onRetryImage: (sceneId: number) => void;
}

export const SceneStudio: React.FC<SceneStudioProps> = (props) => {
  const { scenes, isLoading, onRetryImage, onGenerateImage, onGenerateVideo, onPromptChange, onAspectRatioChange } = props;

  if (isLoading && scenes.length === 0) {
    return (
      <div className="text-center py-16">
        <LoadingSpinner className="w-12 h-12 mx-auto text-purple-400" />
        <p className="mt-4 text-lg text-gray-400">جاري تحليل القصة واستخراج المشاهد...</p>
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gray-900/50 mt-8 rounded-lg border-2 border-dashed border-gray-700">
        <h2 className="text-xl font-semibold text-gray-300">استوديو المشاهد</h2>
        <p className="mt-2 text-gray-500">سيتم عرض المشاهد الفنية لقصتك هنا بعد تحليلها.</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-200">4. اللقطات المولدة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scenes.map((scene, index) => (
          <SceneCard 
            key={scene.id} 
            scene={scene} 
            shotNumber={index + 1} 
            onRetry={onRetryImage}
            onGenerateImage={onGenerateImage}
            onGenerateVideo={onGenerateVideo}
            onPromptChange={onPromptChange}
            onAspectRatioChange={onAspectRatioChange}
            isLastScene={index === scenes.length - 1}
          />
        ))}
      </div>
    </div>
  );
};