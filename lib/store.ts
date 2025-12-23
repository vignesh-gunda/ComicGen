"use client";

import { create } from 'zustand';
import { ComicState, PanelState, PanelScript } from './types';

interface ComicStore extends ComicState {
  setStoryIdea: (idea: string) => void;
  setGeneratedScript: (panels: PanelScript[]) => void;
  updatePanelScript: (panelId: string, updates: Partial<PanelScript>) => void;
  setPanelImage: (panelId: string, imageUrl: string) => void;
  setPanelAudio: (panelId: string, audioUrl: string) => void;
  setPanelVideo: (panelId: string, videoUrl: string) => void;
  setPanelStatus: (panelId: string, status: PanelState['status']) => void;
  setPanelError: (panelId: string, error: string) => void;
  setMasterCharacter: (url: string) => void;
  decrementCredits: () => void;
  setStep: (step: ComicState['currentStep']) => void;
  setSelectedPanel: (panelId: string | undefined) => void;
  setComicId: (id: string) => void;
  setIsGenerating: (generating: boolean) => void;
  resetComic: () => void;
}

const initialState: ComicState = {
  storyIdea: '',
  panels: [],
  videoCreditsRemaining: 4,
  currentStep: 'briefing',
  isGenerating: false,
};

export const useComicStore = create<ComicStore>((set) => ({
  ...initialState,

  setStoryIdea: (idea) => set({ storyIdea: idea }),

  setGeneratedScript: (panelScripts) =>
    set({
      panels: panelScripts.map((script) => ({
        ...script,
        id: `panel-${script.panel_number}`,
        status: 'pending' as const,
      })),
    }),

  updatePanelScript: (panelId, updates) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === panelId ? { ...panel, ...updates } : panel
      ),
    })),

  setPanelImage: (panelId, imageUrl) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === panelId
          ? { ...panel, image_url: imageUrl, status: 'completed' as const }
          : panel
      ),
    })),

  setPanelAudio: (panelId, audioUrl) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === panelId ? { ...panel, audio_url: audioUrl } : panel
      ),
    })),

  setPanelVideo: (panelId, videoUrl) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === panelId ? { ...panel, video_url: videoUrl } : panel
      ),
    })),

  setPanelStatus: (panelId, status) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === panelId ? { ...panel, status, error: undefined } : panel
      ),
    })),

  setPanelError: (panelId, error) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === panelId ? { ...panel, status: 'error' as const, error } : panel
      ),
    })),

  setMasterCharacter: (url) => set({ masterCharacterUrl: url }),

  decrementCredits: () =>
    set((state) => ({
      videoCreditsRemaining: Math.max(0, state.videoCreditsRemaining - 1),
    })),

  setStep: (step) => set({ currentStep: step }),

  setSelectedPanel: (panelId) => set({ selectedPanelId: panelId }),

  setComicId: (id) => set({ comicId: id }),

  setIsGenerating: (generating) => set({ isGenerating: generating }),

  resetComic: () => set(initialState),
}));
