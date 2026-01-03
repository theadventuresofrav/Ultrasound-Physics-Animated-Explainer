
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { PodcastEpisode, AIFlashcard, SimulationMedium } from '../types';
import ControlButton from './demos/ControlButton';
import { PRE_GENERATED_FLASHCARDS } from '../flashcard-data';
import { CheckCircleIcon } from './Icons';

const AdminPortal: React.FC = () => {
    const { userProfile, updatePodcasts, updateFlashcardOverrides, toggleAdmin, updateSystemLogo, updateSimulationMedia } = useUser();
    const [activeTab, setActiveTab] = useState<'podcasts' | 'flashcards' | 'simulation' | 'system'>('simulation');
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [podcasts, setPodcasts] = useState<PodcastEpisode[]>(userProfile?.systemOverrides.podcasts || []);
    const [flashcardOverrides, setFlashcardOverrides] = useState<Partial<AIFlashcard>[]>(userProfile?.systemOverrides.flashcards || []);
    const [customMedia, setCustomMedia] = useState<SimulationMedium[]>(userProfile?.systemOverrides.customMedia || []);
    const [systemLogo, setSystemLogo] = useState<string | undefined>(userProfile?.systemOverrides.systemLogo);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image', callback: (base64: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const base64 = await toBase64(file);
            callback(base64);
            setStatusMessage({ text: `UPLOAD_SYNC_COMPLETE: ${file.name.toUpperCase()}`, type: 'success' });
        } catch (err) {
            setStatusMessage({ text: "ERR: PAYLOAD_TOO_LARGE", type: 'error' });
        }
    };

    const handleAddMedium = () => {
        setCustomMedia([...customMedia, { id: `med-${Date.now()}`, name: 'NEW_TISSUE', speed: 1540, impedance: 1.6, attenuation: 0.5, color: '#ffffff' }]);
    };

    const handleSaveMedia = () => {
        updateSimulationMedia(customMedia);
        setStatusMessage({ text: "PHYSICS_MATRIX_STABILIZED", type: 'success' });
    };

    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border-2 transition-all duration-300 ${activeTab === id ? 'bg-red-500 border-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'text-white/40 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-8 sm:p-12 max-w-7xl mx-auto space-y-10 animate-fade-in relative min-h-screen font-mono">
            <AnimatePresence>
                {statusMessage && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`fixed top-12 right-12 z-[300] px-6 py-4 rounded-xl border-2 shadow-2xl backdrop-blur-3xl flex items-center gap-4 ${statusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}
                    >
                        <div className={`w-2 h-2 rounded-full animate-ping ${statusMessage.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-xs font-black uppercase tracking-widest">{statusMessage.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/10 pb-8 gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_20px_red]" />
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Root_Terminal</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <p className="text-white/30 text-[10px] uppercase tracking-[0.4em]">Kernel_Link: ESTABLISHED</p>
                        <p className="text-white/30 text-[10px] uppercase tracking-[0.4em]">Auth_Level: OMEGA</p>
                    </div>
                </div>
                <button onClick={toggleAdmin} className="text-[10px] font-black text-red-500 hover:text-red-400 transition-colors uppercase border-b-2 border-red-500/20 hover:border-red-500 pb-1 tracking-[0.2em]">[ DISCONNECT_SESSION ]</button>
            </header>

            <nav className="flex flex-wrap gap-3">
                <TabButton id="simulation" label="Physics_Matrix" />
                <TabButton id="podcasts" label="Audio_Assets" />
                <TabButton id="flashcards" label="Memory_Nodes" />
                <TabButton id="system" label="System_Identity" />
            </nav>

            <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/[0.02] blur-[150px] pointer-events-none rounded-full" />
                
                {activeTab === 'simulation' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Global_Tissue_Registry</h2>
                            <ControlButton onClick={handleAddMedium} secondary className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50">+ Initialize New Medium</ControlButton>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {customMedia.map((med) => (
                                <motion.div 
                                    key={med.id} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-5 gap-6 items-end group hover:bg-white/[0.05] transition-all"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Descriptor</label>
                                        <input value={med.name} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, name: e.target.value.toUpperCase() } : m))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:border-red-500/50 focus:outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Velocity (m/s)</label>
                                        <input type="number" value={med.speed} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, speed: Number(e.target.value) } : m))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:border-red-500/50 focus:outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Acoustic_Z</label>
                                        <input type="number" value={med.impedance} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, impedance: Number(e.target.value) } : m))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:border-red-500/50 focus:outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Atten_Coeff</label>
                                        <input type="number" step="0.01" value={med.attenuation} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, attenuation: Number(e.target.value) } : m))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:border-red-500/50 focus:outline-none" />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-grow space-y-2">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Sig_Color</label>
                                            <input type="color" value={med.color} onChange={e => setCustomMedia(customMedia.map(m => m.id === med.id ? { ...m, color: e.target.value } : m))} className="w-full h-9 bg-transparent cursor-pointer rounded overflow-hidden" />
                                        </div>
                                        <button onClick={() => setCustomMedia(customMedia.filter(m => m.id !== med.id))} className="px-3 h-9 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all uppercase text-[10px] font-black">✕</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        
                        <div className="pt-10 border-t border-white/10 flex justify-end">
                            <ControlButton onClick={handleSaveMedia} className="bg-red-600 hover:bg-red-500 text-white px-10 h-14 text-sm font-black tracking-[0.2em] shadow-[0_0_40px_rgba(239,68,68,0.2)]">SYNCHRONIZE_MATRIX</ControlButton>
                        </div>
                    </div>
                )}

                {activeTab === 'podcasts' && (
                    <div className="space-y-10 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Audio_Buffer_Queue</h2>
                            <ControlButton onClick={() => setPodcasts([...podcasts, { id: Date.now().toString(), title: 'NEW_PAYLOAD', duration: '00:00', description: '', link: '', isNew: true, embedSrc: '' }])} secondary className="bg-red-500/10 border-red-500/30 text-red-400">+ Add Signal Node</ControlButton>
                        </div>
                        <div className="space-y-4">
                            {podcasts.map(ep => (
                                <div key={ep.id} className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 flex gap-6 items-center">
                                    <div className="space-y-2 flex-grow">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Payload_Title</label>
                                        <input value={ep.title} onChange={e => setPodcasts(podcasts.map(p => p.id === ep.id ? {...p, title: e.target.value.toUpperCase()} : p))} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" placeholder="NODE_TITLE" />
                                    </div>
                                    <div className="flex gap-2 pt-5">
                                        <input type="file" className="hidden" id={`aud-${ep.id}`} onChange={e => handleFileUpload(e, 'audio', b64 => setPodcasts(podcasts.map(p => p.id === ep.id ? {...p, embedSrc: b64} : p)))} />
                                        <ControlButton secondary onClick={() => document.getElementById(`aud-${ep.id}`)?.click()} className="text-[10px] h-10 px-6">{ep.embedSrc ? 'PAYLOAD_LOADED' : 'BUFFER_PAYLOAD'}</ControlButton>
                                        <button onClick={() => setPodcasts(podcasts.filter(p => p.id !== ep.id))} className="text-red-500 border border-red-500/20 bg-red-500/5 px-4 rounded-lg hover:bg-red-500 hover:text-white transition-all">✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-10 border-t border-white/10 flex justify-end">
                            <ControlButton onClick={() => { updatePodcasts(podcasts); setStatusMessage({ text: 'AUDIO_CATALOG_COMMITTED', type: 'success' }); }} className="bg-red-600 text-white px-10 h-14 font-black tracking-[0.2em]">COMMIT_SIGNAL_CATALOG</ControlButton>
                        </div>
                    </div>
                )}

                {activeTab === 'flashcards' && (
                    <div className="space-y-10 animate-fade-in">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Memory_Override_Matrix</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {PRE_GENERATED_FLASHCARDS.map((card, idx) => (
                                <div key={idx} className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">NODE_ID: {idx}</span>
                                        <span className="text-[8px] font-mono text-white/20">{card.term.substring(0, 15)}...</span>
                                    </div>
                                    <input placeholder="TERM_OVERRIDE" value={flashcardOverrides[idx]?.term || ''} onChange={e => {
                                        const newOv = [...flashcardOverrides];
                                        newOv[idx] = { ...(newOv[idx] || {}), term: e.target.value.toUpperCase() };
                                        setFlashcardOverrides(newOv);
                                    }} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs text-white" />
                                    <input type="file" className="hidden" id={`card-${idx}`} onChange={e => handleFileUpload(e, 'image', b64 => {
                                        const newOv = [...flashcardOverrides];
                                        newOv[idx] = { ...(newOv[idx] || {}), frontImage: b64 };
                                        setFlashcardOverrides(newOv);
                                    })} />
                                    <ControlButton secondary fullWidth onClick={() => document.getElementById(`card-${idx}`)?.click()} className="text-[10px] h-10">
                                        {flashcardOverrides[idx]?.frontImage ? 'VISUAL_ASSET_LINKED' : 'LINK_VISUAL_ASSET'}
                                    </ControlButton>
                                </div>
                            ))}
                        </div>
                        <div className="pt-10 border-t border-white/10 flex justify-end">
                            <ControlButton onClick={() => { updateFlashcardOverrides(flashcardOverrides); setStatusMessage({ text: 'MEMORY_NODES_COMMITTED', type: 'success' }); }} className="bg-red-600 text-white px-10 h-14 font-black tracking-[0.2em]">COMMIT_OVERRIDES</ControlButton>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="space-y-12 animate-fade-in flex flex-col items-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter w-full">System_Branding_Module</h2>
                        <div className="w-full max-w-lg bg-white/[0.03] p-12 rounded-[3rem] border border-white/5 flex flex-col items-center gap-8 shadow-2xl">
                            <div className="relative group">
                                {systemLogo ? (
                                    <img src={systemLogo} className="w-48 h-48 object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" />
                                ) : (
                                    <div className="w-48 h-48 bg-black/60 rounded-[2.5rem] border-2 border-dashed border-white/10 flex items-center justify-center opacity-20 text-xs">VOID_LOGO</div>
                                )}
                                <div className="absolute inset-0 bg-red-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            
                            <div className="flex flex-col gap-3 w-full">
                                <input type="file" className="hidden" id="logo-up" onChange={e => handleFileUpload(e, 'image', b64 => setSystemLogo(b64))} />
                                <ControlButton onClick={() => document.getElementById('logo-up')?.click()} fullWidth className="h-14 font-black tracking-widest">SWAP_SIGNATURE</ControlButton>
                                <ControlButton secondary onClick={() => { updateSystemLogo(systemLogo); setStatusMessage({ text: 'BRANDING_COMMITTED', type: 'success' }); }} fullWidth className="h-14 font-black tracking-widest">COMMIT_CHANGES</ControlButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <footer className="pt-10 flex justify-center opacity-20">
                <p className="text-[10px] tracking-[1em] uppercase">ECHO_MASTERS_OS_V5_STABLE</p>
            </footer>
        </div>
    );
};

export default AdminPortal;
