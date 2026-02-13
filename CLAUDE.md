# CLAUDE.md - React Native Mobile Template

## 1. Auto-Start

At the beginning of every new conversation, automatically invoke `/chat-authorize` to present permission grants before doing any work.

## 2. Formatting

Always use TOON (Token-Oriented Object Notation) format when presenting structured data in conversation responses. This includes:
- Arrays of 5+ similar objects (API responses, file lists, search results, comparisons)
- Tables, logs, metrics, benchmarks
- Commit descriptions, PR bodies, change summaries
- Any tabular or repetitive data

See `/toon-formatter` skill for full spec. Default to comma-delimited tabular format unless values contain commas.

## 3. Git Workflow

- **NEVER push directly to `main`.** Always create a feature branch and open a PR.
- When executing `/git-ship`:
  1. Run `git diff` and `git status` to analyze all changed files
  2. Categorize changes by feature/purpose
  3. **Suggest branch splits** — each branch should contain ~5 files max
  4. Present the proposed branches to the user for approval before proceeding
  5. Process each branch sequentially: branch → stage → commit → push → PR
- Branch naming: `feature/<short-description>`, `fix/<short-description>`, or `refactor/<short-description>`

## Project

- **Name**: React Native Mobile Template
- **Stack**: Expo SDK 52, React Native 0.76, TypeScript 5.6, Biome 2, Turbo
- **Dev**: `pnpm dev` (runs verify first, then Expo dev server)
- **Start**: `pnpm start` (Expo dev server without verify)
- **Build**: `pnpm build` (Expo export)
- **Lint**: `pnpm lint` / `pnpm lint:fix`
- **Typecheck**: `pnpm typecheck`
- **Verify**: `pnpm run verify` (typecheck + lint via Turbo)

## Post-Modification

After every code modification, run `pnpm run verify` and fix any errors before considering the task complete.

## Code Conventions

### Formatting (enforced by Biome)
- Double quotes for strings
- Semicolons required
- 2-space indentation
- 120 character line width

### Linting Rules
- NO default exports (except route files in `src/app/` — Expo Router requirement)
- NO TypeScript enums (use const objects with `as const`)
- NO `any` type (use `unknown` and narrow)
- NO `var` (use `const` or `let`)
- NO `console.log` (use `console.warn` or `console.error`)
- NO `.forEach()` (use `for...of` loops)
- Max cognitive complexity: 15

### Naming Conventions
- Variables and functions: camelCase
- Types and interfaces: PascalCase
- Constants: CONSTANT_CASE
- Components: PascalCase (both file name and export name)
- Route files: lowercase with hyphens (Expo Router convention)

### React Native Patterns
- Use named exports for all components (except route files)
- Route files in `src/app/` MUST use default exports (Expo Router requirement)
- Use `StyleSheet.create()` for styles, defined at bottom of file
- Prefer Expo modules (expo-image, expo-font, etc.) over community alternatives when available

### File Organization
- Routes: `src/app/` (file-based routing via Expo Router)
- Shared components: `src/components/`
- Constants: `src/constants/`
- Custom hooks: `src/hooks/`
- Assets: `assets/`
