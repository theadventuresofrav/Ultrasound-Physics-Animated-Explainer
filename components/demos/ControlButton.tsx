import React from 'react';
import { useSound } from '../../contexts/SoundContext';
import { motion } from 'framer-motion';

interface ControlButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  secondary?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ onClick, children, secondary = false, disabled = false, fullWidth = false, onMouseDown, onMouseUp, onMouseLeave, className }) => {
  const { playHover, playClick } = useSound();

  const handleClick = () => {
      if (!disabled) {
          playClick();
          onClick?.();
      }
  };

  const handleMouseEnter = () => {
      if (!disabled) {
          playHover();
      }
  };

  const baseClasses = `group relative px-6 py-3 rounded-xl font-black text-[10px] tracking-[0.25em] uppercase transition-all duration-500 active:scale-95 disabled:active:scale-100 flex items-center justify-center overflow-hidden border-2 ${fullWidth ? 'w-full' : ''}`;
  
  const primaryClasses = "bg-white text-black border-white hover:bg-[var(--gold)] hover:border-[var(--gold)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]";
  
  const secondaryClasses = "bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 backdrop-blur-md shadow-2xl";
  
  const disabledClasses = "opacity-20 cursor-not-allowed grayscale pointer-events-none";
  
  const finalClasses = [
    baseClasses,
    secondary ? secondaryClasses : primaryClasses,
    disabled ? disabledClasses : '',
    className
  ].join(' ');
  
  return (
    <button 
        onClick={handleClick} 
        onMouseEnter={handleMouseEnter}
        onMouseDown={onMouseDown} 
        onMouseUp={onMouseUp} 
        onMouseLeave={onMouseLeave} 
        disabled={disabled} 
        className={finalClasses}
    >
      {/* Animated Inner Shimmer */}
      {!disabled && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[size:250%_250%] animate-shimmer" />
        </div>
      )}

      {/* Decorative Corner Dots */}
      <div className="absolute top-1 left-1 w-0.5 h-0.5 rounded-full bg-current opacity-20" />
      <div className="absolute bottom-1 right-1 w-0.5 h-0.5 rounded-full bg-current opacity-20" />

      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default ControlButton;