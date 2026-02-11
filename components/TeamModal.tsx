
import React from 'react';
import { X, User as UserIcon, Mail, Shield } from 'lucide-react';
import { User } from '../types';

interface TeamModalProps {
  participants: User[];
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ participants, onClose }) => {
  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#FAFBFC]">
          <h3 className="font-semibold text-[#172B4D] flex items-center gap-2">
            <UserIcon size={18} className="text-[#0052CC]" />
            Team Members
          </h3>
          <button onClick={onClose}><X size={18} className="text-[#5E6C84]" /></button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
            {participants.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-white border border-[#DFE1E6] rounded-[3px] hover:shadow-sm transition-shadow">
                     <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                        style={{ backgroundColor: user.color }}
                     >
                        {user.name.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2">
                             <h4 className="text-sm font-semibold text-[#172B4D] truncate">{user.name}</h4>
                             {user.role === 'Product Owner' || user.role === 'Scrum Master' ? (
                                 <span className="bg-[#EAE6FF] text-[#403294] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Admin</span>
                             ) : null}
                         </div>
                         <p className="text-xs text-[#5E6C84] truncate flex items-center gap-1">
                             <Shield size={10} /> {user.role}
                         </p>
                     </div>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] text-center">
            <p className="text-xs text-[#5E6C84]">
                {participants.length} active participants in this session.
            </p>
        </div>
      </div>
    </div>
  );
};
