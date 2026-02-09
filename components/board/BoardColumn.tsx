
import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ArrowDownAZ, Check, Edit2, Send, ChevronDown, ChevronUp, Plus, Maximize2, Minimize2, EyeOff, Filter, Layers } from 'lucide-react';
import { Column, RetroItem, User, VotingConfig, PermissionSettings } from '../../types';
import { getThemeColors, getUniqueAuthors } from '../../utils/theme';
import { ActionItemCard } from '../ActionItemCard';
import { RetroCard } from './RetroCard';
import { GroupCard } from './GroupCard';
import { EmptyState } from './EmptyState';
import { SkeletonCard } from './SkeletonCard';
import { ViewConfig } from '../../hooks/useRetroBoard';

/**
 * Props for the BoardColumn component.
 */
interface BoardColumnProps {
    column: Column;
    items: RetroItem[];
    allItems: RetroItem[];
    currentUser: User;
    sortedParticipants: User[];
    viewState: { isSorted: boolean; hiddenAuthors: Set<string>; isGrouped: boolean };
    isVotingActive: boolean;
    votingConfig?: VotingConfig;
    userVotesUsed: number;
    dragOverTargetId: string | null;
    draggedItemId: string | null;
    expandedGroups: Set<string>;
    isLoading: boolean;
    isMaximized: boolean;
    activeInputColumnId?: string | null;
    onToggleMaximize: (columnId: string) => void;
    onMoveItem: (itemId: string, newStatus: string, isStaged?: boolean) => void;
    onAddItem: (content: string, columnId: string, isStaged?: boolean) => void;
    onPublishAll: (columnId: string) => void;
    onEditColumn: (columnId: string) => void;
    onToggleSort: (columnId: string) => void;
    onToggleGroupByAuthor: (columnId: string) => void;
    onToggleAuthorFilter: (columnId: string, authorName: string) => void;
    onVote: (itemId: string, delta: 1 | -1) => void;
    onReaction: (itemId: string, emoji: string) => void;
    onItemClick: (item: RetroItem) => void;
    onGroupItem: (itemId: string, targetId: string) => void;
    onToggleGroup: (groupId: string) => void;
    onAddActionItem: (itemId: string, text: string) => void;
    onToggleActionItem: (itemId: string, actionId: string) => void;
    onAddComment: (itemId: string, text: string) => void;
    onUpdateItemContent: (itemId: string, content: string) => void;
    onDelete: (itemId: string) => void;
    permissions: PermissionSettings;
    onHideColumn: (columnId: string) => void;
    onInputActive?: (columnId: string) => void;
    dragHandlers: any;
    globalViewConfig: ViewConfig;
    isCardOverviewEnabled?: boolean;
}

/**
 * Represents a vertical column on the Kanban board.
 * Handles display of items, sorting, grouping, and staging logic.
 */
export const BoardColumn: React.FC<BoardColumnProps> = ({
    column, items, allItems, currentUser, sortedParticipants, viewState, isVotingActive, votingConfig, userVotesUsed,
    dragOverTargetId, draggedItemId, expandedGroups, isMaximized, isLoading, activeInputColumnId, onToggleMaximize,
    onMoveItem, onAddItem, onPublishAll, onEditColumn, onToggleSort, onToggleGroupByAuthor, onToggleAuthorFilter,
    onVote, onReaction, onItemClick, onGroupItem, onToggleGroup,
    onAddActionItem, onToggleActionItem, onAddComment, onUpdateItemContent, onDelete, permissions, onHideColumn, onInputActive,
    dragHandlers, globalViewConfig, isCardOverviewEnabled
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStagingOpen, setIsStagingOpen] = useState(true);
    const [newItemText, setNewItemText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Theme logic
    const colors = getThemeColors(column.colorTheme);
    const isActionList = column.viewMode === 'action-list';

    // View State calculation
    const isGroupedByAuthor = globalViewConfig.groupBy === 'author' || viewState.isGrouped;
    const isSortedByAuthor = globalViewConfig.sortBy === 'author' || viewState.isSorted;
    const uniqueAuthors = getUniqueAuthors(items);

    let publishedItems = items.filter(i => !i.is_staged && !i.parent_id);
    let stagedItems = items.filter(i => i.is_staged && !i.parent_id);

    // Apply Sorting if enabled
    if (isSortedByAuthor) {
        const rankMap = new Map<string, number>();
        sortedParticipants.forEach((p, index) => {
            rankMap.set(p.name, index);
        });

        const sortFn = (a: RetroItem, b: RetroItem) => {
            const rankA = rankMap.get(a.author_name || '') ?? 999;
            const rankB = rankMap.get(b.author_name || '') ?? 999;
            if (rankA !== rankB) return rankA - rankB;
            return (a.author_name || '').localeCompare(b.author_name || '');
        };
        publishedItems.sort(sortFn);
        stagedItems.sort(sortFn);
    }

    useEffect(() => {
        if (isAdding && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [isAdding]);

    useEffect(() => {
        if (activeInputColumnId && activeInputColumnId !== column.id && isAdding) {
            if (!newItemText.trim()) {
                setIsAdding(false);
            }
        }
    }, [activeInputColumnId, column.id, isAdding, newItemText]);

    const handleAddItemSubmit = () => {
        if (newItemText.trim()) {
            onAddItem(newItemText, column.id, true);
            setNewItemText('');
            // Keep input open for rapid entry like Jira
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        } else {
            setIsAdding(false);
        }
    };

    /**
     * Renders a single item card (Card, Group, or Action Item).
     */
    const renderItem = (item: RetroItem) => {
        if (viewState.hiddenAuthors.has(item.author_name || '')) return null;

        if (isActionList) {
            const children = item.type === 'group' ? allItems.filter(i => i.parent_id === item.id) : [];
            return (
                <div key={item.id} className="item-container w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ActionItemCard 
                        item={item}
                        childrenItems={children}
                        currentUser={currentUser}
                        onAddActionItem={onAddActionItem}
                        onToggleActionItem={onToggleActionItem}
                        onAddComment={onAddComment}
                        onReaction={onReaction}
                        dragHandlers={dragHandlers}
                    />
                </div>
            );
        }

        if (item.type === 'group') {
             const children = allItems.filter(i => i.parent_id === item.id);
             return (
                 <div key={item.id} className="item-container">
                    <GroupCard 
                        groupItem={item}
                        childrenItems={children}
                        hiddenAuthors={viewState.hiddenAuthors}
                        currentUser={currentUser}
                        isVotingActive={isVotingActive}
                        votingConfig={votingConfig}
                        userVotesUsed={userVotesUsed}
                        dragOverTargetId={dragOverTargetId}
                        isExpanded={expandedGroups.has(item.id)}
                        onVote={onVote}
                        onReaction={onReaction}
                        onItemClick={onItemClick}
                        onToggleGroup={onToggleGroup}
                        onUpdateContent={onUpdateItemContent}
                        dragHandlers={dragHandlers}
                        isCardOverviewEnabled={isCardOverviewEnabled}
                    />
                 </div>
             );
        }

        return (
            <div key={item.id} className="item-container">
                <RetroCard 
                    item={item}
                    currentUser={currentUser}
                    isVotingActive={isVotingActive}
                    votingConfig={votingConfig}
                    userVotesUsed={userVotesUsed}
                    dragOverTargetId={dragOverTargetId}
                    draggedItemId={draggedItemId}
                    onVote={onVote}
                    onReaction={onReaction}
                    onItemClick={onItemClick}
                    onUpdateContent={onUpdateItemContent}
                    onDelete={onDelete}
                    permissions={permissions}
                    dragHandlers={dragHandlers}
                    isCardOverviewEnabled={isCardOverviewEnabled}
                />
            </div>
        );
    };

    /**
     * Renders items grouped by their author.
     */
    const renderGroupedByAuthor = (itemsToRender: RetroItem[]) => {
        const itemsByAuthor: Record<string, RetroItem[]> = {};
        const otherItems: RetroItem[] = [];

        itemsToRender.forEach(item => {
            const author = item.type === 'group' ? (getUniqueAuthors(allItems.filter(i => i.parent_id === item.id))[0]?.name || 'Mixed') : item.author_name;
            if (author) {
                if (!itemsByAuthor[author]) itemsByAuthor[author] = [];
                itemsByAuthor[author].push(item);
            } else {
                otherItems.push(item);
            }
        });

        const groups = sortedParticipants.map(p => ({
            author: p.name,
            color: p.color,
            items: itemsByAuthor[p.name] || []
        })).filter(g => g.items.length > 0);
        
        // Include authors not in participant list
        const knownNames = new Set(sortedParticipants.map(p => p.name));
        Object.keys(itemsByAuthor).forEach(name => {
            if (!knownNames.has(name)) {
                groups.push({ author: name, color: '#97A0AF', items: itemsByAuthor[name] });
            }
        });
        if (otherItems.length > 0) {
            groups.push({ author: 'Unassigned', color: '#DFE1E6', items: otherItems });
        }

        return (
            <div className="flex flex-col gap-4">
                {groups.map(group => (
                    <div key={group.author} className="flex flex-col gap-2 p-2 rounded bg-white/50 border border-[#DFE1E6]/60">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold" style={{ backgroundColor: group.color }}>
                                {group.author.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-[#5E6C84]">{group.author}</span>
                            <div className="h-px bg-[#DFE1E6] flex-1"></div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {group.items.map(renderItem)}
                        </div>
                    </div>
                ))}
                {groups.length === 0 && (
                    <EmptyState />
                )}
            </div>
        );
    };

    return (
        <div 
            className={`flex flex-col flex-1 bg-[#F4F5F7] rounded-[3px] h-full shrink-0 max-h-full border border-[#DFE1E6] shadow-sm overflow-hidden relative group/column ${isMenuOpen ? 'z-40 ring-2 ring-[#4C9AFF]' : ''}`}
            style={{ 
                minWidth: isMaximized ? '100%' : (isActionList ? '400px' : '300px'),
                // Atlassian columns are often fixed width, but resizeable. We use minWidth here.
            }}
        >
            {/* Column Header */}
            <div className={`p-3 min-h-[48px] bg-[#F4F5F7] border-b-2 ${colors.border} flex justify-between items-center shrink-0 z-20 sticky top-0`}>
                <div className="flex items-center gap-2">
                    <h2 className="font-bold text-[11px] uppercase tracking-wider text-[#5E6C84]">{column.title}</h2>
                    {!isLoading && (
                        <span className="bg-[#DFE1E6] text-[#172B4D] px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center">
                            {items.filter(i => !i.is_staged).length}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-0.5 opacity-0 group-hover/column:opacity-100 transition-opacity">
                     {isActionList && (
                         <button 
                             onClick={(e) => { e.stopPropagation(); onToggleMaximize(column.id); }}
                             className="p-1 rounded hover:bg-[#EBECF0] text-[#42526E] transition-colors"
                             title={isMaximized ? "Minimize" : "Maximize"}
                         >
                             {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                         </button>
                     )}

                     <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                            className={`p-1 rounded hover:bg-[#EBECF0] text-[#42526E] transition-colors ${isMenuOpen ? 'bg-[#EBECF0] text-[#172B4D]' : ''}`}
                        >
                            <MoreHorizontal size={14} />
                        </button>
                        
                        {/* Context Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-[3px] shadow-xl border border-[#DFE1E6] z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col py-1">
                                <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)}></div>
                                
                                {/* Sort & Filter Section */}
                                <div className="border-b border-[#DFE1E6] pb-1 mb-1">
                                    <button 
                                        onClick={() => { onToggleSort(column.id); }}
                                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#F4F5F7] text-sm text-[#172B4D]"
                                    >
                                        <span className="flex items-center gap-2"><ArrowDownAZ size={14} className="text-[#5E6C84]" /> Sort by Author</span>
                                        {isSortedByAuthor && <Check size={14} className="text-[#0052CC]" />}
                                    </button>

                                    <button 
                                        onClick={() => { onToggleGroupByAuthor(column.id); }}
                                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#F4F5F7] text-sm text-[#172B4D]"
                                    >
                                        <span className="flex items-center gap-2"><Layers size={14} className="text-[#5E6C84]" /> Group by Author</span>
                                        {isGroupedByAuthor && <Check size={14} className="text-[#0052CC]" />}
                                    </button>

                                    {/* Author Filter List */}
                                    {uniqueAuthors.length > 0 && (
                                        <div className="mt-2 px-4 pb-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-[#5E6C84] uppercase mb-1">
                                                <Filter size={10} /> Filter Authors
                                            </div>
                                            <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 -mx-2 px-2">
                                                {uniqueAuthors.map(author => (
                                                    <button 
                                                        key={author.name}
                                                        onClick={() => onToggleAuthorFilter(column.id, author.name)}
                                                        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#F4F5F7] rounded-[3px] text-xs text-[#172B4D] transition-colors"
                                                    >
                                                        <span className="flex items-center gap-2 truncate">
                                                            <div className="w-3 h-3 rounded-full flex items-center justify-center text-[7px] text-white" style={{ backgroundColor: author.color }}>
                                                                {author.name.charAt(0)}
                                                            </div>
                                                            {author.name}
                                                        </span>
                                                        {!viewState.hiddenAuthors.has(author.name) && <Check size={12} className="text-[#0052CC]" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Edit Section */}
                                <div>
                                    <button 
                                        onClick={() => { setIsMenuOpen(false); onEditColumn(column.id); }}
                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F4F5F7] text-sm text-[#172B4D]"
                                    >
                                        <Edit2 size={14} className="text-[#5E6C84]" /> Edit Details
                                    </button>
                                </div>
                                
                                {/* Hide Section */}
                                <div>
                                    <button 
                                        onClick={() => { setIsMenuOpen(false); onHideColumn(column.id); }}
                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F4F5F7] text-sm text-[#172B4D]"
                                    >
                                        <EyeOff size={14} className="text-[#5E6C84]" /> Hide Column
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div 
                className={`flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 flex ${isActionList ? 'flex-col gap-3' : 'flex-col'} transition-all duration-300`}
                onDragOver={dragHandlers.handleDragOver}
                onDrop={(e) => dragHandlers.handleDrop(e, column.id, false)}
            >
                {isLoading ? (
                    <div className="space-y-3">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : (
                    <>
                        {isGroupedByAuthor ? (
                            renderGroupedByAuthor(publishedItems)
                        ) : (
                            <div className={`flex ${isActionList ? 'flex-col gap-2' : 'flex-wrap content-start gap-2'}`}>
                                {publishedItems.map(renderItem)}
                            </div>
                        )}
                        
                        {publishedItems.length === 0 && (
                            <EmptyState />
                        )}
                    </>
                )}
            </div>

            {/* Staging / Quick Add Area */}
            {!isActionList && (
                <div 
                    className={`bg-[#F4F5F7] flex flex-col shrink-0 transition-all duration-300 ${isStagingOpen ? 'border-t border-[#DFE1E6]' : ''}`}
                >
                    {/* Header/Toggle - Always Visible */}
                    <div 
                        onClick={() => setIsStagingOpen(!isStagingOpen)}
                        className="flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-[#EBECF0] transition-colors group/staging"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#5E6C84] uppercase">Your Drafts</span>
                            <span className="bg-[#DFE1E6] text-[#172B4D] px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                {stagedItems.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); if(stagedItems.length > 0) onPublishAll(column.id); }}
                                disabled={stagedItems.length === 0}
                                className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-[3px] flex items-center gap-1 transition-colors ${stagedItems.length > 0 ? 'bg-[#0052CC] hover:bg-[#0747A6]' : 'bg-[#DFE1E6] cursor-not-allowed text-[#A5ADBA]'}`}
                            >
                                <Send size={10} /> Publish All
                            </button>
                            {isStagingOpen ? <ChevronDown size={14} className="text-[#5E6C84]" /> : <ChevronUp size={14} className="text-[#5E6C84]" />}
                        </div>
                    </div>

                    {/* Collapsible Staging Content */}
                    <div 
                        className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 flex flex-col transition-all duration-300 ${isStagingOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}
                        onDragOver={dragHandlers.handleDragOver}
                        onDrop={(e) => dragHandlers.handleDrop(e, column.id, true)}
                    >
                         <div className="p-2 pt-0 min-h-[40px]">
                             {stagedItems.length > 0 ? (
                                 isGroupedByAuthor ? (
                                     renderGroupedByAuthor(stagedItems)
                                 ) : (
                                     <div className="flex flex-wrap content-start gap-2">
                                         {stagedItems.map(renderItem)}
                                     </div>
                                 )
                             ) : (
                                 <div className="flex items-center justify-center h-full border-2 border-dashed border-[#DFE1E6] rounded-[3px] p-2">
                                     <span className="text-[10px] text-[#97A0AF] italic">Drag items here to draft</span>
                                 </div>
                             )}
                         </div>
                    </div>
                    
                    {/* Quick Create Footer */}
                    <div className="p-2">
                        {isAdding ? (
                            <div className="w-full bg-white p-2 rounded-[3px] shadow-md border-2 border-[#4C9AFF] animate-in fade-in zoom-in-95 duration-200">
                                <textarea
                                    ref={textareaRef}
                                    placeholder="What's on your mind?"
                                    className="w-full text-sm resize-none outline-none text-[#172B4D] placeholder:text-[#97A0AF] min-h-[40px]"
                                    rows={1}
                                    value={newItemText}
                                    onChange={(e) => {
                                        setNewItemText(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) { 
                                            e.preventDefault(); 
                                            handleAddItemSubmit(); 
                                        }
                                        if (e.key === 'Escape') setIsAdding(false);
                                    }}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => setIsAdding(false)} className="px-2 py-1 rounded-[3px] text-xs font-bold text-[#42526E] hover:bg-[#EBECF0]">Cancel</button>
                                    <button onClick={handleAddItemSubmit} className="px-3 py-1 rounded-[3px] text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6]">Add</button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => { 
                                    setIsAdding(true); 
                                    onInputActive?.(column.id);
                                }}
                                className="w-full py-1.5 px-2 rounded-[3px] hover:bg-[#EBECF0] text-left text-sm text-[#5E6C84] flex items-center gap-2 group transition-colors"
                            >
                                <Plus size={16} className="text-[#5E6C84] group-hover:text-[#172B4D]" />
                                <span className="group-hover:text-[#172B4D]">Create</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
