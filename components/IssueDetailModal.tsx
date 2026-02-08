
import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Save, Send, MessageSquare, AlertTriangle, CheckSquare, ChevronDown, User, Calendar, Tag, Clock } from 'lucide-react';
import { RetroItem } from '../types';
import { dataService } from '../services/dataService';

interface ItemDetailModalProps {
  item: RetroItem | null;
  currentUser: { id: string; name: string; color: string; role: string };
  onClose: () => void;
  onUpdate: () => void;
}

export const IssueDetailModal: React.FC<ItemDetailModalProps> = ({ item, currentUser, onClose, onUpdate }) => {
  const [content, setContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
        setContent(item.content);
        setShowDeleteConfirm(false);
        // Scroll to bottom of comments when opened
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [item]);

  if (!item) return null;

  const handleSaveContent = async () => {
    setIsSaving(true);
    await dataService.updateItemContent(item.id, content);
    setIsSaving(false);
    onUpdate();
  };

  const handleConfirmDelete = async () => {
    try {
        await dataService.deleteItem(item.id);
        onUpdate();
        onClose();
    } catch (error) {
        console.error("Failed to delete item", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await dataService.addComment(item.id, newComment, currentUser as any);
    setNewComment('');
    onUpdate();
  };

  const getStatusColor = (colId: string) => {
      // Mock logic to determine status color based on column
      if (colId.includes('1')) return 'bg-green-100 text-green-700'; // Went well
      if (colId.includes('2')) return 'bg-red-100 text-red-700'; // To improve
      return 'bg-blue-100 text-blue-700'; // Action items
  };
  
  const getStatusText = (colId: string) => {
      if (colId.includes('1')) return 'DONE'; 
      if (colId.includes('2')) return 'TO DO'; 
      return 'IN PROGRESS'; 
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200">
      {/* Jira-style Modal Container */}
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[3px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative">
        
        {/* Header Toolbar */}
        <div className="h-16 border-b border-[#DFE1E6] flex items-center justify-between px-6 shrink-0 bg-white">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-[#0052CC] rounded-[3px] text-white">
                <CheckSquare size={16} />
             </div>
             <div className="flex flex-col">
                 <span className="text-xs text-[#5E6C84] hover:underline cursor-pointer">RET-{item.id.substring(0,4).toUpperCase()}</span>
                 <span className="text-xs text-[#5E6C84]">Sprint 24 Retrospective</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-[#5E6C84] hover:bg-[#EBECF0] hover:text-[#DE350B] rounded-[3px] transition-colors"
                title="Delete Issue"
            >
                <Trash2 size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-[#5E6C84] hover:bg-[#EBECF0] rounded-[3px] transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Custom Delete Overlay */}
        {showDeleteConfirm && (
             <div className="absolute inset-0 bg-white/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="text-center max-w-sm">
                    <div className="w-12 h-12 bg-red-100 text-[#DE350B] rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-[#172B4D] mb-2">Delete this card?</h3>
                    <p className="text-sm text-[#5E6C84] mb-6">
                        This action cannot be undone. All comments and reactions associated with this card will be permanently removed.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 text-sm font-medium text-[#42526E] hover:bg-[#EBECF0] rounded-[3px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmDelete}
                            className="px-4 py-2 text-sm font-bold text-white bg-[#DE350B] hover:bg-[#BF2600] rounded-[3px] shadow-sm transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Two-Column Layout */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            {/* LEFT COLUMN: Main Content */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200">
                
                {/* Description Editor */}
                <div className="mb-8 group">
                    <h2 className="text-lg font-semibold text-[#172B4D] mb-4">Description</h2>
                    <div className="relative">
                        <textarea
                            className="w-full min-h-[120px] p-3 -ml-3 rounded-[3px] text-[#172B4D] text-base leading-relaxed outline-none resize-none bg-transparent hover:bg-[#EBECF0]/50 focus:bg-white focus:ring-2 focus:ring-[#4C9AFF] border border-transparent focus:border-[#4C9AFF] transition-all"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onBlur={handleSaveContent}
                            placeholder="Add a description..."
                        />
                         {content !== item.content && (
                             <div className="absolute bottom-2 right-2 flex gap-2">
                                 <button onClick={handleSaveContent} className="px-2 py-1 bg-[#0052CC] text-white text-xs font-bold rounded">Save</button>
                             </div>
                         )}
                    </div>
                </div>

                {/* Action Items List */}
                <div className="mb-8">
                     <h3 className="text-sm font-bold text-[#172B4D] mb-3 flex items-center gap-2">
                        <CheckSquare size={16} /> Action Items
                     </h3>
                     <div className="space-y-2 pl-6">
                        {item.actionItems?.length > 0 ? item.actionItems.map(action => (
                             <div key={action.id} className="flex items-center gap-2">
                                  <div className={`w-4 h-4 border rounded flex items-center justify-center ${action.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-[#DFE1E6]'}`}>
                                      {action.isCompleted && <CheckSquare size={10} />}
                                  </div>
                                  <span className={`text-sm ${action.isCompleted ? 'line-through text-[#5E6C84]' : 'text-[#172B4D]'}`}>{action.text}</span>
                             </div>
                        )) : (
                            <p className="text-sm text-[#97A0AF] italic">No follow-up actions tracked yet.</p>
                        )}
                     </div>
                </div>

                {/* Activity / Comments */}
                <div>
                    <h3 className="text-sm font-bold text-[#172B4D] mb-4">Activity</h3>
                    
                    {/* Comment Input */}
                    <div className="flex gap-3 mb-6">
                        <div 
                           className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                           style={{ backgroundColor: currentUser.color }}
                         >
                           {currentUser.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                             <div className="border border-[#DFE1E6] rounded-[3px] focus-within:ring-2 focus-within:ring-[#4C9AFF] bg-white transition-all shadow-sm">
                                 <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                    placeholder="Add a comment..."
                                    className="w-full px-3 py-2.5 text-sm outline-none bg-transparent"
                                 />
                                 <div className="flex justify-between items-center px-2 py-1 bg-[#FAFBFC] border-t border-[#DFE1E6]">
                                     <div className="text-xs text-[#97A0AF]">Pro tip: press M to comment</div>
                                     <button 
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="px-3 py-1 bg-[#0052CC] text-white text-xs font-bold rounded-[3px] hover:bg-[#0747A6] disabled:opacity-50 disabled:bg-[#EBECF0] disabled:text-[#A5ADBA] transition-colors"
                                     >
                                        Save
                                     </button>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-6">
                        {item.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group">
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                    style={{ backgroundColor: comment.author_color || '#DFE1E6' }}
                                >
                                    {comment.author_name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-sm font-bold text-[#172B4D]">{comment.author_name}</span>
                                        <span className="text-xs text-[#5E6C84]">
                                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#172B4D] leading-relaxed">{comment.text}</p>
                                    <div className="mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-xs text-[#5E6C84] hover:underline">Reply</button>
                                        <button className="text-xs text-[#5E6C84] hover:underline">Like</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={commentsEndRef} />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Context Sidebar */}
            <div className="w-full md:w-80 border-l border-[#DFE1E6] bg-white overflow-y-auto">
                <div className="p-6 space-y-6">
                    
                    {/* Status Dropdown (Mock) */}
                    <div>
                        <label className="text-xs font-bold text-[#5E6C84] uppercase block mb-1.5">Status</label>
                        <button className={`text-xs font-bold px-3 py-1 rounded-[3px] flex items-center justify-between w-fit gap-2 uppercase tracking-wide transition-colors ${getStatusColor(item.column_id)}`}>
                            {getStatusText(item.column_id)}
                            <ChevronDown size={14} />
                        </button>
                    </div>

                    {/* Meta Fields Section */}
                    <div className="border border-[#DFE1E6] rounded-[3px] p-4 bg-white shadow-sm">
                         <div className="text-xs font-bold text-[#42526E] mb-3 uppercase tracking-wide border-b border-[#DFE1E6] pb-2">Details</div>
                         
                         {/* Assignee */}
                         <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                             <div className="w-24 shrink-0 text-sm text-[#5E6C84] font-medium">Assignee</div>
                             <div className="flex items-center gap-2 flex-1 hover:bg-[#EBECF0] p-1 -ml-1 rounded transition-colors">
                                 <div className="w-6 h-6 rounded-full bg-[#DFE1E6] flex items-center justify-center text-[#42526E] text-[10px] font-bold">
                                     <User size={12} />
                                 </div>
                                 <span className="text-sm text-[#172B4D]">Unassigned</span>
                             </div>
                         </div>

                         {/* Reporter */}
                         <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                             <div className="w-24 shrink-0 text-sm text-[#5E6C84] font-medium">Reporter</div>
                             <div className="flex items-center gap-2 flex-1 hover:bg-[#EBECF0] p-1 -ml-1 rounded transition-colors">
                                 <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                    style={{ backgroundColor: item.author_color || '#DFE1E6' }}
                                 >
                                     {item.author_name.charAt(0)}
                                 </div>
                                 <span className="text-sm text-[#172B4D]">{item.author_name}</span>
                             </div>
                         </div>

                         {/* Labels */}
                         <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                             <div className="w-24 shrink-0 text-sm text-[#5E6C84] font-medium">Labels</div>
                             <div className="flex items-center gap-2 flex-1 flex-wrap">
                                 <span className="text-sm text-[#172B4D] bg-[#EBECF0] px-2 py-0.5 rounded-[3px] hover:bg-[#DFE1E6] transition-colors">None</span>
                             </div>
                         </div>
                    </div>

                    {/* System Dates */}
                    <div className="text-xs text-[#97A0AF] space-y-2 pt-4 border-t border-[#DFE1E6]">
                        <div className="flex items-center gap-2">
                             <Clock size={12} />
                             <span>Created {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Calendar size={12} />
                             <span>Updated just now</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
