
import React, { useState, useEffect, useMemo } from 'react';
import { Column, RetroItem, User, VotingConfig, PermissionSettings } from '../types';
import { BoardColumn } from './board/BoardColumn';
import { ViewConfig } from '../hooks/useRetroBoard';

interface BoardProps {
  columns: Column[];
  items: RetroItem[];
  currentUser: User;
  participants: User[];
  sortedParticipants: User[];
  onMoveItem: (itemId: string, newStatus: string, isStaged?: boolean, index?: number) => void;
  onItemClick: (item: RetroItem) => void;
  onAddItem: (content: string, columnId: string, isStaged?: boolean) => void;
  onPublishAll: (columnId: string) => void;
  onReaction: (itemId: string, emoji: string) => void;
  onGroupItem: (itemId: string, targetId: string) => void;
  onEditColumn: (columnId: string) => void;
  // Voting props
  isVotingActive: boolean;
  votingConfig?: VotingConfig;
  userVotesUsed: number;
  onVote: (itemId: string, delta: 1 | -1) => void;
  // Action Item props
  onAddActionItem: (itemId: string, text: string) => void;
  onToggleActionItem: (itemId: string, actionId: string) => void;
  onAddComment: (itemId: string, text: string) => void;
  onUpdateItemContent: (itemId: string, content: string) => void;
  onDelete: (itemId: string) => void;
  permissions: PermissionSettings;
  // Visibility State
  hiddenColumnIds: Set<string>;
  onToggleColumnVisibility: (columnId: string) => void;
  // Global View Config
  viewConfig: ViewConfig;
  isCardOverviewEnabled: boolean;
  isLoading: boolean;
}

interface ColumnViewState {
    isSorted: boolean;
    hiddenAuthors: Set<string>;
    isGrouped: boolean;
}

export const Board: React.FC<BoardProps> = ({ 
    columns, items, currentUser, participants, sortedParticipants,
    onMoveItem, onItemClick, onAddItem, onPublishAll, onReaction, onGroupItem, onEditColumn,
    isVotingActive, votingConfig, userVotesUsed, onVote,
    onAddActionItem, onToggleActionItem, onAddComment, onUpdateItemContent, onDelete, permissions,
    hiddenColumnIds, onToggleColumnVisibility,
    viewConfig, isCardOverviewEnabled, isLoading
}) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [columnViews, setColumnViews] = useState<Record<string, ColumnViewState>>({});
  const [maximizedColumnId, setMaximizedColumnId] = useState<string | null>(null);
  const [activeInputColumnId, setActiveInputColumnId] = useState<string | null>(null);

  useEffect(() => {
    const initialViews: Record<string, ColumnViewState> = {};
    columns.forEach(col => {
        initialViews[col.id] = { isSorted: false, hiddenAuthors: new Set(), isGrouped: false };
    });
    setColumnViews(prev => ({ ...initialViews, ...prev }));
  }, [columns]);

  const toggleGroup = (groupId: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(groupId)) {
        newSet.delete(groupId);
    } else {
        newSet.add(groupId);
    }
    setExpandedGroups(newSet);
  };

  const toggleSort = (columnId: string) => {
      setColumnViews(prev => ({
          ...prev,
          [columnId]: { ...prev[columnId], isSorted: !prev[columnId].isSorted }
      }));
  };

  const toggleGroupByAuthor = (columnId: string) => {
      setColumnViews(prev => ({
          ...prev,
          [columnId]: { ...prev[columnId], isGrouped: !prev[columnId].isGrouped }
      }));
  };

  const toggleAuthorFilter = (columnId: string, authorName: string) => {
      setColumnViews(prev => {
          const view = prev[columnId] || { isSorted: false, hiddenAuthors: new Set(), isGrouped: false };
          const newHidden = new Set(view.hiddenAuthors);
          if (newHidden.has(authorName)) {
              newHidden.delete(authorName);
          } else {
              newHidden.add(authorName);
          }
          return {
              ...prev,
              [columnId]: { ...view, hiddenAuthors: newHidden }
          };
      });
  };
  
  const toggleMaximize = (columnId: string) => {
      if (maximizedColumnId === columnId) {
          setMaximizedColumnId(null);
      } else {
          setMaximizedColumnId(columnId);
      }
  };

  const dragHandlers = useMemo(() => ({
      handleDragStart: (e: React.DragEvent, itemId: string) => {
          setDraggedItemId(itemId);
          e.dataTransfer.effectAllowed = 'move';
          e.stopPropagation();
      },
      handleDragOver: (e: React.DragEvent) => {
          e.preventDefault();
      },
      handleDrop: (e: React.DragEvent, columnId: string, isStagedTarget: boolean) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverTargetId(null);
          if (draggedItemId) {
              onMoveItem(draggedItemId, columnId, isStagedTarget);
              setDraggedItemId(null);
          }
      },
      handleCardDragEnter: (e: React.DragEvent, targetItemId: string) => {
          if (draggedItemId && draggedItemId !== targetItemId) {
              const draggedItem = items.find(i => i.id === draggedItemId);
              if (draggedItem?.parent_id !== targetItemId && draggedItem?.id !== targetItemId) {
                 setDragOverTargetId(targetItemId);
              }
          }
      },
      handleCardDrop: (e: React.DragEvent, targetItemId: string) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverTargetId(null);
          if (!draggedItemId || draggedItemId === targetItemId) return;
          const draggedItem = items.find(i => i.id === draggedItemId);
          const targetItem = items.find(i => i.id === targetItemId);
          if (!draggedItem || !targetItem) return;
          if (draggedItem.type === 'group' && targetItem.parent_id === draggedItem.id) return;
          onGroupItem(draggedItemId, targetItemId);
          setDraggedItemId(null);
      },
      setDragOverTargetId
  }), [draggedItemId, items, onMoveItem, onGroupItem]);

  // Filter columns if maximized, then check hidden
  const visibleColumns = maximizedColumnId 
    ? columns.filter(c => c.id === maximizedColumnId) 
    : columns.filter(c => !hiddenColumnIds.has(c.id));

  return (
    <div className="flex h-full w-full gap-6 overflow-x-auto p-2 pb-4">
      {visibleColumns.map((column) => (
          <BoardColumn 
            key={column.id}
            column={column}
            items={items.filter(i => i.column_id === column.id)}
            allItems={items}
            currentUser={currentUser}
            sortedParticipants={sortedParticipants}
            viewState={columnViews[column.id] || { isSorted: false, hiddenAuthors: new Set(), isGrouped: false }}
            isVotingActive={isVotingActive}
            votingConfig={votingConfig}
            userVotesUsed={userVotesUsed}
            dragOverTargetId={dragOverTargetId}
            draggedItemId={draggedItemId}
            expandedGroups={expandedGroups}
            isMaximized={maximizedColumnId === column.id}
            isLoading={isLoading}
            activeInputColumnId={activeInputColumnId}
            onInputActive={setActiveInputColumnId}
            onToggleMaximize={toggleMaximize}
            onMoveItem={onMoveItem}
            onAddItem={onAddItem}
            onPublishAll={onPublishAll}
            onEditColumn={onEditColumn}
            onToggleSort={toggleSort}
            onToggleGroupByAuthor={toggleGroupByAuthor}
            onToggleAuthorFilter={toggleAuthorFilter}
            onVote={onVote}
            onReaction={onReaction}
            onItemClick={onItemClick}
            onGroupItem={onGroupItem}
            onToggleGroup={toggleGroup}
            onAddActionItem={onAddActionItem}
            onToggleActionItem={onToggleActionItem}
            onAddComment={onAddComment}
            onUpdateItemContent={onUpdateItemContent}
            onDelete={onDelete}
            permissions={permissions}
            onHideColumn={onToggleColumnVisibility}
            dragHandlers={dragHandlers}
            globalViewConfig={viewConfig}
            isCardOverviewEnabled={isCardOverviewEnabled}
          />
      ))}
    </div>
  );
};
