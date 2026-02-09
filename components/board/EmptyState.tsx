import React from 'react';
import { ClipboardList } from 'lucide-react';

export const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-48 text-center p-4 animate-in fade-in duration-500">
    <div className="mb-3 text-[#97A0AF]">
      <ClipboardList size={48} />
    </div>
    <h3 className="text-sm font-semibold text-[#6B778C] mb-1">No items yet</h3>
    <p className="text-xs text-[#97A0AF]">Drop a card here or click + to add</p>
  </div>
);
