
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
}

export const ActionItemCard: React.FC<ActionItemCardProps> = ({ item, childrenItems, currentUser, onAddActionItem, onToggleActionItem, onAddComment }) => {
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
        <div className="w-full bg-white border border-[#DFE1E6] rounded-lg shadow-sm p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
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

            {/* Comments Toggle */}
            <div className="border-t border-[#DFE1E6] pt-2 flex flex-col gap-2">
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#5E6C84] hover:text-[#172B4D] self-start"
                >
                    <MessageSquare size={14} />
                    {item.comments.length} Comments
                </button>

                {showComments && (
                    <div className="pl-4 border-l-2 border-[#DFE1E6] space-y-3 mt-1">
                        {item.comments.map(c => (
                            <div key={c.id} className="text-sm">
                                <span className="font-bold text-[#172B4D] mr-2">{c.author_name}</span>
                                <span className="text-[#172B4D]">{c.text}</span>
                            </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                                placeholder="Write a comment..."
                                className="flex-1 border border-[#DFE1E6] rounded px-2 py-1 text-sm outline-none focus:border-[#4C9AFF]"
                            />
                            <button onClick={handleComment} disabled={!newCommentText.trim()} className="text-xs bg-[#F4F5F7] px-2 rounded font-bold hover:bg-[#EBECF0]">Post</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
