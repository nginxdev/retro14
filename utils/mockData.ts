import { RetroItem } from '../types';

export const INITIAL_ITEMS: RetroItem[] = [
  {
    id: '1',
    content: 'Research Atlassian Design Guidelines\n\nExplore the "Atlaskit" components and understand the usage of color, typography, and spacing in Jira.',
    column_id: 'col-1',
    reactions: [],
    comments: [],
    votes: {},
    actionItems: [],
    created_at: new Date().toISOString(),
    author_name: 'John Doe',
    author_role: 'Product Owner',
    author_color: '#0052CC'
  },
  {
    id: '2',
    content: 'Implement Sidebar Navigation\n\nCreate a collapsible sidebar similar to the new Jira UI. Ensure smooth transitions and clear iconography.',
    column_id: 'col-2',
    reactions: [],
    comments: [],
    votes: {},
    actionItems: [],
    created_at: new Date().toISOString(),
    author_name: 'Jane Smith',
    author_role: 'Developer',
    author_color: '#36B37E'
  }
];