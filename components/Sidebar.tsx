
import React from 'react';
import { Layout, Settings, Boxes, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { User } from '../types';

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentUser: User;
  onEditProfile: () => void;
  onOpenSettings: () => void;
}

/**
 * Navigation sidebar with collapse functionality and user profile summary.
 */
export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, currentUser, onEditProfile, onOpenSettings }) => {
  return (
    <div 
      className={`relative flex flex-col h-full bg-n20 border-r border-n40 transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Project Info Header */}
      <div className="flex items-center p-4 h-14 border-b border-n40/50">
        <div className="w-8 h-8 bg-p400 rounded flex items-center justify-center shrink-0 shadow-sm text-white font-bold tracking-tight">
          R14
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden whitespace-nowrap">
            <h1 className="text-sm font-bold text-n800 truncate">Retro14</h1>
            <p className="text-xs text-n300 truncate">Sprint 24</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-1">
        <NavItem icon={<Layout size={20} />} label="Board" active collapsed={collapsed} />
        <div className="my-4 border-t border-n40 mx-4"></div>
        <NavItem icon={<Settings size={20} />} label="Board Settings" collapsed={collapsed} onClick={onOpenSettings} />
      </nav>

      {/* Collapse Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-4 top-3 w-8 h-8 bg-white border border-n40 rounded-full flex items-center justify-center shadow-md hover:bg-b50 text-n300 z-50 transition-transform hover:scale-105"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Bottom User Profile Section */}
      <div className="p-4 border-t border-n40/50">
        <div 
          className="flex items-center cursor-pointer hover:bg-n30 p-2 -m-2 rounded transition-colors group relative"
          onClick={onEditProfile}
        >
          <div 
             className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 border-2 border-transparent group-hover:border-white shadow-sm"
             style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-n800 truncate">{currentUser.name}</p>
              <p className="text-xs text-n300 truncate">{currentUser.role}</p>
            </div>
          )}
          {!collapsed && (
            <div className="opacity-0 group-hover:opacity-100 absolute right-2 bg-white p-1 rounded-full shadow-sm">
                <Edit2 size={10} className="text-n500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; collapsed: boolean; onClick?: () => void }> = ({ icon, label, active, collapsed, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center px-4 py-2 mx-2 rounded cursor-pointer transition-colors ${
      active 
        ? 'bg-p50 text-p500' 
        : 'text-n500 hover:bg-n30'
    }`}
  >
    <span className="shrink-0">{icon}</span>
    {!collapsed && <span className="ml-3 text-sm font-medium truncate">{label}</span>}
  </div>
);
