
import React, { useState } from 'react';
import { CheckSquare, Square, Plus, MessageSquare, ThumbsUp } from 'lucide-react';
import { RetroItem, User } from '../types';

interface ActionItemCardProps {
    item: RetroItem;
    childrenItems?: RetroItem[];
    currentUser: User;
    onAddActionItem: (itemId: string, text: string) => void;
    onToggleActionItem: (itemId: string, actionId: string) => void;
    onAddComment: (itemId: string, text: string) => void;
    onReaction: (itemId: string, emoji: string) => void;
    dragHandlers: {
        handleDragStart: (e: React.DragEvent, itemId: string) => void;
        handleDragOver: (e: React.DragEvent) => void;
        handleCardDragEnter: (e: React.DragEvent, targetItemId: string) => void;
        handleCardDrop: (e: React.DragEvent, targetItemId: string) => void;
        setDragOverTargetId: (id: string | null) => void;
    };
}

export const ActionItemCard: React.FC<ActionItemCardProps> = ({ 
    item, childrenItems, currentUser, onAddActionItem, onToggleActionItem, onAddComment, onReaction, dragHandlers 
}) => {
    const [newActionText, setNewActionText] = useState('');
    const [newCommentText, setNewCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    const totalVotes = (Object.values(item.votes || {}) as number[]).reduce((a, b) => a + b, 0);

    const handleAddAction = () => {
        if (!newActionText.trim()) return;
        onAddActionItem(item.id, newActionText);
        setNewActionText('');
    };

    const handleComment = () => {
        if (!newCommentText.trim()) return;
        onAddComment(item.id, newCommentText);
        setNewCommentText('');
    };

    return (
        <div 
            draggable
            onDragStart={(e) => dragHandlers.handleDragStart(e, item.id)}
            onDragOver={dragHandlers.handleDragOver}
            onDragEnter={(e) => dragHandlers.handleCardDragEnter(e, item.id)}
            onDragLeave={() => dragHandlers.setDragOverTargetId(null)}
            onDrop={(e) => dragHandlers.handleCardDrop(e, item.id)}
            className="w-full bg-white border border-[#DFE1E6] rounded-lg shadow-sm p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
        >
            {/* Header Row: Content + Stats */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {item.type !== 'group' && (
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.author_color || '#DFE1E6' }} />
                        )}
                        <span className="text-xs text-[#5E6C84] font-medium">
                            {item.type === 'group' ? 'Multiple participants' : item.author_name}
                        </span>
                        {totalVotes > 0 && (
                             <span className="bg-[#E3FCEF] text-[#006644] px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                 <ThumbsUp size={10} /> {totalVotes} Votes
                             </span>
                        )}
                    </div>
                    {item.type !== 'group' && <p className="text-[#172B4D] font-medium text-base">{item.content}</p>}
                    
                    {/* Display Group Children if available */}
                    {item.type === 'group' && childrenItems && childrenItems.length > 0 && (
                        <div className="mt-1 space-y-2">
                            {childrenItems.map(child => (
                                <div key={child.id} className="text-sm text-[#172B4D] flex items-baseline gap-2">
                                    <span className="text-[#5E6C84]">•</span>
                                    <span>
                                        {child.content} 
                                        {child.author_name && <span className="font-bold text-[#5E6C84] ml-2 text-xs uppercase tracking-wide">- {child.author_name}</span>}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Items Section */}
            <div className="bg-[#FAFBFC] rounded border border-[#DFE1E6] p-3">
                <h4 className="text-xs font-bold text-[#5E6C84] uppercase mb-2 flex items-center gap-2">
                    <CheckSquare size={12} />
                    Action Items
                </h4>
                
                <div className="space-y-2 mb-3">
                    {item.actionItems?.map(action => (
                        <div key={action.id} className="flex items-start gap-2 group">
                            <button 
                                onClick={() => onToggleActionItem(item.id, action.id)}
                                className={`mt-0.5 ${action.isCompleted ? 'text-green-600' : 'text-[#5E6C84] hover:text-[#0052CC]'}`}
                            >
                                {action.isCompleted ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                            <span className={`text-sm ${action.isCompleted ? 'text-[#5E6C84] line-through' : 'text-[#172B4D]'}`}>
                                {action.text}
                            </span>
                        </div>
                    ))}
                    {(!item.actionItems || item.actionItems.length === 0) && (
                        <p className="text-xs text-[#97A0AF] italic">No action items yet.</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Plus size={16} className="text-[#5E6C84]" />
                    <input 
                        type="text"
                        value={newActionText}
                        onChange={(e) => setNewActionText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAction()}
                        placeholder="Add an action item..."
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#97A0AF]"
                    />
                    <button 
                        onClick={handleAddAction}
                        disabled={!newActionText.trim()}
                        className="text-xs font-bold text-[#0052CC] disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Footer Row: Author Avatar & Reactions */}
            <div className="flex items-center justify-between border-t border-[#DFE1E6] pt-3 mt-auto">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#5E6C84] hover:text-[#172B4D]"
                    >
                        <MessageSquare size={14} />
                        {item.comments.length}
                    </button>
                    
                    <div className="flex flex-wrap items-center gap-1 ml-2">
                        {item.reactions.map(r => (
                            <button
                                key={r.emoji}
                                onClick={() => onReaction(item.id, r.emoji)}
                                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors ${r.authors.includes(currentUser.id) ? 'bg-b50 border-b100 text-b500' : 'bg-white border-[#DFE1E6] hover:bg-[#F4F5F7]'}`}
                            >
                                <span>{r.emoji}</span>
                                <span className="font-bold">{r.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {item.type !== 'group' && (
                        <div 
                            className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: item.author_color || '#DFE1E6' }}
                            title={item.author_name}
                        >
                            {(item.author_name || 'U').charAt(0)}
                        </div>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-2 border-t border-[#DFE1E6] pt-3 animate-in fade-in duration-200">
                    <div className="space-y-3 mb-3 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {item.comments.map(c => (
                            <div key={c.id} className="text-sm bg-[#FAFBFC] p-2 rounded border border-[#DFE1E6]/50">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-xs text-[#172B4D]">{c.author_name}</span>
                                    <span className="text-[10px] text-[#97A0AF]">Just now</span>
                                </div>
                                <p className="text-[#42526E] text-xs leading-relaxed">{c.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                            placeholder="Add a thought..."
                            className="flex-1 border border-[#DFE1E6] rounded-md px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#4C9AFF] focus:border-transparent"
                        />
                        <button 
                            onClick={handleComment} 
                            disabled={!newCommentText.trim()} 
                            className="text-xs font-bold text-white bg-[#0052CC] px-3 py-1.5 rounded-md hover:bg-[#0747A6] disabled:opacity-50 disabled:bg-[#EBECF0] disabled:text-[#A5ADBA] transition-colors"
                        >
                            Post
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
