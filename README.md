
# Retro14

**Retro14** is a collaborative retrospective tool designed for high-performing agile teams. It facilitates real-time feedback, voting, and action item tracking in a clean, professional interface inspired by Atlassian design principles.

![Retro14 Board](https://placehold.co/800x400?text=Retro14+Preview)

## Features

- **Real-time Collaboration:** Live updates for columns, cards, and votes.
- **Agile Workflow:** dedicated columns for "Went Well", "To Improve", and "Action Items".
- **Voting System:** Configurable voting sessions with anonymous options and limits.
- **Grouping:** Drag and drop cards to group related thoughts.
- **Action Items:** Track follow-up tasks directly within the board.
- **Atlassian-inspired UI:** Clean, accessible, and familiar design system tokens.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Supabase (Optional/Configurable)

## Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Provide Supabase credentials as environment variables. Create a `.env` (or `.env.local`) at the project root with:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...YourAnonKey...
   ```
   or set these variables in your shell/hosting environment before running `npm run dev` or `npm run build`.
4. Run the development server:
   ```bash
   npm run dev
   ```

## License

MIT
