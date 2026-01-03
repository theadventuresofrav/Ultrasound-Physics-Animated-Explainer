
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseModule from './CourseModule';
import { COURSE_MODULES } from '../constants';
import { DemoId, UserProfile, UserResource } from '../types';
import { useUser } from '../contexts/UserContext';
import ControlButton from './demos/ControlButton';
import { CheckCircleIcon } from './Icons';

export type FilterType = 'All' | 'In Progress' | 'Completed' | 'Premium' | 'Clinical' | 'Advanced' | 'New!' | 'Professional' | 'Resource' | 'Game' | 'Challenge';

interface CourseGridProps {
    activeFilter: FilterType;
    onModuleClick: (moduleId: DemoId) => void;
    userProfile: UserProfile | null;
    limitToIds?: DemoId[];
}

const UserResourceCard: React.FC<{ resource: UserResource, onDelete: (id: string) => void }> = ({ resource, onDelete }) => {
    const icon = resource.category === 'PDF' ? '📄' : resource.category === 'Image' ? '🖼️' : '📁';
    const accent = resource.category === 'PDF' ? '#ef4444' : resource.category === 'Image' ? '#22c55e' : '#3b82f6';

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = resource.data;
        link.download = resource.name;
        link.click();
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 overflow-hidden transition-all hover:border-white/30 hover:bg-white/[0.03]"
        >
            <div className="absolute top-0 left-0 right-0 h-1 z-20 transition-opacity" style={{ backgroundColor: accent, opacity: 0.4 }} />
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-2xl shadow-inner bg-white/5">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-white leading-tight truncate">{resource.name}</h3>
                    <p className="text-[9px] font-mono text-white/30 mt-1 uppercase tracking-wider">
                        {resource.size} // {new Date(resource.timestamp).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="flex gap-2 mt-auto">
                <button onClick={handleDownload} className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white transition-all">Download</button>
                <button onClick={() => onDelete(resource.id)} className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </motion.div>
    );
};

const CourseGrid: React.FC<CourseGridProps> = ({ activeFilter, onModuleClick, userProfile, limitToIds }) => {
    const { addUserResource, deleteUserResource } = useUser();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to clear status messages after a delay
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (uploadSuccess) {
            timer = setTimeout(() => setUploadSuccess(false), 3000);
        } else if (error) {
            timer = setTimeout(() => setError(null), 4000);
        }
        return () => clearTimeout(timer);
    }, [uploadSuccess, error]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple check for browser memory safety with base64 strings
        if (file.size > 15 * 1024 * 1024) {
            setError("PAYLOAD_TOO_LARGE_MAX_15MB");
            e.target.value = '';
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setError(null);
        setUploadSuccess(false);

        // Simulate initial verification phase
        await new Promise(r => setTimeout(r, 600));

        // Simulate upload progress for tactical feel
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) return prev;
                return prev + Math.floor(Math.random() * 12) + 5;
            });
        }, 150);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const base64 = event.target?.result as string;
                const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                const category = file.type.includes('pdf') ? 'PDF' : file.type.includes('image') ? 'Image' : 'Document';
                
                // Finalize upload with a small delay for visual satisfaction
                setTimeout(() => {
                    clearInterval(progressInterval);
                    setUploadProgress(100);
                    addUserResource({
                        id: `user-res-${Date.now()}`,
                        name: file.name,
                        type: file.type,
                        data: base64,
                        size: sizeInMB,
                        timestamp: Date.now(),
                        category: category as any
                    });
                    setUploading(false);
                    setUploadSuccess(true);
                }, 800);
            } catch (err) {
                clearInterval(progressInterval);
                setError("DATA_SYNC_CORRUPTED");
                setUploading(false);
            }
        };
        reader.onerror = () => {
            clearInterval(progressInterval);
            setError("READ_FAILURE");
            setUploading(false);
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset input
    };

    const filteredModules = useMemo(() => {
        let base = COURSE_MODULES;
        if (limitToIds) {
            base = base.filter(m => limitToIds.includes(m.id));
        }

        const completed = userProfile?.completedModules || [];
        switch (activeFilter) {
            case 'In Progress':
                return base.filter(m => !completed.includes(m.id));
            case 'Completed':
                return base.filter(m => completed.includes(m.id));
            case 'Premium':
                return base.filter(m => ['Premium', 'Interactive'].includes(m.status));
            case 'Advanced':
            case 'Clinical':
            case 'New!':
            case 'Professional':
            case 'Resource':
            case 'Game':
            case 'Challenge':
                 return base.filter(m => m.status === activeFilter);
            case 'All':
            default:
                return base;
        }
    }, [activeFilter, userProfile, limitToIds]);

    const showUserResources = (activeFilter === 'Resource' || activeFilter === 'All') && !limitToIds;

    return (
        <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 pb-4 relative"
        >
            <AnimatePresence mode="popLayout" initial={false}>
                {showUserResources && (
                    <motion.div
                        key="upload-dropzone"
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="h-full"
                    >
                        <div className={`relative h-full flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] p-8 group transition-all duration-500 cursor-pointer overflow-hidden min-h-[260px] ${
                            uploading ? 'border-cyan-500/40 bg-cyan-500/5 shadow-[inset_0_0_30px_rgba(34,211,238,0.05)]' : 
                            error ? 'border-red-500/40 bg-red-500/5' : 
                            uploadSuccess ? 'border-green-500/40 bg-green-500/5 shadow-[inset_0_0_30px_rgba(34,197,94,0.05)]' : 
                            'border-white/10 bg-white/[0.02] hover:border-[var(--gold)]/40 hover:bg-white/[0.04]'
                        }`}>
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--gold-dim),_transparent_70%)] opacity-0 group-hover:opacity-10 transition-opacity" />
                             
                             {/* Floating Status Badge */}
                             <AnimatePresence>
                                {(uploadSuccess || error) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border z-30 ${
                                            uploadSuccess ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400'
                                        }`}
                                    >
                                        {uploadSuccess ? 'Link Synchronized' : 'Uplink Error'}
                                    </motion.div>
                                )}
                             </AnimatePresence>

                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileUpload} accept=".pdf,image/*,.doc,.docx" disabled={uploading} />
                             
                             <div className="relative z-10 w-full flex flex-col items-center">
                                <div className={`w-20 h-20 rounded-[1.75rem] border flex items-center justify-center text-3xl mb-6 transition-all duration-500 relative ${
                                    uploading ? 'border-cyan-400/50 bg-black/40' : 
                                    error ? 'border-red-400/50 bg-black/40' : 
                                    uploadSuccess ? 'border-green-400/50 bg-black/40' : 
                                    'border-white/10 bg-white/5 group-hover:scale-110 group-hover:border-[var(--gold)]/30'
                                }`}>
                                    {uploading ? (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-1 border-t-2 border-cyan-400 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-3 border-b-2 border-cyan-400/30 rounded-full"
                                            />
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="text-[10px] font-black font-mono text-cyan-400">{uploadProgress}%</span>
                                            </div>
                                        </div>
                                    ) : error ? (
                                        <motion.span 
                                            initial={{ scale: 0.5, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                        >
                                            ⚠️
                                        </motion.span>
                                    ) : uploadSuccess ? (
                                        <motion.span 
                                            initial={{ scale: 0.5, y: 10 }}
                                            animate={{ scale: 1, y: 0 }}
                                            className="drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                        >
                                            ✅
                                        </motion.span>
                                    ) : (
                                        <span className="text-white/40 group-hover:text-[var(--gold)] transition-colors">📁</span>
                                    )}
                                </div>

                                <div className="text-center space-y-3 w-full">
                                    <h4 className={`text-xl font-black uppercase tracking-tight transition-colors duration-500 ${
                                        uploading ? 'text-cyan-400' : 
                                        error ? 'text-red-400 font-mono text-sm' : 
                                        uploadSuccess ? 'text-green-400 font-black' : 
                                        'text-white group-hover:text-[var(--gold)]'
                                    }`}>
                                        {uploading ? 'Synching Data...' : error ? error : uploadSuccess ? 'Buffer Committed' : 'Personal Vault'}
                                    </h4>
                                    
                                    <div className="h-6 flex flex-col items-center justify-center w-full px-4">
                                        <AnimatePresence mode="wait">
                                            {uploading ? (
                                                <motion.div 
                                                    key="prog" initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0 }}
                                                    className="w-full h-1.5 bg-white/5 rounded-full relative overflow-hidden"
                                                >
                                                    <motion.div 
                                                        className="h-full bg-cyan-500 shadow-[0_0_15px_#22d3ee] rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${uploadProgress}%` }}
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                </motion.div>
                                            ) : (
                                                <motion.p 
                                                    key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className={`text-[9px] uppercase tracking-[0.35em] font-mono font-bold transition-colors ${
                                                        error ? 'text-red-500/60' : 
                                                        uploadSuccess ? 'text-green-500/60 animate-pulse' : 
                                                        'text-white/30 group-hover:text-white/50'
                                                    }`}
                                                >
                                                    {uploading ? '' : error ? 'Access Denied' : uploadSuccess ? 'Integrity Verified' : 'Ingest External Node'}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </motion.div>
                )}

                {showUserResources && userProfile?.userResources?.map(res => (
                    <UserResourceCard key={res.id} resource={res} onDelete={deleteUserResource} />
                ))}

                {filteredModules.map((module) => {
                    let score: number | undefined;
                    if (module.id === 'spi_mock_exam') score = userProfile?.quizScores.spiMockExam;
                    else if (module.id === 'study_guide' || module.id === 'jeopardy') score = userProfile?.quizScores.spi;

                    return (
                        <motion.div
                            key={module.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
                            className="h-full"
                        >
                            <CourseModule
                                {...module}
                                isCompleted={userProfile?.completedModules.includes(module.id)}
                                score={score}
                                onClick={() => onModuleClick(module.id)}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
};

export default CourseGrid;
