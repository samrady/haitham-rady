export interface Scene {
  id: number;
  title: string;
  description: string;
  characters: string;
  location: string;
  time: string;
  props: string;
  mood: string;
  imagePrompt: string; // The editable prompt for image generation
  imageUrl: string | null;
  isLoadingImage: boolean;
  aspectRatio: string;
  videoUrl: string | null;
  isLoadingVideo: boolean;
  transitionPrompt: string;
  errorReason: string | null;
  videoErrorReason: string | null;
}

export interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
  visuals: string;
  visualDescription: string; // The detailed description for portrait generation
  imageUrl: string | null;
  isLoadingImage: boolean;
  errorReason: string | null;
}

export interface StoryAnalysisData {
  scenes: {
    scene_title: string;
    detailed_description: string;
    characters: string[];
    location: string;
    time: string;
    props: string[];
    mood: string;
    creative_prompt_for_image: string;
    transition_prompt_to_next_scene: string;
  }[];
  characters: {
    name: string;
    description: string;
    personality_traits: string[];
    visual_details: string[];
    detailed_visual_description_for_portrait: string;
  }[];
}