import React, { useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { StyleSelector } from './StyleSelector';

interface VisualizerInputProps {
  scenario: string;
  setScenario: (scenario: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  disabled: boolean;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  sceneCount: number;
  setSceneCount: (count: number) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  onFileChange: (file: File) => void;
  onImport: (file: File) => void;
  onExport: () => void;
}

export const VisualizerInput: React.FC<VisualizerInputProps> = (props) => {
  const { scenario, setScenario, onAnalyze, isLoading, disabled, selectedStyle, onStyleChange, sceneCount, setSceneCount, aspectRatio, setAspectRatio, onFileChange, onImport, onExport } = props;
  
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const projectImportRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (ref: React.RefObject<HTMLInputElement>, handler: (file: File) => void) => {
    ref.current?.click();
  };
  
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, handler: (file: File) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      handler(file);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <section className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-200">
          إعدادات التحليل
        </h2>
        <div className="flex gap-2">
            <input type="file" ref={projectImportRef} onChange={(e) => handleFileSelected(e, onImport)} className="hidden" accept=".json" />
            <button onClick={() => handleFileSelect(projectImportRef, onImport)} className="text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50" disabled={disabled}>استيراد مشروع</button>
            <button onClick={onExport} className="text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50" disabled={disabled}>تصدير مشروع</button>
        </div>
      </div>

      <div>
        <label htmlFor="scenario-input" className="block text-lg font-semibold mb-2 text-gray-200">
          القصة أو السيناريو
        </label>
        <div className="relative">
          <textarea
            id="scenario-input"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="ألصق قصتك هنا، أو قم بإنشائها من تبويب 'حوّل فكرتك لقصة'..."
            className="w-full h-36 p-4 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 transition duration-200 resize-y text-gray-200 placeholder-gray-500"
            disabled={disabled}
          />
          <input type="file" ref={fileUploadRef} onChange={(e) => handleFileSelected(e, onFileChange)} className="hidden" accept=".txt" />
          <button onClick={() => handleFileSelect(fileUploadRef, onFileChange)} className="absolute bottom-3 left-3 text-sm bg-gray-700/80 hover:bg-gray-600/80 text-white font-semibold py-1 px-3 rounded-md transition-colors backdrop-blur-sm" disabled={disabled}>
            رفع ملف (.txt)
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">خيارات التحليل</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="scene-count" className="block text-sm font-medium mb-1 text-gray-300">عدد المشاهد</label>
                    <input type="number" id="scene-count" value={sceneCount} onChange={e => setSceneCount(Number(e.target.value))} min="1" max="20" className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 text-gray-200" disabled={disabled} />
                </div>
                <div>
                    <label htmlFor="aspect-ratio" className="block text-sm font-medium mb-1 text-gray-300">الأبعاد الافتراضية</label>
                    <select id="aspect-ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 text-gray-200" disabled={disabled}>
                        <option value="16:9">أفقي (16:9)</option>
                        <option value="1:1">مربع (1:1)</option>
                        <option value="9:16">عمودي (9:16)</option>
                    </select>
                </div>
            </div>
          </div>
          <StyleSelector 
            selectedStyle={selectedStyle}
            onStyleChange={onStyleChange}
            disabled={disabled}
          />
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading || !scenario.trim()}
        className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-purple-500/50"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="w-5 h-5 ml-2" />
            جاري تحليل القصة...
          </>
        ) : (
          'حلّل القصة'
        )}
      </button>
    </section>
  );
};
