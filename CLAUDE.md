# CLAUDE.md

Project context for AI-assisted development.

## Auto-Start

Run `/chat-authorize` at the beginning of every new session to grant permissions.

## Communication

Use TOON formatting for all structured outputs: commit messages, PR bodies, file lists, reports, tables.

## Git Rules

- **NEVER push directly to main** — always create feature branches
- When running `/git-ship`:
  1. Run `pnpm verify` first — fix all errors before proceeding
  2. Analyze all changed files via `git diff`
  3. Group changes by feature/purpose and **suggest branches** to the user before committing
  4. Each branch should contain **~5 files max** — split larger changesets across multiple branches
  5. Branch naming: `feature/<desc>`, `fix/<desc>`, `refactor/<desc>`
  6. Never force-push, never skip hooks, never commit secrets

## Project

React Native mobile app built with Expo SDK 52, Expo Router 4 for file-based navigation,
React Native 0.76 with New Architecture enabled. TypeScript in strict mode. Biome for linting. Turbo for task orchestration.

**Key dependencies included:** react-native-reanimated (animations), react-native-gesture-handler (gestures),
react-native-safe-area-context, react-native-screens, expo-font, expo-splash-screen, expo-status-bar.

## Commands

- `pnpm start` — Expo dev server
- `pnpm dev` — verify first, then Expo dev server
- `pnpm build` — export production bundle (`npx expo export`)
- `pnpm typecheck` — type-check without emitting
- `pnpm lint` — check with Biome
- `pnpm lint:fix` — auto-fix Biome issues
- `pnpm verify` — typecheck + lint (via Turbo)
- `pnpm ios` / `pnpm android` / `pnpm web` — platform-specific dev
- `pnpm prebuild` — generate native `ios/` and `android/` directories

## Code Style

- Biome enforces all rules — run `pnpm lint` before committing
- Double quotes, semicolons, 2-space indent, 120 char line width
- Named exports only — **except** route files in `src/app/` (Expo Router requires default exports)
- No `any`, no `var`, no enums, no `forEach`, no barrel re-exports
- `console.warn` and `console.error` only (no `console.log`)
- camelCase variables/functions, PascalCase types/components, CONSTANT_CASE constants

## Architecture

```
src/app/                  ← file-based routing (Expo Router)
  _layout.tsx             ← root layout (Stack/Tabs navigator + StatusBar)
  index.tsx               ← home screen (route: /)
  +not-found.tsx          ← 404 fallback
  settings.tsx            ← example: /settings
  (tabs)/                 ← tab group layout
    _layout.tsx           ← tab navigator config
    index.tsx             ← first tab
    profile.tsx           ← second tab
  user/[id].tsx           ← dynamic route: /user/123
src/components/           ← shared reusable components (named exports)
src/constants/            ← app constants, colors, config
src/hooks/                ← custom React hooks
src/services/             ← API clients, storage, external services
src/types/                ← shared TypeScript types
assets/                   ← images, fonts, static files
```

### Adding a new screen

1. Create `src/app/my-screen.tsx` with a **default export**
2. Route is automatically available at `/my-screen`
3. Add `<Stack.Screen>` options in `_layout.tsx` if custom header needed

### Adding tabs

1. Create `src/app/(tabs)/_layout.tsx` with a `<Tabs>` navigator
2. Each file in `(tabs)/` becomes a tab screen
3. Group name `(tabs)` is not part of the URL

### Navigation

```typescript
import { Link, useRouter } from "expo-router";

// Declarative (preferred)
<Link href="/settings">Go to Settings</Link>

// Programmatic
const router = useRouter();
router.push("/user/123");
router.replace("/login");
router.back();
```

### Screen pattern (route file — default export)

```typescript
import { StyleSheet, Text, View } from "react-native";

export default function MyScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Screen</Text>
    </View>
  );
}

const styles: ReturnType<typeof StyleSheet.create> = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: "bold" },
});
```

### Component pattern (non-route — named export)

```typescript
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface MyComponentProps {
  readonly children: ReactNode;
}

export function MyComponent({ children }: MyComponentProps): React.JSX.Element {
  return <View style={styles.container}>{children}</View>;
}

const styles: ReturnType<typeof StyleSheet.create> = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
```

## Mobile Patterns

### Imports — use path aliases

```typescript
import { COLORS } from "@/constants/colors";
import { useAppColorScheme } from "@/hooks/useAppColorScheme";
import { ScreenContainer } from "@/components/ScreenContainer";
```

### Platform-specific code

```typescript
import { Platform } from "react-native";

const paddingTop = Platform.OS === "ios" ? 44 : 0;
const fontFamily = Platform.select({ ios: "System", android: "Roboto", default: "System" });
```

### Animations — use Reanimated (already installed)

```typescript
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const offset = useSharedValue(0);
const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));
```

### Lists — use FlashList for large lists (install when needed)

```bash
npx expo install @shopify/flash-list
```

### Images — use expo-image (install when needed)

```bash
npx expo install expo-image
```

```typescript
import { Image } from "expo-image";
<Image source={{ uri: "https://..." }} style={{ width: 200, height: 200 }} />
```

### Safe areas

```typescript
import { SafeAreaView } from "react-native-safe-area-context";
// Wrap screens that need safe area insets (notch, home indicator)
```

## Expo

- Config: `app.config.ts` (TypeScript — type-safe configuration)
- New Architecture: enabled (`newArchEnabled: true`)
- Typed routes: enabled (`experiments.typedRoutes: true`)
- Deep linking scheme: `mobile-template://`
- iOS bundle ID: `com.template.mobile`
- Android package: `com.template.mobile`
- **Never commit `ios/` or `android/`** — generated by `expo prebuild`
- Install packages with `npx expo install <package>` (ensures Expo-compatible versions)
- pnpm requires `.npmrc` with `node-linker=hoisted` for React Native compatibility

## Skills

- `/git-ship` — verify + commit + push + PR
- `/chat-authorize` — session permission grants
- `/toon-formatter` — token-efficient structured data formatting
- `vercel-react-native-skills` — 36 performance rules (lists, animations, UI patterns, state)
- `building-native-ui` — Expo UI patterns (navigation, controls, media, styling)
- `react-native-best-practices` — profiling, native optimization, bundle analysis (Callstack)
- `react-native-architecture` — project structure, auth flows, offline-first patterns
