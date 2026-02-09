
import React, { useState } from 'react';
import { X, Copy, Check, Link } from 'lucide-react';

interface ShareDialogProps {
  onClose: () => void;
  sprintCode: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ onClose, sprintCode }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const shareUrl = `${window.location.origin}/${sprintCode}`;
  const boardCode = sprintCode;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(boardCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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
                    value={shareUrl}
                    className="flex-1 border border-[#DFE1E6] rounded p-2 text-sm text-[#172B4D] bg-[#FAFBFC] focus:outline-none"
                />
                <button 
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-[#F4F5F7] hover:bg-[#EBECF0] rounded text-[#42526E] font-medium text-sm flex items-center gap-2 transition-colors min-w-[90px] justify-center"
                >
                    {copiedLink ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copiedLink ? 'Copied' : 'Copy'}
                </button>
            </div>
          </div>
          
          <div className="p-4 bg-[#EAE6FF] rounded-lg border border-[#C0B6F2] flex justify-between items-center">
             <div className="flex-1">
                <span className="block text-xs font-bold text-[#403294] uppercase mb-0.5">Board Code</span>
                <span className="text-lg font-mono font-bold text-[#403294] tracking-wider">{boardCode}</span>
             </div>
             <button 
                onClick={handleCopyCode}
                className="h-10 w-10 bg-white rounded flex items-center justify-center text-[#403294] hover:bg-[#EBECF0] transition-colors border border-[#C0B6F2] relative"
                title="Copy Board Code"
             >
                {copiedCode ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                {copiedCode && (
                    <span className="absolute -top-8 bg-[#403294] text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">Copied!</span>
                )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
