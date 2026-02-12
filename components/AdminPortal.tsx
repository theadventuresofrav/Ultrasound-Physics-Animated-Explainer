
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { PodcastEpisode, AIFlashcard, SimulationMedium } from '../types';
import ControlButton from './demos/ControlButton';
import { PRE_GENERATED_FLASHCARDS } from '../flashcard-data';
import { CheckCircleIcon, SpeakerWaveIcon, BrainIcon, SparklesIcon, TargetIcon } from './Icons';
import { supabase } from '../lib/supabaseClient';

const TabButton = ({ id, activeTab, label, onClick }: { id: string, activeTab: string, label: string, onClick: (id: any) => void }) => (
    <button 
        onClick={() => onClick(id)} 
        className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.25em] border-2 transition-all duration-300 ${activeTab === id ? 'bg-red-500 border-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.2)]' : 'text-white/40 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
    >
        {label}
    </button>
);

const AdminPortal: React.FC = () => {
    const { userProfile, updatePodcasts, updateFlashcardOverrides, toggleAdmin, updateSystemLogo, updateThemeMusic, updateSimulationMedia } = useUser();
    const [activeTab, setActiveTab] = useState<'podcasts' | 'flashcards' | 'simulation' | 'system'>('podcasts');
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);

    // Safety initialized state with deep optional chaining
    const [podcasts, setPodcasts] = useState<PodcastEpisode[]>(userProfile?.systemOverrides?.podcasts || []);
    const [flashcardOverrides, setFlashcardOverrides] = useState<Partial<AIFlashcard>[]>(userProfile?.systemOverrides?.flashcards || []);
    const [customMedia, setCustomMedia] = useState<SimulationMedium[]>(userProfile?.systemOverrides?.customMedia || []);
    const [systemLogo, setSystemLogo] = useState<string | undefined>(userProfile?.systemOverrides?.systemLogo);
    const [themeMusicKey, setThemeMusicKey] = useState<string | undefined>(userProfile?.systemOverrides?.themeMusicKey);
    const [isGlobalBroadcast, setIsGlobalBroadcast] = useState(true); // Default to true so uploads are global

    useEffect(() => {
        if (statusMessage) {
            const timer = setTimeout(() => setStatusMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);

    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, callback: (base64: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const base64 = await toBase64(file);
            callback(base64);
            setStatusMessage({ text: `UPLOAD_SUCCESS: ${type.toUpperCase()}`, type: 'success' });
        } catch (err) {
            setStatusMessage({ text: `ERR: ${type.toUpperCase()}_UPLOAD_FAILED`, type: 'error' });
        }
    };

    const handleBulkAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsProcessingBulk(true);
        setStatusMessage({ text: `INGESTING_${files.length}_SIGNALS...`, type: 'success' });

        const newEpisodes: PodcastEpisode[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64 = await toBase64(file);
                const key = `podcast_sig_${Date.now()}_${i}`;
                
                // Upload to Supabase Audio Cache
                await supabase.from('audio_cache').upsert({ 
                    id: key, 
                    audio_base64: base64, 
                    created_at: new Date().toISOString() 
                });

                // Construct Episode Node
                newEpisodes.push({
                    id: `ep-bulk-${Date.now()}-${i}`,
                    title: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
                    duration: 'SYNC_DETECTION',
                    description: `Neural signal ingested via bulk uplink. Original: ${file.name}`,
                    link: '',
                    isNew: true,
                    embedSrc: key // Using the cache key as the reference
                });
            }

            const updatedPodcasts = [...newEpisodes, ...podcasts];
            setPodcasts(updatedPodcasts);
            updatePodcasts(updatedPodcasts);
            setStatusMessage({ text: `BULK_INGEST_COMPLETE: ${files.length} NODES SYNCED`, type: 'success' });
        } catch (err) {
            console.error(err);
            setStatusMessage({ text: "ERR: BULK_UPLINK_SEVERED", type: 'error' });
        } finally {
            setIsProcessingBulk(false);
            e.target.value = '';
        }
    };

    const handleThemeMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Reset input value so same file can be selected again if needed
        e.target.value = '';
        
        const signalText = isGlobalBroadcast ? "GLOBAL_BROADCAST" : "LOCAL_OVERRIDE";
        setStatusMessage({ text: `UPLINKING_${signalText}_SIGNAL...`, type: 'success' });
        
        try {
            const base64 = await toBase64(file);
            
            // If Global, use fixed ID. If Local, use timestamp.
            const key = isGlobalBroadcast ? "GLOBAL_BROADCAST_SIGNAL" : `theme_music_${Date.now()}`;
            
            console.log(`Uploading theme music (${signalText}):`, file.name);
            
            try {
                // Try Supabase first (Standard Upload)
                const { error } = await supabase.from('audio_cache').upsert({ id: key, audio_base64: base64, created_at: new Date().toISOString() });
                
                if (error) {
                    console.warn("Standard upload failed, attempting CHUNKED upload strategy...", error);
                    
                    const CHUNK_SIZE = 1024 * 250; // Reduced to 250KB for better stability
                    const totalChunks = Math.ceil(base64.length / CHUNK_SIZE);
                    
                    // Update status to show we are switching to chunked mode
                    setStatusMessage({ text: `LARGE_FILE_DETECTED. INITIATING_ROBUST_PROTOCOL...`, type: 'success' });

                    for (let i = 0; i < totalChunks; i++) {
                        const chunk = base64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                        
                        // Retry logic for each chunk
                        let attempts = 0;
                        let success = false;
                        
                        while (!success && attempts < 3) {
                            attempts++;
                            const { error: chunkError } = await supabase.from('audio_cache').upsert({ 
                                id: `${key}_part_${i}`, 
                                audio_base64: chunk, 
                                created_at: new Date().toISOString() 
                            });
                            
                            if (!chunkError) {
                                success = true;
                            } else {
                                console.warn(`Chunk ${i} failed (attempt ${attempts}), retrying...`, chunkError);
                                await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
                            }
                        }
                        
                        if (!success) throw new Error(`Failed to upload chunk ${i} after 3 attempts`);
                        
                        // Update status for every chunk to show progress
                        setStatusMessage({ text: `UPLINKING_SEGMENT_${i+1}/${totalChunks}...`, type: 'success' });
                        // Significant delay to avoid rate limits
                        await new Promise(r => setTimeout(r, 300));
                    }
                    
                    // Save the "Manifest" to the main key
                    await supabase.from('audio_cache').upsert({ 
                        id: key, 
                        audio_base64: `CHUNKED_MANIFEST:${totalChunks}`, 
                        created_at: new Date().toISOString() 
                    });
                }
            } catch (supaErr) {
                console.warn("Supabase upload failed, falling back to LocalStorage", supaErr);
                // Fallback to LocalStorage
                try {
                    localStorage.setItem(key, base64);
                    setStatusMessage({ text: `LOCAL_SYNC_ONLY: ${file.name.toUpperCase()}`, type: 'success' });
                    // Return here so we don't overwrite the success message below
                    setThemeMusicKey(key);
                    updateThemeMusic(key);
                    return; 
                } catch (localErr) {
                     console.error("LocalStorage failed too", localErr);
                     setStatusMessage({ text: "ERR: FILE_TOO_LARGE_FOR_BROWSER", type: 'error' });
                     return;
                }
            }
            
            // Update User Profile state
            setThemeMusicKey(key);
            updateThemeMusic(key);
            
            // Force success message
            setStatusMessage({ text: `SYNCHRONIZED: ${file.name.toUpperCase()}`, type: 'success' });
            
        } catch (err) {
            console.error(err);
            setStatusMessage({ text: "ERR: UPLINK_FAILURE", type: 'error' });
        }
    };

    const handlePurgeAudioCache = useCallback(() => {
        if (!window.confirm("PURGE ALL NEURAL AUDIO BUFFERS? All narrations will be regenerated on next access.")) return;
        
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.startsWith('echoMastersModuleIntroCache_') || 
                key.startsWith('echoMastersStudyGuideNarration_') || 
                key.startsWith('echoMastersOnboardingCache_') ||
                key.startsWith('global_narr_')
            )) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(k => localStorage.removeItem(k));
        setStatusMessage({ text: `ARCHIVE_PURGED: ${keysToRemove.length} NODES DELETED`, type: 'success' });
        
        // Force reload after short delay to apply new versioning
        setTimeout(() => window.location.reload(), 2000);
    }, []);

    const handleAddMedium = () => {
        setCustomMedia([...customMedia, { id: `med-${Date.now()}`, name: 'NEW_TISSUE', speed: 1540, impedance: 1.6, attenuation: 0.5, color: '#ffffff' }]);
    };

    const handleSaveMedia = () => {
        updateSimulationMedia(customMedia);
        setStatusMessage({ text: "PHYSICS_MATRIX_STABILIZED", type: 'success' });
    };

    const handleAddPodcast = () => {
        const newEp: PodcastEpisode = {
            id: `ep-${Date.now()}`,
            title: 'NEW_TRANSMISSION',
            duration: '0 min',
            description: 'Awaiting signal data...',
            link: '',
            isNew: true,
            embedSrc: ''
        };
        setPodcasts([newEp, ...podcasts]);
    };

    const handleSavePodcasts = () => {
        updatePodcasts(podcasts);
        setStatusMessage({ text: "AUDIO_FEED_UPDATED", type: 'success' });
    };

    return (
        <div className="p-4 sm:p-12 max-w-7xl mx-auto space-y-10 animate-fade-in relative min-h-screen font-mono">
            <AnimatePresence>
                {statusMessage && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`fixed top-24 right-4 sm:right-12 z-[300] px-6 py-4 rounded-xl border-2 shadow-2xl backdrop-blur-3xl flex items-center gap-4 ${statusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full animate-ping ${statusMessage.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{statusMessage.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/10 pb-8 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_20px_red]" />
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">Root_Terminal</h1>
                    </div>
                    <p className="text-[10px] text-white/30 tracking-[0.4em] uppercase">AES_PRO: Admin_Level_Uplink_Active</p>
                </div>
                <button onClick={toggleAdmin} className="px-6 py-2 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all border border-red-500/20 text-[9px] font-black uppercase tracking-[0.2em]">[ DISCONNECT_SESSION ]</button>
            </header>

            <nav className="flex flex-wrap gap-2 sm:gap-3">
                <TabButton id="simulation" activeTab={activeTab} label="Matrix" onClick={setActiveTab} />
                <TabButton id="podcasts" activeTab={activeTab} label="Audio" onClick={setActiveTab} />
                <TabButton id="flashcards" activeTab={activeTab} label="Memory" onClick={setActiveTab} />
                <TabButton id="system" activeTab={activeTab} label="Core" onClick={setActiveTab} />
            </nav>

            <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden min-h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'simulation' && (
                        <motion.div key="sim" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Global_Tissue_Registry</h2>
                                <ControlButton onClick={handleAddMedium} secondary className="bg-red-500/10 border-red-500/30 text-red-400 text-[10px] uppercase font-black">+ Initialize New Medium</ControlButton>
                            </div>
                            <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {customMedia.length === 0 && <p className="text-center py-20 text-white/20 italic uppercase tracking-widest text-xs">No custom tissues registered</p>}
                                {customMedia.map((med) => (
                                    <div key={med.id} className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-5 gap-6 items-end group relative">
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-white/30 uppercase">ID_LABEL</label>
                                            <input value={med.name} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, name: e.target.value.toUpperCase() } : m))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:border-red-500/50 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-white/30 uppercase">SPD_M/S</label>
                                            <input type="number" value={med.speed} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, speed: Number(e.target.value) } : m))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-white/30 uppercase">IMP_RAYLS</label>
                                            <input type="number" step="0.01" value={med.impedance} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, impedance: Number(e.target.value) } : m))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-white/30 uppercase">ATT_DB/CM</label>
                                            <input type="number" step="0.01" value={med.attenuation} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, attenuation: Number(e.target.value) } : m))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" />
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-grow space-y-2">
                                                <label className="text-[8px] text-white/30 uppercase">HEX_SIGNAL</label>
                                                <input type="color" value={med.color} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, color: e.target.value } : m))} className="w-full h-9 bg-black/40 cursor-pointer rounded-lg border border-white/10 p-1" />
                                            </div>
                                            <button onClick={() => setCustomMedia(customMedia.filter(m => m.id !== med.id))} className="px-4 h-9 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 uppercase text-[10px] font-black hover:bg-red-500/20 transition-all self-end">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-10 border-t border-white/10 flex justify-end">
                                <ControlButton onClick={handleSaveMedia} className="bg-red-600 hover:bg-red-500 text-white px-10 h-14 text-[11px] font-black tracking-widest">SYNCHRONIZE_MATRIX</ControlButton>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'podcasts' && (
                        <motion.div key="pod" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Sonic_Feed_Commander</h2>
                                <div className="flex gap-3">
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="audio/*" 
                                            onChange={handleBulkAudioUpload} 
                                            disabled={isProcessingBulk}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <ControlButton secondary className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 text-[10px] uppercase font-black">
                                            {isProcessingBulk ? 'SYNCING...' : '[ BULK_SIGNAL_INGEST ]'}
                                        </ControlButton>
                                    </div>
                                    <ControlButton onClick={handleAddPodcast} secondary className="bg-red-500/10 border-red-500/30 text-red-400 text-[10px] uppercase font-black">+ Inject Single Feed</ControlButton>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {podcasts.length === 0 && <p className="text-center py-20 text-white/20 italic uppercase tracking-widest text-xs">No active signals in feed</p>}
                                {podcasts.map((pod) => (
                                    <div key={pod.id} className="bg-white/[0.03] p-8 rounded-2xl border border-white/5 space-y-6 relative group/node">
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            {pod.embedSrc?.startsWith('podcast_sig') && (
                                                <span className="text-[7px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/40 uppercase font-black">LOCAL_CACHE_SYNC</span>
                                            )}
                                            <button onClick={() => setPodcasts(podcasts.filter(p => p.id !== pod.id))} className="text-red-500 hover:text-red-400 p-2">✕</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[8px] text-white/30 uppercase">EPISODE_TITLE</label>
                                                <input value={pod.title} onChange={e => setPodcasts(podcasts.map(p => p.id === pod.id ? { ...p, title: e.target.value.toUpperCase() } : p))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] text-white/30 uppercase">DURATION_VAL</label>
                                                <input value={pod.duration} onChange={e => setPodcasts(podcasts.map(p => p.id === pod.id ? { ...p, duration: e.target.value } : p))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-white/30 uppercase">DESCRIPTION_BLOB</label>
                                            <textarea value={pod.description} onChange={e => setPodcasts(podcasts.map(p => p.id === pod.id ? { ...p, description: e.target.value } : p))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white h-20 resize-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-white/30 uppercase">EMBED_SIGNAL_URL_OR_KEY</label>
                                            <input value={pod.embedSrc} onChange={e => setPodcasts(podcasts.map(p => p.id === pod.id ? { ...p, embedSrc: e.target.value } : p))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white font-mono" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-10 border-t border-white/10 flex justify-between items-center">
                                <button onClick={() => { if(confirm('WIPE ALL FEED NODES?')) setPodcasts([]) }} className="text-[9px] text-red-500/40 hover:text-red-500 font-black uppercase tracking-widest">[ PURGE_ALL_FEEDS ]</button>
                                <ControlButton onClick={handleSavePodcasts} className="bg-red-600 hover:bg-red-500 text-white px-10 h-14 text-[11px] font-black tracking-widest">COMMIT_FEED_CHANGES</ControlButton>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'system' && (
                        <motion.div key="sys" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter border-b border-white/5 pb-6">Global_Core_Identity</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <SpeakerWaveIcon className="w-5 h-5 text-red-500" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Atmospheric_Harmonics</h3>
                                    </div>
                                    <p className="text-xs text-white/40 leading-relaxed">Inject a custom audio signal to override the global system ambiance. Supports MP3/WAV.</p>
                                    <div className="relative group">
                                        <input type="file" accept="audio/*" onChange={handleThemeMusicUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="w-full py-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 group-hover:border-red-500/40 transition-all bg-white/[0.02]">
                                            <div className="text-3xl">🔊</div>
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{themeMusicKey ? 'OVERRIDE_ACTIVE' : 'UPLOAD_SIGNAL'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                                        <div 
                                            onClick={() => setIsGlobalBroadcast(!isGlobalBroadcast)}
                                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isGlobalBroadcast ? 'bg-green-500' : 'bg-white/20'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-md transition-transform ${isGlobalBroadcast ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-white tracking-wider">GLOBAL BROADCAST</span>
                                            <span className="text-[9px] text-white/40">
                                                {isGlobalBroadcast 
                                                    ? "System is prioritizing local file (public/background-music.mp3)" 
                                                    : "Apply upload to your personal profile only"}
                                            </span>
                                        </div>
                                    </div>

                                    {themeMusicKey && (
                                        <button onClick={() => { setThemeMusicKey(undefined); updateThemeMusic(undefined); }} className="text-[8px] text-red-500 font-bold uppercase tracking-widest">[ PURGE_OVERRIDE ]</button>
                                    )}

                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4">Neural Buffer Control</h3>
                                        <button 
                                            onClick={handlePurgeAudioCache}
                                            className="w-full py-4 bg-red-600/10 border border-red-600 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-lg"
                                        >
                                            [ PURGE_AUDIO_ARCHIVES ]
                                        </button>
                                        <p className="text-[9px] text-white/20 mt-3 text-center uppercase">Forces regeneration of all briefings & intros</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <TargetIcon className="w-5 h-5 text-red-500" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Visual_Branding_Node</h3>
                                    </div>
                                    <p className="text-xs text-white/40 leading-relaxed">Customize the primary system logo used in the mission control header.</p>
                                    <div className="relative group">
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', (b) => { setSystemLogo(b); updateSystemLogo(b); })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="w-full py-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 group-hover:border-red-500/40 transition-all bg-white/[0.02]">
                                            {systemLogo ? <img src={systemLogo} className="w-12 h-12 object-contain" alt="Custom Logo" /> : <div className="text-3xl">🎨</div>}
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">UPLOAD_SVG/PNG</span>
                                        </div>
                                    </div>
                                    {systemLogo && (
                                        <button onClick={() => { setSystemLogo(undefined); updateSystemLogo(undefined); }} className="text-[8px] text-red-500 font-bold uppercase tracking-widest">[ RESET_IDENTITY ]</button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'flashcards' && (
                         <motion.div key="flash" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                             <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Memory_Database_Override</h2>
                                <p className="text-[9px] text-white/30 uppercase tracking-widest">Overriding: SPI_CORE_V1</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {PRE_GENERATED_FLASHCARDS.map((card, idx) => {
                                    const override = flashcardOverrides[idx] || {};
                                    return (
                                        <div key={idx} className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Node_{String(idx+1).padStart(3, '0')}</span>
                                                <span className="text-[8px] text-white/20 uppercase italic">Ref: {card.term}</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[8px] text-white/30 uppercase">OVERRIDE_TERM</label>
                                                    <input 
                                                        placeholder={card.term}
                                                        value={override.term || ''} 
                                                        onChange={e => {
                                                            const newOverrides = [...flashcardOverrides];
                                                            newOverrides[idx] = { ...override, term: e.target.value };
                                                            setFlashcardOverrides(newOverrides);
                                                        }} 
                                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[8px] text-white/30 uppercase">OVERRIDE_DEF</label>
                                                    <input 
                                                        placeholder={card.definition.substring(0, 30) + '...'}
                                                        value={override.definition || ''} 
                                                        onChange={e => {
                                                            const newOverrides = [...flashcardOverrides];
                                                            newOverrides[idx] = { ...override, definition: e.target.value };
                                                            setFlashcardOverrides(newOverrides);
                                                        }} 
                                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="pt-10 border-t border-white/10 flex justify-end">
                                <ControlButton onClick={() => { updateFlashcardOverrides(flashcardOverrides); setStatusMessage({ text: "MEMORY_BUFFER_UPDATED", type: 'success' }); }} className="bg-red-600 hover:bg-red-500 text-white px-10 h-14 text-[11px] font-black tracking-widest">COMMIT_MEMORY_WIPE</ControlButton>
                            </div>
                         </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tactical Footer Overlay */}
            <div className="pt-12 text-center opacity-20 flex flex-col items-center gap-4">
                <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.5em]">
                    <span>LINK: STABLE</span>
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <span>ENCRYPTION: AES-256</span>
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <span>ROOT_ACCESS: ENABLED</span>
                </div>
                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>
        </div>
    );
};

export default AdminPortal;
