
import React, { useState } from 'react';
import { X, Vote } from 'lucide-react';
import { VotingConfig } from '../types';

interface VotingConfigDialogProps {
  onStart: (config: VotingConfig) => void;
  onClose: () => void;
}

export const VotingConfigDialog: React.FC<VotingConfigDialogProps> = ({ onStart, onClose }) => {
  const [votesPerParticipant, setVotesPerParticipant] = useState(6);
  const [anonymous, setAnonymous] = useState(true);
  const [allowMultiplePerCard, setAllowMultiplePerCard] = useState(true);

  const handleStart = () => {
    onStart({
      votesPerParticipant,
      anonymous,
      allowMultiplePerCard
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#FAFBFC]">
          <h3 className="font-semibold text-[#172B4D] flex items-center gap-2">
            <Vote size={18} className="text-[#0052CC]" />
            Start Voting Session
          </h3>
          <button onClick={onClose}><X size={18} className="text-[#5E6C84]" /></button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-2">Votes per Participant</label>
            <input 
              type="number" 
              min="1"
              max="20"
              value={votesPerParticipant} 
              onChange={(e) => setVotesPerParticipant(parseInt(e.target.value) || 1)}
              className="w-full border border-[#DFE1E6] rounded p-2 text-sm focus:ring-2 focus:ring-[#4C9AFF] focus:border-transparent outline-none"
            />
          </div>
          
          <div className="space-y-3">
             <label className="flex items-center gap-3 cursor-pointer group">
                 <input 
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
                 />
                 <div>
                     <span className="block text-sm font-medium text-[#172B4D]">Anonymous Voting</span>
                     <span className="block text-xs text-[#5E6C84]">Voters identities are hidden</span>
                 </div>
             </label>

             <label className="flex items-center gap-3 cursor-pointer group">
                 <input 
                    type="checkbox"
                    checked={allowMultiplePerCard}
                    onChange={(e) => setAllowMultiplePerCard(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
                 />
                 <div>
                     <span className="block text-sm font-medium text-[#172B4D]">Multiple votes per card</span>
                     <span className="block text-xs text-[#5E6C84]">Users can vote multiple times on one item</span>
                 </div>
             </label>
          </div>
        </div>

        <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] flex justify-end gap-2">
          <button onClick={onClose} className="px-2 py-1 text-xs font-medium text-[#42526E] hover:bg-[#EBECF0] rounded">Cancel</button>
          <button onClick={handleStart} className="px-2 py-1 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded shadow-sm">Start Voting</button>
        </div>
      </div>
    </div>
  );
};
