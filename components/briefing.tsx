// "use client";

// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Sparkles, Wand2, AlertTriangle } from 'lucide-react';
// import { Button } from './ui/button';
// import { Textarea } from './ui/textarea';
// import { useComicStore } from '@/lib/store';
// import { generateScript } from '@/lib/api';
// import { toast } from 'sonner';
// import { STORY_PLACEHOLDERS } from '@/lib/constants';

// export function Briefing() {
//   const [isLoading, setIsLoading] = useState(false);
//   const { storyIdea, setStoryIdea, setGeneratedScript, setStep } = useComicStore();
//   const [placeholder] = useState(
//     STORY_PLACEHOLDERS[Math.floor(Math.random() * STORY_PLACEHOLDERS.length)]
//   );
//   const [showEnvWarning, setShowEnvWarning] = useState(false);

//   useEffect(() => {
//     const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY;
//     console.log('[MotionManga] Environment Check:', {
//       hasApiKey: !!apiKey && apiKey !== 'undefined',
//       apiKeyLength: apiKey?.length || 0,
//       apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING',
//     });

//     if (!apiKey || apiKey === 'undefined') {
//       setShowEnvWarning(true);
//       toast.error('MiniMax API key not configured. Please check your .env file and restart the server.', {
//         duration: 10000,
//       });
//     } else {
//       console.log('[MotionManga] ✓ API key is configured correctly');
//     }
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const newValue = e.target.value;
//     setStoryIdea(newValue);
//   };

//   const handleGenerate = async () => {
//     if (!storyIdea.trim()) {
//       toast.error('Please enter a story idea');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const result = await generateScript(storyIdea);

//       if (result.error || !result.data) {
//         toast.error(result.message || 'Failed to generate script', {
//           duration: 8000,
//         });
//         return;
//       }

//       setGeneratedScript(result.data.script.panels);
//       setStep('scripting');
//       toast.success('Script generated successfully!');
//     } catch (error: any) {
//       toast.error(error.message || 'An unexpected error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="max-w-3xl w-full relative z-10"
//       >
//         <div className="text-center mb-8">
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.2, type: 'spring' }}
//             className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6 shadow-2xl"
//           >
//             <Wand2 className="w-10 h-10 text-white" />
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.3 }}
//             className="text-5xl md:text-6xl font-bold text-white mb-4"
//           >
//             MotionManga AI
//           </motion.h1>

//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4 }}
//             className="text-xl text-slate-300 mb-2"
//           >
//             Create Living Comics with AI
//           </motion.p>

//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5 }}
//             className="flex items-center justify-center gap-4 text-sm text-slate-400"
//           >
//             <span className="flex items-center gap-1">
//               <Sparkles className="w-4 h-4" />
//               AI Story Generation
//             </span>
//             <span>•</span>
//             <span>Character Consistency</span>
//             <span>•</span>
//             <span>Voice Acting</span>
//             <span>•</span>
//             <span>Animation</span>
//           </motion.div>
//         </div>

//         {showEnvWarning && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg"
//           >
//             <div className="flex items-start gap-3">
//               <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
//               <div className="flex-1">
//                 <h3 className="text-red-300 font-semibold mb-1">API Key Not Configured</h3>
//                 <p className="text-red-200 text-sm">
//                   Your MiniMax API key is not configured. Please add it to your .env file and restart the development server.
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6 }}
//           className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700"
//         >
//           <label className="block text-lg font-semibold text-white mb-3">
//             Tell me your story idea
//           </label>

//           <Textarea
//             value={storyIdea}
//             onChange={handleInputChange}
//             placeholder={placeholder}
//             className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//             disabled={isLoading}
//             autoComplete="off"
//             spellCheck="true"
//           />

//           <div className="flex items-center justify-between mt-4">
//             <span className="text-sm text-slate-400">
//               {storyIdea.length} characters
//             </span>

//             <Button
//               onClick={handleGenerate}
//               disabled={isLoading || !storyIdea.trim()}
//               size="lg"
//               className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-8 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <>
//                   <motion.div
//                     animate={{ rotate: 360 }}
//                     transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//                     className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
//                   />
//                   Generating Script...
//                 </>
//               ) : (
//                 <>
//                   <Sparkles className="w-5 h-5 mr-2" />
//                   Generate Comic Script
//                 </>
//               )}
//             </Button>
//           </div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.8 }}
//           className="mt-6 text-center text-sm text-slate-400"
//         >
//           Powered by MiniMax AI • M2, Image-01, Speech 2.6, Hailuo 2.3
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, AlertTriangle, Key, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { useComicStore } from '@/lib/store';
import { generateScript, setUserApiKey, getUserApiKey } from '@/lib/api';
import { toast } from 'sonner';
import { STORY_PLACEHOLDERS } from '@/lib/constants';

export function Briefing() {
  const [isLoading, setIsLoading] = useState(false);
  const { storyIdea, setStoryIdea, setGeneratedScript, setStep } = useComicStore();
  const [placeholder] = useState(STORY_PLACEHOLDERS[Math.floor(Math.random() * STORY_PLACEHOLDERS.length)]);
  const [showEnvWarning, setShowEnvWarning] = useState(false);
  const [userApiKey, setUserApiKeyState] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  useEffect(() => {
    const envApiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY;
    const storedApiKey = getUserApiKey();
    
    console.log('[MotionManga] Environment Check:', {
      hasEnvApiKey: !!envApiKey && envApiKey !== 'undefined',
      hasStoredApiKey: !!storedApiKey,
    });

    if (storedApiKey) {
      setIsApiKeySet(true);
      setShowEnvWarning(false);
    } else if (!envApiKey || envApiKey === 'undefined') {
      setShowEnvWarning(true);
    } else {
      setIsApiKeySet(true);
      console.log('[MotionManga] ✓ API key is configured correctly');
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!userApiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }
    
    if (!userApiKey.startsWith('eyJ')) {
      toast.error('Invalid API key format. MiniMax API keys start with "eyJ"');
      return;
    }

    setUserApiKey(userApiKey.trim());
    setIsApiKeySet(true);
    setShowEnvWarning(false);
    toast.success('API key saved successfully!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setStoryIdea(newValue);
  };

  const handleGenerate = async () => {
    if (!storyIdea.trim()) {
      toast.error('Please enter a story idea');
      return;
    }

    if (!isApiKeySet) {
      toast.error('Please configure your MiniMax API key first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateScript(storyIdea);

      if (result.error || !result.data) {
        toast.error(result.message || 'Failed to generate script', {
          duration: 8000,
        });
        return;
      }

      setGeneratedScript(result.data.script.panels);
      setStep('scripting');
      toast.success('Script generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6 shadow-2xl"
          >
            <Wand2 className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
          >
            MotionManga AI
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-300 mb-2"
          >
            Create Living Comics with AI
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 text-sm text-slate-400"
          >
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              AI Story Generation
            </span>
            <span>•</span>
            <span>Character Consistency</span>
            <span>•</span>
            <span>Voice Acting</span>
            <span>•</span>
            <span>Animation</span>
          </motion.div>
        </div>

        {showEnvWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-amber-900/30 border border-amber-500/50 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-amber-300 font-semibold mb-1">Enter Your MiniMax API Key</h3>
                <p className="text-amber-200 text-sm mb-3">
                  Get your API key from{' '}
                  <a 
                    href="https://platform.minimax.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-100"
                  >
                    platform.minimax.io
                  </a>
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => setUserApiKeyState(e.target.value)}
                    placeholder="Paste your MiniMax API key here..."
                    className="flex-1 bg-slate-900/50 border-amber-600/50 text-white placeholder:text-slate-500"
                  />
                  <Button
                    onClick={handleSaveApiKey}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
                <p className="text-amber-200/60 text-xs mt-2">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {isApiKeySet && !showEnvWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Check className="w-4 h-4" />
              <span>API key configured</span>
              <button
                onClick={() => {
                  setShowEnvWarning(true);
                  setIsApiKeySet(false);
                }}
                className="ml-auto text-green-400/60 hover:text-green-400 text-xs underline"
              >
                Change key
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700"
        >
          <label className="block text-lg font-semibold text-white mb-3">
            Tell me your story idea
          </label>
          
          <Textarea
            value={storyIdea}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading}
            autoComplete="off"
            spellCheck="true"
          />
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-slate-400">
              {storyIdea.length} characters
            </span>
            
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !storyIdea.trim() || !isApiKeySet}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-8 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Generating Script...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Comic Script
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-sm text-slate-400"
        >
          Powered by MiniMax AI • M2, Image-01, Speech 2.6, Hailuo 2.3
        </motion.div>
      </motion.div>
    </div>
  );
}
