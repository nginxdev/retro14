
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
    onUpdateContent: (itemId: string, content: string) => void;
    dragHandlers: any;
    isCardOverviewEnabled?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({
    groupItem, childrenItems, hiddenAuthors, currentUser,
    isVotingActive, votingConfig, userVotesUsed,
    dragOverTargetId, isExpanded,
    onVote, onReaction, onItemClick, onToggleGroup, onUpdateContent, dragHandlers,
    isCardOverviewEnabled = true
}) => {
    const [hoveredReactionId, setHoveredReactionId] = useState<string | null>(null);
    const isTargeted = dragOverTargetId === groupItem.id;
    const userVotes = (groupItem.votes || {})[currentUser.id] || 0;
    
    // Filter visible children
    const visibleChildren = childrenItems.filter(c => !hiddenAuthors.has(c.author_name || ''));
    if (visibleChildren.length === 0 && hiddenAuthors.size > 0) return null;

    const authors = getUniqueAuthors(visibleChildren);
    const authorNames = authors.map(a => a.name).join(', ');

    // Footer used for the Expanded view only
    const renderExpandedFooter = () => (
        <div className="min-h-[32px] flex items-center justify-between px-2 pb-2 bg-white/50 rounded-b-[3px] shrink-0 mt-auto border-t border-[#DFE1E6]/50 pt-1 gap-2">
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
                
                <div 
                    className="relative shrink-0"
                    onMouseLeave={() => setHoveredReactionId(null)}
                >
                    <button 
                        className="p-0.5 rounded text-[#97A0AF] hover:bg-[#EBECF0] hover:text-[#172B4D] transition-colors"
                        onMouseEnter={() => setHoveredReactionId(groupItem.id)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SmilePlus size={12} />
                    </button>
                    {hoveredReactionId === groupItem.id && (
                        <div 
                            className="absolute bottom-full right-0 bg-white shadow-lg rounded-full border border-[#DFE1E6] p-1 flex gap-1 animate-in zoom-in-95 duration-150 z-20"
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
                className="w-[135px] flex flex-col items-center transition-all duration-200"
            >
                 <div className={`
                    relative w-full h-[150px] bg-white rounded-[3px] shadow-sm border
                    ${isTargeted ? 'border-[#4C9AFF] ring-2 ring-[#4C9AFF] animate-pulse z-10' : 'border-[#DFE1E6]'}
                    cursor-pointer hover:shadow-md transition-all flex flex-col overflow-hidden group
                 `}>
                     {/* Multi-Color Header Bar */}
                     <div className="flex w-full h-1.5 shrink-0">
                        {authors.map((a, i) => (
                            <div key={i} className="flex-1 h-full" style={{ backgroundColor: a.color }} />
                        ))}
                     </div>

                     {/* Top Left: Group Badge (Icon + Count) */}
                     <div className="absolute top-2.5 left-2 z-20 bg-[#F4F5F7]/95 backdrop-blur-[1px] border border-[#DFE1E6] rounded-[3px] px-1.5 py-0.5 flex items-center gap-1.5 shadow-sm">
                        <Layers size={10} className="text-[#5E6C84]" />
                        <span className="text-[9px] font-bold text-[#172B4D]">{visibleChildren.length}</span>
                     </div>

                     {/* Top Right: Vote Control (Same position as RetroCard) */}
                     <div className="absolute top-2.5 right-2 z-20">
                        <VoteControl 
                            itemId={groupItem.id} 
                            votes={userVotes}
                            allVotes={groupItem.votes}
                            isVotingActive={isVotingActive}
                            votingConfig={votingConfig}
                            userVotesUsed={userVotesUsed}
                            onVote={onVote}
                        />
                     </div>

                     {/* Content List */}
                     <div className="w-full flex-1 overflow-y-auto px-2 pt-10 pb-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                          {visibleChildren.map((child, index) => (
                              <div 
                                key={child.id} 
                                className={`text-[10px] text-[#172B4D] leading-tight break-words ${index < visibleChildren.length - 1 ? 'border-b border-[#EBECF0] pb-1.5 mb-1.5' : 'pb-0.5'}`}
                              >
                                 {child.content} 
                                 <span className="text-[#5E6C84] font-bold ml-1 whitespace-nowrap">- {child.author_name}</span>
                              </div>
                          ))}
                     </div>

                     {/* Footer: Reactions Only (Votes are now top right) */}
                     <div className="min-h-[32px] flex items-center justify-between px-2 pb-2 bg-white shrink-0 w-full mt-auto gap-2 border-t border-[#F4F5F7] pt-1">
                        {/* Avatars */}
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
                        </div>
                        
                        {/* Reactions & Emoji Picker */}
                        <div className="flex flex-wrap items-center justify-end gap-1 flex-1">
                            {groupItem.reactions.slice(0, 1).map(r => (
                                <button
                                    key={r.emoji}
                                    onClick={(e) => { e.stopPropagation(); onReaction(groupItem.id, r.emoji); }}
                                    className={`flex items-center gap-0.5 px-1 py-0 rounded-full text-[9px] border transition-colors ${r.authors.includes(currentUser.id) ? 'bg-[#DEEBFF] border-[#B3D4FF] text-[#0052CC]' : 'bg-transparent border-transparent hover:bg-[#F4F5F7]'}`}
                                >
                                    <span>{r.emoji}</span>
                                    <span className="font-bold">{r.count}</span>
                                </button>
                            ))}
                            
                             <div 
                                className="relative shrink-0 group/reaction"
                                onMouseLeave={() => setHoveredReactionId(null)}
                             >
                                <button 
                                    className="p-0.5 rounded text-[#97A0AF] hover:bg-[#EBECF0] hover:text-[#172B4D] transition-colors"
                                    onMouseEnter={() => setHoveredReactionId(groupItem.id)}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <SmilePlus size={12} />
                                </button>
                                {hoveredReactionId === groupItem.id && (
                                    <div 
                                        className="absolute bottom-full right-0 bg-white shadow-lg rounded-full border border-[#DFE1E6] p-1 flex gap-1 animate-in zoom-in-95 duration-150 z-20"
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
                 </div>
            </div>
        );
    }

    // Expanded View (Drop Zone)
    return (
        <div
            draggable
            onDragStart={(e) => dragHandlers.handleDragStart(e, groupItem.id)}
            onDragOver={dragHandlers.handleDragOver}
            onDragEnter={(e) => dragHandlers.handleCardDragEnter(e, groupItem.id)}
            onDragLeave={() => dragHandlers.setDragOverTargetId(null)}
            onDrop={(e) => dragHandlers.handleCardDrop(e, groupItem.id)}
            className={`w-full bg-gray-50 border-2 border-dashed ${isTargeted ? 'border-[#4C9AFF] bg-blue-50/50' : 'border-[#DFE1E6]'} rounded-[3px] flex flex-col group animate-in zoom-in-95 duration-200 relative`}
        >
            <div className="h-8 flex items-center justify-between px-2 bg-white/50 border-b border-[#DFE1E6]/50 shrink-0 rounded-t-[3px]">
                <span className="text-[10px] font-bold text-[#5E6C84] uppercase flex items-center gap-1">
                    <Layers size={12} />
                    <span className="truncate max-w-[200px]" title={authorNames}>
                        {authorNames}
                    </span>
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
                            onUpdateContent={onUpdateContent}
                            dragHandlers={dragHandlers}
                            isCardOverviewEnabled={isCardOverviewEnabled}
                        />
                    ))}
                </div>
            </div>
            {renderExpandedFooter()}
        </div>
    );
};
