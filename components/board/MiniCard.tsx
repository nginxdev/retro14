
import React, { useState } from 'react';
import { RetroItem, User, VotingConfig } from '../../types';

interface MiniCardProps {
    item: RetroItem;
    currentUser: User;
    isVotingActive: boolean;
    votingConfig?: VotingConfig;
    onItemClick: (item: RetroItem) => void;
    onUpdateContent: (itemId: string, content: string) => void;
    dragHandlers: {
        handleDragStart: (e: React.DragEvent, itemId: string) => void;
    };
    isCardOverviewEnabled?: boolean;
}

export const MiniCard: React.FC<MiniCardProps> = ({ 
    item, currentUser, isVotingActive, onItemClick, onUpdateContent, dragHandlers, 
    isCardOverviewEnabled = true 
}) => {
    const userVotes = (item.votes || {})[currentUser.id] || 0;
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(item.content);

    const handleSaveEdit = () => {
        if (editContent.trim() !== item.content) {
            onUpdateContent(item.id, editContent);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        }
        if (e.key === 'Escape') {
            setEditContent(item.content);
            setIsEditing(false);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isEditing) return;

        if (isCardOverviewEnabled) {
            onItemClick(item);
        } else {
            setIsEditing(true);
        }
    };
    
    return (
        <div 
            draggable={!isEditing}
            onDragStart={(e) => !isEditing && dragHandlers.handleDragStart(e, item.id)}
            onClick={handleClick}
            className={`w-[108px] h-[120px] bg-white rounded-[3px] border border-[#DFE1E6] shadow-sm flex flex-col shrink-0 transition-all relative ${isEditing ? 'ring-2 ring-[#4C9AFF] border-[#4C9AFF] cursor-text' : 'cursor-pointer hover:shadow-md'}`}
        >
            <div className="h-1 w-full shrink-0" style={{ backgroundColor: item.author_color || '#DFE1E6' }}></div>
            <div className="p-2 flex-1 overflow-hidden">
                {isEditing ? (
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-full text-[10px] leading-tight resize-none outline-none bg-transparent"
                    />
                ) : (
                    <p className="text-[10px] text-[#172B4D] leading-tight line-clamp-5">{item.content}</p>
                )}
            </div>
            
            {/* Voting Result Badge for Mini Card */}
            {(isVotingActive || userVotes > 0) && userVotes > 0 && !isEditing && (
                 <div className="absolute top-1 right-1 z-30 bg-[#0052CC] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {userVotes}
                 </div>
            )}

            <div className="h-5 border-t border-[#F4F5F7] flex items-center justify-center shrink-0">
                <div 
                    className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center" 
                    style={{ backgroundColor: item.author_color || '#DFE1E6' }}
                    title={item.author_name}
                >
                    {(item.author_name || 'U').charAt(0)}
                </div>
            </div>
        </div>
    );
};
