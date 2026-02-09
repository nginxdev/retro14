import React from 'react';
import { X, FileText, Printer, Download, Info } from 'lucide-react';
import { Column, RetroItem, User } from '../types';
import { convertToMarkdown, downloadMarkdown, generatePDF } from '../utils/exportUtils';

interface ExportModalProps {
  sprintName: string;
  participants: User[];
  columns: Column[];
  items: RetroItem[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  sprintName,
  participants,
  columns,
  items,
  onClose,
}) => {
  const handleExportMarkdown = () => {
    const content = convertToMarkdown(sprintName, participants, columns, items);
    const filename = `retro-${sprintName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    downloadMarkdown(content, filename);
  };

  const handleExportPDF = () => {
    generatePDF(sprintName, participants, columns, items);
  };

  return (
    <div className="fixed inset-0 bg-n900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-n40 flex justify-between items-center bg-n10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-b50 flex items-center justify-center text-b400">
              <Download size={18} />
            </div>
            <h3 className="font-bold text-n800">Export Board</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-n30 rounded-full transition-colors text-n300 hover:text-n500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="flex gap-4 p-4 bg-b50 border border-b100 rounded-lg">
            <Info size={20} className="text-b400 shrink-0 mt-0.5" />
            <p className="text-sm text-b700 leading-relaxed">
              Export your retro session to share with stakeholders or archive for future reference. 
              All columns, cards, and comments will be included.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Markdown Option */}
            <button
              onClick={handleExportMarkdown}
              className="group flex items-start gap-4 p-4 border border-n40 rounded-xl hover:border-b400 hover:bg-b50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-n20 group-hover:bg-white flex items-center justify-center text-n400 group-hover:text-b400 shrink-0 transition-colors">
                <FileText size={24} />
              </div>
              <div>
                <div className="font-bold text-n800 mb-1">Markdown (.md)</div>
                <p className="text-xs text-n500 leading-relaxed">
                  Best for documentation, GitHub, or Notion. Includes formatted text, hierarchical lists, and vote counts.
                </p>
              </div>
            </button>

            {/* Print/PDF Option */}
            <button
              onClick={handleExportPDF}
              className="group flex items-start gap-4 p-4 border border-n40 rounded-xl hover:border-b400 hover:bg-b50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-n20 group-hover:bg-white flex items-center justify-center text-n400 group-hover:text-b400 shrink-0 transition-colors">
                <Printer size={24} />
              </div>
              <div>
                <div className="font-bold text-n800 mb-1">Print / Save as PDF</div>
                <p className="text-xs text-n500 leading-relaxed">
                  Generates a clean, printable layout. Choose "Save as PDF" in your browser's print dialog to download.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-n40 bg-n10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-n600 hover:bg-n30 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
