import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const Timer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("5");

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(parseInt(inputValue) * 60 || 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const mins = parseInt(inputValue);
    if (!isNaN(mins) && mins > 0) {
        setTimeLeft(mins * 60);
    } else {
        setInputValue("5");
        setTimeLeft(300);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-[#F4F5F7] px-3 py-1.5 rounded-lg border border-[#DFE1E6]">
      <div className="flex items-center gap-2">
        {isEditing ? (
            <div className="flex items-center">
                 <input 
                    type="number" 
                    value={inputValue} 
                    onChange={handleInputChange} 
                    onBlur={handleInputBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
                    autoFocus
                    className="w-12 px-1 py-0.5 text-center text-sm font-mono border rounded"
                 />
                 <span className="text-xs text-[#5E6C84] ml-1">min</span>
            </div>
        ) : (
            <span 
                onClick={() => !isActive && setIsEditing(true)}
                className={`font-mono font-bold text-lg min-w-[3.5rem] text-center cursor-pointer select-none ${timeLeft < 60 && isActive ? 'text-red-600 animate-pulse' : 'text-[#172B4D]'}`}
            >
              {formatTime(timeLeft)}
            </span>
        )}
      </div>
      
      <div className="h-4 w-px bg-[#DFE1E6] mx-1"></div>
      
      <button 
        onClick={toggleTimer} 
        className="p-1 hover:bg-[#EBECF0] rounded text-[#42526E] transition-colors"
        title={isActive ? "Pause" : "Start"}
      >
        {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
      </button>
      
      <button 
        onClick={resetTimer} 
        className="p-1 hover:bg-[#EBECF0] rounded text-[#42526E] transition-colors"
        title="Reset"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
};