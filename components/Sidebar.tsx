
import React from 'react';
import { KanbanSquare, Settings, ChevronLeft, ChevronRight, Users, History, Layout } from 'lucide-react';
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
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, onToggle, currentUser, onEditProfile, onOpenSettings, onOpenTeam, onOpenHistory, onSwitchSprint 
}) => {
  return (
    <div 
      className={`relative flex flex-col h-full bg-[#F4F5F7] border-r border-[#DFE1E6] transition-all duration-300 z-40 group/sidebar ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}
    >
      {/* Project Info Header */}
      <div className={`flex items-center h-16 px-4 mb-2 transition-opacity ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-[#0052CC] rounded-[3px] flex items-center justify-center shrink-0 shadow-sm text-white font-bold tracking-tight">
          R
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
            <h1 className="text-sm font-semibold text-[#172B4D] truncate leading-tight">Retro14</h1>
            <p className="text-[11px] text-[#5E6C84] truncate mt-0.5">Sprint 24</p>
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
      <div className="absolute -right-3 top-8 opacity-0 group-hover/sidebar:opacity-100 transition-opacity z-50">
          <button 
            onClick={onToggle}
            className="w-6 h-6 bg-white border border-[#DFE1E6] rounded-full flex items-center justify-center shadow-sm hover:bg-[#0052CC] hover:border-[#0052CC] hover:text-white text-[#5E6C84] transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-[#DFE1E6]">
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
