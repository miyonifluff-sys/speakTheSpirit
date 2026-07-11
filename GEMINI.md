# Project Instructions

## Build Validation
- **Mandatory Build Check:** After making any code changes, you MUST run `npm run build` to ensure that the project compiles successfully and that no regressions were introduced.
- This should be part of the **Validate** step in the Execution cycle.

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