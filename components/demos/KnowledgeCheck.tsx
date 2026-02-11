
import React, { useState } from 'react';
// Added missing imports for motion and AnimatePresence from framer-motion
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import { useUser } from '../../contexts/UserContext';
import { DemoId } from '../../types';

interface KnowledgeCheckProps {
  moduleId?: DemoId;
  title?: string;
  description?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const KnowledgeCheck: React.FC<KnowledgeCheckProps> = ({ 
    moduleId, 
    title = "🧠 Proficiency Evaluation", 
    description = "Validate your understanding of the physical principles mapped in this unit. Successful synchronization completes the node.",
    question, 
    options, 
    correctAnswer, 
    explanation 
}) => {
  const { markModuleAsCompleted, awardAchievement } = useUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);

    if (option === correctAnswer && moduleId) {
        markModuleAsCompleted(moduleId);
        awardAchievement(moduleId);
    }
  };
  
  const handleReset = () => {
    setSelected(null);
    setShowResult(false);
  }

  return (
    <DemoSection 
        title={title} 
        description={description}
        objectives={["Analyze subject query", "Select verified hypothesis", "Synchronize memory buffer"]}
    >
      <p className="font-bold text-lg text-white/90 mb-8 border-l-4 border-[var(--gold)] pl-4 italic">"{question}"</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map(option => {
          const isCorrect = option === correctAnswer;
          const isSelected = option === selected;
          let buttonClass = 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-[var(--gold)]/40';
          if (showResult) {
            if (isCorrect) buttonClass = 'bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.1)]';
            else if (isSelected) buttonClass = 'bg-red-500/20 border-red-500 text-red-300';
            else buttonClass = 'bg-white/5 border border-white/5 text-white/20 opacity-50';
          }
          return (
            <button 
                key={option} 
                onClick={() => handleSelect(option)} 
                disabled={showResult} 
                className={`p-5 rounded-2xl text-left transition-all duration-300 w-full font-black uppercase tracking-widest text-[10px] ${buttonClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
      {showResult && (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-black/40 rounded-3xl animate-fade-in border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gold)]" />
          <h5 className="font-black text-[var(--gold)] uppercase tracking-[0.3em] text-[9px] mb-3">Post-Analysis_Briefing:</h5>
          <p className="text-white/80 text-sm leading-relaxed font-light">{explanation}</p>
           <div className="text-right mt-6">
            <button onClick={handleReset} className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 text-white/40 px-4 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all">
                [ Request New Evaluation ]
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </DemoSection>
  );
};

export default KnowledgeCheck;
