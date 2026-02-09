import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import {
  RetroItem,
  User,
  Comment,
  Reaction,
  ActionItem,
  Column,
  VotingConfig,
  SprintConfig,
} from "../types";

// In-memory fallback
let mockData: RetroItem[] = [];

// Helper to generate sprint code
const generateSprintCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const part = () =>
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `${part()}-${part()}-${part()}`;
};

export const dataService = {
  // Sprints
  async createSprint(
    name: string,
    userId: string,
  ): Promise<{ id: string; code: string }> {
    const code = generateSprintCode();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("sprints")
        .insert([{ name, code, created_by: userId }])
        .select()
        .single();
      if (error) throw error;

      // Also add creator as a participant
      await supabase
        .from("sprint_participants")
        .insert([{ sprint_id: data.id, user_id: userId }])
        .select()
        .single();

      return { id: data.id, code: data.code };
    }
    return { id: "mock-sprint-id", code };
  },

  async joinSprint(
    code: string,
  ): Promise<{ id: string; name: string; code: string } | null> {
    if (isSupabaseConfigured && supabase) {
      const upperCode = code.toUpperCase();
      console.log("Attempting to join sprint with code:", upperCode);
      const { data, error } = await supabase
        .from("sprints")
        .select("id, name, code")
        .ilike("code", upperCode)
        .single();

      if (error || !data) {
        console.error("Sprint not found or error:", error);
        return null;
      }
      console.log("Sprint found:", data.name);

      // Add user as participant to the sprint they are joining
      // Get current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase
          .from("sprint_participants")
          .upsert([{ sprint_id: data.id, user_id: session.user.id }], {
            onConflict: "sprint_id,user_id",
          });
      }

      return { id: data.id, name: data.name, code: data.code };
    }
    return code.toLowerCase() === "abcd-defg-hijk"
      ? { id: "mock-sprint-id", name: "Mock Sprint", code }
      : null;
  },

  subscribeToSprint(
    sprintId: string,
    onUpdate: (payload: any) => void,
  ): RealtimeChannel | null {
    if (!isSupabaseConfigured || !supabase) return null;

    return supabase
      .channel(`sprint:${sprintId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "retro_items",
          filter: `sprint_id=eq.${sprintId}`,
        },
        (payload) => onUpdate(payload),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sprints",
          filter: `id=eq.${sprintId}`,
        },
        (payload) => onUpdate(payload),
      );
  },

  async fetchSprintConfig(sprintId: string): Promise<SprintConfig | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("sprints")
        .select("configuration")
        .eq("id", sprintId)
        .single();

      if (error || !data) return null;
      return data.configuration;
    }
    return null;
  },

  async updateSprintConfig(
    sprintId: string,
    config: SprintConfig,
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("sprints")
        .update({ configuration: config })
        .eq("id", sprintId);
    }
  },

  async fetchItems(sprintId: string): Promise<RetroItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("retro_items")
        .select("*")
        .eq("sprint_id", sprintId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as RetroItem[];
    }
    // Return a shallow copy so state updates don't mutate mockData immediately
    return Promise.resolve(
      mockData
        .filter((i: any) => i.sprint_id === sprintId)
        .map((item) => ({ ...item, votes: { ...item.votes } })),
    );
  },

  async createItem(
    content: string,
    columnId: string,
    user: User,
    sprintId: string,
    isStaged: boolean = true,
  ): Promise<RetroItem> {
    const newItem: RetroItem = {
      id: crypto.randomUUID(),
      content,
      column_id: columnId,
      reactions: [],
      comments: [],
      votes: {},
      actionItems: [],
      created_at: new Date().toISOString(),
      author_name: user.name,
      author_role: user.role,
      author_color: user.color,
      is_staged: isStaged,
      parent_id: null,
      type: "card",
      sprint_id: sprintId,
      user_id: user.id,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("retro_items")
        .insert([
          {
            content,
            column_id: columnId,
            reactions: [],
            comments: [],
            votes: {},
            actionItems: [],
            author_name: user.name,
            author_role: user.role,
            author_color: user.color,
            is_staged: isStaged,
            type: "card",
            sprint_id: sprintId,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        mockData.push(newItem);
        return Promise.resolve(newItem);
      }
      return data as RetroItem;
    }
    return Promise.resolve(newItem);
  },

  async createGroupItem(
    columnId: string,
    sprintId: string,
    isStaged: boolean,
  ): Promise<RetroItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("retro_items")
        .insert([
          {
            content: "Group",
            column_id: columnId,
            is_staged: isStaged,
            type: "group",
            votes: {},
            reactions: [],
            comments: [],
            actionItems: [],
            sprint_id: sprintId,
          },
        ])
        .select()
        .single();
      if (!error && data) return data as RetroItem;
    }

    const groupItem: RetroItem = {
      id: crypto.randomUUID(),
      content: "Group",
      column_id: columnId,
      reactions: [],
      comments: [],
      votes: {},
      actionItems: [],
      created_at: new Date().toISOString(),
      author_name: "System",
      is_staged: isStaged,
      parent_id: null,
      type: "group",
      sprint_id: sprintId,
    } as any;

    mockData.push(groupItem);
    return Promise.resolve(groupItem);
  },

  async copyItem(
    itemId: string,
    targetColumnId: string,
  ): Promise<RetroItem | null> {
    if (isSupabaseConfigured && supabase) {
      // 1. Fetch the original item
      const { data: original, error: fetchError } = await supabase
        .from("retro_items")
        .select("*")
        .eq("id", itemId)
        .single();
      if (fetchError || !original) return null;

      // 2. Create the copy
      const { data: newItem, error: createError } = await supabase
        .from("retro_items")
        .insert([
          {
            content: original.content,
            column_id: targetColumnId,
            is_staged: false,
            votes: original.votes,
            reactions: original.reactions,
            comments: original.comments,
            actionItems: original.actionItems,
            author_name: original.author_name,
            author_role: original.author_role,
            author_color: original.author_color,
            type: original.type,
            sprint_id: original.sprint_id,
            user_id: original.user_id,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      // 3. If it's a group, copy children
      if (original.type === "group") {
        const { data: children } = await supabase
          .from("retro_items")
          .select("*")
          .eq("parent_id", original.id);

        if (children && children.length > 0) {
          const childrenToInsert = children.map((child) => ({
            content: child.content,
            column_id: targetColumnId,
            parent_id: newItem.id, // Point to new parent
            is_staged: false,
            votes: child.votes,
            reactions: child.reactions,
            comments: child.comments,
            actionItems: child.actionItems,
            author_name: child.author_name,
            author_role: child.author_role,
            author_color: child.author_color,
            type: child.type,
            sprint_id: child.sprint_id,
            user_id: child.user_id,
          }));
          await supabase.from("retro_items").insert(childrenToInsert);
        }
      }
      return newItem as RetroItem;
    }

    const originalItem = mockData.find((i) => i.id === itemId);
    if (!originalItem) return Promise.resolve(null);

    if (originalItem.type === "group") {
      // Copy group parent
      const newGroup: RetroItem = {
        ...originalItem,
        id: crypto.randomUUID(),
        column_id: targetColumnId,
        is_staged: false,
        votes: { ...originalItem.votes },
        created_at: new Date().toISOString(),
      };
      mockData.push(newGroup);

      // Copy children
      const children = mockData.filter((i) => i.parent_id === itemId);
      children.forEach((child) => {
        mockData.push({
          ...child,
          id: crypto.randomUUID(),
          parent_id: newGroup.id,
          column_id: targetColumnId,
          is_staged: false,
          votes: { ...child.votes },
          created_at: new Date().toISOString(),
        });
      });
      return Promise.resolve(newGroup);
    } else {
      // Copy single item
      const newItem: RetroItem = {
        ...originalItem,
        id: crypto.randomUUID(),
        column_id: targetColumnId,
        is_staged: false,
        votes: { ...originalItem.votes },
        created_at: new Date().toISOString(),
      };
      mockData.push(newItem);
      return Promise.resolve(newItem);
    }
  },

  async updateItemColumn(
    id: string,
    columnId: string,
    isStaged?: boolean,
  ): Promise<void> {
    const updates: any = { column_id: columnId, parent_id: null }; // Reset parent_id when moving to a column (ungroup)
    if (isStaged !== undefined) {
      updates.is_staged = isStaged;
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from("retro_items").update(updates).eq("id", id);
      return;
    }
    const item = mockData.find((i) => i.id === id);
    if (item) {
      item.column_id = columnId;
      item.parent_id = null; // Ungroup
      if (isStaged !== undefined) {
        item.is_staged = isStaged;
      }
    }
    return Promise.resolve();
  },

  async assignParent(itemId: string, parentId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // 1. Fetch parent to get its column and staged status
      const { data: parent, error } = await supabase
        .from("retro_items")
        .select("column_id, is_staged")
        .eq("id", parentId)
        .single();

      if (error || !parent) return;

      const updates = {
        parent_id: parentId,
        column_id: parent.column_id,
        is_staged: parent.is_staged,
      };

      await supabase.from("retro_items").update(updates).eq("id", itemId);
      return;
    }

    const parent = mockData.find((i) => i.id === parentId);
    if (!parent || parent.id === itemId) return Promise.resolve();

    const item = mockData.find((i) => i.id === itemId);
    if (item) {
      item.parent_id = parentId;
      item.column_id = parent.column_id;
      item.is_staged = parent.is_staged;
    }
    return Promise.resolve();
  },

  async checkAndDissolveGroup(
    groupId: string,
  ): Promise<{ dissolved: boolean; remainingItemId?: string }> {
    let children = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error: fetchError } = await supabase
        .from("retro_items")
        .select("id")
        .eq("parent_id", groupId);

      if (fetchError) return { dissolved: false };
      children = data || [];

      if (children.length <= 1) {
        if (children.length === 1) {
          const lastChildId = children[0].id;
          await supabase
            .from("retro_items")
            .update({ parent_id: null })
            .eq("id", lastChildId);
        }

        await supabase.from("retro_items").delete().eq("id", groupId);

        return {
          dissolved: true,
          remainingItemId: children.length === 1 ? children[0].id : undefined,
        };
      }
      return { dissolved: false };
    }

    // Mock logic
    children = mockData.filter((i) => i.parent_id === groupId);
    if (children.length <= 1) {
      if (children.length === 1) {
        const item = mockData.find((i) => i.id === children[0].id);
        if (item) item.parent_id = null;
      }
      mockData = mockData.filter((i) => i.id !== groupId);
      return {
        dissolved: true,
        remainingItemId: children.length === 1 ? children[0].id : undefined,
      };
    }
    return { dissolved: false };
  },

  async updateItemContent(id: string, content: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("retro_items").update({ content }).eq("id", id);
      return;
    }
    const item = mockData.find((i) => i.id === id);
    if (item) item.content = content;
    return Promise.resolve();
  },

  async publishAllInColumn(columnId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("retro_items")
        .update({ is_staged: false })
        .eq("column_id", columnId)
        .eq("is_staged", true)
        .eq("user_id", userId);
      return;
    }
    mockData.forEach((item) => {
      if (
        item.column_id === columnId &&
        item.is_staged &&
        item.user_id === userId
      ) {
        item.is_staged = false;
      }
    });
    return Promise.resolve();
  },

  async toggleReaction(
    itemId: string,
    emoji: string,
    user: User,
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data: item, error } = await supabase
        .from("retro_items")
        .select("reactions")
        .eq("id", itemId)
        .single();

      if (error || !item) return;

      const reactions = (item.reactions as Reaction[]) || [];
      const existingReaction = reactions.find((r) => r.emoji === emoji);

      let updatedReactions;
      if (existingReaction) {
        if (existingReaction.authors.includes(user.id)) {
          const newAuthors = existingReaction.authors.filter(
            (id) => id !== user.id,
          );
          if (newAuthors.length === 0) {
            updatedReactions = reactions.filter((r) => r.emoji !== emoji);
          } else {
            updatedReactions = reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, authors: newAuthors, count: newAuthors.length }
                : r,
            );
          }
        } else {
          updatedReactions = reactions.map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  authors: [...r.authors, user.id],
                  count: r.count + 1,
                }
              : r,
          );
        }
      } else {
        updatedReactions = [
          ...reactions,
          { emoji, count: 1, authors: [user.id] },
        ];
      }

      await supabase
        .from("retro_items")
        .update({ reactions: updatedReactions })
        .eq("id", itemId);
      return;
    }

    const item = mockData.find((i) => i.id === itemId);
    if (!item) return;

    const existingReaction = item.reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.authors.includes(user.id)) {
        existingReaction.authors = existingReaction.authors.filter(
          (id) => id !== user.id,
        );
        existingReaction.count--;
        if (existingReaction.count === 0) {
          item.reactions = item.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        existingReaction.authors.push(user.id);
        existingReaction.count++;
      }
    } else {
      item.reactions.push({ emoji, count: 1, authors: [user.id] });
    }
    return Promise.resolve();
  },

  async addComment(itemId: string, text: string, user: User): Promise<void> {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      text,
      author_name: user.name,
      created_at: new Date().toISOString(),
      author_color: user.color,
    };

    if (isSupabaseConfigured && supabase) {
      const { data: item, error } = await supabase
        .from("retro_items")
        .select("comments")
        .eq("id", itemId)
        .single();

      if (error || !item) return;

      const comments = (item.comments as Comment[]) || [];
      await supabase
        .from("retro_items")
        .update({ comments: [...comments, newComment] })
        .eq("id", itemId);
      return;
    }

    const item = mockData.find((i) => i.id === itemId);
    if (item) {
      item.comments.push(newComment);
    }
    return Promise.resolve();
  },

  async deleteItem(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("retro_items").delete().eq("id", id);
      return;
    }
    mockData = mockData.filter((i) => i.id !== id);
    return Promise.resolve();
  },

  // Voting
  async castVote(itemId: string, userId: string, delta: 1 | -1): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data: item, error } = await supabase
        .from("retro_items")
        .select("votes")
        .eq("id", itemId)
        .single();

      if (error || !item) return;

      const votes = (item.votes as Record<string, number>) || {};
      const currentVotes = votes[userId] || 0;
      const newVotes = Math.max(0, currentVotes + delta);

      const updatedVotes = { ...votes };
      if (newVotes === 0) {
        delete updatedVotes[userId];
      } else {
        updatedVotes[userId] = newVotes;
      }

      await supabase
        .from("retro_items")
        .update({ votes: updatedVotes })
        .eq("id", itemId);
      return;
    }

    const item = mockData.find((i) => i.id === itemId);
    if (!item) return;

    const currentVotes = item.votes[userId] || 0;
    const newVotes = Math.max(0, currentVotes + delta);

    if (newVotes === 0) {
      delete item.votes[userId];
    } else {
      item.votes[userId] = newVotes;
    }
    return Promise.resolve();
  },

  // Action Items
  async addActionItem(itemId: string, text: string): Promise<void> {
    const newAction: ActionItem = {
      id: crypto.randomUUID(),
      text,
      isCompleted: false,
    };

    if (isSupabaseConfigured && supabase) {
      const { data: item, error } = await supabase
        .from("retro_items")
        .select("actionItems")
        .eq("id", itemId)
        .single();

      if (error || !item) return;

      const actionItems = (item.actionItems as ActionItem[]) || [];
      await supabase
        .from("retro_items")
        .update({ actionItems: [...actionItems, newAction] })
        .eq("id", itemId);
      return;
    }

    const item = mockData.find((i) => i.id === itemId);
    if (item) {
      item.actionItems = item.actionItems || [];
      item.actionItems.push(newAction);
    }
    return Promise.resolve();
  },

  async toggleActionItem(itemId: string, actionId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data: item, error } = await supabase
        .from("retro_items")
        .select("actionItems")
        .eq("id", itemId)
        .single();

      if (error || !item) return;

      const actionItems = (item.actionItems as ActionItem[]) || [];
      const updatedActionItems = actionItems.map((a) =>
        a.id === actionId ? { ...a, isCompleted: !a.isCompleted } : a,
      );

      await supabase
        .from("retro_items")
        .update({ actionItems: updatedActionItems })
        .eq("id", itemId);
      return;
    }

    const item = mockData.find((i) => i.id === itemId);
    if (!item) return;

    const action = item.actionItems?.find((a) => a.id === actionId);
    if (action) {
      action.isCompleted = !action.isCompleted;
    }
    return Promise.resolve();
  },

  async updateContentAuthor(oldName: string, newUser: User): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // 1. Update Retro Items author_name and author_color
      await supabase
        .from("retro_items")
        .update({
          author_name: newUser.name,
          author_color: newUser.color,
        })
        .eq("author_name", oldName);
    }
  },

  async upsertUser(user: User): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("retro_users").upsert({
        id: user.id,
        name: user.name,
        color: user.color,
        role: user.role,
      });
    }
  },

  async getUser(id: string): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("retro_users")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        name: data.name,
        color: data.color,
        role: data.role,
        isHandRaised: data.is_hand_raised || false,
        handRaisedAt: data.hand_raised_at
          ? new Date(data.hand_raised_at).getTime()
          : undefined,
      };
    }
    return null;
  },

  async updateUserHandRaised(
    userId: string,
    isRaised: boolean,
    timestamp?: number,
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("retro_users")
        .update({
          is_hand_raised: isRaised,
          hand_raised_at:
            isRaised && timestamp ? new Date(timestamp).toISOString() : null,
        })
        .eq("id", userId);
    }
  },

  async lowerAllHands(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // Lower all hands for all users
      await supabase
        .from("retro_users")
        .update({
          is_hand_raised: false,
          hand_raised_at: null,
        })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all (dummy condition)
    }
  },

  async fetchJoinedSprints(userId: string): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("sprint_participants")
        .select(
          `
                joined_at,
                sprints (
                    id,
                    name,
                    code
                )
            `,
        )
        .eq("user_id", userId)
        .order("joined_at", { ascending: false });

      if (error) {
        console.error("Error fetching joined sprints:", error);
        return [];
      }

      return data
        .filter((item: any) => item.sprints)
        .map((item: any) => ({
          id: item.sprints.id,
          name: item.sprints.name,
          code: item.sprints.code,
          date: item.joined_at,
        }));
    }
    return [];
  },

  async fetchSprintParticipants(sprintId: string): Promise<User[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("sprint_participants")
        .select(
          `
                user_id,
                retro_users (*)
            `,
        )
        .eq("sprint_id", sprintId);

      if (error) {
        console.error("Error fetching sprint participants:", error);
        return [];
      }

      return data
        .filter((item: any) => item.retro_users)
        .map((item: any) => ({
          id: item.retro_users.id,
          name: item.retro_users.name,
          color: item.retro_users.color,
          role: item.retro_users.role,
          isHandRaised: item.retro_users.is_hand_raised || false,
          handRaisedAt: item.retro_users.hand_raised_at
            ? new Date(item.retro_users.hand_raised_at).getTime()
            : undefined,
        }));
    }
    return [];
  },
};
