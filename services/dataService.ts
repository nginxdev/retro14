
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { RetroItem, User, Comment, Reaction, ActionItem, Column } from '../types';

// In-memory fallback
let mockData: RetroItem[] = [
  { 
    id: '1', 
    content: 'Team velocity increased by 15%', 
    column_id: 'col-1', 
    reactions: [
        { emoji: '🔥', count: 2, authors: ['u-2', 'u-3'] },
        { emoji: '👍', count: 1, authors: ['u-2'] }
    ],
    comments: [],
    votes: {},
    actionItems: [],
    created_at: new Date().toISOString(), 
    author_name: 'John Doe', 
    author_role: 'Scrum Master', 
    author_color: '#36B37E',
    is_staged: false,
    parent_id: null,
    type: 'card'
  },
  { 
    id: '2', 
    content: 'Standups are taking too long', 
    column_id: 'col-2', 
    reactions: [],
    comments: [
        { id: 'c1', text: 'Agree, let\'s cut it to 15m', author_name: 'Sarah Smith', created_at: new Date().toISOString(), author_color: '#FF5630' }
    ],
    votes: {},
    actionItems: [],
    created_at: new Date().toISOString(), 
    author_name: 'Sarah Smith', 
    author_role: 'Developer', 
    author_color: '#FF5630',
    is_staged: false,
    parent_id: null,
    type: 'card'
  },
  { 
    id: '3', 
    content: 'Update documentation for the new API', 
    column_id: 'col-3', 
    reactions: [],
    comments: [],
    votes: {},
    actionItems: [],
    created_at: new Date().toISOString(), 
    author_name: 'Mike Ross', 
    author_role: 'Designer', 
    author_color: '#00B8D9',
    is_staged: false,
    parent_id: null,
    type: 'card'
  },
];

export const dataService = {
  async fetchItems(): Promise<RetroItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('retro_items')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as RetroItem[];
    }
    // Return a shallow copy so state updates don't mutate mockData immediately
    return Promise.resolve(mockData.map(item => ({...item, votes: {...item.votes}})));
  },

  async createItem(content: string, columnId: string, user: User, isStaged: boolean = true): Promise<RetroItem> {
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
      type: 'card'
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('retro_items')
        .insert([{ 
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
          type: 'card'
        }])
        .select()
        .single();
      
      if (error) {
        mockData.push(newItem);
        return Promise.resolve(newItem);
      }
      return data as RetroItem;
    }

    mockData.push(newItem);
    return Promise.resolve(newItem);
  },

  async createGroupItem(columnId: string, isStaged: boolean): Promise<RetroItem> {
      const groupItem: RetroItem = {
          id: crypto.randomUUID(),
          content: 'Group',
          column_id: columnId,
          reactions: [],
          comments: [],
          votes: {},
          actionItems: [],
          created_at: new Date().toISOString(),
          author_name: 'System',
          is_staged: isStaged,
          parent_id: null,
          type: 'group'
      };

      if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('retro_items')
            .insert([{
                content: 'Group',
                column_id: columnId,
                is_staged: isStaged,
                type: 'group',
                votes: {},
                actionItems: []
            }])
            .select()
            .single();
           if (!error) return data as RetroItem;
      }
      
      mockData.push(groupItem);
      return Promise.resolve(groupItem);
  },

  async copyItem(itemId: string, targetColumnId: string): Promise<RetroItem | null> {
    const originalItem = mockData.find(i => i.id === itemId);
    if (!originalItem) return Promise.resolve(null);

    if (originalItem.type === 'group') {
        // Copy group parent
        const newGroup = {
            ...originalItem,
            id: crypto.randomUUID(),
            column_id: targetColumnId,
            is_staged: false,
            votes: { ...originalItem.votes }, 
            created_at: new Date().toISOString()
        };
        mockData.push(newGroup);

        // Copy children
        const children = mockData.filter(i => i.parent_id === itemId);
        children.forEach(child => {
            mockData.push({
                ...child,
                id: crypto.randomUUID(),
                parent_id: newGroup.id,
                column_id: targetColumnId,
                is_staged: false,
                votes: { ...child.votes },
                created_at: new Date().toISOString()
            });
        });
        return Promise.resolve(newGroup);
    } else {
        // Copy single item
        const newItem = {
            ...originalItem,
            id: crypto.randomUUID(),
            column_id: targetColumnId,
            is_staged: false,
            votes: { ...originalItem.votes },
            created_at: new Date().toISOString()
        };
        mockData.push(newItem);
        return Promise.resolve(newItem);
    }
  },

  async updateItemColumn(id: string, columnId: string, isStaged?: boolean): Promise<void> {
    const updates: any = { column_id: columnId, parent_id: null }; // Reset parent_id when moving to a column (ungroup)
    if (isStaged !== undefined) {
        updates.is_staged = isStaged;
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('retro_items').update(updates).eq('id', id);
      return;
    }
    const item = mockData.find(i => i.id === id);
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
    const parent = mockData.find(i => i.id === parentId);
    if (!parent || parent.id === itemId) return Promise.resolve();
    
    const updates = {
        parent_id: parentId,
        column_id: parent.column_id,
        is_staged: parent.is_staged
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('retro_items').update(updates).eq('id', itemId);
      return;
    }
    
    const item = mockData.find(i => i.id === itemId);
    if (item) {
        item.parent_id = parentId;
        item.column_id = parent.column_id;
        item.is_staged = parent.is_staged;
    }
    return Promise.resolve();
  },

  async checkAndDissolveGroup(groupId: string): Promise<{ dissolved: boolean, remainingItemId?: string }> {
      let children = [];
      if (isSupabaseConfigured && supabase) {
         const { data } = await supabase.from('retro_items').select('*').eq('parent_id', groupId);
         children = data || [];
      } else {
         children = mockData.filter(i => i.parent_id === groupId);
      }

      if (children.length <= 1) {
          if (children.length === 1) {
              const lastChild = children[0];
              if (isSupabaseConfigured && supabase) {
                  await supabase.from('retro_items').update({ parent_id: null }).eq('id', lastChild.id);
              } else {
                  const item = mockData.find(i => i.id === lastChild.id);
                  if (item) item.parent_id = null;
              }
          }

          if (isSupabaseConfigured && supabase) {
              await supabase.from('retro_items').delete().eq('id', groupId);
          } else {
              mockData = mockData.filter(i => i.id !== groupId);
          }
          
          return { dissolved: true, remainingItemId: children.length === 1 ? children[0].id : undefined };
      }
      return { dissolved: false };
  },

  async updateItemContent(id: string, content: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('retro_items').update({ content }).eq('id', id);
      return;
    }
    const item = mockData.find(i => i.id === id);
    if (item) item.content = content;
    return Promise.resolve();
  },

  async publishAllInColumn(columnId: string): Promise<void> {
      if (isSupabaseConfigured && supabase) {
          await supabase.from('retro_items').update({ is_staged: false }).eq('column_id', columnId).eq('is_staged', true);
          return;
      }
      mockData.forEach(item => {
          if (item.column_id === columnId && item.is_staged) {
              item.is_staged = false;
          }
      });
      return Promise.resolve();
  },

  async toggleReaction(itemId: string, emoji: string, user: User): Promise<void> {
    const item = mockData.find(i => i.id === itemId);
    if (!item) return;

    const existingReaction = item.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
        if (existingReaction.authors.includes(user.id)) {
            existingReaction.authors = existingReaction.authors.filter(id => id !== user.id);
            existingReaction.count--;
            if (existingReaction.count === 0) {
                item.reactions = item.reactions.filter(r => r.emoji !== emoji);
            }
        } else {
            existingReaction.authors.push(user.id);
            existingReaction.count++;
        }
    } else {
        item.reactions.push({ emoji, count: 1, authors: [user.id] });
    }

    if (isSupabaseConfigured && supabase) {
       await supabase.from('retro_items').update({ reactions: item.reactions }).eq('id', itemId);
    }
    return Promise.resolve();
  },

  async addComment(itemId: string, text: string, user: User): Promise<void> {
    const item = mockData.find(i => i.id === itemId);
    if (!item) return;

    const newComment: Comment = {
        id: crypto.randomUUID(),
        text,
        author_name: user.name,
        created_at: new Date().toISOString(),
        author_color: user.color
    };
    
    item.comments.push(newComment);

    if (isSupabaseConfigured && supabase) {
        await supabase.from('retro_items').update({ comments: item.comments }).eq('id', itemId);
    }
    return Promise.resolve();
  },
  
  async deleteItem(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('retro_items').delete().eq('id', id);
      return;
    }
    mockData = mockData.filter(i => i.id !== id);
    return Promise.resolve();
  },

  // Voting
  async castVote(itemId: string, userId: string, delta: 1 | -1): Promise<void> {
      const item = mockData.find(i => i.id === itemId);
      if (!item) return;
      
      const currentVotes = item.votes[userId] || 0;
      const newVotes = Math.max(0, currentVotes + delta);
      
      if (newVotes === 0) {
          delete item.votes[userId];
      } else {
          item.votes[userId] = newVotes;
      }

      if (isSupabaseConfigured && supabase) {
          await supabase.from('retro_items').update({ votes: item.votes }).eq('id', itemId);
      }
      return Promise.resolve();
  },

  // Action Items
  async addActionItem(itemId: string, text: string): Promise<void> {
      const item = mockData.find(i => i.id === itemId);
      if (!item) return;

      const newAction: ActionItem = {
          id: crypto.randomUUID(),
          text,
          isCompleted: false
      };
      
      item.actionItems = item.actionItems || [];
      item.actionItems.push(newAction);

      if (isSupabaseConfigured && supabase) {
          await supabase.from('retro_items').update({ actionItems: item.actionItems }).eq('id', itemId);
      }
      return Promise.resolve();
  },

  async toggleActionItem(itemId: string, actionId: string): Promise<void> {
      const item = mockData.find(i => i.id === itemId);
      if (!item) return;

      const action = item.actionItems?.find(a => a.id === actionId);
      if (action) {
          action.isCompleted = !action.isCompleted;
      }

      if (isSupabaseConfigured && supabase) {
          await supabase.from('retro_items').update({ actionItems: item.actionItems }).eq('id', itemId);
      }
      return Promise.resolve();
  }
};
