import React, { useEffect, useState } from 'react';
import { X, Calendar, ArrowRight, FileText, Loader2 } from 'lucide-react';
import { dataService } from '../services/dataService';

interface HistoryModalProps {
  userId: string;
  currentSprintId?: string;
  currentSprintName?: string;
  currentSprintCode?: string;
  onClose: () => void;
  onSelectSprint: (code: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
    userId, 
    currentSprintId, 
    currentSprintName,
    currentSprintCode,
    onClose, 
    onSelectSprint 
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.fetchJoinedSprints(userId).then(data => {
        let finalHistory = [...data];
        
        // Ensure current sprint is in the list
        if (currentSprintId && !finalHistory.some(h => h.id === currentSprintId)) {
            finalHistory.unshift({
                id: currentSprintId,
                name: currentSprintName,
                code: currentSprintCode,
                date: new Date().toISOString()
            });
        }
        
        setHistory(finalHistory);
        setLoading(false);
    });
  }, [userId, currentSprintId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#FAFBFC]">
          <h3 className="font-semibold text-[#172B4D] flex items-center gap-2">
            <Calendar size={18} className="text-[#0052CC]" />
            Retrospective History
          </h3>
          <button onClick={onClose}><X size={18} className="text-[#5E6C84]" /></button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin text-[#0052CC] mb-2" size={32} />
                    <p className="text-sm text-[#5E6C84]">Loading history...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-[#5E6C84]">No board history found.</p>
                </div>
            ) : (
                history.map(retro => (
                    <div 
                        key={retro.id} 
                        onClick={() => retro.id !== currentSprintId && onSelectSprint(retro.code)}
                        className={`group flex items-center justify-between p-4 bg-white border rounded-[3px] transition-all ${retro.id === currentSprintId ? 'border-b400 bg-b50 ring-1 ring-b400' : 'border-[#DFE1E6] hover:border-[#4C9AFF] hover:shadow-md cursor-pointer'}`}
                    >
                         <div className="flex items-start gap-3">
                             <div className={`p-2 rounded-[3px] ${retro.id === currentSprintId ? 'bg-b400 text-white' : 'bg-[#DEEBFF] text-[#0052CC]'}`}>
                                 <FileText size={20} />
                             </div>
                             <div>
                                 <div className="flex items-center gap-2">
                                     <h4 className={`text-sm font-semibold truncate ${retro.id === currentSprintId ? 'text-b800' : 'text-[#172B4D] group-hover:text-[#0052CC]'}`}>
                                         {retro.name || 'Unnamed Board'}
                                     </h4>
                                     {retro.id === currentSprintId && (
                                         <span className="bg-b400 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase">Current</span>
                                     )}
                                 </div>
                                 <p className={`text-xs mt-0.5 ${retro.id === currentSprintId ? 'text-b600' : 'text-[#5E6C84]'}`}>
                                     {formatDate(retro.date)} • {retro.code}
                                 </p>
                             </div>
                         </div>
                         <div className="flex items-center gap-4">
                             {retro.id !== currentSprintId && (
                                 <ArrowRight size={16} className="text-[#97A0AF] group-hover:text-[#0052CC] transform group-hover:translate-x-1 transition-all" />
                             )}
                         </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] flex justify-center">
             <button onClick={onClose} className="text-sm font-medium text-[#0052CC] hover:underline">
                 Close
             </button>
        </div>
      </div>
    </div>
  );
};
