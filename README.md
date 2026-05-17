# Splittr

A lightweight bill‑splitting app built with Vue 3 + Vite, Pinia, Supabase and packaged with Capacitor for mobile.

---

## Quick overview

- Frontend: Vue 3 (script-setup, TypeScript), Vite
- State: Pinia (see [src/stores](src/stores))
- Backend & Auth: Supabase (Postgres + Auth)
- Mobile: Capacitor (see `capacitor.config.ts` and the `ios/` folder)

## Key files and locations

- Group view and expense UI: [src/views/dashboard/group/GroupDetails.vue](src/views/dashboard/group/GroupDetails.vue)
- Drawers (add expense / split / scan): [src/views/dashboard/group/drawers](src/views/dashboard/group/drawers)
- Stores: [src/stores/groups.ts](src/stores/groups.ts), [src/stores/profiles.ts](src/stores/profiles.ts)
- DB typings: [src/utils/database.types.ts](src/utils/database.types.ts)
- Supabase client: [src/utils/supabase.ts](src/utils/supabase.ts)

## How to run (web)

1. Install dependencies

```bash
npm install
```

2. Provide environment variables (create a `.env` file at project root):

- `VITE_SUPABASE_URL` — your Supabase URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

Example `.env` (do not commit keys):

```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_key_here
```

3. Run dev server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
npm run preview  # optional local preview
```

## How to run on iOS (Capacitor)

1. Build web assets

```bash
npm run build
```

2. Sync and open in Xcode

```bash
npx cap sync ios
npx cap open ios
```

Open the Xcode workspace in `ios/App/App.xcodeproj` and run on a simulator/device.

## Database schema notes

The project uses Supabase/Postgres. See `src/utils/database.types.ts` for the typed schema. Important tables:

- `groups` — group metadata (id, name, created_by, created_at; can hold `invite_code`)
- `group_members` — membership rows linking `user_id` → `group_id`
- `expenses` — expenses with `group_id`, `created_by`, `title`, `total_amount`
- `expense_participants` — per-expense owed amounts (`expense_id`, `user_id`, `owed_amount`)
- `profiles` — user profiles (name)

Splitting logic in the UI computes per-expense shares and persists them to `expense_participants` when confirmed.

## Approach & architecture

- Keep the group details and expense feed in a single view so actions stay in context.
- Use one shared drawer container (single backdrop/transition) and swap components with a `drawerComponent` computed value. This avoids duplicate markup and keeps animations consistent.
- Keep data normalized: members, expenses, and expense participants are separate tables for clarity and easier queries.

## Challenges faced

- Typing `defineEmits` in TypeScript: no-payload emits require `null` in the generic (`defineEmits<{ close: null }>()`) or the `defineEmits(['close'])` form. This caused a runtime/compile error during early edits.
- Drawer composition: centralizing a drawer required passing `currentGroup`, `expenses`, and derived props consistently to avoid undefined access.

## Limitations
- Unable to delete/edit expenses after creation *(not enough time)*
- Currently unresponsive, can be made to work on desktop too *(not enough time)*
- OCR may lack high accuracy and read incorrect text, or it will not identify tax items (ex: 6% service tax) *(could use a better model)*