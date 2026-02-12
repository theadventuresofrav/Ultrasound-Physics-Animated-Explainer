import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { CourseModuleData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { spiCoursesExpanded } from '../spi-course-data';
import EchoBotMascot from './EchoBotMascot';

interface AIAssistantProps {
  activeModule: CourseModuleData | null;
}

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

// Helper to extract text from React Elements
function extractTextFromContent(content: any): string {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return String(content);
    if (Array.isArray(content)) return content.map(extractTextFromContent).join(' ');
    if (React.isValidElement(content)) {
        const props = content.props as any;
        if (props.children) return extractTextFromContent(props.children);
    }
    return '';
}

const ID_MAPPING: Record<string, string> = {
    'waves': '1', 'transducers': '2', 'pulsed': '3', 'doppler': '4', 'artifacts': '5', 'safety': '6',
    'hemodynamics': '7', 'qa': '8', 'resolution': '9', 'harmonics': '10', 'processing': '11',
};

const getModuleContent = (activeModule: CourseModuleData | null): string => {
    if (!activeModule) return "Dashboard view.";
    const mappedId = ID_MAPPING[activeModule.id];
    let richContent = '';
    if (mappedId) {
        const module = spiCoursesExpanded.courses[0].modules.find(m => m.id === mappedId);
        if (module) {
            richContent += `MODULE: ${module.title}\n`;
            module.topics.forEach(t => richContent += `${t.title}: ${extractTextFromContent(t.content)}\n`);
        }
    }
    return richContent || activeModule.description;
};

const AIAssistant: React.FC<AIAssistantProps> = ({ activeModule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    const moduleContent = getModuleContent(activeModule);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { 
          systemInstruction: `You are EchoBot, an elite ultrasound physics AI. Precise, professional, encouraging. Context: ${moduleContent}`
      },
    });
  }, [activeModule]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, isLoading, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatRef.current) return;
    const userMsg = input;
    setHistory(prev => [...prev, { role: 'user', content: userMsg }, { role: 'model', content: '' }]);
    setInput('');
    setIsLoading(true);

    try {
        const result = await chatRef.current.sendMessageStream({ message: userMsg });
        let fullResponse = "";
        for await (const chunk of result) {
            fullResponse += chunk.text || "";
            setHistory(prev => {
                const h = [...prev];
                h[h.length - 1].content = fullResponse;
                return h;
            });
        }
    } catch (e) {
      setHistory(prev => [...prev.slice(0, -1), { role: 'model', content: 'Connection severed. Re-link signal.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center z-[100] bg-[#0f0f0f] border-2 border-[var(--gold)] shadow-2xl"
      >
        {isOpen ? <span className="text-xl text-[var(--gold)]">✕</span> : <EchoBotMascot size={40} isThinking={isLoading} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-3 sm:bottom-28 sm:right-8 w-[calc(100vw-24px)] sm:w-[400px] h-[60vh] sm:h-[600px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-[var(--gold)]/20 rounded-3xl shadow-2xl flex flex-col z-[99] overflow-hidden"
          >
            <header className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <EchoBotMascot size={28} />
                <div className="min-w-0">
                    <h3 className="font-black text-xs text-white uppercase tracking-widest">EchoBot</h3>
                    <p className="text-[8px] font-mono text-white/30 uppercase truncate">Secure_Link: Active</p>
                </div>
              </div>
              {/* Dynamic Wave Visualizer */}
              <div className="flex items-end gap-[2px] h-4">
                  {[...Array(6)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="w-[2px] bg-[var(--gold)] rounded-full"
                        animate={isLoading ? { height: [2, 16, 2] } : { height: 2 }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                      />
                  ))}
              </div>
            </header>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {history.length === 0 && <p className="text-xs text-white/30 text-center mt-20 italic">Neural link established. Awaiting query...</p>}
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[var(--gold)] text-black font-bold' : 'bg-white/10 text-white/90 border border-white/5'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <footer className="p-3 bg-black/40 border-t border-white/10">
              <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                <input
                  type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Query physics core..."
                  className="flex-grow bg-transparent px-3 text-white placeholder-white/20 focus:outline-none text-xs"
                  disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="w-8 h-8 flex items-center justify-center bg-[var(--gold)] text-black rounded-lg disabled:opacity-30">
                    <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;