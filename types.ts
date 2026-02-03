
export interface Comment {
  id: string;
  text: string;
  author_name: string;
  created_at: string;
  author_color?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  authors: string[]; // List of user IDs who reacted
}

export interface ActionItem {
  id: string;
  text: string;
  isCompleted: boolean;
  assigneeId?: string;
}

export interface RetroItem {
  id: string;
  content: string;
  column_id: string;
  created_at: string;
  author_name?: string;
  author_role?: string;
  author_color?: string;
  reactions: Reaction[];
  comments: Comment[];
  votes: Record<string, number>; // userId -> count
  actionItems: ActionItem[];
  is_staged?: boolean;
  parent_id?: string | null; // For grouping items
  type?: 'card' | 'group';
}

export interface Column {
  id: string;
  title: string;
  colorTheme: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'gray';
  viewMode?: 'board' | 'action-list';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  role: string;
  color: string;
  isHandRaised: boolean;
  handRaisedAt?: number;
}

export interface VotingConfig {
  votesPerParticipant: number;
  anonymous: boolean;
  allowMultiplePerCard: boolean;
}
