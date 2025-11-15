import React, { useState } from 'react';
import type { Scene } from '../types';
import { UserIcon } from './icons/UserIcon';
import { LocationIcon } from './icons/LocationIcon';
import { ClockIcon } from './icons/ClockIcon';
import { MoodIcon } from './icons/MoodIcon';
import { PropsIcon } from './icons/PropsIcon';
import { ActionIcon } from './icons/ActionIcon';
import { ImagePlaceholder, ErrorPlaceholder, VideoPlaceholder } from './ImagePlaceholders';
import { DescriptionIcon } from './icons/DescriptionIcon';
import { TransitionIcon } from './icons/TransitionIcon';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface SceneCardProps {
  scene: Scene;
  shotNumber: number;
  onPromptChange: (sceneId: number, newPrompt: string) => void;
  onAspectRatioChange: (sceneId: number, newAspectRatio: string) => void;
  onGenerateImage: (sceneId: number) => void;
  onGenerateVideo: (sceneId: number) => void;
  onRetry: (sceneId: number) => void;
  isLastScene: boolean;
}

const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const SceneCard: React.FC<SceneCardProps> = ({ scene, shotNumber, onPromptChange, onAspectRatioChange, onGenerateImage, onGenerateVideo, onRetry, isLastScene }) => {
  const [promptCopied, setPromptCopied] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(scene.imagePrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!scene.imageUrl) return;
    const link = document.createElement('a');
    link.href = scene.imageUrl;
    link.download = `scene_${shotNumber}_${scene.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const externalTools = [
    { name: 'Pika Labs', url: 'https://pika.art/' },
    { name: 'Runway ML', url: 'https://runwayml.com/' },
    { name: 'Luma AI', url: 'https://lumalabs.ai/' },
  ];

  return (
    <div className="bg-gray-900/80 rounded-lg overflow-hidden border border-gray-700 flex flex-col shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-800">
      <div className="relative">
        {scene.isLoadingVideo ? (
          <VideoPlaceholder aspectRatio={scene.aspectRatio} />
        ) : scene.videoUrl ? (
          <video src={scene.videoUrl} className="w-full object-cover" style={{ aspectRatio: scene.aspectRatio.replace(':', ' / ') }} controls autoPlay loop muted />
        ) : scene.isLoadingImage ? (
          <ImagePlaceholder aspectRatio={scene.aspectRatio} />
        ) : scene.errorReason ? (
          <ErrorPlaceholder onRetry={() => onRetry(scene.id)} aspectRatio={scene.aspectRatio} reason={scene.errorReason} />
        ) : scene.imageUrl ? (
          <img src={scene.imageUrl} alt={scene.title} className="w-full object-cover" style={{ aspectRatio: scene.aspectRatio.replace(':', ' / ') }} />
        ) : (
           <div className="w-full bg-gray-900 flex flex-col items-center justify-center p-4 text-center" style={{ aspectRatio: scene.aspectRatio.replace(':', ' / ') }}>
             <button
              onClick={() => onGenerateImage(scene.id)}
              disabled={scene.isLoadingImage}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 px-5 rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
            >
              إنشاء الصورة
            </button>
           </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
          مشهد #{shotNumber}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow space-y-4">
        <h3 className="text-lg font-bold text-purple-400 -mb-2">{scene.title}</h3>
        
        <div>
          <h4 className="flex items-center text-sm font-semibold text-purple-400 my-2">
              <DescriptionIcon className="w-4 h-4 ml-2" />
              الوصف
          </h4>
          <p className="text-gray-300 text-sm">{scene.description}</p>
        </div>

        <div className="border-t border-gray-800 pt-4">
            <h4 className="flex items-center text-sm font-semibold text-purple-400 mb-2">
                <ActionIcon className="w-4 h-4 ml-2" />
                برومبت الصورة (قابل للتعديل)
            </h4>
            <textarea
                value={scene.imagePrompt}
                onChange={(e) => onPromptChange(scene.id, e.target.value)}
                className="w-full h-24 p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 transition duration-200 resize-y text-sm text-gray-300"
            />
        </div>

        {scene.imageUrl && !scene.errorReason && !scene.videoUrl && (
             <div className="border-t border-gray-800 pt-4">
                <button
                    onClick={() => onGenerateVideo(scene.id)}
                    disabled={scene.isLoadingVideo}
                    className="w-full bg-gradient-to-r from-pink-600 to-orange-500 text-white font-bold py-2 px-5 rounded-md hover:from-pink-700 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                >
                    {scene.isLoadingVideo ? 'جاري إنشاء الفيديو...' : 'إنشاء فيديو للمشهد'}
                </button>
                {scene.videoErrorReason && (
                  <div className="mt-2 text-center text-xs bg-red-900/50 text-red-300 p-2 rounded-md">
                      <p className="font-semibold">فشل إنشاء الفيديو:</p>
                      <p>{scene.videoErrorReason}</p>
                  </div>
                )}
            </div>
        )}
        
        {scene.imageUrl && !scene.errorReason && (
          <div className="border-t border-gray-800 pt-4 space-y-3">
            <h4 className="flex items-center text-sm font-semibold text-purple-400">
              التصدير اليدوي لأدوات الفيديو
            </h4>
            <p className="text-xs text-gray-400">
              استخدم الصورة والبرومبت أدناه مع أدوات توليد الفيديو الخارجية.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyPrompt}
                className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <CopyIcon className="w-4 h-4" />
                {promptCopied ? 'تم النسخ!' : 'نسخ البرومبت'}
              </button>
              <button
                onClick={handleDownloadImage}
                className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                تحميل الصورة
              </button>
            </div>
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-2">أدوات مقترحة:</p>
              <div className="flex flex-col space-y-1">
                {externalTools.map(tool => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {tool.name}
                    <ExternalLinkIcon className="w-3 h-3 mr-2" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-800 pt-4">
             <h4 className="flex items-center text-sm font-semibold text-purple-400 mb-2">
                الأبعاد
            </h4>
            <select
                value={scene.aspectRatio}
                onChange={(e) => onAspectRatioChange(scene.id, e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 transition duration-200 text-sm text-gray-300"
            >
                {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
            </select>
        </div>

        {!isLastScene && scene.transitionPrompt && (
          <div className="border-t border-gray-800 pt-4">
              <h4 className="flex items-center text-sm font-semibold text-pink-400 mb-2">
                  <TransitionIcon className="w-4 h-4 ml-2" />
                  الانتقال للمشهد التالي
              </h4>
              <p className="text-gray-300 text-sm bg-gray-800 p-2 rounded-md">{scene.transitionPrompt}</p>
          </div>
        )}
        
        <div className="space-y-3 text-xs text-gray-400 border-t border-gray-800 pt-4">
           <div className="flex items-start">
            <UserIcon className="w-4 h-4 ml-2 text-gray-500 shrink-0 mt-0.5" />
            <strong className="shrink-0">الشخصيات:</strong>
            <span className="mr-2 break-words">{scene.characters || 'غير محدد'}</span>
          </div>
          <div className="flex items-start">
            <LocationIcon className="w-4 h-4 ml-2 text-gray-500 shrink-0 mt-0.5" />
            <strong className="shrink-0">المكان:</strong>
            <span className="mr-2 break-words">{scene.location}</span>
          </div>
          <div className="flex items-start">
            <ClockIcon className="w-4 h-4 ml-2 text-gray-500 shrink-0 mt-0.5" />
            <strong className="shrink-0">الزمان:</strong>
            <span className="mr-2 break-words">{scene.time}</span>
          </div>
          <div className="flex items-start">
            <PropsIcon className="w-4 h-4 ml-2 text-gray-500 shrink-0 mt-0.5" />
            <strong className="shrink-0">العناصر:</strong>
            <span className="mr-2 break-words">{scene.props || 'لا يوجد'}</span>
          </div>
          <div className="flex items-start">
            <MoodIcon className="w-4 h-4 ml-2 text-gray-500 shrink-0 mt-0.5" />
            <strong className="shrink-0">الجو العام:</strong>
            <span className="mr-2 break-words">{scene.mood}</span>
          </div>
        </div>
      </div>
    </div>
  );
};