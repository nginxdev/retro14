
import React from 'react';
import { KanbanSquare, Settings, ChevronLeft, ChevronRight, Users, History, Layout, Copy, Check } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentUser: User;
  onEditProfile: () => void;
  onOpenSettings: () => void;
  onOpenTeam: () => void;
  onOpenHistory: () => void;
  onSwitchSprint: () => void;
  sprintName?: string;
  sprintCode?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, onToggle, currentUser, onEditProfile, onOpenSettings, onOpenTeam, onOpenHistory, onSwitchSprint, sprintName, sprintCode
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    if (sprintCode) {
      navigator.clipboard.writeText(sprintCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className={`relative flex flex-col h-full bg-[#F4F5F7] border-r border-[#DFE1E6] transition-all duration-300 z-40 group/sidebar ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}
    >
      {/* Project Info Header */}
      <div className={`flex items-center h-16 px-4 mb-2 transition-opacity ${collapsed ? 'justify-center' : ''}`}>
        <img 
          src="/logo-192.png" 
          alt="Retro14 Logo" 
          className="w-8 h-8 rounded-[3px] shrink-0 shadow-sm"
        />
        {!collapsed && (
          <div className="ml-3 overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
            <h1 className="text-sm font-semibold text-[#172B4D] truncate leading-tight">Retro14</h1>
            <p className="text-[11px] text-[#5E6C84] truncate mt-0.5">{sprintName || 'Current Sprint'}</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 px-3">
        
        {/* Main Section */}
        {!collapsed && (
            <div className="px-3 mt-4 mb-2">
                <span className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wide">Menu</span>
            </div>
        )}
        
        <NavItem 
            icon={<KanbanSquare size={20} />} 
            label="Board" 
            active 
            collapsed={collapsed} 
        />
        
        <NavItem 
            icon={<History size={20} />} 
            label="History" 
            collapsed={collapsed} 
            onClick={onOpenHistory}
        />
        
        <NavItem 
            icon={<Users size={20} />} 
            label="Team" 
            collapsed={collapsed} 
            onClick={onOpenTeam}
        />

        <div className="my-2"></div>

        <NavItem 
            icon={<Settings size={20} />} 
            label="Board Settings" 
            collapsed={collapsed} 
            onClick={onOpenSettings} 
        />

        <div className="my-2 border-t border-[#DFE1E6] mx-3"></div>

        <NavItem 
            icon={<Layout size={20} />} 
            label="Switch Sprint" 
            collapsed={collapsed} 
            onClick={onSwitchSprint} 
        />
      </nav>

      {/* Collapse Toggle Button - Jira Style (Overlapping border) */}
      <button 
        onClick={onToggle}
        className="absolute -right-3.5 inset-y-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-[#DFE1E6] rounded-full flex items-center justify-center shadow-md hover:bg-[#0052CC] hover:border-[#0052CC] hover:text-white text-[#5E6C84] transition-colors z-50"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-[#DFE1E6] space-y-3">
        {/* Board Code */}
        {sprintCode && !collapsed && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-[3px] border border-[#DFE1E6] hover:border-[#0052CC] transition-colors group">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-[#5E6C84] uppercase tracking-wide mb-0.5">Board Code</p>
              <p className="text-sm font-mono font-bold text-[#0052CC] truncate">{sprintCode}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-1 text-[#5E6C84] hover:text-[#0052CC] hover:bg-[#DEEBFF] rounded transition-colors shrink-0"
              title="Copy board code"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}

        {/* User Profile */}
        <div 
          className="flex items-center cursor-pointer hover:bg-[#EBECF0] p-2 rounded-[3px] transition-colors group relative"
          onClick={onEditProfile}
        >
          <div 
             className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 border-2 border-transparent group-hover:border-white shadow-sm"
             style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1 overflow-hidden animate-in fade-in duration-200">
              <p className="text-sm font-medium text-[#172B4D] truncate">{currentUser.name}</p>
              <p className="text-xs text-[#5E6C84] truncate">{currentUser.role}</p>
            </div>
          )}
        </div>
        
        {!collapsed && (
            <div className="text-center">
                <p className="text-[9px] text-[#A5ADBA] font-mono">v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}</p>
            </div>
        )}
      </div>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; collapsed: boolean; onClick?: () => void }> = ({ icon, label, active, collapsed, onClick }) => {
  return (
    <div 
        onClick={onClick}
        className={`flex items-center px-3 py-2 rounded-[3px] cursor-pointer transition-colors mb-1 ${
        active 
            ? 'bg-[#DEEBFF] text-[#0052CC]' 
            : 'text-[#172B4D] hover:bg-[#EBECF0]'
        } ${collapsed ? 'justify-center' : ''}`}
    >
        <span className={`shrink-0 ${active ? 'text-[#0052CC]' : 'text-[#42526E]'}`}>{icon}</span>
        {!collapsed && <span className="ml-3 text-sm font-medium truncate">{label}</span>}
    </div>
  );
};
