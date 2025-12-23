export type PanelStatus = 'pending' | 'generating-image' | 'generating-audio' | 'generating-video' | 'completed' | 'error';

export type CharacterEmotion = 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'disgusted' | 'neutral';

export type CameraMovement = 'Zoom In' | 'Zoom Out' | 'Pan Left' | 'Pan Right' | 'Tilt Up' | 'Tilt Down' | 'Static' | 'Rotate';

export interface PanelScript {
  panel_number: number;
  visual_prompt: string;
  dialogue: string;
  character_emotion: CharacterEmotion;
  camera_movement: CameraMovement;
  character_name?: string;
  character_gender?: string;
  character_age?: string;
  character_trait?: string;
}

export interface PanelState extends PanelScript {
  id: string;
  image_url?: string;
  video_url?: string;
  audio_url?: string;
  status: PanelStatus;
  error?: string;
}

export interface ComicState {
  comicId?: string;
  storyIdea: string;
  panels: PanelState[];
  masterCharacterUrl?: string;
  videoCreditsRemaining: number;
  currentStep: 'briefing' | 'scripting' | 'canvas' | 'viewer';
  selectedPanelId?: string;
  isGenerating: boolean;
}
