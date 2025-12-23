"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins } from 'lucide-react';
import { Button } from './ui/button';
import { useComicStore } from '@/lib/store';
import { ComicPanel } from './comic-panel';
import { generateImage } from '@/lib/api';
import { toast } from 'sonner';

export function ComicCanvas() {
  const {
    panels,
    masterCharacterUrl,
    videoCreditsRemaining,
    setStep,
    setPanelImage,
    setPanelStatus,
    setPanelError,
    setMasterCharacter,
  } = useComicStore();

  const hasStartedGeneration = useRef(false);

  useEffect(() => {
    if (!hasStartedGeneration.current && panels.length === 4) {
      hasStartedGeneration.current = true;
      generateAllPanels();
    }
  }, [panels.length]);

  const generateAllPanels = async () => {
    const panel1 = panels[0];
    if (!panel1) return;

    setPanelStatus(panel1.id, 'generating-image');
    const result1 = await generateImage(panel1.visual_prompt);

    if (result1.error || !result1.data) {
      setPanelError(panel1.id, result1.message || 'Failed to generate image');
      toast.error(`Panel 1: ${result1.message}`);
      return;
    }

    setPanelImage(panel1.id, result1.data.imageUrl);
    setMasterCharacter(result1.data.imageUrl);
    toast.success('Panel 1 complete! This will be your character reference.');

    for (let i = 1; i < panels.length; i++) {
      const panel = panels[i];
      setPanelStatus(panel.id, 'generating-image');

      const result = await generateImage(
        panel.visual_prompt,
        result1.data.imageUrl
      );

      if (result.error || !result.data) {
        setPanelError(panel.id, result.message || 'Failed to generate image');
        toast.error(`Panel ${i + 1}: ${result.message}`);
        continue;
      }

      setPanelImage(panel.id, result.data.imageUrl);
      toast.success(`Panel ${i + 1} complete!`);
    }

    toast.success('All panels generated! You can now add voice and animation.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => setStep('scripting')}
                className="text-slate-300 hover:text-white mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Script
              </Button>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Your Living Comic
              </h1>
              <p className="text-slate-400">
                Panels are generating. Click on panels to add voice and animation.
              </p>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full shadow-lg"
            >
              <Coins className="w-5 h-5 text-white" />
              <span className="text-white font-bold">
                {videoCreditsRemaining} Credits
              </span>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {panels.map((panel, index) => (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ComicPanel panel={panel} isAnchor={index === 0} />
            </motion.div>
          ))}
        </div>

        {masterCharacterUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <p className="text-sm text-slate-400 text-center">
              Character locked from Panel 1 • All other panels use this as reference for consistency
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
