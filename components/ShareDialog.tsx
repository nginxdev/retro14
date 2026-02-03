
import React, { useState } from 'react';
import { X, Copy, Check, Link } from 'lucide-react';

interface ShareDialogProps {
  onClose: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;
  const boardCode = "R14-24-X9Z"; // Branding updated

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#FAFBFC]">
          <h3 className="font-semibold text-[#172B4D] flex items-center gap-2">
            <Link size={16} />
            Share Board
          </h3>
          <button onClick={onClose}><X size={18} className="text-[#5E6C84]" /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-2">Board Link</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    readOnly
                    value={currentUrl}
                    className="flex-1 border border-[#DFE1E6] rounded p-2 text-sm text-[#172B4D] bg-[#FAFBFC] focus:outline-none"
                />
                <button 
                    onClick={handleCopy}
                    className="px-3 py-2 bg-[#F4F5F7] hover:bg-[#EBECF0] rounded text-[#42526E] font-medium text-sm flex items-center gap-2 transition-colors min-w-[90px] justify-center"
                >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
          </div>
          
          <div className="p-4 bg-[#EAE6FF] rounded-lg border border-[#C0B6F2] flex justify-between items-center">
             <div>
                <span className="block text-xs font-bold text-[#403294] uppercase mb-0.5">Board Code</span>
                <span className="text-lg font-mono font-bold text-[#403294] tracking-wider">{boardCode}</span>
             </div>
             <div className="h-10 w-10 bg-white rounded flex items-center justify-center text-[#403294] font-bold text-xl">
                R
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
