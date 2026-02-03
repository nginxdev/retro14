
import React, { useState } from 'react';
import { Layers, Minimize2, SmilePlus } from 'lucide-react';
import { RetroItem, User, VotingConfig } from '../../types';
import { VoteControl } from './VoteControl';
import { MiniCard } from './MiniCard';
import { getUniqueAuthors } from '../../utils/theme';

const EMOJIS = ['👍', '❤️', '🔥', '😂', '😮'];

interface GroupCardProps {
    groupItem: RetroItem;
    childrenItems: RetroItem[];
    hiddenAuthors: Set<string>;
    currentUser: User;
    isVotingActive: boolean;
    votingConfig?: VotingConfig;
    userVotesUsed: number;
    dragOverTargetId: string | null;
    isExpanded: boolean;
    onVote: (itemId: string, delta: 1 | -1) => void;
    onReaction: (itemId: string, emoji: string) => void;
    onItemClick: (item: RetroItem) => void;
    onToggleGroup: (groupId: string) => void;
    dragHandlers: any;
}

export const GroupCard: React.FC<GroupCardProps> = ({
    groupItem, childrenItems, hiddenAuthors, currentUser,
    isVotingActive, votingConfig, userVotesUsed,
    dragOverTargetId, isExpanded,
    onVote, onReaction, onItemClick, onToggleGroup, dragHandlers
}) => {
    const [hoveredReactionId, setHoveredReactionId] = useState<string | null>(null);
    const isTargeted = dragOverTargetId === groupItem.id;
    const userVotes = (groupItem.votes || {})[currentUser.id] || 0;
    
    // Filter visible children
    const visibleChildren = childrenItems.filter(c => !hiddenAuthors.has(c.author_name || ''));
    if (visibleChildren.length === 0 && hiddenAuthors.size > 0) return null;

    const authors = getUniqueAuthors(visibleChildren);
    const authorNames = authors.map(a => a.name).join(', ');

    const renderFooter = () => (
        <div className="min-h-[32px] flex items-center justify-between px-2 pb-2 bg-white/50 rounded-b-lg shrink-0 mt-auto border-t border-[#DFE1E6]/50 pt-1 gap-2">
            <div className="flex -space-x-1.5 shrink-0">
                {authors.slice(0, 3).map((a, i) => (
                    <div 
                        key={i} 
                        className="w-4 h-4 rounded-full border border-white text-[8px] flex items-center justify-center text-white font-bold shadow-sm" 
                        style={{backgroundColor: a.color}}
                        title={a.name}
                    >
                        {a.name.charAt(0)}
                    </div>
                ))}
                {authors.length > 3 && (
                    <div className="w-4 h-4 rounded-full border border-white bg-gray-100 text-[8px] flex items-center justify-center text-gray-500 font-bold shadow-sm">
                        +{authors.length - 3}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-1 flex-1">
                <VoteControl 
                    itemId={groupItem.id} 
                    votes={userVotes}
                    allVotes={groupItem.votes}
                    isVotingActive={isVotingActive}
                    votingConfig={votingConfig}
                    userVotesUsed={userVotesUsed}
                    onVote={onVote}
                />

                {groupItem.reactions.map(r => (
                    <button
                        key={r.emoji}
                        onClick={(e) => { e.stopPropagation(); onReaction(groupItem.id, r.emoji); }}
                        className={`flex items-center gap-0.5 px-1 py-0 rounded-full text-[9px] border transition-colors ${r.authors.includes(currentUser.id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-transparent border-transparent hover:bg-gray-100'}`}
                    >
                        <span>{r.emoji}</span>
                        <span className="font-bold">{r.count}</span>
                    </button>
                ))}
                
                <div className="relative shrink-0">
                    <button 
                        className="p-0.5 rounded text-[#97A0AF] hover:bg-[#EBECF0] hover:text-[#172B4D] transition-colors"
                        onMouseEnter={() => setHoveredReactionId(groupItem.id)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SmilePlus size={12} />
                    </button>
                    {hoveredReactionId === groupItem.id && (
                        <div 
                            className="absolute bottom-full right-0 mb-1 bg-white shadow-lg rounded-full border border-[#DFE1E6] p-1 flex gap-1 animate-in zoom-in-95 duration-150 z-20"
                            onMouseLeave={() => setHoveredReactionId(null)}
                        >
                            {EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={(e) => { e.stopPropagation(); onReaction(groupItem.id, emoji); setHoveredReactionId(null); }}
                                    className="w-6 h-6 flex items-center justify-center text-base hover:bg-[#F4F5F7] rounded-full transition-transform hover:scale-125"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (!isExpanded) {
        return (
            <div
                draggable
                onDragStart={(e) => dragHandlers.handleDragStart(e, groupItem.id)}
                onDragOver={dragHandlers.handleDragOver}
                onDragEnter={(e) => dragHandlers.handleCardDragEnter(e, groupItem.id)}
                onDragLeave={() => dragHandlers.setDragOverTargetId(null)}
                onDrop={(e) => dragHandlers.handleCardDrop(e, groupItem.id)}
                onClick={() => onToggleGroup(groupItem.id)}
                className="w-[135px] h-[150px] flex-shrink-0 cursor-pointer transition-all duration-200 hover:shadow-md z-0 relative overflow-visible group-container"
            >
                 <div className={`w-full h-full bg-white border rounded-lg overflow-hidden flex flex-col justify-between ${isTargeted ? 'border-[#4C9AFF] ring-2 ring-[#4C9AFF] animate-pulse' : 'border-[#DFE1E6]'}`}>
                     <div className="h-7 bg-gray-50 border-b border-[#DFE1E6] flex items-center justify-between px-2 shrink-0">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <Layers size={12} className="text-[#5E6C84] shrink-0" />
                            <span className="text-[9px] font-bold text-[#172B4D] truncate" title={authorNames}>{authorNames || 'Group'}</span>
                          </div>
                          <span className="bg-[#DFE1E6] text-[#172B4D] text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{visibleChildren.length}</span>
                     </div>

                     <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                          {visibleChildren.map(child => (
                              <div key={child.id} className="text-[9px] text-[#172B4D] leading-snug border-b border-gray-100 last:border-0 pb-1">
                                 {child.content}
                              </div>
                          ))}
                     </div>
                     {renderFooter()}
                 </div>
            </div>
        );
    }

    return (
        <div
            draggable
            onDragStart={(e) => dragHandlers.handleDragStart(e, groupItem.id)}
            onDragOver={dragHandlers.handleDragOver}
            onDragEnter={(e) => dragHandlers.handleCardDragEnter(e, groupItem.id)}
            onDragLeave={() => dragHandlers.setDragOverTargetId(null)}
            onDrop={(e) => dragHandlers.handleCardDrop(e, groupItem.id)}
            className={`w-full bg-gray-50 border-2 border-dashed ${isTargeted ? 'border-[#4C9AFF] bg-blue-50/50' : 'border-[#DFE1E6]'} rounded-lg flex flex-col transition-all group animate-in zoom-in-95 duration-200 relative`}
        >
            <div className="h-8 flex items-center justify-between px-2 bg-white/50 border-b border-[#DFE1E6]/50 shrink-0 rounded-t-lg">
                <span className="text-[10px] font-bold text-[#5E6C84] uppercase flex items-center gap-1">
                    <Layers size={12} />
                    <span className="truncate max-w-[200px]" title={authorNames}>{authorNames}</span>
                </span>
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleGroup(groupItem.id); }}
                    className="p-1 hover:bg-gray-200 rounded text-[#0052CC] transition-colors"
                >
                    <Minimize2 size={14} />
                </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300">
                <div className="flex flex-wrap gap-2 justify-start">
                    {visibleChildren.map(child => (
                        <MiniCard 
                            key={child.id} 
                            item={child} 
                            currentUser={currentUser}
                            isVotingActive={isVotingActive}
                            votingConfig={votingConfig}
                            onItemClick={onItemClick}
                            dragHandlers={dragHandlers}
                        />
                    ))}
                </div>
            </div>
            {renderFooter()}
        </div>
    );
};
