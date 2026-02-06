---
trigger: glob
globs: **/*.{tsx,jsx}
---

# React & TypeScript Component Standards

## 1. Naming Conventions
* **Components:** Must use **PascalCase** (e.g., `UserProfile.tsx`, `NavBar.jsx`).
* **Files:** Filenames must exactly match the main component name (e.g., component `MyButton` lives in `MyButton.tsx`).

## 2. Structural Constraints
* **One Component Per File:** Do not declare multiple functional components in a single file. 
* **Declaration Style:** Always use **arrow functions** for component and hook declarations.
* **Exports:** Use **default exports** for all components and custom hooks.
* **Types:** TypeScript interfaces/types must reside in a companion file: `[ComponentName].types.ts` in the same directory.
* **Folder Structure:** Follow a **Feature-Driven** structure. Components and their specific types/hooks should stay within their respective feature folders.

## 3. Size & Refactoring Limits
* **Component Limit:** Max **120 lines**. Exceeding this requires extraction into sub-components (Composition).
* **Hook Limit:** Max **200 lines**.
* **Logic:** Extract UI logic into custom hooks to keep components lean.

## 4. Imports
* **Aliasing:** Always use `@/` alias. Relative imports (`../../`) are forbidden.