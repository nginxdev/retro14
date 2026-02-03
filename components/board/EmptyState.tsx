import React from 'react';
import { ClipboardList, ThumbsUp, AlertCircle, Rocket, Lightbulb } from 'lucide-react';

interface EmptyStateProps {
  type: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'gray';
  title?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, title }) => {
  const getIcon = () => {
    switch (type) {
      case 'green': return <ThumbsUp size={48} className="text-green-200" />;
      case 'red': return <AlertCircle size={48} className="text-red-200" />;
      case 'blue': return <Rocket size={48} className="text-blue-200" />;
      case 'yellow': return <Lightbulb size={48} className="text-yellow-200" />;
      case 'purple': return <ClipboardList size={48} className="text-purple-200" />;
      default: return <ClipboardList size={48} className="text-gray-200" />;
    }
  };

  const getText = () => {
    if (title) return title;
    switch (type) {
      case 'green': return "What went well?";
      case 'red': return "What needs improvement?";
      case 'blue': return "Action items";
      case 'yellow': return "Ideas";
      default: return "No items yet";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-48 text-center p-4 animate-in fade-in duration-500">
      <div className="mb-3 transform hover:scale-110 transition-transform duration-300">
        {getIcon()}
      </div>
      <h3 className="text-sm font-semibold text-[#6B778C] mb-1">{getText()}</h3>
      <p className="text-xs text-[#97A0AF]">
        Drop a card here or click + to add
      </p>
    </div>
  );
};