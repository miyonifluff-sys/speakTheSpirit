# Project Instructions

## Build Validation
- **Mandatory Build Check:** After making any code changes, you MUST run `npm run build` to ensure that the project compiles successfully and that no regressions were introduced.
- This should be part of the **Validate** step in the Execution cycle.

## 🧠 State & Data Management Boundaries
- Global game values (rewards, cupcakes, cucumbers, tickets, clearedIslands, hasHolyWater) MUST live exclusively inside `context/GameContext.tsx`.
- NEVER use isolated `useState` hooks inside standalone child components for values meant to persist. Always pull them from `useGameContext()`.
- Use **camelCase** naming conventions for all profile database columns (`clearedIslands`, `hasHolyWater`) to perfectly align with the Supabase table setup.

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
   - Components must NEVER invoke `supabase` methods directly if a corresponding context function or hook wrapper exists.

2. 🎨 UI & Presentation Layer (Rendering):
   - Standalone components (e.g., `BattleArea.tsx`, `BasecampShop.tsx`) should act as "pure" layout containers.
   - They must pull ready-to-use data values and callback triggers from `useGameContext()` and focus strictly on mapping that data to the screen using Tailwind and global classes.

### 🧹 Code Quality: npm run lint
- **What it does:** Runs static analysis over our TypeScript and Next.js components to catch syntax errors, unused variables, formatting bugs, and React hook dependency array mismatches before deployment.
- **Hackathon Status:** Active. Build pipelines require strict lint compliance to prevent deployment failures on Vercel/Netlify.