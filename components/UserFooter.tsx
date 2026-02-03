
import React, { useState } from 'react';
import { Hand, User as UserIcon, AlertTriangle, X } from 'lucide-react';
import { User } from '../types';

interface UserFooterProps {
  currentUser: User;
  participants: User[];
  onRaiseHand: () => void;
  onLowerAllHands: () => void;
}

export const UserFooter: React.FC<UserFooterProps> = ({ currentUser, participants, onRaiseHand, onLowerAllHands }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Sort: Hand raised first (by time), then others
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isHandRaised && !b.isHandRaised) return -1;
    if (!a.isHandRaised && b.isHandRaised) return 1;
    if (a.isHandRaised && b.isHandRaised) {
        return (a.handRaisedAt || 0) - (b.handRaisedAt || 0);
    }
    return 0;
  });

  return (
    <>
      <div className="relative h-16 bg-white border-t border-[#DFE1E6] flex items-center px-6 justify-between shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-30">
        
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar mask-gradient-right">
             <span className="text-xs font-bold text-[#5E6C84] uppercase whitespace-nowrap">Participants ({participants.length})</span>
             
             {sortedParticipants.map(p => (
                 <div 
                   key={p.id} 
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${p.isHandRaised ? 'bg-[#EAE6FF] border-[#6554C0]' : 'bg-white border-[#DFE1E6]'} ${p.id === currentUser.id ? 'ring-2 ring-offset-1 ring-[#0052CC]/20' : ''}`}
                 >
                     <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ backgroundColor: p.color }}
                     >
                         {p.name.charAt(0)}
                     </div>
                     <span className={`text-sm font-medium ${p.isHandRaised ? 'text-[#403294]' : 'text-[#172B4D]'}`}>{p.name} {p.id === currentUser.id && '(You)'}</span>
                     {p.isHandRaised && <Hand size={14} className="text-[#6554C0]" />}
                 </div>
             ))}
        </div>

        <div className="pl-4 border-l border-[#DFE1E6] ml-4 flex items-center gap-2">
            <button 
                onClick={() => setIsConfirmOpen(true)}
                className="text-xs font-bold text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] px-3 py-2 rounded-lg transition-colors"
            >
                Lower all Hands
            </button>
            <button 
                onClick={onRaiseHand}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all transform active:scale-95 ${currentUser.isHandRaised ? 'bg-[#FF5630] text-white hover:bg-[#DE350B]' : 'bg-[#0052CC] text-white hover:bg-[#0747A6]'}`}
            >
                <Hand size={16} className={currentUser.isHandRaised ? "animate-pulse" : ""} />
                {currentUser.isHandRaised ? "Lower Hand" : "Raise Hand"}
            </button>
        </div>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[1px]">
             <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#FAFBFC]">
                    <h3 className="font-semibold text-[#172B4D] flex items-center gap-2">
                        <AlertTriangle size={16} className="text-[#FF991F]" />
                        Lower All Hands?
                    </h3>
                    <button onClick={() => setIsConfirmOpen(false)}><X size={18} className="text-[#5E6C84]" /></button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-[#172B4D]">This will lower the hands of all participants. Are you sure you want to proceed?</p>
                </div>
                <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] flex justify-end gap-2">
                    <button onClick={() => setIsConfirmOpen(false)} className="px-3 py-1.5 text-sm font-medium text-[#42526E] hover:bg-[#EBECF0] rounded">Cancel</button>
                    <button 
                        onClick={() => { onLowerAllHands(); setIsConfirmOpen(false); }} 
                        className="px-3 py-1.5 text-sm font-bold text-white bg-[#FF5630] hover:bg-[#DE350B] rounded"
                    >
                        Lower All
                    </button>
                </div>
             </div>
        </div>
      )}
    </>
  );
};
