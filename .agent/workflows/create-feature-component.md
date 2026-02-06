---
description: Use this workflow when requested to create a new UI component within a feature.
---

# Workflow: Create Feature Component

## Context
Use this workflow when requested to create a new UI component within a feature.

## Steps
1. **Identify Feature Path:** Determine the feature folder under `src/features/[feature-name]/components/`.
2. **Create Type File:** Generate `[ComponentName].types.ts` first to define the Props interface.
3. **Create Component File:** - Use `PascalCase` for the filename and arrow function.
    - Import types from `./[ComponentName].types`.
    - Implement default export.
    - Ensure length is < 120 lines.
4. **Create Hook (Optional):** If logic is complex, create `use[ComponentName].ts` in the same folder.
5. **Verify Imports:** Ensure all imports use the `@/` alias.

## Example Output Structure
src/features/billing/
├── components/
│   ├── InvoiceCard.tsx
│   └── InvoiceCard.types.ts
└── hooks/
    └── useInvoiceCalculator.ts