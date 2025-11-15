import React, { useState, useCallback } from 'react';
import { generateStoryFromIdea } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface StoryGeneratorProps {
  onStoryGenerated: (story: string) => void;
}

const genres = ['خيال علمي', 'دراما', 'كوميديا', 'رعب', 'فانتازيا', 'مغامرة'];
const writingStyles = ['سينمائي', 'واقعي', 'كرتوني', 'شعري', 'وثائقي'];

export const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onStoryGenerated }) => {
  const [idea, setIdea] = useState('');
  const [genre, setGenre] = useState('خيال علمي');
  const [style, setStyle] = useState('سينمائي');
  const [length, setLength] = useState(1000);
  const [generatedStory, setGeneratedStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!idea.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedStory('');
    try {
      const story = await generateStoryFromIdea(idea, genre, style, length);
      setGeneratedStory(story);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إنشاء القصة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [idea, genre, style, length]);

  return (
    <div className="space-y-8">
      <section className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 shadow-lg space-y-4">
        <h2 className="text-2xl font-bold text-center text-purple-400 mb-4">مولّد القصص</h2>
        <div>
          <label htmlFor="idea-input" className="block text-lg font-semibold mb-2 text-gray-200">فكرة القصة</label>
          <textarea
            id="idea-input"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="مثال: عالم آثار يكتشف هرمًا مخفيًا تحت جليد القطب الجنوبي."
            className="w-full h-24 p-4 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 transition duration-200 resize-none text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="genre-select" className="block text-sm font-medium mb-1 text-gray-300">النوع الأدبي</label>
            <select id="genre-select" value={genre} onChange={(e) => setGenre(e.target.value)} disabled={isLoading} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 text-gray-200">
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="style-select" className="block text-sm font-medium mb-1 text-gray-300">أسلوب الكتابة</label>
            <select id="style-select" value={style} onChange={(e) => setStyle(e.target.value)} disabled={isLoading} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 text-gray-200">
              {writingStyles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="length-input" className="block text-sm font-medium mb-1 text-gray-300">طول القصة (حرف)</label>
            <input type="number" id="length-input" value={length} onChange={(e) => setLength(parseInt(e.target.value))} step="100" min="200" max="5000" disabled={isLoading} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 text-gray-200" />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !idea.trim()}
          className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? <><LoadingSpinner className="w-5 h-5 ml-2" />جاري إنشاء القصة...</> : 'أنشئ القصة'}
        </button>
      </section>

      {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">{error}</div>}

      {generatedStory && (
        <section className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 shadow-lg space-y-4 fade-in">
          <h3 className="text-xl font-bold text-gray-200">القصة المولدة</h3>
          <textarea
            readOnly
            value={generatedStory}
            className="w-full h-64 p-4 bg-gray-900 border border-gray-600 rounded-md resize-y text-gray-300"
          />
          <button
            onClick={() => onStoryGenerated(generatedStory)}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-4 rounded-md hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
          >
            استخدم هذه القصة لتحويلها لمشاهد
          </button>
        </section>
      )}
    </div>
  );
};
