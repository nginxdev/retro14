
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Column } from '../types';

interface ColumnSettingsDialogProps {
  column: Column;
  onSave: (id: string, title: string, theme: any) => void;
  onClose: () => void;
}

const THEMES = ['green', 'red', 'blue', 'yellow', 'purple', 'gray'] as const;

export const ColumnSettingsDialog: React.FC<ColumnSettingsDialogProps> = ({ column, onSave, onClose }) => {
  const [title, setTitle] = useState(column.title);
  const [theme, setTheme] = useState(column.colorTheme);

  const handleSave = () => {
    onSave(column.id, title, theme);
    onClose();
  };

  const getThemeColor = (t: string) => {
    switch (t) {
        case 'green': return '#E3FCEF';
        case 'red': return '#FFEBE6';
        case 'blue': return '#DEEBFF';
        case 'yellow': return '#FFF0B3';
        case 'purple': return '#EAE6FF';
        default: return '#F4F5F7';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#FAFBFC]">
          <h3 className="font-semibold text-[#172B4D]">Edit Column</h3>
          <button onClick={onClose}><X size={18} className="text-[#5E6C84]" /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1">Column Name</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded p-2 text-sm focus:ring-2 focus:ring-[#4C9AFF] focus:border-transparent outline-none"
              autoFocus
            />
          </div>
          
          <div>
             <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-2">Color Theme</label>
             <div className="flex flex-wrap gap-3">
               {THEMES.map((c) => (
                 <button
                   key={c}
                   onClick={() => setTheme(c)}
                   className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${theme === c ? 'border-[#172B4D] scale-110' : 'border-transparent'}`}
                   style={{ backgroundColor: getThemeColor(c) }}
                 >
                   {theme === c && <Check size={14} className="text-[#172B4D] mx-auto opacity-50" />}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] flex justify-end gap-2">
          <button onClick={onClose} className="px-2 py-1 text-xs font-medium text-[#42526E] hover:bg-[#EBECF0] rounded">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1.5 text-sm font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded">Save</button>
        </div>
      </div>
    </div>
  );
};
