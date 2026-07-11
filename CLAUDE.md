@AGENTS.md

# Agent Guidelines

## Build Validation
- Run `npm run build` after every set of changes to verify the project still builds.

## 🧠 State & Data Management Boundaries
- Global game values (rewards, cupcakes, cucumbers, tickets, clearedIslands, hasHolyWater) MUST live exclusively inside `context/GameContext.tsx`.
- NEVER use isolated `useState` hooks inside standalone child components for values meant to persist. Always pull them from `useGameContext()`.
- Use **camelCase** naming conventions for all profile database columns (`clearedIslands`, `hasHolyWater`) to perfectly align with the Supabase table setup.

## 🌐 Web3 & Blockchain Integration
- Use modern **wagmi** and **viem** hook patterns for asynchronous smart contract execution (e.g., `useWaitForTransactionReceipt`). 
- Do not let the app crash on wallet transactions; wrap all RPC calls and contract writing actions inside strict try/catch blocks.
- If a blockchain transaction is active, toggle the global loading state (`isTransactionPending: true`) to display the loading screen.

## 🎨 Styling Conventions
- Keep code clean: Avoid massive clusters of repetitive inline Tailwind classes inside `app/page.tsx`.
- Move reusable neobrutalist styling patterns (thick borders, harsh drop shadows, custom keyframe cartoon loops) into global CSS classes in `app/globals.css`.

## 🚫 Hard Constraints
- DO NOT install any additional third-party dependencies or UI packages via npm without asking for permission first.
- DO NOT rewrite entire files if you are only asked to update a single function or component block.
- DO NOT guess or generate fake environment variables.

## 🏗️ Architectural Separation of Concerns (Layering)
To maintain code stability and prevent context clutter, strictly separate data logic from UI rendering layers:

1. 🗄️ Database & Blockchain Layer (Logic):
   - All Supabase mutations, profile fetches, and global state updates must live exclusively inside `context/GameContext.tsx`.
   - All raw smart contract invocations and blockchain event listening must live inside `hooks/useGameContracts.ts`.
   - Components must NEVER invoke `supabase` or `wagmi` methods directly if a corresponding context function or hook wrapper exists.

2. 🎨 UI & Presentation Layer (Rendering):
   - Standalone components (e.g., `BattleArea.tsx`, `BasecampShop.tsx`) should act as "pure" layout containers.
   - They must pull ready-to-use data values and callback triggers from `useGameContext()` and focus strictly on mapping that data to the screen using Tailwind and global classes.