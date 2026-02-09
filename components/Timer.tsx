import React, { useState } from 'react';
import { Timer as TimerIcon, Play, Pause, RotateCcw, ChevronDown } from 'lucide-react';
import { TimerConfig } from '../types';

interface TimerProps {
  timer?: TimerConfig;
  remainingTime: number | null;
  onStart: (duration: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  timer,
  remainingTime,
  onStart,
  onPause,
  onResume,
  onReset,
}) => {
  const [showPresets, setShowPresets] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const presets = [
    { label: '1m', value: 60 },
    { label: '3m', value: 180 },
    { label: '5m', value: 300 },
    { label: '10m', value: 600 },
  ];

  const isRunning = timer?.status === 'running';
  const isPaused = timer?.status === 'paused';
  const hasStarted = isRunning || isPaused;

  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');

  const handleStartCustom = () => {
    const mins = parseInt(customMinutes) || 0;
    const secs = parseInt(customSeconds) || 0;
    const totalSeconds = mins * 60 + secs;
    
    if (totalSeconds > 0) {
      onStart(totalSeconds);
      setShowPresets(false);
      setCustomMinutes('');
      setCustomSeconds('');
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-full border border-n40 px-3 py-1.5 shadow-sm">
      <div className={`p-1 rounded-full ${isRunning ? 'bg-g50 text-g200' : 'bg-n20 text-n300'}`}>
        <TimerIcon size={16} />
      </div>

      <div className="flex flex-col items-center min-w-[48px]">
        {remainingTime !== null ? (
          <span className={`text-sm font-bold tabular-nums ${remainingTime < 30 ? 'text-r300 animate-pulse' : 'text-n800'}`}>
            {formatTime(remainingTime)}
          </span>
        ) : (
          <span className="text-sm font-bold text-n300">--:--</span>
        )}
      </div>

      <div className="h-4 w-[1px] bg-n40 mx-1" />

      <div className="flex items-center gap-1">
        {!hasStarted ? (
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="p-1 rounded hover:bg-n20 text-n500 transition-colors flex items-center gap-0.5"
            >
              <Play size={14} />
              <ChevronDown size={10} />
            </button>
            {showPresets && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded shadow-xl border border-n40 z-[100] py-1 min-w-[160px]">
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowPresets(false)}></div>
                <div className="px-3 py-2 border-b border-n40 flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-n300 uppercase">Mins</label>
                        <input 
                            type="text" 
                            placeholder="0" 
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-10 text-xs border border-n40 rounded px-1 py-1 focus:ring-1 focus:ring-b200 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleStartCustom()}
                        />
                    </div>
                    <span className="mt-4 text-n300">:</span>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-n300 uppercase">Secs</label>
                        <input 
                            type="text" 
                            placeholder="00" 
                            value={customSeconds}
                            onChange={(e) => setCustomSeconds(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-10 text-xs border border-n40 rounded px-1 py-1 focus:ring-1 focus:ring-b200 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleStartCustom()}
                        />
                    </div>
                    <button 
                        onClick={handleStartCustom}
                        className="mt-4 p-1.5 bg-b400 text-white rounded hover:bg-b500 transition-colors shrink-0"
                    >
                        <Play size={12} fill="currentColor" />
                    </button>
                </div>
                {presets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      onStart(p.value);
                      setShowPresets(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-n10 font-medium text-n800"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {isRunning ? (
              <button
                onClick={onPause}
                className="p-1 rounded hover:bg-n20 text-n500 transition-colors"
                title="Pause"
              >
                <Pause size={14} />
              </button>
            ) : (
              <button
                onClick={onResume}
                className="p-1 rounded hover:bg-n20 text-n500 transition-colors"
                title="Resume"
              >
                <Play size={14} />
              </button>
            )}
            <button
              onClick={onReset}
              className="p-1 rounded hover:bg-n20 text-n500 transition-colors"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};