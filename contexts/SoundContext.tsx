import React, { createContext, useContext, useRef, useEffect, useState, ReactNode, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { useUser } from './UserContext';
import { supabase } from '../lib/supabaseClient';
import { decode, decodeAudioData } from '../utils/audio';
import { GoogleGenAI, Modality } from '@google/genai';

interface QueuedNarration {
    text: string;
    title?: string;
    id: string;
}

interface SoundContextType {
    playHover: () => void;
    playClick: () => void;
    playTypewriter: () => void;
    playSuccess: () => void;
    playError: () => void;
    playScan: () => void;
    playStartup: () => void;
    isBriefingActive: boolean;
    playBriefing: (base64Audio: string) => Promise<void>;
    stopBriefing: () => void;
    narrateText: (text: string, title?: string) => Promise<void>;
    briefingStatus: string | null;
    isAudioSuspended: boolean;
    resumeAudio: () => Promise<void>;
    queueLength: number;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
};

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useSettings();
    const { userProfile, isQuotaExhausted, handleApiError } = useUser();
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    
    const briefingSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isBriefingActive, setIsBriefingActive] = useState(false);
    const [briefingStatus, setBriefingStatus] = useState<string | null>(null);
    const [isAudioSuspended, setIsAudioSuspended] = useState(false);
    
    const [narrationQueue, setNarrationQueue] = useState<QueuedNarration[]>([]);
    const isProcessingRef = useRef(false);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
                masterGainRef.current = audioContextRef.current.createGain();
                masterGainRef.current.connect(audioContextRef.current.destination);
                masterGainRef.current.gain.value = settings.volume;
                
                audioContextRef.current.onstatechange = () => {
                    setIsAudioSuspended(audioContextRef.current?.state === 'suspended');
                };
            }
        }
        
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume().catch(console.error);
        }
        
        if (masterGainRef.current) {
            masterGainRef.current.gain.value = settings.volume;
        }

        return audioContextRef.current;
    }, [settings.volume]);

    const stopBriefing = useCallback(() => {
        if (briefingSourceRef.current) {
            try { briefingSourceRef.current.stop(); } catch (e) {}
            briefingSourceRef.current = null;
        }
        setNarrationQueue([]); 
        isProcessingRef.current = false;
        setIsBriefingActive(false);
        setBriefingStatus(null);
    }, []);

    const playBriefing = useCallback(async (base64Audio: string): Promise<void> => {
        const ctx = initAudioContext();
        if (!ctx) return;
        
        return new Promise(async (resolve) => {
            try {
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                
                if (masterGainRef.current) {
                    source.connect(masterGainRef.current);
                } else {
                    source.connect(ctx.destination);
                }

                source.onended = () => {
                    if (briefingSourceRef.current === source) {
                        briefingSourceRef.current = null;
                    }
                    resolve();
                };

                briefingSourceRef.current = source;
                source.start();
            } catch (err) {
                console.error("playBriefing error:", err);
                resolve();
            }
        });
    }, [initAudioContext]);

    useEffect(() => {
        const processQueue = async () => {
            if (isProcessingRef.current || narrationQueue.length === 0) return;
            
            isProcessingRef.current = true;
            setIsBriefingActive(true);

            const current = narrationQueue[0];
            const contentHash = hashString(current.text);
            const cacheKey = `global_narr_v9_${contentHash}`;
            
            let audioToPlay: string | null = localStorage.getItem(cacheKey);

            if (!audioToPlay) {
                setBriefingStatus("LINKING...");
                try {
                    const { data, error } = await supabase.from('audio_cache').select('audio_base64').eq('id', cacheKey).single();
                    if (data && !error) {
                        audioToPlay = data.audio_base64;
                        localStorage.setItem(cacheKey, audioToPlay);
                    } else if (!isQuotaExhausted) {
                        setBriefingStatus("NEURAL_SYNC...");
                        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                        
                        // ENFORCED NARRATION STYLE: Just talk, no metadata.
                        const speakerText = `Narrate the following text naturally as if you are giving a live, professional speech. 
                        CRITICAL: Do NOT say "Step 1", "Point 2", "Title", or use any bullet point labels or numbers. 
                        Just speak the information fluently and conversationally: 
                        ${current.text}`;
                        
                        const response = await ai.models.generateContent({
                            model: "gemini-2.5-flash-preview-tts",
                            contents: [{ parts: [{ text: speakerText }] }],
                            config: {
                                responseModalities: [Modality.AUDIO],
                                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' }}},
                            },
                        });
                        audioToPlay = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
                        if (audioToPlay) {
                            localStorage.setItem(cacheKey, audioToPlay);
                            await supabase.from('audio_cache').upsert({ id: cacheKey, audio_base64: audioToPlay, created_at: new Date().toISOString() });
                        }
                    }
                } catch (err) {
                    handleApiError(err);
                }
            }

            if (audioToPlay) {
                setBriefingStatus("PLAYING...");
                await playBriefing(audioToPlay);
            }

            setNarrationQueue(prev => prev.slice(1));
            isProcessingRef.current = false;
            
            if (narrationQueue.length === 1) {
                setIsBriefingActive(false);
                setBriefingStatus(null);
            }
        };

        processQueue();
    }, [narrationQueue, playBriefing, isQuotaExhausted, handleApiError]);

    const narrateText = useCallback(async (text: string, title?: string) => {
        const id = Math.random().toString(36).substring(7);
        setNarrationQueue(prev => [...prev, { text, title, id }]);
    }, []);

    const resumeAudio = async () => {
        const ctx = initAudioContext();
        if (ctx) await ctx.resume();
    };

    const playHover = () => {
        const ctx = initAudioContext();
        if (!ctx || !settings.soundEnabled) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.03 * settings.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    };

    const playClick = () => {
        const ctx = initAudioContext();
        if (!ctx || !settings.soundEnabled) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1 * settings.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    };

    const playTypewriter = () => {
        const ctx = initAudioContext();
        if (!ctx || !settings.soundEnabled) return;
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.02 * settings.volume, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    };

    const playSuccess = () => {
        const ctx = initAudioContext();
        if (!ctx || !settings.soundEnabled) return;
        const now = ctx.currentTime;
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.1 * settings.volume, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.5);
        });
    };

    const playError = () => {
        const ctx = initAudioContext();
        if (!ctx || !settings.soundEnabled) return;
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.1 * settings.volume, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    };

    const playScan = () => {
        const ctx = initAudioContext();
        if (!ctx || !settings.soundEnabled) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1.0);
        gain.gain.setValueAtTime(0.05 * settings.volume, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.0);
    };

    const playStartup = () => {
        const ctx = initAudioContext();
        if (!ctx || !settings.soundEnabled) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(50, ctx.currentTime);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(51, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2 * settings.volume, ctx.currentTime + 1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 4);
        osc2.stop(ctx.currentTime + 4);
    };

    return (
        <SoundContext.Provider value={{ 
            playHover, playClick, playTypewriter, playSuccess, playError, playScan, playStartup,
            isBriefingActive, playBriefing, stopBriefing, narrateText, briefingStatus,
            isAudioSuspended, resumeAudio, queueLength: narrationQueue.length
        }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = (): SoundContextType => {
    const context = useContext(SoundContext);
    if (context === undefined) throw new Error('useSound must be used within a SoundProvider');
    return context;
};