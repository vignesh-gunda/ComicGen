import { CharacterEmotion, CameraMovement } from './types';

export const EMOTIONS: { value: CharacterEmotion; label: string; icon: string }[] = [
  { value: 'happy', label: 'Happy', icon: '😊' },
  { value: 'sad', label: 'Sad', icon: '😢' },
  { value: 'angry', label: 'Angry', icon: '😠' },
  { value: 'fearful', label: 'Fearful', icon: '😨' },
  { value: 'surprised', label: 'Surprised', icon: '😲' },
  { value: 'disgusted', label: 'Disgusted', icon: '🤢' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
];

export const CAMERA_MOVEMENTS: { value: CameraMovement; label: string; description: string }[] = [
  { value: 'Static', label: 'Static', description: 'No camera movement' },
  { value: 'Zoom In', label: 'Zoom In', description: 'Camera moves closer to subject' },
  { value: 'Zoom Out', label: 'Zoom Out', description: 'Camera moves away from subject' },
  { value: 'Pan Left', label: 'Pan Left', description: 'Camera pans to the left' },
  { value: 'Pan Right', label: 'Pan Right', description: 'Camera pans to the right' },
  { value: 'Tilt Up', label: 'Tilt Up', description: 'Camera tilts upward' },
  { value: 'Tilt Down', label: 'Tilt Down', description: 'Camera tilts downward' },
  { value: 'Rotate', label: 'Rotate', description: 'Camera rotates around subject' },
];

export const STORY_PLACEHOLDERS = [
  'A brave astronaut discovers a mysterious alien artifact on Mars...',
  'A young chef competes in the ultimate cooking championship...',
  'A detective solves a supernatural mystery in Victorian London...',
  'A robot learns what it means to be human...',
  'A time traveler tries to prevent a historical catastrophe...',
];

export const DEFAULT_CREDITS = 3;