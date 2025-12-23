"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Mic, Play, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { PanelState } from '@/lib/types';
import { useComicStore } from '@/lib/store';
import { generateSpeech, generateVideo } from '@/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ComicPanelProps {
  panel: PanelState;
  isAnchor?: boolean;
}

export function ComicPanel({ panel, isAnchor }: ComicPanelProps) {
  const {
    setPanelAudio,
    setPanelVideo,
    setPanelStatus,
    decrementCredits,
    videoCreditsRemaining,
    setSelectedPanel,
  } = useComicStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showCreditWarning, setShowCreditWarning] = useState(false);

  const handleGenerateSpeech = async () => {
    if (!panel.dialogue || !panel.dialogue.trim()) {
      toast.error('No dialogue to speak');
      return;
    }

    setIsGeneratingSpeech(true);
    try {
      const result = await generateSpeech(
        panel.dialogue,
        panel.character_emotion,
        panel.character_gender,
        panel.character_age,
        panel.character_trait
      );

      if (result.error || !result.data) {
        toast.error(result.message || 'Failed to generate audio');
        return;
      }

      setPanelAudio(panel.id, result.data.audioUrl);
      toast.success('Voice generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate voice');
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (videoCreditsRemaining <= 0) {
      toast.error('No video credits remaining');
      return;
    }

    if (!panel.image_url) {
      toast.error('Image must be generated first');
      return;
    }

    setShowCreditWarning(true);
  };

  const confirmGenerateVideo = async () => {
    setShowCreditWarning(false);
    setIsGeneratingVideo(true);
    setPanelStatus(panel.id, 'generating-video');

    try {
      const result = await generateVideo(
        panel.image_url!,
        panel.visual_prompt,
        panel.camera_movement
      );

      if (result.error || !result.data) {
        toast.error(result.message || 'Failed to generate video');
        setPanelStatus(panel.id, 'completed');
        return;
      }

      setPanelVideo(panel.id, result.data.videoUrl);
      decrementCredits();
      toast.success('Video generated! 1 credit used.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate video');
      setPanelStatus(panel.id, 'completed');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handlePanelClick = () => {
    if (panel.video_url || panel.image_url) {
      setSelectedPanel(panel.id);
    }
  };

  const renderStatus = () => {
    switch (panel.status) {
      case 'pending':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Waiting...</p>
            </div>
          </div>
        );
      case 'generating-image':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <motion.div
                className="w-32 h-32 border-4 border-slate-600 rounded-lg mb-4 relative"
                animate={{
                  borderColor: ['#475569', '#f97316', '#475569'],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="absolute inset-2 bg-slate-700 rounded"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
              <p className="text-white font-medium">Generating Image...</p>
              <p className="text-slate-400 text-sm">This may take a moment</p>
            </div>
          </div>
        );
      case 'generating-video':
        return (
          <div className="relative">
            {panel.image_url && (
              <img
                src={panel.image_url}
                alt={`Panel ${panel.panel_number}`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                <p className="text-white font-medium">Animating...</p>
                <p className="text-slate-300 text-sm">This may take 30-60 seconds</p>
              </div>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-400 text-sm">{panel.error || 'Generation failed'}</p>
            </div>
          </div>
        );
      case 'completed':
        return (
          <>
            {panel.video_url ? (
              <video
                src={panel.video_url}
                className="w-full h-full object-cover"
                loop
                muted
                autoPlay
              />
            ) : panel.image_url ? (
              <img
                src={panel.image_url}
                alt={`Panel ${panel.panel_number}`}
                className="w-full h-full object-cover"
              />
            ) : null}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card
        className={`relative overflow-hidden bg-slate-800 border-2 transition-all cursor-pointer group ${
          isAnchor ? 'border-yellow-500' : 'border-slate-700'
        } ${isHovered && panel.status === 'completed' ? 'border-orange-500' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePanelClick}
      >
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white text-sm font-bold shadow-lg">
              {panel.panel_number}
            </span>
            {isAnchor && (
              <span className="px-2 py-1 bg-yellow-500/90 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
                ANCHOR
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          <div className="aspect-square">{renderStatus()}</div>

          <AnimatePresence>
            {isHovered && panel.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 flex items-center justify-center gap-4"
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateSpeech();
                  }}
                  disabled={isGeneratingSpeech || !!panel.audio_url}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGeneratingSpeech ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : panel.audio_url ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Voice Ready
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Speak
                    </>
                  )}
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateVideo();
                  }}
                  disabled={isGeneratingVideo || !!panel.video_url}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGeneratingVideo ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : panel.video_url ? (
                    <>
                      <Film className="w-5 h-5 mr-2" />
                      Animated
                    </>
                  ) : (
                    <>
                      <Film className="w-5 h-5 mr-2" />
                      Animate
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {panel.dialogue && (
          <div className="p-3 bg-slate-900/80 border-t border-slate-700">
            <p className="text-sm text-slate-300 italic line-clamp-2">
              "{panel.dialogue}"
            </p>
          </div>
        )}
      </Card>

      <AlertDialog open={showCreditWarning} onOpenChange={setShowCreditWarning}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Use 1 Video Credit?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              This will use 1 of your {videoCreditsRemaining} remaining video credits to animate this panel.
              Video generation takes about 30-60 seconds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmGenerateVideo}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Generate Video
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
