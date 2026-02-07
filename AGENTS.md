# GitHub Command Deck — Agent Overview

This document orients AI agents working on this codebase. Read it first to understand the project before making changes.

## Project Summary

**GitHub Command Deck** is a conversational GitHub analytics dashboard built with Next.js and Tambo AI. Users talk to their repository in natural language to generate charts, tables, and comparisons on demand. The UI follows a "command center" / Star Destroyer bridge aesthetic—serious, tactical, high-stakes.

**Core value**: "Conversation drives UI, not the other way around."

## Essential References

| Document | Purpose |
|----------|---------|
| `docs/brand_guidelines.md.resolved` | Visual identity, color palette, typography, layout, tone of voice, and UI component patterns |
| `docs/context.md.resolved` | Product context, functional rules, technical stack, AI guidelines, and Tambo best practices |
| [Tambo Docs](https://docs.tambo.co/llms.txt) | Tambo generative UI, hooks, components, tools, MCP, and coding agent rules |

## Technical Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **AI/Agent**: Tambo SDK for generative UI, tools, and interactable components
- **Styling**: Tailwind CSS v4, dark mode
- **Charts**: Recharts
- **Validation**: Zod

## Key Directories

- `src/lib/tambo.ts` — Central config: component and tool registration
- `src/components/tambo/` — Tambo-specific components (Graph, message threads, etc.)
- `src/services/github/` — GitHub API client
- `docs/` — Brand guidelines and product/context docs

## When Making Changes

1. **Styling**: Follow `docs/brand_guidelines.md.resolved` — deep space palette, monospace typography, modular panels, tactical tone.
2. **Behavior**: Follow `docs/context.md.resolved` — ambiguity handling, data constraints, rate limits, data freshness.
3. **Tambo**: Use [Tambo docs](https://docs.tambo.co/llms.txt) for component registration, tools, streaming, and generative UI patterns. Check `node_modules/@tambo-ai/react` for latest hooks and exports.
4. **Codebase**: See `CLAUDE.md` for architecture, file structure, and development commands.
