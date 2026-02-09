import { useState, useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { dataService } from "../services/dataService";
import { SIDEBAR_BREAKPOINT } from "../utils/breakpoints";
import {
  RetroItem,
  Column,
  User,
  VotingConfig,
  PermissionSettings,
  TimerConfig,
  Comment as RetroComment, // Rename to avoid DOM conflict
  ActionItem as RetroActionItem,
} from "../types";

const INITIAL_COLUMNS: Column[] = [
  { id: "col-1", title: "What went well", colorTheme: "green" },
  { id: "col-2", title: "What did not go well", colorTheme: "red" },
  { id: "col-3", title: "What can be improved", colorTheme: "blue" },
];

const INITIAL_USER: User = {
  id: "u-1",
  name: "John Doe",
  role: "Product Owner",
  color: "#0052CC",
  isHandRaised: false,
};

export interface ViewConfig {
  sortBy: "none" | "author";
  groupBy: "none" | "author";
}

export const useRetroBoard = (user: User | undefined, sprintId: string) => {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [items, setItems] = useState<RetroItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RetroItem | null>(null);
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);

  // View Configuration
  const [viewConfig, setViewConfig] = useState<ViewConfig>({
    sortBy: "none",
    groupBy: "none",
  });
  const [isCardOverviewEnabled, setIsCardOverviewEnabled] = useState(true);

  // User & Participants State
  const [currentUser, setCurrentUser] = useState<User>(user || INITIAL_USER);
  const [participants, setParticipants] = useState<User[]>([currentUser]);

  // Voting State
  const [isVotingConfigOpen, setIsVotingConfigOpen] = useState(false);
  const [votingConfig, setVotingConfig] = useState<VotingConfig | undefined>(
    undefined,
  );
  const isVotingActive = !!votingConfig;
  const [permissions, setPermissions] = useState<PermissionSettings>({
    canMoveOthersCards: true,
    canEditOthersCards: true,
    canDeleteOthersCards: true,
  });
  const [isEndVotingConfirmOpen, setIsEndVotingConfirmOpen] = useState(false);
  const [timer, setTimer] = useState<TimerConfig | undefined>(undefined);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Dialogs State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Collapse sidebar by default on screens under Tailwind xl breakpoint (1280px)
    if (typeof window !== 'undefined') {
      return window.innerWidth < SIDEBAR_BREAKPOINT;
    }
    return false;
  });

  const channelRef = useRef<RealtimeChannel | null>(null);

  const refreshData = async () => {
    if (!sprintId) return;
    const data = await dataService.fetchItems(sprintId);
    setItems(data);

    // Initial Config Load
    const config = await dataService.fetchSprintConfig(sprintId);
    if (config) {
      if (config.columns) setColumns(config.columns);
      if (config.votingConfig) setVotingConfig(config.votingConfig);
      if (config.permissions) setPermissions(config.permissions);
      if (config.settings)
        setIsCardOverviewEnabled(config.settings.isCardOverviewEnabled);
      if (config.timer) setTimer(config.timer);
    }

    // Initial Participants Load
    const dbParticipants = await dataService.fetchSprintParticipants(sprintId);
    setParticipants(dbParticipants);

    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();

    // Subscribe to Realtime Updates (Items & Config)
    const channel = dataService.subscribeToSprint(sprintId, (payload) => {
      try {
        if (payload.table === "sprints") {
          const { new: newSprint } = payload;
          if (!newSprint || newSprint.id !== sprintId) return;

          if (newSprint.configuration) {
            const config = newSprint.configuration;
            if (config.columns) setColumns(config.columns);
            setVotingConfig(config.votingConfig);
            if (config.permissions) setPermissions(config.permissions);
            if (config.settings)
              setIsCardOverviewEnabled(config.settings.isCardOverviewEnabled);
            if (config.timer) setTimer(config.timer);
          }
        } else if (payload.table === "retro_items") {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT" && newRecord) {
            const safeRecord = {
              reactions: [],
              comments: [],
              votes: {},
              actionItems: [],
              ...newRecord,
            } as RetroItem;
            setItems((prev) =>
              prev.some((i) => i.id === safeRecord.id)
                ? prev
                : [...prev, safeRecord],
            );
          } else if (eventType === "UPDATE" && newRecord) {
            setItems((prev) => {
              const exists = prev.some((i) => i.id === newRecord.id);
              if (!exists) {
                const safeRecord = {
                  reactions: [],
                  comments: [],
                  votes: {},
                  actionItems: [],
                  ...newRecord,
                } as RetroItem;
                return [...prev, safeRecord];
              }
              return prev.map((i) =>
                i.id === newRecord.id ? { ...i, ...newRecord } : i,
              );
            });
          } else if (eventType === "DELETE" && oldRecord) {
            setItems((prev) => prev.filter((i) => i.id !== oldRecord.id));
          }
        }
      } catch (err) {
        console.error("Error in Realtime handler:", err);
      }
    });

    if (channel) {
      channelRef.current = channel;

      // Broadcast Listener for Hands
      channel.on("broadcast", { event: "hand_raised" }, ({ payload }) => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === payload.userId
              ? {
                  ...p,
                  isHandRaised: payload.isHandRaised,
                  handRaisedAt: payload.handRaisedAt,
                }
              : p,
          ),
        );
      });

      channel.on("broadcast", { event: "lower_all_hands" }, () => {
        setParticipants((prev) =>
          prev.map((p) => ({
            ...p,
            isHandRaised: false,
            handRaisedAt: undefined,
          })),
        );
        setCurrentUser((prev) => ({
          ...prev,
          isHandRaised: false,
          handRaisedAt: undefined,
        }));
      });

      // Presence Setup
      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const onlineUsers = Object.values(state)
            .flat()
            .map((p: any) => p.user) as User[];

          setParticipants((prev) => {
            // Combine DB participants with online status from Presence
            const onlineMap = new Map(onlineUsers.map((u) => [u.id, u]));

            const updated = prev.map((p) => {
              const onlineUser = onlineMap.get(p.id);
              if (onlineUser) {
                // Prefer state from Presence (more immediate)
                return { ...p, ...onlineUser };
              }
              return p;
            });

            // Add any online users who aren't in the DB list yet (joining in real-time)
            onlineUsers.forEach((u) => {
              if (!updated.some((p) => p.id === u.id)) {
                updated.push(u);
              }
            });

            return updated;
          });
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ user: currentUser });
          }
        });
    }

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [sprintId]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (timer?.status === "running" && timer.endTime) {
      const calculateRemaining = () => {
        const end = new Date(timer.endTime!).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        setRemainingTime(diff);
      };

      calculateRemaining();
      interval = setInterval(calculateRemaining, 1000);
    } else if (timer?.status === "paused") {
      setRemainingTime(timer.remainingAtPause ?? 0);
    } else {
      setRemainingTime(null);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Track User State Updates
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.track({ user: currentUser });
    }
  }, [currentUser]);

  // Sync Prop Updates (e.g. loaded from DB)
  useEffect(() => {
    if (user) {
      setCurrentUser((prev) => ({
        ...prev,
        name: user.name,
        color: user.color,
        role: user.role,
        // Use hand-raising state from DB (synced via App.tsx subscription)
        isHandRaised: user.isHandRaised,
        handRaisedAt: user.handRaisedAt,
      }));
    }
  }, [user]);

  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === currentUser.id ? currentUser : p)),
    );
  }, [currentUser]);

  const userVotesUsed = items.reduce(
    (acc, item) => acc + ((item.votes || {})[currentUser.id] || 0),
    0,
  );

  const handleStartVoting = (config: VotingConfig) => {
    setVotingConfig(config);
    dataService.updateSprintConfig(sprintId, {
      columns,
      votingConfig: config,
      permissions,
      settings: { isCardOverviewEnabled },
      timer,
    });
  };

  const confirmEndVoting = async () => {
    setIsEndVotingConfirmOpen(false);

    // 1. Identify voted items
    const votedItems = items.filter((item) => {
      const votes = item.votes || {};
      const total = (Object.values(votes) as number[]).reduce(
        (a, b) => a + b,
        0,
      );
      return total > 0;
    });

    if (votedItems.length === 0) {
      // Just clear voting if no votes
      await dataService.updateSprintConfig(sprintId, {
        columns,
        votingConfig: undefined,
        permissions,
        settings: { isCardOverviewEnabled },
        timer,
      });
      return;
    }

    // 2. Reuse or Create "Voting Results / Action Items" column
    const RESULTS_TITLE = "Voting Results / Action Items";
    let resultsColumn = columns.find((c) => c.title === RESULTS_TITLE);
    let newColumns = [...columns];

    if (!resultsColumn) {
      resultsColumn = {
        id: `col-results-${Date.now()}`,
        title: RESULTS_TITLE,
        colorTheme: "purple",
        viewMode: "action-list",
      };
      newColumns.push(resultsColumn);
    }

    // 3. Copy items to the results column in the database
    // Using copyItem preserves the original items (duplication)
    for (const item of votedItems) {
      await dataService.copyItem(item.id, resultsColumn.id);
    }

    // 4. Clear voting and persist column change in one go
    await dataService.updateSprintConfig(sprintId, {
      columns: newColumns,
      votingConfig: undefined,
      permissions,
      settings: { isCardOverviewEnabled },
      timer,
    });

    refreshData();
  };

  const handleVote = async (itemId: string, delta: 1 | -1) => {
    if (!votingConfig) return;

    if (delta === 1) {
      if (userVotesUsed >= votingConfig.votesPerParticipant) {
        alert(
          `You have used all your ${votingConfig.votesPerParticipant} votes.`,
        );
        return;
      }
    }

    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return;
    const currentVoteCount = (targetItem.votes || {})[currentUser.id] || 0;

    if (
      delta === 1 &&
      !votingConfig.allowMultiplePerCard &&
      currentVoteCount > 0
    ) {
      alert("Multiple votes per card are not allowed.");
      return;
    }

    // Optimistic Update
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;

        const newVal = Math.max(0, currentVoteCount + delta);
        const newVotes = { ...(i.votes || {}) };
        if (newVal === 0) delete newVotes[currentUser.id];
        else newVotes[currentUser.id] = newVal;
        return { ...i, votes: newVotes };
      }),
    );

    await dataService.castVote(itemId, currentUser.id, delta);
  };

  const handleUpdateItemContent = async (
    itemId: string,
    newContent: string,
  ) => {
    const item = items.find((i) => i.id === itemId);

    // Permission check: Can only edit other's cards if permission is enabled
    const isOwnCard = item?.user_id === currentUser.id;
    if (!isOwnCard && !permissions.canEditOthersCards) {
      return; // Silently ignore if no permission
    }

    // Optimistic Update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, content: newContent } : i)),
    );
    await dataService.updateItemContent(itemId, newContent);
  };

  const handleAddActionItem = async (itemId: string, text: string) => {
    const newAction: RetroActionItem = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      isCompleted: false,
    };

    // Optimistic Update
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, actionItems: [...(i.actionItems || []), newAction] }
          : i,
      ),
    );
    await dataService.addActionItem(itemId, text);
    // No full refresh needed if optimistic update is good
  };

  const handleToggleActionItem = async (itemId: string, actionId: string) => {
    // Optimistic Update
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        return {
          ...i,
          actionItems: i.actionItems.map((a) =>
            a.id === actionId ? { ...a, isCompleted: !a.isCompleted } : a,
          ),
        };
      }),
    );
    await dataService.toggleActionItem(itemId, actionId);
  };

  const handleAddComment = async (itemId: string, text: string) => {
    const newComment: RetroComment = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      author_name: currentUser.name,
      author_color: currentUser.color,
      created_at: new Date().toISOString(),
    };

    // Optimistic Update
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, comments: [...(i.comments || []), newComment] }
          : i,
      ),
    );
    await dataService.addComment(itemId, text, currentUser);
  };

  const handleMoveItem = async (
    itemId: string,
    newStatus: string,
    isStaged?: boolean,
    index?: number,
  ) => {
    const movedItem = items.find((i) => i.id === itemId);

    // Permission check: Can only move other's cards if permission is enabled
    const isOwnCard = movedItem?.user_id === currentUser.id;
    if (!isOwnCard && !permissions.canMoveOthersCards) {
      return; // Silently ignore if no permission
    }

    const sourceColumn = columns.find((c) => c.id === movedItem?.column_id);
    const targetColumn = columns.find((c) => c.id === newStatus);

    // Copy Logic: Whenever dragging TO an Action List from a DIFFERENT column, it's a CLONE.
    if (
      targetColumn?.viewMode === "action-list" &&
      sourceColumn?.id !== targetColumn?.id
    ) {
      const newItem = await dataService.copyItem(itemId, newStatus);
      if (newItem) {
        setItems((prev) => [...prev, newItem]);
      }
      return;
    }

    // Standard Move Logic
    const oldParentId = movedItem?.parent_id;

    // We are mostly just changing the column ID in this simplified data model
    // Real reordering within a column would require a 'rank' field, but we'll simulate by list order if we had it.
    // For now, we update column state.

    setItems((prev) => {
      let nextItems = prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              column_id: newStatus,
              is_staged: isStaged !== undefined ? isStaged : i.is_staged,
              parent_id: null,
            }
          : i,
      );

      if (oldParentId) {
        const siblings = nextItems.filter((i) => i.parent_id === oldParentId);
        if (siblings.length <= 1) {
          const lastChildId = siblings[0]?.id;
          nextItems = nextItems.filter((i) => i.id !== oldParentId);
          if (lastChildId) {
            nextItems = nextItems.map((i) =>
              i.id === lastChildId ? { ...i, parent_id: null } : i,
            );
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
    const draggedItem = items.find((i) => i.id === itemId);
    const targetItem = items.find((i) => i.id === targetId);

    if (!draggedItem || !targetItem) return;

    // --- Scenario 1: Dragging a GROUP ---
    if (draggedItem.type === "group") {
      const children = items.filter((i) => i.parent_id === draggedItem.id);
      const targetGroupId =
        targetItem.type === "group" ? targetItem.id : targetItem.parent_id;

      if (targetGroupId) {
        // Merge dragged group into target group
        const targetGroup = items.find((i) => i.id === targetGroupId);
        if (!targetGroup || targetGroup.id === draggedItem.id) return; // Can't merge into self

        setItems((prev) => {
          return prev
            .filter((i) => i.id !== draggedItem.id)
            .map((i) => {
              if (i.parent_id === draggedItem.id) {
                return {
                  ...i,
                  parent_id: targetGroupId,
                  column_id: targetGroup.column_id,
                  is_staged: targetGroup.is_staged,
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
          is_staged: newIsStaged,
        };

        const updatedTarget = {
          ...targetItem,
          parent_id: draggedItem.id,
          column_id: newColumnId,
          is_staged: newIsStaged,
        };

        const updatedChildren = children.map((c) => ({
          ...c,
          column_id: newColumnId,
          is_staged: newIsStaged,
        }));

        setItems((prev) =>
          prev.map((i) => {
            if (i.id === draggedItem.id) return updatedGroup;
            if (i.id === targetItem.id) return updatedTarget;
            if (children.find((c) => c.id === i.id))
              return updatedChildren.find((c) => c.id === i.id)!;
            return i;
          }),
        );

        await dataService.updateItemColumn(
          draggedItem.id,
          newColumnId,
          newIsStaged,
        );
        await dataService.assignParent(targetItem.id, draggedItem.id);
        for (const child of children) {
          await dataService.assignParent(child.id, draggedItem.id);
        }
      }
      return;
    }

    // --- Scenario 2: Dragging a CARD ---
    if (targetItem.type === "group") {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                parent_id: targetId,
                column_id: targetItem.column_id,
                is_staged: targetItem.is_staged,
              }
            : i,
        ),
      );
      await dataService.assignParent(itemId, targetId);
    } else if (targetItem.parent_id) {
      const groupId = targetItem.parent_id;
      const group = items.find((i) => i.id === groupId);
      if (group) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  parent_id: groupId,
                  column_id: group.column_id,
                  is_staged: group.is_staged,
                }
              : i,
          ),
        );
        await dataService.assignParent(itemId, groupId);
      }
    } else {
      const newGroupId = crypto.randomUUID();
      const newGroup: RetroItem = {
        id: newGroupId,
        content: "Group",
        column_id: targetItem.column_id,
        is_staged: targetItem.is_staged,
        created_at: new Date().toISOString(),
        reactions: [],
        comments: [],
        votes: {},
        actionItems: [],
        type: "group",
        parent_id: null,
      };

      setItems((prev) => [
        ...prev.map((i) => {
          if (i.id === itemId || i.id === targetId) {
            return {
              ...i,
              parent_id: newGroupId,
              column_id: targetItem.column_id,
              is_staged: targetItem.is_staged,
            };
          }
          return i;
        }),
        newGroup,
      ]);

      const createdGroup = await dataService.createGroupItem(
        targetItem.column_id,
        sprintId,
        targetItem.is_staged || false,
      );
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

  const handleAddItem = async (
    content: string,
    columnId: string,
    isStaged: boolean = true,
  ) => {
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
      type: "card",
    };
    setItems((prev) => [...prev, tempItem]);

    // Actual API Call
    const newItem = await dataService.createItem(
      content,
      columnId,
      currentUser,
      sprintId,
      isStaged,
    );

    // Replace temp with real
    setItems((prev) => {
      // If Realtime already added the item (by ID), just remove the temp one
      if (prev.some((i) => i.id === newItem.id)) {
        return prev.filter((i) => i.id !== tempItem.id);
      }
      return prev.map((i) => (i.id === tempItem.id ? newItem : i));
    });
  };

  const handlePublishAll = async (columnId: string) => {
    // Only publish OWN items optimistically
    setItems((prev) =>
      prev.map((i) =>
        i.column_id === columnId && i.is_staged && i.user_id === currentUser.id
          ? { ...i, is_staged: false }
          : i,
      ),
    );
    await dataService.publishAllInColumn(columnId, currentUser.id);
  };

  const handleReaction = async (itemId: string, emoji: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newReactions = JSON.parse(JSON.stringify(item.reactions)); // Deep copy
        const existing = newReactions.find((r: any) => r.emoji === emoji);
        if (existing) {
          if (existing.authors.includes(currentUser.id)) {
            existing.authors = existing.authors.filter(
              (a: any) => a !== currentUser.id,
            );
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
      }),
    );
    await dataService.toggleReaction(itemId, emoji, currentUser);
  };

  const handleRaiseHand = async () => {
    const newState = !currentUser.isHandRaised;
    const timestamp = newState ? Date.now() : undefined;

    // Optimistic update
    setCurrentUser((prev) => ({
      ...prev,
      isHandRaised: newState,
      handRaisedAt: timestamp,
    }));

    // Broadcast change for immediate speed
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "hand_raised",
        payload: {
          userId: currentUser.id,
          isHandRaised: newState,
          handRaisedAt: timestamp,
        },
      });
    }

    // Persist to database
    await dataService.updateUserHandRaised(currentUser.id, newState, timestamp);
  };

  const handleLowerAllHands = async () => {
    // Broadcast for immediate speed
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "lower_all_hands",
        payload: {},
      });
    }

    // Lower all hands via database (broadcasts to all users via Realtime)
    await dataService.lowerAllHands();

    // Also update local state immediately for responsiveness
    setCurrentUser((prev) => ({
      ...prev,
      isHandRaised: false,
      handRaisedAt: undefined,
    }));
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    const oldName = currentUser.name;
    const oldColor = currentUser.color;

    setCurrentUser(updatedUser);

    // If name or color changed, update potential existing content
    if (updatedUser.name !== oldName || updatedUser.color !== oldColor) {
      await dataService.updateContentAuthor(oldName, updatedUser);
    }

    // Always persist key profile changes to DB
    await dataService.upsertUser(updatedUser);
  };

  const handleColumnUpdate = (id: string, title: string, theme: any) => {
    const nextColumns = columns.map((c) =>
      c.id === id ? { ...c, title, colorTheme: theme } : c,
    );
    setColumns(nextColumns);
    dataService.updateSprintConfig(sprintId, {
      columns: nextColumns,
      votingConfig,
    });
  };

  const handleToggleColumnVisibility = (columnId: string) => {
    setHiddenColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await dataService.deleteItem(itemId);
      // Optimistically remove from local state
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return {
    columns,
    setColumns,
    items,
    setItems,
    selectedItem,
    setSelectedItem,
    currentUser,
    setCurrentUser,
    participants,
    isVotingConfigOpen,
    setIsVotingConfigOpen,
    isVotingActive,
    votingConfig,
    isEndVotingConfirmOpen,
    setIsEndVotingConfirmOpen,
    isProfileOpen,
    setIsProfileOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isShareOpen,
    setIsShareOpen,
    editingColumnId,
    setEditingColumnId,
    sidebarCollapsed,
    setSidebarCollapsed,
    userVotesUsed,
    hiddenColumnIds,
    viewConfig,
    setViewConfig,
    isCardOverviewEnabled,
    setIsCardOverviewEnabled,
    permissions,
    setPermissions,
    isLoading,
    refreshData,
    handleStartVoting,
    confirmEndVoting,
    handleVote,
    handleAddActionItem,
    handleToggleActionItem,
    handleStartTimer: (duration: number) => {
      const endTime = new Date(Date.now() + duration * 1000).toISOString();
      const newTimer: TimerConfig = {
        endTime,
        duration,
        status: "running",
      };
      setTimer(newTimer);
      dataService.updateSprintConfig(sprintId, {
        columns,
        votingConfig,
        permissions,
        settings: { isCardOverviewEnabled },
        timer: newTimer,
      });
    },
    handlePauseTimer: () => {
      if (!timer || timer.status !== "running") return;
      const end = new Date(timer.endTime!).getTime();
      const now = Date.now();
      const remainingAtPause = Math.max(0, Math.floor((end - now) / 1000));

      const newTimer: TimerConfig = {
        ...timer,
        status: "paused",
        endTime: null,
        remainingAtPause,
      };
      setTimer(newTimer);
      dataService.updateSprintConfig(sprintId, {
        columns,
        votingConfig,
        permissions,
        settings: { isCardOverviewEnabled },
        timer: newTimer,
      });
    },
    handleResumeTimer: () => {
      if (!timer || timer.status !== "paused") return;
      const duration = timer.remainingAtPause ?? 0;
      const endTime = new Date(Date.now() + duration * 1000).toISOString();

      const newTimer: TimerConfig = {
        ...timer,
        status: "running",
        endTime,
        remainingAtPause: undefined,
      };
      setTimer(newTimer);
      dataService.updateSprintConfig(sprintId, {
        columns,
        votingConfig,
        permissions,
        settings: { isCardOverviewEnabled },
        timer: newTimer,
      });
    },
    handleResetTimer: () => {
      const newTimer: TimerConfig = {
        endTime: null,
        duration: 0,
        status: "stopped",
      };
      setTimer(newTimer);
      dataService.updateSprintConfig(sprintId, {
        columns,
        votingConfig,
        permissions,
        settings: { isCardOverviewEnabled },
        timer: newTimer,
      });
    },
    timer,
    remainingTime,
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
  };
};
