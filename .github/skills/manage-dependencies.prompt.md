---
description: "Manage barrel exports and imports after generating new components"
---

# Manage Dependencies

After generating new components, update barrel files and imports to properly export and reference the new component throughout the project.

## When to Use

Run this after generating a new component to ensure it's properly integrated into the project's module system.

## Tasks

### 1. Update Type Barrel Exports

Check if `src/_types/types.ts` (or `src/_types/index.ts`) exists. If it does, ensure the newly added type interface is re-exported.

For example, if a new `ButtonModel` was added to `src/_types/atoms.d.ts`, verify that `src/_types/types.ts` re-exports from `atoms.d.ts`:

```typescript
// In src/_types/types.ts
export * from './atoms';
export * from './molecules';
export * from './organisms';
```

### 2. Update Data Barrel Exports

If a data file was generated (e.g., `src/_data/productCard.ts`), check if there's a barrel file at `src/_data/index.ts`. If so, add the re-export:

```typescript
export { productCardData } from './productCard';
```

### 3. Verify Import Paths

Check that all generated files use the correct import aliases:
- `@_types/types` for type imports
- `@helpers/functions` for `getModifiers`
- `@helpers/RequireJs` for script loading
- `@helpers/RequireCss` for style loading
- `@organisms/{kebab-name}/{ComponentName}` for organism imports
- `@templates/{kebab-name}/{ComponentName}` for template imports
- `@data/{kebab-name}` for data imports

### 4. Report Changes

After updating, list all files that were modified and what was added.

## Important Notes

- Only modify barrel/index files if they already exist — don't create new barrel files
- Use **append** mode when adding exports to avoid overwriting existing content
- Preserve existing exports — only add the new component's exports
- Follow the existing code style in barrel files (named exports vs default exports, semicolons, etc.)
- If no barrel files exist, inform the user that manual import setup may be needed
