
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData } from '../../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';

// Global AudioContext and source ref to manage playback
let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

const NARRATION_CACHE_KEY_PREFIX = 'echoMastersBriefingCache_v7';
const AUDIO_SESSION_CACHE_PREFIX = 'echoAudioSession_v1';

const BriefingIcon = ({ isActive, isThrottled }: { isActive: boolean, isThrottled: boolean }) => (
    <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-all ${isThrottled ? 'text-white/20' : isActive ? 'text-red-400' : 'text-[var(--gold)]'}`}>
            {isActive ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            )}
        </svg>
        {isActive && <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-red-400 rounded-full blur-md" />}
    </div>
);

interface DemoSectionProps {
  title: string;
  description: string;
  objectives?: string[];
  controls?: string[]; 
  children?: React.ReactNode;
}

const DemoSection: React.FC<DemoSectionProps> = ({ 
    title, 
    description, 
    objectives = ["Observe physical interactions", "Analyze telemetry data", "Master core principles"], 
    controls = [],
    children 
}) => {
  const [isNarrating, setIsNarrating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const { vaultMnemonic, isQuotaExhausted, handleApiError } = useUser();

  const handleBriefing = async () => {
      if (isNarrating) {
          if (currentSource) {
              currentSource.stop();
              currentSource.onended = null;
          }
          currentSource = null;
          setIsNarrating(false);
          setStatus(null);
          return;
      }

      setIsNarrating(true);

      const playAudio = async (base64Audio: string) => {
          if (!audioContext || audioContext.state === 'closed') {
              audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          if(audioContext.state === 'suspended') await audioContext.resume();

          const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          source.start();

          currentSource = source;
          source.onended = () => {
              if (currentSource === source) {
                  setIsNarrating(false);
                  currentSource = null;
                  setStatus(null);
              }
          };
      };
      
      try {
          if (currentSource) {
              currentSource.stop();
              currentSource.onended = null;
          }
          
          const sanitizeKey = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_');
          const cacheKey = `${NARRATION_CACHE_KEY_PREFIX}_${sanitizeKey(title)}`;
          const sessionCacheKey = `${AUDIO_SESSION_CACHE_PREFIX}_${sanitizeKey(title)}`;
          
          let cachedAudio = sessionStorage.getItem(sessionCacheKey);
          
          if (!cachedAudio) {
              try { cachedAudio = localStorage.getItem(cacheKey); } catch (e) {}
          }

          if (cachedAudio) {
              setStatus("BUFFER_LOADED...");
              await playAudio(cachedAudio);
              return;
          }

          if (isQuotaExhausted) {
              setStatus("QUOTA_THROTTLED");
              setTimeout(() => { setIsNarrating(false); setStatus(null); }, 3000);
              return;
          }

          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          setStatus("SYNCING...");
          
          const briefingPrompt = `
            Act as "Mission Commander Echo", an elite ultrasound physics instructor. 
            Unit Title: "${title}"
            Current Objectives: ${objectives.join(', ')}
            Available Interactive Controls: ${controls.length > 0 ? controls.join(', ') : 'Direct manipulation of visual elements'}

            Provide a short high-fidelity tactical briefing explaining exactly HOW to use this lab.
            Include a Mnemonic at the end clearly labeled "SCRIPT:".
            Length: 100 words max.
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: briefingPrompt,
          });

          const lectureText = response.text;
          const mnemonicMatch = lectureText.match(/(?:MNEMONIC|SCRIPT):\s*(.*)/i);
          if (mnemonicMatch && mnemonicMatch[1]) {
              vaultMnemonic(title, mnemonicMatch[1].trim());
          }

          const audioResponse = await ai.models.generateContent({
              model: "gemini-2.5-flash-preview-tts",
              contents: lectureText,
              config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' }}},
              },
          });

          const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          
          if (base64Audio) {
              try {
                  sessionStorage.setItem(sessionCacheKey, base64Audio);
                  localStorage.setItem(cacheKey, base64Audio);
              } catch (e) {}
              setStatus("PLAYING...");
              await playAudio(base64Audio);
          }
      } catch (err: any) {
          handleApiError(err);
          setIsNarrating(false);
          setStatus(null);
      }
  };

  return (
    <div className="group relative bg-[#08080a] border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-[var(--gold)]/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
      <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-white/5 pointer-events-none group-hover:border-[var(--gold)]/20 transition-colors" />
      <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-white/5 pointer-events-none group-hover:border-[var(--gold)]/20 transition-colors" />

      <div className="p-10 pb-6 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse shadow-[0_0_10px_var(--gold)]" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{title}</h3>
                </div>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">Unit_ID: {title.substring(0, 4).toUpperCase()}_PRM</p>
            </div>
            
            <button 
                onClick={handleBriefing} 
                disabled={isQuotaExhausted && !isNarrating}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border transition-all ${
                    isNarrating 
                        ? 'bg-red-500/10 text-red-400 border-red-500/30 ring-1 ring-red-500/20 shadow-lg' 
                        : isQuotaExhausted
                            ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed opacity-50'
                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-[var(--gold)]/40'
                }`}
            >
                <BriefingIcon isActive={isNarrating} isThrottled={isQuotaExhausted && !isNarrating} />
                <span>{isNarrating ? (status || 'STOP') : isQuotaExhausted ? 'UPLINK_PAUSED' : 'ENGAGE_BRIEFING'}</span>
            </button>
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-3xl font-light">{description}</p>
      </div>
      
      {children && (
          <div className="p-10 pt-0">
              <div className="bg-black/60 rounded-[2rem] border border-white/5 p-8 shadow-inner relative overflow-hidden group/viz">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                  
                  <div className="absolute top-6 left-6 z-20 pointer-events-none space-y-2">
                       <div className="flex items-center gap-2 mb-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5">
                            <div className="w-1 h-3 bg-[var(--gold)]" />
                            <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Briefing_Targets</span>
                       </div>
                       {objectives.map((obj, i) => (
                           <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                               <span className="text-[var(--gold)]">0{i+1}_</span> {obj}
                           </motion.div>
                       ))}
                  </div>

                  <div className="relative z-10">
                    {children}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DemoSection;
