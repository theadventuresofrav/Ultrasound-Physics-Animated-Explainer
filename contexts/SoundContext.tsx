import React, { createContext, useContext, useRef, useEffect, useState, ReactNode, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { useUser } from './UserContext';
import { supabase } from '../lib/supabaseClient';
import { decode, decodeAudioData } from '../utils/audio';
import { generateQwenTTS } from '../utils/qwen';
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
    getAudioFromCache: (text: string) => Promise<string | null>;
    briefingStatus: string | null;
    isAudioSuspended: boolean;
    resumeAudio: () => Promise<void>;
    queueLength: number;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Static hashing for consistent cache keys across pregen and components
export const getAudioContentHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'v10_' + Math.abs(hash).toString(36);
};

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useSettings();
    const { isQuotaExhausted, handleApiError } = useUser();
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    
    const briefingSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isBriefingActive, setIsBriefingActive] = useState(false);
    const [briefingStatus, setBriefingStatus] = useState<string | null>(null);
    const [isAudioSuspended, setIsAudioSuspended] = useState(false);
    
    const [narrationQueue, setNarrationQueue] = useState<QueuedNarration[]>([]);
    const isProcessingRef = useRef(false);

    // Theme Music Refs
    const themeMusicSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const themeOscillatorsRef = useRef<OscillatorNode[]>([]); // Track oscillators for procedural sound
    const themeMusicGainRef = useRef<GainNode | null>(null);
    const { userProfile } = useUser();

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
                const uint8Array = decode(base64Audio);
                let audioBuffer: AudioBuffer;

                try {
                    // Try native decoding first (for MP3/WAV from Qwen)
                    // We need to copy the buffer because decodeAudioData detaches it
                    const bufferCopy = uint8Array.slice(0).buffer;
                    audioBuffer = await ctx.decodeAudioData(bufferCopy);
                } catch (e) {
                    // Fallback to custom PCM decoding (for Gemini)
                    audioBuffer = await decodeAudioData(uint8Array, ctx, 24000, 1);
                }

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

    const getAudioFromCache = useCallback(async (text: string): Promise<string | null> => {
        const hash = getAudioContentHash(text);
        const cacheKey = `global_narr_${hash}`;
        
        // 1. Check Local
        const local = localStorage.getItem(cacheKey);
        if (local) return local;

        // 2. Check Supabase
        try {
            const { data, error } = await supabase.from('audio_cache').select('audio_base64').eq('id', cacheKey).single();
            if (data && !error) {
                localStorage.setItem(cacheKey, data.audio_base64);
                return data.audio_base64;
            }
        } catch (e) {}

        return null;
    }, []);

    // Theme Music Effect
    useEffect(() => {
        const playThemeMusic = async () => {
            // Cleanup previous audio sources
            if (themeMusicSourceRef.current) {
                try { themeMusicSourceRef.current.stop(); } catch(e){}
                themeMusicSourceRef.current = null;
            }
            // Cleanup procedural oscillators
            themeOscillatorsRef.current.forEach(osc => {
                try { osc.stop(); osc.disconnect(); } catch(e){}
            });
            themeOscillatorsRef.current = [];

            // Check if music is enabled
            if (!settings.musicEnabled) return;

            const ctx = initAudioContext();
            if (!ctx) return;

            const masterGain = ctx.createGain();
            const volume = settings.musicVolume > 0 ? settings.musicVolume : 0.5;
            masterGain.gain.value = volume;
            masterGain.connect(ctx.destination);
            themeMusicGainRef.current = masterGain;

            // STRATEGY: 
            // 1. Try User's Custom Override
            // 2. Try GLOBAL BROADCAST (System-wide music)
            // 3. Fallback to Procedural Drone
            
            let musicKeyToPlay = userProfile?.systemOverrides?.themeMusicKey;
            let playedCustom = false;
            
            // If user has no personal override, check for global broadcast
             if (!musicKeyToPlay) {
                 musicKeyToPlay = 'GLOBAL_BROADCAST_SIGNAL';
             }

             // SPECIAL BYPASS: If Global Broadcast, try to load from /background-music.mp3 first
             // This bypasses the database entirely and uses the file in the public/ folder.
             if (musicKeyToPlay === 'GLOBAL_BROADCAST_SIGNAL') {
                 try {
                     const response = await fetch('/background-music.mp3');
                     if (response.ok) {
                         console.log("Found local static background music file!");
                         const arrayBuffer = await response.arrayBuffer();
                         const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                         
                         const source = ctx.createBufferSource();
                         source.buffer = audioBuffer;
                         source.loop = true;
                         source.connect(masterGain);
                         themeMusicSourceRef.current = source;
                         source.start();
                         return; // Exit early, we are playing!
                     }
                 } catch (e) {
                     console.log("No static /background-music.mp3 found, checking database...");
                 }
             }

             if (musicKeyToPlay) {
                 try {
                     let base64Data: string | null = null;

                     // 1. Try fetching from Supabase
                     const { data, error } = await supabase.from('audio_cache').select('audio_base64').eq('id', musicKeyToPlay).single();
                     
                     // If we tried global and it failed (404), that's fine, just fall through.
                     if (!data && musicKeyToPlay === 'GLOBAL_BROADCAST_SIGNAL') {
                         console.log("No global broadcast signal found.");
                     } else if (data?.audio_base64) {
                         base64Data = data.audio_base64;
                     }
                     
                     // 2. Fallback: Try LocalStorage (only if NOT global)
                     if (!base64Data && musicKeyToPlay !== 'GLOBAL_BROADCAST_SIGNAL') {
                          const localData = localStorage.getItem(musicKeyToPlay);
                          if (localData) base64Data = localData;
                     }

                     if (base64Data) {
                         // CHECK FOR CHUNKED MANIFEST
                         if (base64Data.startsWith('CHUNKED_MANIFEST:')) {
                                const totalChunks = parseInt(base64Data.split(':')[1]);
                                console.log(`Detected Chunked Audio (${totalChunks} parts). Reassembling...`);
                                
                                const chunkPromises = [];
                                for (let i = 0; i < totalChunks; i++) {
                                    chunkPromises.push(
                                        supabase.from('audio_cache').select('audio_base64').eq('id', `${musicKeyToPlay}_part_${i}`).single()
                                    );
                                }
                                
                                const chunkResults = await Promise.all(chunkPromises);
                                base64Data = chunkResults.map(r => r.data?.audio_base64 || '').join('');
                         } else if (base64Data.includes(',')) {
                             base64Data = base64Data.split(',')[1];
                         }

                         const uint8Array = decode(base64Data);
                        let audioBuffer: AudioBuffer;

                        try {
                            const bufferCopy = uint8Array.slice(0).buffer;
                            audioBuffer = await ctx.decodeAudioData(bufferCopy);
                        } catch (e) {
                            audioBuffer = await decodeAudioData(uint8Array, ctx, 24000, 1);
                        }

                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.loop = true;
                        source.connect(masterGain);
                        themeMusicSourceRef.current = source;
                        source.start();
                        playedCustom = true;
                        console.log("Playing theme music:", musicKeyToPlay);
                    }
                } catch (e) {
                    console.error("Failed to load music:", e);
                }
            }

            // Fallback: Procedural Space Drone (Gentle Ethereal)
            if (!playedCustom) {
                console.log("Generating gentle space drone...");
                // Frequencies: Lower and softer (Open Fifths: C2, G2, C3)
                const freqs = [65.41, 98.00, 130.81]; 
                
                // Create a "Warmth" Filter (Lowpass) to remove harshness
                const filter = ctx.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.value = 800; // Cut off anything above 800Hz
                filter.connect(masterGain);

                const oscillators = freqs.map((f, i) => {
                    const osc = ctx.createOscillator();
                    osc.type = 'sine'; // All Sine waves for purity
                    osc.frequency.value = f;
                    
                    // Gentle detune for "floating" feel
                    osc.detune.value = (Math.random() * 4) - 2; 

                    // Individual gain - much quieter now
                    const oscGain = ctx.createGain();
                    oscGain.gain.value = 0.03; // Very low volume for background ambience
                    
                    // Add a slow "breathing" effect (LFO) to the volume of one oscillator
                    if (i === 1) {
                         const lfo = ctx.createOscillator();
                         lfo.type = 'sine';
                         lfo.frequency.value = 0.1; // Very slow cycle (10 seconds)
                         const lfoGain = ctx.createGain();
                         lfoGain.gain.value = 0.01; // Modulate volume slightly
                         lfo.connect(lfoGain);
                         lfoGain.connect(oscGain.gain);
                         lfo.start();
                         // We track the LFO to stop it later? 
                         // For simplicity in this structure, we'll just let the LFO run attached to the node 
                         // (it gets GC'd when graph is disconnected, but cleaner to track. 
                         // Given the complexity, a simple static drone is safer for now without extra refs.)
                         // Let's stick to static gain for stability, but softer.
                    }

                    osc.connect(oscGain);
                    oscGain.connect(filter); // Connect to filter instead of master directly
                    osc.start();
                    return osc;
                });
                
                themeOscillatorsRef.current = oscillators;
            }
        };

        // Delay start slightly to ensure user interaction has occurred
        const timer = setTimeout(() => {
             playThemeMusic();
        }, 1000);

        return () => {
            clearTimeout(timer);
            if (themeMusicSourceRef.current) {
                try { themeMusicSourceRef.current.stop(); } catch(e){}
            }
            themeOscillatorsRef.current.forEach(osc => {
                try { osc.stop(); osc.disconnect(); } catch(e){}
            });
            themeOscillatorsRef.current = [];
        };
    }, [settings.musicEnabled, userProfile?.systemOverrides?.themeMusicKey, initAudioContext]); // Re-run if enabled changes or key changes

    // Update Music Volume
    useEffect(() => {
        if (themeMusicGainRef.current && audioContextRef.current) {
            themeMusicGainRef.current.gain.setTargetAtTime(settings.musicVolume, audioContextRef.current.currentTime, 0.1);
        }
    }, [settings.musicVolume]);

    useEffect(() => {
        const processQueue = async () => {
            if (isProcessingRef.current || narrationQueue.length === 0) return;
            
            isProcessingRef.current = true;
            setIsBriefingActive(true);

            const current = narrationQueue[0];
            const hash = getAudioContentHash(current.text);
            const cacheKey = `global_narr_${hash}`;
            
            let audioToPlay = await getAudioFromCache(current.text);

            if (!audioToPlay) {
                if (!isQuotaExhausted) {
                    setBriefingStatus("NEURAL_SYNC...");
                    try {
                        // Check for Qwen Key
                        const qwenKey = (import.meta as any).env?.VITE_DASHSCOPE_API_KEY || (process.env as any).VITE_DASHSCOPE_API_KEY;
                        
                        if (qwenKey) {
                            audioToPlay = await generateQwenTTS(current.text, qwenKey);
                        }

                        // If Qwen didn't run or return audio, use Gemini
                        if (!audioToPlay) {
                            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                            const speakerText = `Narrate the following text naturally as if you are giving a live, professional speech. CRITICAL: Do NOT say "Step 1", "Point 2", "Title", or use any bullet point labels or numbers. Just speak the information fluently: ${current.text}`;
                            
                            const response = await ai.models.generateContent({
                                model: "gemini-2.5-flash-preview-tts",
                                contents: [{ parts: [{ text: speakerText }] }],
                                config: {
                                    responseModalities: [Modality.AUDIO],
                                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' }}},
                                },
                            });
                            audioToPlay = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
                        }

                        if (audioToPlay) {
                            localStorage.setItem(cacheKey, audioToPlay);
                            await supabase.from('audio_cache').upsert({ id: cacheKey, audio_base64: audioToPlay, created_at: new Date().toISOString() });
                        }
                    } catch (err) {
                        handleApiError(err);
                    }
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
    }, [narrationQueue, playBriefing, isQuotaExhausted, handleApiError, getAudioFromCache]);

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
            isBriefingActive, playBriefing, stopBriefing, narrateText, getAudioFromCache, briefingStatus,
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