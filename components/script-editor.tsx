"use client";

import { motion } from 'framer-motion';
import { ArrowLeft, Check, Edit3, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useComicStore } from '@/lib/store';
import { EMOTIONS, CAMERA_MOVEMENTS } from '@/lib/constants';
import { toast } from 'sonner';
import { useState } from 'react';
import { generateScript } from '@/lib/api';

export function ScriptEditor() {
  const { panels, storyIdea, updatePanelScript, setGeneratedScript, setStep } = useComicStore();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const result = await generateScript(storyIdea);

      if (result.error || !result.data) {
        toast.error(result.message || 'Failed to regenerate script');
        return;
      }

      setGeneratedScript(result.data.script.panels);
      toast.success('Script regenerated!');
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApprove = () => {
    const allValid = panels.every(
      (panel) =>
        panel.visual_prompt.trim() &&
        panel.dialogue.trim() &&
        panel.character_emotion &&
        panel.camera_movement
    );

    if (!allValid) {
      toast.error('Please fill in all required fields for each panel');
      return;
    }

    setStep('canvas');
    toast.success('Script approved! Starting comic generation...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setStep('briefing')}
            className="text-slate-300 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Story Idea
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Review Your Script
              </h1>
              <p className="text-slate-400">
                Edit panels, emotions, and camera movements before generating your comic
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isRegenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full mr-2"
                    />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>

              <Button
                onClick={handleApprove}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve & Create Comic
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {panels.map((panel, index) => (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white text-sm font-bold mr-3">
                      {panel.panel_number}
                    </span>
                    Panel {panel.panel_number}
                    {panel.panel_number === 1 && (
                      <span className="ml-2 text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">
                        Anchor Panel
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Edit3 className="w-4 h-4 inline mr-1" />
                      Visual Prompt
                    </label>
                    <Textarea
                      value={panel.visual_prompt}
                      onChange={(e) =>
                        updatePanelScript(panel.id, { visual_prompt: e.target.value })
                      }
                      className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
                      placeholder="Describe the scene, characters, setting, and art style..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Dialogue
                    </label>
                    <Textarea
                      value={panel.dialogue}
                      onChange={(e) =>
                        updatePanelScript(panel.id, { dialogue: e.target.value })
                      }
                      className="bg-slate-900/50 border-slate-600 text-white min-h-[80px]"
                      placeholder="Character dialogue or narration..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Character Emotion
                      </label>
                      <Select
                        value={panel.character_emotion}
                        onValueChange={(value: any) =>
                          updatePanelScript(panel.id, { character_emotion: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EMOTIONS.map((emotion) => (
                            <SelectItem key={emotion.value} value={emotion.value}>
                              {emotion.icon} {emotion.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Camera Movement
                      </label>
                      <Select
                        value={panel.camera_movement}
                        onValueChange={(value: any) =>
                          updatePanelScript(panel.id, { camera_movement: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CAMERA_MOVEMENTS.map((movement) => (
                            <SelectItem key={movement.value} value={movement.value}>
                              {movement.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
