
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Board } from '../components/Board';
import { IssueDetailModal } from '../components/IssueDetailModal';
import { UserProfileDialog } from '../components/UserProfileDialog';
import { BoardSettingsModal } from '../components/BoardSettingsModal';
import { ColumnSettingsDialog } from '../components/ColumnSettingsDialog';
import { ShareDialog } from '../components/ShareDialog';
import { VotingConfigDialog } from '../components/VotingConfigDialog';
import { Timer } from '../components/Timer';
import { UserFooter } from '../components/UserFooter';
import { TeamModal } from '../components/TeamModal';
import { HistoryModal } from '../components/HistoryModal';
import { Share2, Vote, X, AlertTriangle, Eye, ChevronDown, Settings, Layers, ArrowDownAZ, EyeOff, Check, Download } from 'lucide-react';
import { ExportModal } from '../components/ExportModal';
import { useRetroBoard } from '../hooks/useRetroBoard';
import { dataService } from '../services/dataService';
import { SIDEBAR_BREAKPOINT } from '../utils/breakpoints';

import { User } from '../types';

export interface RetroPageProps {
  user?: User;
  sprintId: string;
  sprintName?: string;
  sprintCode?: string;
  onSwitchSprint: () => void;
    onSignOut: () => void;
}

export const RetroPage: React.FC<RetroPageProps> = ({ user, sprintId, sprintName, sprintCode, onSwitchSprint, onSignOut }) => {
    const {
        columns, setColumns,
        items, selectedItem, setSelectedItem,
        currentUser, setCurrentUser,
        participants,
        // ...
        isVotingConfigOpen, setIsVotingConfigOpen,
        isVotingActive,
        votingConfig,
        isEndVotingConfirmOpen, setIsEndVotingConfirmOpen,
        isProfileOpen, setIsProfileOpen,
        isSettingsOpen, setIsSettingsOpen,
        isShareOpen, setIsShareOpen,
        editingColumnId, setEditingColumnId,
        sidebarCollapsed, setSidebarCollapsed,
        userVotesUsed,
        hiddenColumnIds,
        viewConfig, setViewConfig,
        isCardOverviewEnabled, setIsCardOverviewEnabled,
        permissions, setPermissions,
        isLoading,
        refreshData,
        handleStartVoting,
        confirmEndVoting,
        handleVote,
        handleAddActionItem,
        handleToggleActionItem,
        handleAddComment,
        handleUpdateItemContent,
        handleMoveItem,
        handleGroupItem,
        handleAddItem,
        handlePublishAll,
        handleReaction,
        handleRaiseHand,
        handleLowerAllHands,
        handleUpdateProfile,
        handleColumnUpdate,
        handleToggleColumnVisibility,
        handleDeleteItem,
        handleStartTimer,
        handlePauseTimer,
        handleResumeTimer,
        handleResetTimer,
        timer,
        remainingTime
    } = useRetroBoard(user, sprintId);

    const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
    const [isTeamOpen, setIsTeamOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Handle click outside sidebar on small screens to close it
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (window.innerWidth < SIDEBAR_BREAKPOINT && sidebarCollapsed === false) {
          if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
            setSidebarCollapsed(true);
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarCollapsed]);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= SIDEBAR_BREAKPOINT) {
          // On larger screens, allow sidebar to stay open
          // Don't force any state change here
        } else if (window.innerWidth < SIDEBAR_BREAKPOINT) {
          // On smaller screens, collapse by default
          setSidebarCollapsed(true);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sort: Hand raised first (by time), then others
    const sortedParticipants = [...participants].sort((a, b) => {
        if (a.isHandRaised && !b.isHandRaised) return -1;
        if (!a.isHandRaised && b.isHandRaised) return 1;
        if (a.isHandRaised && b.isHandRaised) {
            return (a.handRaisedAt || 0) - (b.handRaisedAt || 0);
        }
        return 0;
    });

  return (
    <div className="flex h-screen w-full bg-n10 overflow-hidden">
            <div ref={sidebarRef}>
              <Sidebar 
                  collapsed={sidebarCollapsed} 
                  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
                  currentUser={currentUser}
                  onEditProfile={() => setIsProfileOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenTeam={() => setIsTeamOpen(true)}
                  onOpenHistory={() => setIsHistoryOpen(true)}
                  onSwitchSprint={onSwitchSprint}
                  sprintName={sprintName}
                  sprintCode={sprintCode}
              />
            </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="relative h-14 bg-white border-b border-n40 flex items-center justify-between px-6 shrink-0 z-30">
           {/* Breadcrumbs */}
           <div className="flex items-center">
             <div className="text-sm breadcrumbs text-n300 flex items-center gap-2">
               <span className="font-semibold text-n500 hover:text-b400 cursor-pointer hidden lg:inline">Retro14</span>
               <span className="text-n300 hidden lg:inline">/</span>
               <span className="font-semibold text-n800">{sprintName || 'Current Sprint'}</span>
               <div className="h-4 w-px bg-n40 mx-2"></div>
               <div className="flex items-center gap-1 text-xs bg-g50 text-g400 px-2 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 bg-g200 rounded-full animate-pulse"></span>
                  <span>Live</span>
               </div>
             </div>
           </div>
           
           {/* Center Controls (Timer & Voting) */}
           <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                <Timer 
                  timer={timer}
                  remainingTime={remainingTime}
                  onStart={handleStartTimer}
                  onPause={handlePauseTimer}
                  onResume={handleResumeTimer}
                  onReset={handleResetTimer}
                />
               
               {!isVotingActive ? (
                   <button 
                       onClick={() => setIsVotingConfigOpen(true)}
                       className="flex items-center gap-2 px-2 py-1 bg-n20 border border-n40 rounded text-n800 hover:bg-n30 text-xs font-medium transition-colors"
                       title="Start Vote"
                   >
                       <Vote size={14} />
                       <span className="hidden lg:inline">Start Vote</span>
                   </button>
               ) : (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-g50 border border-g100 rounded-lg animate-in fade-in">
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-g400 font-bold uppercase tracking-wide">Votes Left</span>
                            <span className="text-sm font-bold text-g400">
                                {userVotesUsed} / {votingConfig?.votesPerParticipant}
                            </span>
                        </div>
                        <div className="h-6 w-px bg-g100 mx-1"></div>
                        <button 
                            onClick={() => setIsEndVotingConfirmOpen(true)}
                            className="text-xs font-bold text-g400 hover:underline"
                        >
                            End Voting
                        </button>
                   </div>
               )}
           </div>
           
           {/* Right Actions */}
           <div className="flex items-center gap-4">
             {/* View Options Menu */}
             <div className="relative">
                 <button
                    onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1 bg-n20 border border-n40 rounded text-xs text-n500 hover:bg-n30 transition-colors"
                    title="View Options"
                 >
                     <Settings size={16} />
                     <span className="hidden lg:inline">View Options</span>
                     <ChevronDown size={14} className="hidden lg:inline" />
                 </button>
                 
                 {isViewMenuOpen && (
                     <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-n40 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                         <div className="fixed inset-0 z-[-1]" onClick={() => setIsViewMenuOpen(false)}></div>
                         
                         {/* Global Sort/Group */}
                         <div className="p-2 border-b border-n40">
                            <div className="text-[10px] font-bold text-n300 uppercase mb-2 px-2">Global Settings</div>
                             <button
                                 onClick={() => {
                                     setViewConfig(prev => ({ ...prev, sortBy: prev.sortBy === 'author' ? 'none' : 'author' }));
                                 }}
                                 className="w-full text-left px-2 py-1 text-xs text-n800 hover:bg-n20 flex items-center justify-between rounded"
                             >
                                 <div className="flex items-center gap-2">
                                     <ArrowDownAZ size={14} className="text-n300" />
                                     <span>Sort All by Author</span>
                                 </div>
                                 {viewConfig.sortBy === 'author' && <Check size={14} className="text-b400" />}
                             </button>
                             <button
                                 onClick={() => {
                                     setViewConfig(prev => ({ ...prev, groupBy: prev.groupBy === 'author' ? 'none' : 'author' }));
                                 }}
                                 className="w-full text-left px-2 py-1 text-xs text-n800 hover:bg-n20 flex items-center justify-between rounded"
                             >
                                 <div className="flex items-center gap-2">
                                     <Layers size={14} className="text-n300" />
                                     <span>Group All by Author</span>
                                 </div>
                                 {viewConfig.groupBy === 'author' && <Check size={14} className="text-b400" />}
                             </button>
                         </div>

                         {/* Column Visibility */}
                         <div className="p-2 bg-n10">
                             <div className="text-[10px] font-bold text-n300 uppercase mb-2 px-2">Column Visibility</div>
                             <div className="max-h-60 overflow-y-auto">
                                 {columns.map(c => (
                                     <button
                                         key={c.id}
                                         onClick={() => handleToggleColumnVisibility(c.id)}
                                         className="w-full text-left px-2 py-1 text-xs text-n800 hover:bg-n30 flex items-center justify-between group rounded"
                                     >
                                         <span className="truncate">{c.title}</span>
                                         {hiddenColumnIds.has(c.id) ? (
                                             <EyeOff size={14} className="text-r500" />
                                         ) : (
                                             <Eye size={14} className="text-b400" />
                                         )}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     </div>
                 )}
             </div>

             <button 
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-2 px-2 py-1 bg-n20 border border-n40 rounded text-xs text-n800 hover:bg-n30 transition-colors"
                title="Export"
             >
                <Download size={16} />
                <span className="hidden xl:inline">Export</span>
             </button>

             <button 
                onClick={() => setIsShareOpen(true)}
                className="bg-b400 text-white px-2 py-1 rounded font-bold text-xs hover:bg-b500 flex items-center transition-colors"
                title="Share"
             >
                <Share2 size={16} className="xl:mr-2" />
                <span className="hidden xl:inline">Share</span>
             </button>
           </div>
        </header>

        {/* Board Area */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden bg-gradient-to-b from-n10 to-white relative">
            <div className="absolute inset-0 px-8 py-6">
                <Board 
                    columns={columns}
                    items={items} 
                    currentUser={currentUser}
                    participants={participants}
                    sortedParticipants={sortedParticipants}
                    onMoveItem={handleMoveItem} 
                    onItemClick={setSelectedItem}
                    onAddItem={handleAddItem}
                    onPublishAll={handlePublishAll}
                    onReaction={handleReaction}
                    onGroupItem={handleGroupItem}
                    onEditColumn={setEditingColumnId}
                    
                    isVotingActive={isVotingActive}
                    votingConfig={votingConfig}
                    userVotesUsed={userVotesUsed}
                    onVote={handleVote}

                    onAddActionItem={handleAddActionItem}
                    onToggleActionItem={handleToggleActionItem}
                    onAddComment={handleAddComment}
                    onUpdateItemContent={handleUpdateItemContent}
                    onDelete={handleDeleteItem}
                    permissions={permissions}
                    
                    hiddenColumnIds={hiddenColumnIds}
                    onToggleColumnVisibility={handleToggleColumnVisibility}
                    viewConfig={viewConfig}
                    isCardOverviewEnabled={isCardOverviewEnabled}
                    isLoading={isLoading}
                />
            </div>
        </main>

        <UserFooter 
            currentUser={currentUser}
            participants={participants}
            onRaiseHand={handleRaiseHand}
            onLowerAllHands={handleLowerAllHands}
        />
      </div>

      {/* Modals & Dialogs */}
      <IssueDetailModal 
        item={selectedItem} 
        currentUser={currentUser}
        permissions={permissions}
        onClose={() => setSelectedItem(null)}
        onUpdate={refreshData}
                sprintName={sprintName}
      />
      
      {isProfileOpen && (
            <UserProfileDialog 
                        user={currentUser} 
                        onSave={handleUpdateProfile} 
                        onClose={() => setIsProfileOpen(false)} 
                        onSignOut={() => {
                            setIsProfileOpen(false);
                            onSignOut();
                        }}
                    />
      )}

      {isSettingsOpen && (
          <BoardSettingsModal 
            columns={columns}
            isCardOverviewEnabled={isCardOverviewEnabled}
            permissions={permissions}
            onSave={(newColumns, newPermissions, cardOverview) => {
              setColumns(newColumns);
              setPermissions(newPermissions);
              setIsCardOverviewEnabled(cardOverview);
              
              dataService.updateSprintConfig(sprintId, {
                columns: newColumns,
                votingConfig,
                permissions: newPermissions,
                settings: {
                  isCardOverviewEnabled: cardOverview
                }
              });
            }}
            onClose={() => setIsSettingsOpen(false)}
          />
      )}

      {isTeamOpen && (
          <TeamModal 
            participants={participants}
            onClose={() => setIsTeamOpen(false)}
          />
      )}

      {isHistoryOpen && (
          <HistoryModal 
            userId={currentUser.id}
            currentSprintId={sprintId}
            currentSprintName={sprintName}
            currentSprintCode={sprintCode}
            onClose={() => setIsHistoryOpen(false)} 
            onSelectSprint={(code) => {
                window.location.pathname = `/${code}`;
            }}
          />
      )}

      {isShareOpen && (
          <ShareDialog onClose={() => setIsShareOpen(false)} sprintCode={sprintCode || ''} />
      )}

      {isExportOpen && (
          <ExportModal 
            sprintName={sprintName || 'Current Sprint'}
            participants={participants}
            columns={columns}
            items={items}
            onClose={() => setIsExportOpen(false)}
          />
      )}

      {editingColumnId && (
          <ColumnSettingsDialog 
            column={columns.find(c => c.id === editingColumnId)!}
            onSave={handleColumnUpdate}
            onClose={() => setEditingColumnId(null)}
          />
      )}

      {isVotingConfigOpen && (
          <VotingConfigDialog 
            onStart={handleStartVoting}
            onClose={() => setIsVotingConfigOpen(false)}
          />
      )}

      {isEndVotingConfirmOpen && (
        <div className="fixed inset-0 bg-n900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[1px]">
             <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-n40 flex justify-between items-center bg-n10">
                    <h3 className="font-semibold text-n800 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-b400" />
                        End Voting Session?
                    </h3>
                    <button onClick={() => setIsEndVotingConfirmOpen(false)}><X size={18} className="text-n300" /></button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-n800">This will conclude the voting session. Cards with votes will be <strong>copied</strong> to a new <strong>"Voting Results"</strong> column.</p>
                </div>
                <div className="p-4 border-t border-n40 bg-n10 flex justify-end gap-2">
                    <button onClick={() => setIsEndVotingConfirmOpen(false)} className="px-2 py-1 text-xs font-medium text-n500 hover:bg-n30 rounded">Cancel</button>
                    <button 
                        onClick={confirmEndVoting} 
                        className="px-3 py-1.5 text-sm font-bold text-white bg-b400 hover:bg-b500 rounded"
                    >
                        End Voting
                    </button>
                </div>
             </div>
        </div>
      )}

    </div>
  );
};
