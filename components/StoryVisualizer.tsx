import React, { useState, useCallback, useEffect } from 'react';
import { VisualizerInput } from './VisualizerInput';
import { SceneStudio } from './SceneStudio';
import { generateStoryAnalysis, generateStyledSceneImage, generateCharacterPortrait, generateSceneVideo } from '../services/geminiService';
import type { Scene, Character, StoryAnalysisData } from '../types';
import { CharacterStudio } from './CharacterStudio';

interface StoryVisualizerProps {
  initialStory: string;
}

// Helper to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Helper to read file as Base64
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const StoryVisualizer: React.FC<StoryVisualizerProps> = ({ initialStory }) => {
  const [scenario, setScenario] = useState<string>('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('Cinematic');
  const [sceneCount, setSceneCount] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialStory) {
      setScenario(initialStory);
    }
  }, [initialStory]);
  
  const handleAnalyze = useCallback(async () => {
    if (!scenario.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setScenes([]);
    setCharacters([]);
    setError(null);

    try {
      const analysis: StoryAnalysisData = await generateStoryAnalysis(scenario, sceneCount);
      
      const initialCharacters: Character[] = analysis.characters.map((detail, index) => ({
        id: index,
        name: detail.name,
        description: detail.description,
        personality: detail.personality_traits.join(', '),
        visuals: detail.visual_details.join(', '),
        visualDescription: detail.detailed_visual_description_for_portrait,
        imageUrl: null,
        isLoadingImage: true,
        errorReason: null,
      }));
      setCharacters(initialCharacters);

      const initialScenes: Scene[] = analysis.scenes.map((detail, index) => ({
        id: index,
        title: detail.scene_title,
        description: detail.detailed_description,
        characters: detail.characters.join(', '),
        location: detail.location,
        time: detail.time,
        props: detail.props.join(', '),
        mood: detail.mood,
        imagePrompt: detail.creative_prompt_for_image,
        imageUrl: null,
        isLoadingImage: false, // Will be generated manually
        aspectRatio: aspectRatio,
        videoUrl: null,
        isLoadingVideo: false,
        transitionPrompt: detail.transition_prompt_to_next_scene || '',
        errorReason: null,
        videoErrorReason: null,
      }));
      setScenes(initialScenes);
      
      // Generate character portraits sequentially to avoid rate-limiting
      for (const character of initialCharacters) {
        try {
          const imageUrl = await generateCharacterPortrait(character.visualDescription, selectedStyle);
          setCharacters(prev => prev.map(c => c.id === character.id ? { ...c, imageUrl, isLoadingImage: false } : c));
        } catch (err) {
          const reason = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Failed to generate portrait for ${character.name}:`, err);
          setCharacters(prev => prev.map(c => c.id === character.id ? { ...c, isLoadingImage: false, imageUrl: null, errorReason: reason } : c));
        }
      }

    } catch (err) {
      console.error(err);
      setError('فشل في تحليل القصة. يرجى التحقق من المدخلات أو مفتاح API والمحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [scenario, sceneCount, aspectRatio, selectedStyle, isAnalyzing]);
  
  const getCharacterImagesForScene = (scene: Scene): {name: string, base64: string}[] => {
      const sceneCharacters = scene.characters.split(', ').map(name => name.trim());
      return characters
        .filter(char => sceneCharacters.includes(char.name) && char.imageUrl && !char.errorReason)
        .map(char => ({ name: char.name, base64: char.imageUrl as string }));
  };

  const handleGenerateSceneImage = useCallback(async (sceneId: number) => {
    const sceneToGenerate = scenes.find(s => s.id === sceneId);
    if (!sceneToGenerate) return;

    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isLoadingImage: true, imageUrl: null, errorReason: null } : s));
    
    const characterImages = getCharacterImagesForScene(sceneToGenerate);

    try {
      const imageUrl = await generateStyledSceneImage(sceneToGenerate.imagePrompt, selectedStyle, sceneToGenerate.aspectRatio, characterImages);
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, imageUrl, isLoadingImage: false } : s));
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Failed to generate image for scene ${sceneId}:`, err);
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isLoadingImage: false, imageUrl: null, errorReason: reason } : s));
    }
  }, [scenes, characters, selectedStyle]);


  const handleRetryCharacterImage = useCallback(async (characterId: number) => {
    const charToRetry = characters.find(c => c.id === characterId);
    if (!charToRetry) return;

    setCharacters(prev => prev.map(c => c.id === characterId ? { ...c, isLoadingImage: true, imageUrl: null, errorReason: null } : c));

    try {
      const imageUrl = await generateCharacterPortrait(charToRetry.visualDescription, selectedStyle);
      setCharacters(prev => prev.map(c => c.id === characterId ? { ...c, imageUrl, isLoadingImage: false } : c));
    } catch (imgError) {
      const reason = imgError instanceof Error ? imgError.message : 'Unknown error';
      console.error(`Failed to re-generate portrait for ${charToRetry.name}:`, imgError);
      setCharacters(prev => prev.map(c => c.id === characterId ? { ...c, isLoadingImage: false, imageUrl: null, errorReason: reason } : c));
    }
  }, [characters, selectedStyle]);

  const handleGenerateVideo = useCallback(async (sceneId: number) => {
    const sceneToAnimate = scenes.find(s => s.id === sceneId);
    if (!sceneToAnimate || !sceneToAnimate.imageUrl || sceneToAnimate.errorReason || sceneToAnimate.isLoadingVideo) return;
    
    setError(null);
    let hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
        await window.aistudio.openSelectKey();
        hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            setError("مفتاح API مطلوب لتوليد الفيديو. يرجى اختيار واحد للمتابعة.");
            return;
        }
    }
    
    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isLoadingVideo: true, videoErrorReason: null } : s));
    try {
        const videoUrl = await generateSceneVideo(sceneToAnimate.imagePrompt, sceneToAnimate.imageUrl, sceneToAnimate.aspectRatio);
        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, videoUrl, isLoadingVideo: false } : s));
    } catch (err) {
        console.error(`Failed to generate video for scene ${sceneId}:`, err);
        const reason = err instanceof Error ? err.message : 'حدث خطأ غير معروف.';
        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isLoadingVideo: false, videoErrorReason: reason } : s));
    }
  }, [scenes]);
  
  const handleFileChange = async (file: File) => {
      if (file.type === "text/plain") {
          const text = await readFileAsText(file);
          setScenario(text);
      } else {
          setError("يرجى رفع ملف نصي (.txt) فقط.");
      }
  };

  const handleExport = () => {
      const stateToSave = { scenario, scenes, characters, selectedStyle, sceneCount, aspectRatio };
      const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'story-producer-project.json';
      a.click();
      URL.revokeObjectURL(url);
  };
  
  const handleImport = async (file: File) => {
      if (file.type === 'application/json') {
          try {
              const text = await readFileAsText(file);
              const importedState = JSON.parse(text);
              setScenario(importedState.scenario || '');
              setScenes(importedState.scenes || []);
              setCharacters(importedState.characters || []);
              setSelectedStyle(importedState.selectedStyle || 'Cinematic');
              setSceneCount(importedState.sceneCount || 5);
              setAspectRatio(importedState.aspectRatio || '16:9');
              setError(null);
          } catch (e) {
              setError('فشل في قراءة ملف المشروع.');
          }
      } else {
          setError('يرجى اختيار ملف مشروع صحيح (.json).');
      }
  };

  const isLoading = isAnalyzing || characters.some(c => c.isLoadingImage) || scenes.some(s => s.isLoadingImage) || scenes.some(s => s.isLoadingVideo);

  return (
    <div className="space-y-12">
      <VisualizerInput
        scenario={scenario} setScenario={setScenario}
        onAnalyze={handleAnalyze} isLoading={isAnalyzing}
        selectedStyle={selectedStyle} onStyleChange={setSelectedStyle}
        sceneCount={sceneCount} setSceneCount={setSceneCount}
        aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
        onFileChange={handleFileChange}
        onImport={handleImport} onExport={handleExport}
        disabled={isLoading}
      />
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center" role="alert">
          <strong className="font-bold">حدث خطأ: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <CharacterStudio 
        characters={characters} 
        isLoading={isAnalyzing && characters.length === 0}
        onRetryImage={handleRetryCharacterImage} 
        onDescriptionChange={(id, desc) => setCharacters(prev => prev.map(c => c.id === id ? {...c, visualDescription: desc} : c))}
        onImageUpload={async (id, file) => {
            const base64 = await readFileAsBase64(file);
            setCharacters(prev => prev.map(c => c.id === id ? {...c, imageUrl: base64, errorReason: null} : c));
        }}
      />
      <SceneStudio 
        scenes={scenes} 
        isLoading={isAnalyzing && scenes.length === 0}
        onGenerateImage={handleGenerateSceneImage}
        onGenerateVideo={handleGenerateVideo}
        onRetryImage={handleGenerateSceneImage} // Retry is the same as generate
        onPromptChange={(id, prompt) => setScenes(prev => prev.map(s => s.id === id ? {...s, imagePrompt: prompt} : s))}
        onAspectRatioChange={(id, ar) => setScenes(prev => prev.map(s => s.id === id ? {...s, aspectRatio: ar} : s))}
      />
    </div>
  );
};