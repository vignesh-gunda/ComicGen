"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { useComicStore } from '@/lib/store';
import { useState } from 'react';

export function ComicViewer() {
  const { panels, selectedPanelId, setSelectedPanel } = useComicStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentPanel = panels[currentIndex];

  useEffect(() => {
    if (selectedPanelId) {
      const index = panels.findIndex((p) => p.id === selectedPanelId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedPanelId, panels]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleClose = () => {
    setSelectedPanel(undefined);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleNext = () => {
    if (currentIndex < panels.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    // Only register keyboard shortcuts when viewer is active
    if (!selectedPanelId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPanelId, currentIndex, isPlaying]);

  if (!selectedPanelId || !currentPanel) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      >
        <Button
          onClick={handleClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-lg">
            <span className="text-white font-medium">
              Panel {currentPanel.panel_number} of {panels.length}
            </span>
          </div>
        </div>

        {currentIndex > 0 && (
          <Button
            onClick={handlePrev}
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {currentIndex < panels.length - 1 && (
          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}

        <motion.div
          key={currentPanel.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]"
        >
          <div className="relative aspect-square bg-slate-900 rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
            {currentPanel.video_url ? (
              <video
                ref={videoRef}
                src={currentPanel.video_url}
                className="w-full h-full object-cover"
                loop
                autoPlay
                muted={isMuted}
              />
            ) : currentPanel.image_url ? (
              <img
                src={currentPanel.image_url}
                alt={`Panel ${currentPanel.panel_number}`}
                className="w-full h-full object-cover"
              />
            ) : null}

            {currentPanel.video_url && (
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="ghost"
                size="icon"
                className="absolute bottom-4 right-4 bg-black/50 text-white hover:bg-black/70"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            )}

            {currentPanel.audio_url && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause();
                  }}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-2xl"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause Voice
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Play Voice
                    </>
                  )}
                </Button>
                <audio
                  ref={audioRef}
                  src={currentPanel.audio_url}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>

          {currentPanel.dialogue && (
            <div className="mt-4 p-4 bg-slate-900/80 rounded-lg flex-shrink-0">
              <p className="text-white text-lg italic text-center">
                "{currentPanel.dialogue}"
              </p>
            </div>
          )}
        </motion.div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {panels.map((panel, index) => (
            <button
              key={panel.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-orange-500 w-8'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
