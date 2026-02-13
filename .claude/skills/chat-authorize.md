# chat-authorize

Session permission grants for streamlined AI-assisted development. Invoke with `/chat-authorize` at the start of a session to pre-approve common operations.

## When to Use

Run this skill at the beginning of a coding session to grant blanket permissions for frequently needed operations. This eliminates repeated confirmation prompts and speeds up the workflow.

## Permission Categories

When invoked, present the following permission categories to the user using `AskUserQuestion` with `multiSelect: true`:

### 1. Dev Server & Build Operations
- Run `pnpm dev`, `pnpm start`, `pnpm build`
- Run `npx expo start`, `npx expo export`
- Run `npx expo install <package>`
- Execute `pnpm typecheck` / `tsc --noEmit`

### 2. Codebase Modifications
- Create, edit, and delete source files (`src/**/*`)
- Create, edit, and delete test files (`test/**/*`, `__tests__/**/*`)
- Modify configuration files (`tsconfig.json`, `package.json`, `app.config.ts`, `biome.json`)
- Create new utility files, components, and modules

### 3. Test & Lint Execution
- Run `pnpm lint`, `pnpm lint:fix`
- Run `npx biome check`
- Execute type-checking with `pnpm typecheck`
- Run `pnpm run verify`

### 4. Git Operations
- Run `git add`, `git commit`, `git push`
- Run `git checkout`, `git branch`
- Create PRs with `gh pr create`
- View PRs with `gh pr view`, `gh pr list`

### 5. Plan-Mode Optimization
- Automatically enter plan mode for multi-file changes
- Skip plan mode for single-file fixes and trivial changes
- Use TOON format in all structured outputs (commit messages, PR bodies, reports)

## Behavior

When `/chat-authorize` is invoked:

1. Present all 5 categories with descriptions using `AskUserQuestion` (multiSelect)
2. User selects which categories to authorize
3. For the remainder of the session, proceed without confirmation prompts for operations within authorized categories
4. Still confirm for operations outside authorized categories
5. Always confirm destructive operations regardless of grants:
   - `git push --force`
   - `git reset --hard`
   - `rm -rf`
   - Any operation that cannot be undone

## Example Interaction

```
> /chat-authorize

Which permission categories would you like to grant for this session?

[x] Dev Server & Build Operations — Run dev server, builds, and type-checking
[x] Codebase Modifications — Create, edit, delete source and config files
[x] Test & Lint Execution — Run linting, type-checks, and verification
[ ] Git Operations — Run git commands and create PRs
[ ] Plan-Mode Optimization — Auto plan mode and TOON formatting

Granted: Dev Server & Build, Codebase, Tests & Lint
```

## Rules

- Never auto-grant permissions — always ask the user
- Permissions last for the current session only
- Destructive operations always require explicit confirmation regardless of grants
- Never commit `.env`, credentials, API keys, or secrets even if codebase modifications are authorized
- Log which categories were granted at the start of session for reference
