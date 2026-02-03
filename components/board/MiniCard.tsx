
import React from 'react';
import { RetroItem, User, VotingConfig } from '../../types';

interface MiniCardProps {
    item: RetroItem;
    currentUser: User;
    isVotingActive: boolean;
    votingConfig?: VotingConfig;
    onItemClick: (item: RetroItem) => void;
    dragHandlers: {
        handleDragStart: (e: React.DragEvent, itemId: string) => void;
    };
}

export const MiniCard: React.FC<MiniCardProps> = ({ item, currentUser, isVotingActive, onItemClick, dragHandlers }) => {
    const userVotes = (item.votes || {})[currentUser.id] || 0;
    
    return (
        <div 
            draggable
            onDragStart={(e) => dragHandlers.handleDragStart(e, item.id)}
            onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
            className="w-[108px] h-[120px] bg-white rounded border border-[#DFE1E6] shadow-sm flex flex-col shrink-0 cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative"
        >
            <div className="h-1 w-full shrink-0" style={{ backgroundColor: item.author_color || '#DFE1E6' }}></div>
            <div className="p-2 flex-1 overflow-hidden">
                <p className="text-[10px] text-[#172B4D] leading-tight line-clamp-5">{item.content}</p>
            </div>
            
            {/* Voting Result Badge for Mini Card */}
            {(isVotingActive || userVotes > 0) && userVotes > 0 && (
                 <div className="absolute top-1 right-1 z-30 bg-[#0052CC] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {userVotes}
                 </div>
            )}

            <div className="h-5 border-t border-[#F4F5F7] flex items-center justify-center shrink-0">
                <div className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center" style={{ backgroundColor: item.author_color || '#DFE1E6' }}>
                    {(item.author_name || 'U').charAt(0)}
                </div>
            </div>
        </div>
    );
};
