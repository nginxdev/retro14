
import React from 'react';
import { ThumbsUp, Minus } from 'lucide-react';
import { RetroItem, VotingConfig } from '../../types';

interface VoteControlProps {
    itemId: string;
    votes: number; // votes by current user
    allVotes: Record<string, number>;
    isVotingActive: boolean;
    votingConfig?: VotingConfig;
    userVotesUsed: number;
    onVote: (itemId: string, delta: 1 | -1) => void;
}

export const VoteControl: React.FC<VoteControlProps> = ({ itemId, votes, allVotes, isVotingActive, votingConfig, userVotesUsed, onVote }) => {
     const totalVotes = Object.values(allVotes || {}).reduce((a, b) => a + b, 0);
     
     if (!isVotingActive && totalVotes === 0) return null;

     if (isVotingActive) {
         const isMaxed = userVotesUsed >= (votingConfig?.votesPerParticipant || 6);

         return (
             <div className="flex items-center gap-1 bg-[#F4F5F7] hover:bg-[#EBECF0] rounded-full px-1.5 py-0.5 border border-[#DFE1E6] transition-colors">
                <button 
                    onClick={(e) => { e.stopPropagation(); onVote(itemId, 1); }}
                    disabled={isMaxed}
                    className={`flex items-center justify-center w-5 h-5 rounded-full hover:bg-white transition-colors ${votes > 0 ? 'text-[#0052CC]' : 'text-[#5E6C84]'}`}
                    title="Vote"
                >
                    <ThumbsUp size={12} className={votes > 0 ? "fill-current" : ""} />
                </button>
                
                {votes > 0 && (
                    <span className="text-[10px] font-bold text-[#0052CC] min-w-[8px] text-center">{votes}</span>
                )}
                
                {votes > 0 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onVote(itemId, -1); }}
                        className="flex items-center justify-center w-4 h-4 rounded-full text-red-500 hover:bg-red-50 ml-0.5"
                        title="Remove Vote"
                    >
                        <Minus size={10} />
                    </button>
                )}
             </div>
         );
     }

     // Voting ended, show results
     return (
         <div className="flex items-center gap-1 bg-[#E3FCEF] border border-[#ABF5D1] rounded-full px-1.5 py-0.5">
             <ThumbsUp size={10} className="text-[#006644] fill-current" />
             <span className="text-[10px] font-bold text-[#006644]">{totalVotes}</span>
         </div>
     );
};
