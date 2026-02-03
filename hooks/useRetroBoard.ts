
import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { RetroItem, Column, User, VotingConfig } from '../types';

const INITIAL_COLUMNS: Column[] = [
    { id: 'col-1', title: 'What went well', colorTheme: 'green' },
    { id: 'col-2', title: 'What did not go well', colorTheme: 'red' },
    { id: 'col-3', title: 'What can be improved', colorTheme: 'blue' }
];

const INITIAL_USER: User = {
    id: 'u-1',
    name: 'John Doe',
    role: 'Product Owner',
    color: '#0052CC',
    isHandRaised: false
};

const MOCK_PARTICIPANTS: User[] = [
    { id: 'u-2', name: 'Sarah S.', role: 'Dev', color: '#36B37E', isHandRaised: false },
    { id: 'u-3', name: 'Mike R.', role: 'Designer', color: '#FF5630', isHandRaised: true, handRaisedAt: Date.now() - 5000 },
];

export interface ViewConfig {
    sortBy: 'none' | 'author';
    groupBy: 'none' | 'author';
}

export const useRetroBoard = () => {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [items, setItems] = useState<RetroItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RetroItem | null>(null);
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  // View Configuration
  const [viewConfig, setViewConfig] = useState<ViewConfig>({ sortBy: 'none', groupBy: 'none' });
  
  // User & Participants State
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [participants, setParticipants] = useState<User[]>([...MOCK_PARTICIPANTS, INITIAL_USER]);
  
  // Voting State
  const [isVotingConfigOpen, setIsVotingConfigOpen] = useState(false);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [votingConfig, setVotingConfig] = useState<VotingConfig | undefined>(undefined);
  const [isEndVotingConfirmOpen, setIsEndVotingConfirmOpen] = useState(false);
  
  // Dialogs State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const refreshData = async () => {
    // Keep loading true initially, or set it if doing a full refresh
    // For smoother UX, we might only set loading on mount
    const data = await dataService.fetchItems();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
      setParticipants(prev => prev.map(p => p.id === currentUser.id ? currentUser : p));
  }, [currentUser]);

  const userVotesUsed = items.reduce((acc, item) => acc + ((item.votes || {})[currentUser.id] || 0), 0);

  const handleStartVoting = (config: VotingConfig) => {
      setVotingConfig(config);
      setIsVotingActive(true);
  };

  const confirmEndVoting = async () => {
      setIsEndVotingConfirmOpen(false);
      setIsVotingActive(false);
      
      const newColumn: Column = {
          id: `col-results-${Date.now()}`,
          title: 'Voting Results / Action Items',
          colorTheme: 'purple',
          viewMode: 'action-list'
      };
      setColumns(prev => [...prev, newColumn]);

      const votedItems = items.filter(item => {
          const votes = item.votes || {};
          const total = Object.values(votes).reduce((a, b) => a + b, 0);
          return total > 0;
      });

      for (const item of votedItems) {
          await dataService.copyItem(item.id, newColumn.id);
      }

      refreshData();
  };

  const handleVote = async (itemId: string, delta: 1 | -1) => {
      if (!votingConfig) return;
      
      if (delta === 1) {
          if (userVotesUsed >= votingConfig.votesPerParticipant) {
              alert(`You have used all your ${votingConfig.votesPerParticipant} votes.`);
              return;
          }
      }

      const targetItem = items.find(i => i.id === itemId);
      if (!targetItem) return;
      const currentVoteCount = (targetItem.votes || {})[currentUser.id] || 0;

      // Optimistic Update
      setItems(prev => prev.map(i => {
          if (i.id !== itemId) return i;
          
          const newVal = Math.max(0, currentVoteCount + delta);
          const newVotes = { ...(i.votes || {}) };
          if (newVal === 0) delete newVotes[currentUser.id];
          else newVotes[currentUser.id] = newVal;
          return { ...i, votes: newVotes };
      }));

      await dataService.castVote(itemId, currentUser.id, delta);
  };

  const handleUpdateItemContent = async (itemId: string, newContent: string) => {
      // Optimistic Update
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, content: newContent } : i));
      await dataService.updateItemContent(itemId, newContent);
  };

  const handleAddActionItem = async (itemId: string, text: string) => {
      await dataService.addActionItem(itemId, text);
      refreshData();
  };

  const handleToggleActionItem = async (itemId: string, actionId: string) => {
      // Optimistic Update
      setItems(prev => prev.map(i => {
          if (i.id !== itemId) return i;
          return {
              ...i,
              actionItems: i.actionItems.map(a => a.id === actionId ? { ...a, isCompleted: !a.isCompleted } : a)
          };
      }));
      await dataService.toggleActionItem(itemId, actionId);
  };
  
  const handleAddComment = async (itemId: string, text: string) => {
      await dataService.addComment(itemId, text, currentUser);
      refreshData();
  };

  const handleMoveItem = async (itemId: string, newStatus: string, isStaged?: boolean, index?: number) => {
    const movedItem = items.find(i => i.id === itemId);
    const targetColumn = columns.find(c => c.id === newStatus);
    
    // Copy Logic if Target is Action List
    if (targetColumn?.viewMode === 'action-list') {
        const newItem = await dataService.copyItem(itemId, newStatus);
        if (newItem) {
            setItems(prev => [...prev, newItem]);
        }
        return; 
    }

    // Standard Move Logic
    const oldParentId = movedItem?.parent_id;

    // We are mostly just changing the column ID in this simplified data model
    // Real reordering within a column would require a 'rank' field, but we'll simulate by list order if we had it.
    // For now, we update column state.
    
    setItems(prev => {
        let nextItems = prev.map(i => i.id === itemId ? { 
            ...i, 
            column_id: newStatus,
            is_staged: isStaged !== undefined ? isStaged : i.is_staged,
            parent_id: null 
        } : i);

        if (oldParentId) {
            const siblings = nextItems.filter(i => i.parent_id === oldParentId);
            if (siblings.length <= 1) {
                const lastChildId = siblings[0]?.id;
                nextItems = nextItems.filter(i => i.id !== oldParentId);
                if (lastChildId) {
                    nextItems = nextItems.map(i => i.id === lastChildId ? { ...i, parent_id: null } : i);
                }
            }
        }
        return nextItems;
    });

    await dataService.updateItemColumn(itemId, newStatus, isStaged);
    if (oldParentId) {
        await dataService.checkAndDissolveGroup(oldParentId);
        refreshData(); 
    }
  };

  const handleGroupItem = async (itemId: string, targetId: string) => {
      const draggedItem = items.find(i => i.id === itemId);
      const targetItem = items.find(i => i.id === targetId);
      
      if (!draggedItem || !targetItem) return;

      // --- Scenario 1: Dragging a GROUP ---
      if (draggedItem.type === 'group') {
          const children = items.filter(i => i.parent_id === draggedItem.id);
          const targetGroupId = targetItem.type === 'group' ? targetItem.id : targetItem.parent_id;
          
          if (targetGroupId) {
              // Merge dragged group into target group
              const targetGroup = items.find(i => i.id === targetGroupId);
              if (!targetGroup || targetGroup.id === draggedItem.id) return; // Can't merge into self

              setItems(prev => {
                  return prev.filter(i => i.id !== draggedItem.id).map(i => {
                      if (i.parent_id === draggedItem.id) {
                          return { 
                              ...i, 
                              parent_id: targetGroupId, 
                              column_id: targetGroup.column_id, 
                              is_staged: targetGroup.is_staged 
                          };
                      }
                      return i;
                  });
              });

              for (const child of children) {
                  await dataService.assignParent(child.id, targetGroupId);
              }
              await dataService.deleteItem(draggedItem.id);
          } else {
              // Target is a standalone Card: Add card to dragged group
              const newColumnId = targetItem.column_id;
              const newIsStaged = targetItem.is_staged;

              const updatedGroup = { 
                  ...draggedItem, 
                  column_id: newColumnId, 
                  is_staged: newIsStaged 
              };

              const updatedTarget = {
                  ...targetItem,
                  parent_id: draggedItem.id,
                  column_id: newColumnId,
                  is_staged: newIsStaged
              };
              
              const updatedChildren = children.map(c => ({
                  ...c,
                  column_id: newColumnId,
                  is_staged: newIsStaged
              }));

              setItems(prev => prev.map(i => {
                  if (i.id === draggedItem.id) return updatedGroup;
                  if (i.id === targetItem.id) return updatedTarget;
                  if (children.find(c => c.id === i.id)) return updatedChildren.find(c => c.id === i.id)!;
                  return i;
              }));

              await dataService.updateItemColumn(draggedItem.id, newColumnId, newIsStaged);
              await dataService.assignParent(targetItem.id, draggedItem.id);
              for (const child of children) {
                  await dataService.assignParent(child.id, draggedItem.id);
              }
          }
          return;
      }

      // --- Scenario 2: Dragging a CARD ---
      if (targetItem.type === 'group') {
          setItems(prev => prev.map(i => i.id === itemId ? {
              ...i,
              parent_id: targetId,
              column_id: targetItem.column_id,
              is_staged: targetItem.is_staged
          } : i));
          await dataService.assignParent(itemId, targetId);
      } 
      else if (targetItem.parent_id) {
          const groupId = targetItem.parent_id;
          const group = items.find(i => i.id === groupId);
          if (group) {
              setItems(prev => prev.map(i => i.id === itemId ? {
                  ...i,
                  parent_id: groupId,
                  column_id: group.column_id,
                  is_staged: group.is_staged
              } : i));
              await dataService.assignParent(itemId, groupId);
          }
      }
      else {
          const newGroupId = crypto.randomUUID();
          const newGroup: RetroItem = {
              id: newGroupId,
              content: 'Group',
              column_id: targetItem.column_id,
              is_staged: targetItem.is_staged,
              created_at: new Date().toISOString(),
              reactions: [],
              comments: [],
              votes: {},
              actionItems: [],
              type: 'group',
              parent_id: null
          };

          setItems(prev => [
              ...prev.map(i => {
                  if (i.id === itemId || i.id === targetId) {
                      return { ...i, parent_id: newGroupId, column_id: targetItem.column_id, is_staged: targetItem.is_staged };
                  }
                  return i;
              }),
              newGroup
          ]);

          const createdGroup = await dataService.createGroupItem(targetItem.column_id, targetItem.is_staged || false);
          await dataService.assignParent(targetId, createdGroup.id);
          await dataService.assignParent(itemId, createdGroup.id);
          refreshData(); 
      }
      
      // Cleanup source group if empty
      if (draggedItem.parent_id) {
          await dataService.checkAndDissolveGroup(draggedItem.parent_id);
          refreshData();
      }
  };

  const handleAddItem = async (content: string, columnId: string, isStaged: boolean = true) => {
    // Optimistic Add
    const tempItem: RetroItem = {
      id: `temp-${Date.now()}`,
      content,
      column_id: columnId,
      reactions: [],
      comments: [],
      votes: {},
      actionItems: [],
      created_at: new Date().toISOString(),
      author_name: currentUser.name,
      author_role: currentUser.role,
      author_color: currentUser.color,
      is_staged: isStaged,
      parent_id: null,
      type: 'card'
    };
    setItems(prev => [...prev, tempItem]);
    
    // Actual API Call
    const newItem = await dataService.createItem(content, columnId, currentUser, isStaged);
    
    // Replace temp with real
    setItems(prev => prev.map(i => i.id === tempItem.id ? newItem : i));
  };

  const handlePublishAll = async (columnId: string) => {
      setItems(prev => prev.map(i => (i.column_id === columnId && i.is_staged) ? { ...i, is_staged: false } : i));
      await dataService.publishAllInColumn(columnId);
  };

  const handleReaction = async (itemId: string, emoji: string) => {
      setItems(prev => prev.map(item => {
          if (item.id !== itemId) return item;
          const newReactions = JSON.parse(JSON.stringify(item.reactions)); // Deep copy
          const existing = newReactions.find((r: any) => r.emoji === emoji);
          if (existing) {
              if (existing.authors.includes(currentUser.id)) {
                  existing.authors = existing.authors.filter((a: any) => a !== currentUser.id);
                  existing.count--;
                  if (existing.count === 0) {
                      const idx = newReactions.indexOf(existing);
                      newReactions.splice(idx, 1);
                  }
              } else {
                  existing.authors.push(currentUser.id);
                  existing.count++;
              }
          } else {
              newReactions.push({ emoji, count: 1, authors: [currentUser.id] });
          }
          return { ...item, reactions: newReactions };
      }));
      await dataService.toggleReaction(itemId, emoji, currentUser);
  };

  const handleRaiseHand = () => {
      const newState = !currentUser.isHandRaised;
      setCurrentUser(prev => ({
          ...prev, 
          isHandRaised: newState,
          handRaisedAt: newState ? Date.now() : undefined
      }));
  };

  const handleLowerAllHands = () => {
      setParticipants(prev => prev.map(p => ({ ...p, isHandRaised: false, handRaisedAt: undefined })));
      setCurrentUser(prev => ({ ...prev, isHandRaised: false, handRaisedAt: undefined }));
  };

  const handleUpdateProfile = (updatedUser: User) => {
      setCurrentUser(updatedUser);
  };

  const handleColumnUpdate = (id: string, title: string, theme: any) => {
      setColumns(prev => prev.map(c => c.id === id ? { ...c, title, colorTheme: theme } : c));
  };

  const handleToggleColumnVisibility = (columnId: string) => {
      setHiddenColumnIds(prev => {
          const next = new Set(prev);
          if (next.has(columnId)) {
              next.delete(columnId);
          } else {
              next.add(columnId);
          }
          return next;
      });
  };

  return {
      columns, setColumns,
      items, setItems,
      selectedItem, setSelectedItem,
      currentUser, setCurrentUser,
      participants,
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
      handleToggleColumnVisibility
  };
};
