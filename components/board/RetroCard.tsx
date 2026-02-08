
import React, { useState } from 'react';
import { SmilePlus, Pencil } from 'lucide-react';
import { RetroItem, User, VotingConfig } from '../../types';
import { VoteControl } from './VoteControl';
import { colors } from '../../utils/theme';

const EMOJIS = ['👍', '❤️', '🔥', '😂', '😮'];

/**
 * Props for the RetroCard component.
 */
interface RetroCardProps {
    item: RetroItem;
    currentUser: User;
    isVotingActive: boolean;
    votingConfig?: VotingConfig;
    userVotesUsed: number;
    dragOverTargetId: string | null;
    draggedItemId: string | null;
    onVote: (itemId: string, delta: 1 | -1) => void;
    onReaction: (itemId: string, emoji: string) => void;
    onItemClick: (item: RetroItem) => void;
    onUpdateContent: (itemId: string, content: string) => void;
    dragHandlers: {
        handleDragStart: (e: React.DragEvent, itemId: string) => void;
        handleDragOver: (e: React.DragEvent) => void;
        handleCardDragEnter: (e: React.DragEvent, targetItemId: string) => void;
        handleCardDrop: (e: React.DragEvent, targetItemId: string) => void;
        setDragOverTargetId: (id: string | null) => void;
    };
    isCardOverviewEnabled?: boolean;
}

/**
 * Represents a single card on the board.
 * Supports inline editing, voting, reactions, and drag-and-drop.
 */
export const RetroCard: React.FC<RetroCardProps> = ({ 
    item, currentUser, isVotingActive, votingConfig, userVotesUsed, 
    dragOverTargetId, draggedItemId,
    onVote, onReaction, onItemClick, onUpdateContent, dragHandlers,
    isCardOverviewEnabled = true
}) => {
    const [hoveredReactionId, setHoveredReactionId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(item.content);
    
    const isTargeted = dragOverTargetId === item.id;
    const userVotes = (item.votes || {})[currentUser.id] || 0;

    // Handlers
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
        <div className="w-[135px] flex flex-col items-center transition-all duration-200">
            <div
                draggable={!isEditing}
                onDragStart={(e) => !isEditing && dragHandlers.handleDragStart(e, item.id)}
                onClick={handleClick}
                onDragOver={dragHandlers.handleDragOver}
                onDragEnter={(e) => dragHandlers.handleCardDragEnter(e, item.id)}
                onDragLeave={() => dragHandlers.setDragOverTargetId(null)}
                onDrop={(e) => dragHandlers.handleCardDrop(e, item.id)}
                className={`
                    relative bg-white rounded-[3px] shadow-sm border
                    ${isTargeted ? 'border-b200 ring-2 ring-b200 ring-offset-1 animate-pulse z-10' : 'border-n40'}
                    ${isEditing ? 'ring-2 ring-b200 border-b200 cursor-text' : 'cursor-pointer hover:shadow-md'}
                    h-[150px] w-full
                    group transition-all flex flex-col
                    ${draggedItemId === item.id ? 'opacity-40 rotate-2 scale-95' : ''}
                `}
            >
                {/* Author Color Strip */}
                <div className="h-1.5 w-full rounded-t-[3px] shrink-0" style={{ backgroundColor: item.author_color || colors.n40 }}></div>
                
                {/* Controls Overlay - Edit (Top-Left) */}
                {/* Only show pencil if Overview is Enabled (since disabling it makes the whole card clickable for edit) */}
                {!isEditing && isCardOverviewEnabled && (
                    <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                            className="flex items-center justify-center w-7 h-7 rounded-full bg-n20 hover:bg-n30 border border-n40 text-n300 hover:text-b400 transition-colors shadow-sm"
                            title="Quick Edit"
                         >
                             <Pencil size={14} />
                         </button>
                    </div>
                )}

                {/* Controls Overlay - Vote (Top-Right) */}
                {!isEditing && (
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                         <VoteControl 
                            itemId={item.id} 
                            votes={userVotes}
                            allVotes={item.votes}
                            isVotingActive={isVotingActive}
                            votingConfig={votingConfig}
                            userVotesUsed={userVotesUsed}
                            onVote={onVote}
                        />
                    </div>
                )}

                {/* Persistent Vote Count (Visible when voting active or has votes) */}
                {!isEditing && (userVotes > 0 || isVotingActive) && (
                     <div className="absolute top-2 right-2 z-10 group-hover:opacity-0 transition-opacity">
                         <VoteControl 
                            itemId={item.id} 
                            votes={userVotes}
                            allVotes={item.votes}
                            isVotingActive={isVotingActive}
                            votingConfig={votingConfig}
                            userVotesUsed={userVotesUsed}
                            onVote={onVote}
                        />
                     </div>
                )}

                {/* Card Content */}
                <div className="p-3 pt-4 flex-1 flex flex-col justify-center items-center overflow-hidden w-full">
                    {isEditing ? (
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-full text-xs font-medium leading-snug text-center resize-none outline-none bg-transparent"
                        />
                    ) : (
                        <p className={`text-n800 text-xs font-medium leading-snug text-center line-clamp-4 ${item.is_staged ? 'italic' : ''}`}>
                            {item.content}
                        </p>
                    )}
                </div>

                {/* Footer: Author Avatar & Reactions */}
                <div className="min-h-[32px] flex items-center justify-between px-2 pb-2 bg-white rounded-b-[3px] shrink-0 w-full mt-auto gap-2">
                    <div 
                        className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-sm shrink-0"
                        style={{ backgroundColor: item.author_color || colors.n40 }}
                        title={item.author_name}
                    >
                        {(item.author_name || 'U').charAt(0)}
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-end gap-1 flex-1">
                        {item.reactions.map(r => (
                            <button
                                key={r.emoji}
                                onClick={(e) => { e.stopPropagation(); onReaction(item.id, r.emoji); }}
                                className={`flex items-center gap-0.5 px-1 py-0 rounded-full text-[9px] border transition-colors ${r.authors.includes(currentUser.id) ? 'bg-b50 border-b100 text-b500' : 'bg-transparent border-transparent hover:bg-n20'}`}
                            >
                                <span>{r.emoji}</span>
                                <span className="font-bold">{r.count}</span>
                            </button>
                        ))}
                        
                        <div 
                            className="relative group/reaction shrink-0"
                            onMouseLeave={() => setHoveredReactionId(null)}
                        >
                            <button 
                                className="p-0.5 rounded text-n90 hover:bg-n30 hover:text-n800 transition-colors"
                                onMouseEnter={() => setHoveredReactionId(item.id)}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <SmilePlus size={12} />
                            </button>
                            {/* Reaction Picker Popup */}
                            {hoveredReactionId === item.id && (
                                <div 
                                    className="absolute bottom-full right-0 bg-white shadow-lg rounded-full border border-n40 p-1 flex gap-1 animate-in zoom-in-95 duration-150 z-20"
                                >
                                    {EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={(e) => { e.stopPropagation(); onReaction(item.id, emoji); setHoveredReactionId(null); }}
                                            className="w-6 h-6 flex items-center justify-center text-base hover:bg-n20 rounded-full transition-transform hover:scale-125"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
