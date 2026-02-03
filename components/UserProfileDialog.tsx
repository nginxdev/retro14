
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { User } from '../types';

interface UserProfileDialogProps {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
}

const COLORS = [
  '#0052CC', // Blue
  '#36B37E', // Green
  '#FF5630', // Red
  '#FF991F', // Orange
  '#6554C0', // Purple
  '#00B8D9', // Teal
  '#C0546C', // Rose
  '#505F79', // Gray
];

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [color, setColor] = useState(user.color);

  const handleSave = () => {
    onSave({ ...user, name, role, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#FAFBFC]">
          <h3 className="font-semibold text-[#172B4D]">Edit Profile</h3>
          <button onClick={onClose}><X size={18} className="text-[#5E6C84]" /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded p-2 text-sm focus:ring-2 focus:ring-[#4C9AFF] focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1">Role</label>
            <input 
              type="text" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded p-2 text-sm focus:ring-2 focus:ring-[#4C9AFF] focus:border-transparent outline-none"
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-2">Color</label>
             <div className="flex flex-wrap gap-3">
               {COLORS.map((c) => (
                 <button
                   key={c}
                   onClick={() => setColor(c)}
                   className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-[#172B4D] scale-110' : 'border-transparent'}`}
                   style={{ backgroundColor: c }}
                 >
                   {color === c && <Check size={14} className="text-white mx-auto" />}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm font-medium text-[#42526E] hover:bg-[#EBECF0] rounded">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1.5 text-sm font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded">Save</button>
        </div>
      </div>
    </div>
  );
};
