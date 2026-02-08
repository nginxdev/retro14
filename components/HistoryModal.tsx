
import React from 'react';
import { X, Calendar, ArrowRight, FileText } from 'lucide-react';

interface HistoryModalProps {
  onClose: () => void;
}

const MOCK_HISTORY = [
    { id: '1', name: 'Sprint 23 Retro', date: '2 weeks ago', items: 12, participants: 5 },
    { id: '2', name: 'Sprint 22 Retro', date: '1 month ago', items: 15, participants: 6 },
    { id: '3', name: 'Sprint 21 Retro', date: '6 weeks ago', items: 8, participants: 4 },
];

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
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
            {MOCK_HISTORY.map(retro => (
                <div key={retro.id} className="group flex items-center justify-between p-4 bg-white border border-[#DFE1E6] rounded-[3px] hover:border-[#4C9AFF] hover:shadow-md cursor-pointer transition-all">
                     <div className="flex items-start gap-3">
                         <div className="p-2 bg-[#DEEBFF] text-[#0052CC] rounded-[3px]">
                             <FileText size={20} />
                         </div>
                         <div>
                             <h4 className="text-sm font-semibold text-[#172B4D] group-hover:text-[#0052CC]">{retro.name}</h4>
                             <p className="text-xs text-[#5E6C84] mt-0.5">{retro.date} • {retro.participants} participants</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-4">
                         <div className="text-right hidden sm:block">
                             <span className="block text-xs font-bold text-[#172B4D]">{retro.items}</span>
                             <span className="text-[10px] text-[#5E6C84] uppercase">Items</span>
                         </div>
                         <ArrowRight size={16} className="text-[#97A0AF] group-hover:text-[#0052CC] transform group-hover:translate-x-1 transition-all" />
                     </div>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] flex justify-center">
             <button onClick={onClose} className="text-sm font-medium text-[#0052CC] hover:underline">
                 View All Archived Boards
             </button>
        </div>
      </div>
    </div>
  );
};
