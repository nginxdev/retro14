# Supabase Database Schema

This directory contains the consolidated SQL schema for the **Retro14** application. These files synthesize the final state of the database after evolving through 19 historical migrations.

## Schema Organization

The schema is organized by core components to make it easier to manage and deploy:

1.  **[01_sprints.sql](./01_sprints.sql)**: Defines the core retro boards, their codes, and JSONB configuration (timer, participation settings).
2.  **[02_retro_users.sql](./02_retro_users.sql)**: Manages user profiles, colors, and hand-raising state.
3.  **[03_retro_items.sql](./03_retro_items.sql)**: Defines the cards, groups, comments, and action items. Includes the strict draft-first RLS security model.
4.  **[04_sprint_participants.sql](./04_sprint_participants.sql)**: Tracks board membership and includes the `check_is_sprint_participant` security function to prevent RLS recursion.
5.  **[05_realtime.sql](./05_realtime.sql)**: Unified configuration for Supabase Realtime (Replica Identity and Publications).

## Historical Context

The project evolved through several phases captured here:

- **Phase 1 (Setup)**: Initial table creation and basic RLS.
- **Phase 2 (Security Hardening)**: Implementation of the "Draft System" where cards are private until published.
- **Phase 3 (Scaling Sync)**: Transition to `REPLICA IDENTITY FULL` across all tables to support advanced Realtime filtering.
- **Phase 4 (Persistence Fixes)**: Resolving "Infinite Recursion" and "403 Forbidden" errors by moving to Security Definer functions and optimized participant policies.

## Fresh Installation

To set up a new database environment, execute the files in the following order in the Supabase SQL Editor:

1. `sprints.sql`
2. `retro_users.sql`
3. `retro_items.sql`
4. `sprint_participants.sql`
5. `realtime.sql`

---

_Maintained by Antigravity AI_
