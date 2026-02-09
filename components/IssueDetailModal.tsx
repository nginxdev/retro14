

import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, ChevronDown } from 'lucide-react';
import { RetroItem, PermissionSettings } from '../types';
import { dataService } from '../services/dataService';

interface ItemDetailModalProps {
  item: RetroItem | null;
  currentUser: { id: string; name: string; color: string; role: string };
  permissions: PermissionSettings;
  onClose: () => void;
  onUpdate: () => void;
    sprintName?: string;
}

export const IssueDetailModal: React.FC<ItemDetailModalProps> = ({ item, currentUser, permissions, onClose, onUpdate, sprintName }) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (item) {
        setContent(item.content);
        setShowDeleteConfirm(false);
    }
  }, [item]);

  if (!item) return null;

  const handleSaveContent = async () => {
    // Permission check: Can only edit other's cards if permission is enabled
    const isOwnCard = item.user_id === currentUser.id;
    if (!isOwnCard && !permissions.canEditOthersCards) {
      return; // Silently ignore if no permission
    }
    
    setIsSaving(true);
    await dataService.updateItemContent(item.id, content);
    setIsSaving(false);
    onUpdate();
  };

  const handleConfirmDelete = async () => {
    // Permission check: Can only delete other's cards if permission is enabled
    const isOwnCard = item.user_id === currentUser.id;
    if (!isOwnCard && !permissions.canDeleteOthersCards) {
      setShowDeleteConfirm(false);
      return; // Silently ignore if no permission
    }
    
    try {
        await dataService.deleteItem(item.id);
        onUpdate();
        onClose();
    } catch (error) {
        console.error("Failed to delete item", error);
    }
  };

  const getStatusColor = () => {
      if (item.is_staged) return 'bg-yellow-100 text-yellow-700';
      if (item.parent_id) return 'bg-purple-100 text-purple-700';
      return 'bg-green-100 text-green-700';
  };
  
  const getStatusText = () => {
      if (item.is_staged) return 'DRAFT';
      if (item.parent_id) return 'GROUPED';
      return 'PUBLISHED';
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200">
      {/* Jira-style Modal Container - Made smaller */}
      <div className="bg-white w-full max-w-3xl h-[70vh] rounded-[3px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative">
        
        {/* Header Toolbar */}
        <div className="h-16 border-b border-[#DFE1E6] flex items-center justify-between px-6 shrink-0 bg-white">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-[#0052CC] rounded-[3px] text-white text-xs font-bold">
                RET
             </div>
                 <div className="flex flex-col">
                     <span className="text-xs text-[#5E6C84] hover:underline cursor-pointer">RET-{item.id.substring(0,4).toUpperCase()}</span>
                     <span className="text-xs text-[#5E6C84]">{sprintName ? `${sprintName} Retrospective` : 'Retro14 Retrospective'}</span>
                 </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Only show delete button if user owns the card or has permission */}
            {(item.user_id === currentUser.id || permissions.canDeleteOthersCards) && (
              <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-[#5E6C84] hover:bg-[#EBECF0] hover:text-[#DE350B] rounded-[3px] transition-colors"
                  title="Delete Issue"
              >
                  <Trash2 size={20} />
              </button>
            )}
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
                            className="px-3 py-1 text-xs font-medium text-[#42526E] hover:bg-[#EBECF0] rounded-[3px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmDelete}
                            className="px-3 py-1 text-xs font-bold text-white bg-[#DE350B] hover:bg-[#BF2600] rounded-[3px] shadow-sm transition-colors"
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
                    <textarea
                        className="w-full min-h-[120px] p-3 rounded-[3px] text-[#172B4D] text-base leading-relaxed outline-none resize-none bg-transparent hover:bg-[#EBECF0]/50 focus:bg-white focus:ring-2 focus:ring-[#4C9AFF] border border-[#DFE1E6] focus:border-[#4C9AFF] transition-all"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a description..."
                    />
                    <div className="flex justify-end mt-2">
                        <button 
                            onClick={handleSaveContent}
                            disabled={content === item.content || isSaving}
                            className="px-3 py-1 bg-[#0052CC] text-white text-xs font-bold rounded-[3px] hover:bg-[#0747A6] disabled:opacity-50 disabled:bg-[#EBECF0] disabled:text-[#A5ADBA] transition-colors"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Context Sidebar */}
            <div className="w-full md:w-80 border-l border-[#DFE1E6] bg-white overflow-y-auto">
                <div className="p-6 space-y-6">
                    
                    {/* Status Dropdown (Mock) */}
                    <div>
                        <label className="text-xs font-bold text-[#5E6C84] uppercase block mb-1.5">Status</label>
                        <button className={`text-xs font-bold px-3 py-1 rounded-[3px] flex items-center justify-between w-fit gap-2 uppercase tracking-wide transition-colors ${getStatusColor()}`}>
                            {getStatusText()}
                            <ChevronDown size={14} />
                        </button>
                    </div>

                    {/* Meta Fields Section */}
                    <div className="border border-[#DFE1E6] rounded-[3px] p-4 bg-white shadow-sm">
                         <div className="text-xs font-bold text-[#42526E] mb-3 uppercase tracking-wide border-b border-[#DFE1E6] pb-2">Details</div>
                         
                         {/* Reporter */}
                         <div className="flex items-center gap-2 mb-4">
                             <div className="w-24 shrink-0 text-sm text-[#5E6C84] font-medium">Reporter</div>
                             <div className="flex items-center gap-2 flex-1">
                                 <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                    style={{ backgroundColor: item.author_color || '#DFE1E6' }}
                                 >
                                     {(item.author_name || 'Unknown').charAt(0)}
                                 </div>
                                 <span className="text-sm text-[#172B4D]">{item.author_name || 'Unknown'}</span>
                             </div>
                         </div>

                         {/* Editors - Show reporter and current user */}
                         <div className="flex items-start gap-2">
                             <div className="w-24 shrink-0 text-sm text-[#5E6C84] font-medium">Editors</div>
                             <div className="flex flex-col gap-2 flex-1">
                                 {/* Reporter (original author) */}
                                 <div className="flex items-center gap-2">
                                     <div 
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                        style={{ backgroundColor: item.author_color || '#DFE1E6' }}
                                     >
                                         {(item.author_name || 'Unknown').charAt(0)}
                                     </div>
                                     <span className="text-sm text-[#172B4D]">{item.author_name || 'Unknown'}</span>
                                 </div>
                                 {/* Current user (if different from reporter) */}
                                 {currentUser.id !== item.user_id && (
                                     <div className="flex items-center gap-2">
                                         <div 
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                            style={{ backgroundColor: currentUser.color }}
                                         >
                                             {currentUser.name.charAt(0)}
                                         </div>
                                         <span className="text-sm text-[#172B4D]">{currentUser.name}</span>
                                     </div>
                                 )}
                             </div>
                         </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
