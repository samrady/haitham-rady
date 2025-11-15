import React, { useState } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { StoryGenerator } from './components/StoryGenerator';
import { StoryVisualizer } from './components/StoryVisualizer';

export type AppTab = 'generator' | 'visualizer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('visualizer');
  const [story, setStory] = useState<string>('');

  const handleStoryGenerated = (newStory: string) => {
    setStory(newStory);
    setActiveTab('visualizer');
  };

  return (
    <div className="min-h-screen text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {activeTab === 'generator' && (
            <div className="fade-in">
              <StoryGenerator onStoryGenerated={handleStoryGenerated} />
            </div>
          )}

          {activeTab === 'visualizer' && (
             <div className="fade-in">
              <StoryVisualizer initialStory={story} />
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>مدعوم بواسطة Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;