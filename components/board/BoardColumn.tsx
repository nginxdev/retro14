
import React, { useState } from 'react';
import { MoreHorizontal, ArrowDownAZ, Check, Edit2, Send, ChevronDown, ChevronUp, Plus, Maximize2, Minimize2, EyeOff, Filter, Layers } from 'lucide-react';
import { Column, RetroItem, User, VotingConfig } from '../../types';
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
    onHideColumn: (columnId: string) => void;
    dragHandlers: any;
    globalViewConfig: ViewConfig;
}

/**
 * Represents a vertical column on the Kanban board.
 * Handles display of items, sorting, grouping, and staging logic.
 */
export const BoardColumn: React.FC<BoardColumnProps> = ({
    column, items, allItems, currentUser, sortedParticipants, viewState, isVotingActive, votingConfig, userVotesUsed,
    dragOverTargetId, draggedItemId, expandedGroups, isMaximized, isLoading, onToggleMaximize,
    onMoveItem, onAddItem, onPublishAll, onEditColumn, onToggleSort, onToggleGroupByAuthor, onToggleAuthorFilter,
    onVote, onReaction, onItemClick, onGroupItem, onToggleGroup,
    onAddActionItem, onToggleActionItem, onAddComment, onUpdateItemContent, onHideColumn,
    dragHandlers, globalViewConfig
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStagingOpen, setIsStagingOpen] = useState(true);
    const [newItemText, setNewItemText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
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

    const handleAddItemSubmit = () => {
        if (newItemText.trim()) {
            onAddItem(newItemText, column.id, true);
            setNewItemText('');
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
                <div key={item.id} className="item-container w-full">
                    <ActionItemCard 
                        item={item}
                        childrenItems={children}
                        currentUser={currentUser}
                        onAddActionItem={onAddActionItem}
                        onToggleActionItem={onToggleActionItem}
                        onAddComment={onAddComment}
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
                        dragHandlers={dragHandlers}
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
                    dragHandlers={dragHandlers}
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
        
        // Include authors not in participant list (e.g., past users)
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
                    <div key={group.author} className="flex flex-col gap-2 p-2 rounded bg-white/50 border border-n40/50">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold" style={{ backgroundColor: group.color }}>
                                {group.author.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-n300">{group.author}</span>
                            <div className="h-px bg-n40 flex-1"></div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {group.items.map(renderItem)}
                        </div>
                    </div>
                ))}
                {groups.length === 0 && (
                    <EmptyState type={column.colorTheme} title="No items by author" />
                )}
            </div>
        );
    };

    return (
        <div 
            className={`flex flex-col flex-1 bg-n20 rounded-xl h-full shrink-0 border border-n40/50 shadow-sm overflow-hidden relative ${isMenuOpen ? 'z-40 ring-1 ring-n40' : ''}`}
            style={{ 
                minWidth: isMaximized ? '100%' : (isActionList ? '400px' : '300px'),
            }}
        >
            {/* Column Header */}
            <div className={`p-3 border-b ${colors.border} ${colors.bg} flex justify-between items-center shrink-0 z-20 relative`}>
                <div className="flex items-center gap-2">
                    <h2 className={`font-bold text-xs uppercase tracking-wide ${colors.text}`}>{column.title}</h2>
                    {!isLoading && (
                        <span className="px-1.5 py-0.5 rounded-full bg-white/40 text-[10px] font-bold text-n800">
                            {items.filter(i => !i.is_staged).length}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                     {isActionList && (
                         <button 
                             onClick={(e) => { e.stopPropagation(); onToggleMaximize(column.id); }}
                             className={`p-1 rounded hover:bg-white/50 ${colors.text} transition-colors`}
                             title={isMaximized ? "Minimize" : "Maximize"}
                         >
                             {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                         </button>
                     )}

                     <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                            className={`p-1 rounded hover:bg-white/50 ${colors.text} transition-colors ${isMenuOpen ? 'bg-white/60' : ''}`}
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        
                        {/* Context Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-n40 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden flex flex-col">
                                <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)}></div>
                                
                                {/* Sort & Filter Section */}
                                <div className="p-1 border-b border-n40">
                                    <button 
                                        onClick={() => { onToggleSort(column.id); }}
                                        className="w-full flex items-center justify-between p-2 hover:bg-n20 rounded text-sm text-n800 font-medium"
                                    >
                                        <span className="flex items-center gap-2"><ArrowDownAZ size={14} className="text-n300" /> Sort by Author</span>
                                        {isSortedByAuthor && <Check size={14} className="text-b400" />}
                                    </button>

                                    <button 
                                        onClick={() => { onToggleGroupByAuthor(column.id); }}
                                        className="w-full flex items-center justify-between p-2 hover:bg-n20 rounded text-sm text-n800 font-medium"
                                    >
                                        <span className="flex items-center gap-2"><Layers size={14} className="text-n300" /> Group by Author</span>
                                        {isGroupedByAuthor && <Check size={14} className="text-b400" />}
                                    </button>

                                    {/* Author Filter List */}
                                    {uniqueAuthors.length > 0 && (
                                        <div className="mt-2 px-2 pb-2">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-n300 uppercase mb-1">
                                                <Filter size={10} /> Filter Authors
                                            </div>
                                            <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                                {uniqueAuthors.map(author => (
                                                    <button 
                                                        key={author.name}
                                                        onClick={() => onToggleAuthorFilter(column.id, author.name)}
                                                        className="w-full flex items-center justify-between px-2 py-1 hover:bg-n20 rounded text-xs text-n800 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-2 truncate">
                                                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white" style={{ backgroundColor: author.color }}>
                                                                {author.name.charAt(0)}
                                                            </div>
                                                            {author.name}
                                                        </span>
                                                        {!viewState.hiddenAuthors.has(author.name) && <Check size={12} className="text-b400" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Edit Section */}
                                <div className="p-1 bg-n10">
                                    <button 
                                        onClick={() => { setIsMenuOpen(false); onEditColumn(column.id); }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-n30 rounded text-sm text-n500"
                                    >
                                        <Edit2 size={14} /> Edit Column Details
                                    </button>
                                </div>
                                
                                {/* Hide Section */}
                                <div className="p-1 border-t border-n40 bg-n10">
                                    <button 
                                        onClick={() => { setIsMenuOpen(false); onHideColumn(column.id); }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-r50 rounded text-sm text-r500"
                                    >
                                        <EyeOff size={14} /> Hide Column
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div 
                className={`flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 flex ${isActionList ? 'flex-col gap-3' : 'flex-col'} transition-all duration-300 ${!isActionList && isStagingOpen ? 'basis-1/2' : 'flex-1'}`}
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
                            <div className={`flex ${isActionList ? 'flex-col gap-3' : 'flex-wrap content-start gap-3'}`}>
                                {publishedItems.map(renderItem)}
                            </div>
                        )}
                        
                        {publishedItems.length === 0 && (
                            <EmptyState type={column.colorTheme} />
                        )}
                    </>
                )}
            </div>

            {/* Staging Area */}
            {!isActionList && (
                <div className={`border-t-2 border-dashed border-n40 bg-n10 flex flex-col transition-all duration-300 ${isStagingOpen ? 'basis-1/2 min-h-0' : 'h-10 shrink-0'}`}>
                    <div 
                        onClick={() => setIsStagingOpen(!isStagingOpen)}
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-n20 transition-colors shrink-0"
                        onDragOver={dragHandlers.handleDragOver}
                        onDrop={(e) => dragHandlers.handleDrop(e, column.id, true)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-n300 uppercase">Staging</span>
                            {!isLoading && <span className="px-1.5 py-0.5 rounded-full bg-n40 text-[10px] font-bold text-n800">{stagedItems.length}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            {stagedItems.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPublishAll(column.id); }}
                                    className="text-[10px] font-bold text-white bg-g400 px-2 py-1 rounded hover:bg-g200 flex items-center gap-1 shadow-sm"
                                >
                                    <Send size={10} /> Publish All
                                </button>
                            )}
                            {isStagingOpen ? <ChevronDown size={14} className="text-n300" /> : <ChevronUp size={14} className="text-n300" />}
                        </div>
                    </div>

                    <div 
                        className={`flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 flex flex-col ${isStagingOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
                        onDragOver={dragHandlers.handleDragOver}
                        onDrop={(e) => dragHandlers.handleDrop(e, column.id, true)}
                    >
                        {isLoading ? (
                            <SkeletonCard />
                        ) : (
                            <>
                                <div className="w-full mb-2">
                                     {isAdding ? (
                                        <div className="w-full bg-white p-3 rounded shadow-md border-2 border-b200 animate-in fade-in zoom-in-95 duration-200">
                                            <textarea
                                                autoFocus
                                                placeholder="Draft your idea..."
                                                className="w-full text-sm resize-none outline-none text-n800 placeholder:text-n90"
                                                rows={2}
                                                value={newItemText}
                                                onChange={(e) => setNewItemText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddItemSubmit(); }
                                                    if (e.key === 'Escape') setIsAdding(false);
                                                }}
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setIsAdding(false)} className="text-xs font-medium text-n500 hover:underline px-2 py-1">Cancel</button>
                                                <button onClick={handleAddItemSubmit} className="text-xs font-bold text-white bg-b400 px-3 py-1.5 rounded hover:bg-b500">Add Draft</button>
                                            </div>
                                        </div>
                                     ) : (
                                        <div 
                                            onClick={() => setIsAdding(true)}
                                            className="w-full py-2 border-2 border-dashed border-n40 rounded-lg flex items-center justify-center text-n200 text-xs cursor-pointer hover:border-b400 hover:text-b400 hover:bg-white transition-all opacity-70 hover:opacity-100 bg-white/50"
                                        >
                                            <Plus size={16} className="mr-1" /> Add to Staging
                                        </div>
                                     )}
                                </div>
                                
                                {isGroupedByAuthor ? (
                                    renderGroupedByAuthor(stagedItems)
                                ) : (
                                    <div className="flex flex-wrap content-start gap-3">
                                        {stagedItems.map(renderItem)}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
