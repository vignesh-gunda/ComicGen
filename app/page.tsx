"use client";

import { useComicStore } from '@/lib/store';
import { Briefing } from '@/components/briefing';
import { ScriptEditor } from '@/components/script-editor';
import { ComicCanvas } from '@/components/comic-canvas';
import { ComicViewer } from '@/components/comic-viewer';

export default function Home() {
  const { currentStep } = useComicStore();

  return (
    <>
      {currentStep === 'briefing' && <Briefing />}
      {currentStep === 'scripting' && <ScriptEditor />}
      {currentStep === 'canvas' && <ComicCanvas />}
      <ComicViewer />
    </>
  );
}
