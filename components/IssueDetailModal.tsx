
import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Save, Send, MessageSquare, AlertTriangle } from 'lucide-react';
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
    onClose();
  };

  const handleConfirmDelete = async () => {
    try {
        await dataService.deleteItem(item.id);
        onUpdate();
        onClose();
    } catch (error) {
        console.error("Failed to delete item", error);
        // Fallback for logging since alert might be blocked too, though custom UI handles the prompt
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await dataService.addComment(item.id, newComment, currentUser as any);
    setNewComment('');
    onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#DFE1E6] bg-[#FAFBFC] shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.author_color || '#ccc' }}></div>
             <span className="text-sm font-semibold text-[#172B4D]">{item.author_name}</span>
             <span className="text-xs text-[#5E6C84]">created this card</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-[#42526E] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           {/* Custom Delete Confirmation Overlay */}
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
                            className="px-4 py-2 text-sm font-medium text-[#42526E] hover:bg-[#EBECF0] rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmDelete}
                            className="px-4 py-2 text-sm font-bold text-white bg-[#DE350B] hover:bg-[#BF2600] rounded-md shadow-sm transition-colors"
                        >
                            Delete Forever
                        </button>
                    </div>
                </div>
             </div>
           )}

           {/* Content Editor */}
           <div className="mb-8">
               <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-2">Description</label>
               <textarea
                 className="w-full min-h-[120px] p-3 border border-[#DFE1E6] rounded-md text-[#172B4D] text-lg leading-relaxed focus:ring-2 focus:ring-[#4C9AFF] focus:border-transparent outline-none resize-none bg-transparent hover:bg-[#FAFBFC] focus:bg-white transition-colors"
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 placeholder="Add a description..."
               />
               <div className="mt-2 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </button>
                  <button 
                   type="button"
                   onClick={handleSaveContent}
                   disabled={isSaving || content === item.content}
                   className="px-3 py-1.5 bg-[#0052CC] text-white font-bold text-sm rounded hover:bg-[#0747A6] flex items-center transition-colors disabled:opacity-50 disabled:bg-[#EBECF0] disabled:text-[#A5ADBA]"
                 >
                   <Save size={14} className="mr-2" />
                   Save
                 </button>
               </div>
           </div>

           {/* Comments Section */}
           <div>
               <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#DFE1E6]">
                   <MessageSquare size={16} className="text-[#42526E]" />
                   <h3 className="text-sm font-bold text-[#172B4D]">Comments ({item.comments.length})</h3>
               </div>
               
               <div className="space-y-6">
                   {item.comments.map((comment) => (
                       <div key={comment.id} className="flex gap-3 group">
                           <div 
                             className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                             style={{ backgroundColor: comment.author_color || '#DFE1E6' }}
                           >
                               {comment.author_name.charAt(0)}
                           </div>
                           <div className="flex-1">
                               <div className="flex items-baseline gap-2 mb-1">
                                   <span className="text-sm font-semibold text-[#172B4D]">{comment.author_name}</span>
                                   <span className="text-xs text-[#5E6C84]">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               </div>
                               <p className="text-sm text-[#172B4D] leading-relaxed">{comment.text}</p>
                           </div>
                       </div>
                   ))}
                   <div ref={commentsEndRef} />
               </div>
           </div>
        </div>
        
        {/* Footer Input */}
        <div className="p-4 bg-white border-t border-[#DFE1E6] shrink-0">
            <div className="flex gap-3">
                 <div 
                   className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                   style={{ backgroundColor: currentUser.color }}
                 >
                   {currentUser.name.charAt(0)}
                 </div>
                 <div className="flex-1 relative">
                     <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder="Add a comment..."
                        className="w-full border border-[#DFE1E6] rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C9AFF] focus:border-transparent pr-10"
                     />
                     <button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#0052CC] hover:bg-[#DEEBFF] rounded disabled:text-[#DFE1E6] disabled:hover:bg-transparent transition-colors"
                     >
                        <Send size={16} />
                     </button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};
