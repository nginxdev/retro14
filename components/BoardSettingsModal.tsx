
import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { Column } from '../types';

interface BoardSettingsModalProps {
  columns: Column[];
  onSave: (columns: Column[]) => void;
  onClose: () => void;
}

const THEMES = ['green', 'red', 'blue', 'yellow', 'purple', 'gray'] as const;

export const BoardSettingsModal: React.FC<BoardSettingsModalProps> = ({ columns, onSave, onClose }) => {
  const [editedColumns, setEditedColumns] = useState<Column[]>([...columns]);

  const handleTitleChange = (id: string, newTitle: string) => {
    setEditedColumns(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleThemeChange = (id: string, newTheme: any) => {
    setEditedColumns(prev => prev.map(c => c.id === id ? { ...c, colorTheme: newTheme } : c));
  };

  const handleDelete = (id: string) => {
    if (editedColumns.length <= 1) {
        alert("You must have at least one column.");
        return;
    }
    setEditedColumns(prev => prev.filter(c => c.id !== id));
  };

  const handleAdd = () => {
    const newCol: Column = {
        id: `col-${Date.now()}`,
        title: 'New Column',
        colorTheme: 'gray'
    };
    setEditedColumns(prev => [...prev, newCol]);
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-2xl h-[70vh] rounded-lg shadow-xl flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#DFE1E6] flex justify-between items-center">
          <div>
              <h2 className="text-lg font-semibold text-[#172B4D]">Board Settings</h2>
              <p className="text-sm text-[#5E6C84]">Manage columns and layout</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-[#5E6C84]" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAFBFC]">
            <div className="space-y-4">
                {editedColumns.map((col, index) => (
                    <div key={col.id} className="bg-white p-4 rounded border border-[#DFE1E6] shadow-sm flex items-center gap-4 group">
                        <GripVertical className="text-[#DFE1E6] cursor-grab" size={20} />
                        
                        <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase text-[#5E6C84] mb-1 block">Column Title</label>
                            <input 
                                value={col.title}
                                onChange={(e) => handleTitleChange(col.id, e.target.value)}
                                className="w-full border border-[#DFE1E6] rounded px-2 py-1.5 text-sm font-medium text-[#172B4D] focus:ring-2 focus:ring-[#4C9AFF] focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase text-[#5E6C84] mb-1 block">Theme</label>
                            <div className="flex gap-1">
                                {THEMES.map(theme => (
                                    <button 
                                        key={theme}
                                        onClick={() => handleThemeChange(col.id, theme)}
                                        className={`w-6 h-6 rounded-full border-2 ${col.colorTheme === theme ? 'border-[#172B4D]' : 'border-transparent'} transition-all`}
                                        style={{ backgroundColor: getThemeColor(theme) }}
                                        title={theme}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={() => handleDelete(col.id)}
                                className="p-2 text-[#5E6C84] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={handleAdd}
                    className="w-full py-3 border-2 border-dashed border-[#DFE1E6] rounded-lg text-[#5E6C84] font-medium hover:bg-[#EBECF0] hover:border-[#C1C7D0] transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Add Column
                </button>
            </div>
        </div>

        <div className="p-5 border-t border-[#DFE1E6] flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#42526E] hover:bg-[#EBECF0] rounded">Cancel</button>
          <button onClick={() => { onSave(editedColumns); onClose(); }} className="px-4 py-2 text-sm font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const getThemeColor = (theme: string) => {
    switch (theme) {
        case 'green': return '#E3FCEF';
        case 'red': return '#FFEBE6';
        case 'blue': return '#DEEBFF';
        case 'yellow': return '#FFF0B3';
        case 'purple': return '#EAE6FF';
        default: return '#F4F5F7';
    }
}
