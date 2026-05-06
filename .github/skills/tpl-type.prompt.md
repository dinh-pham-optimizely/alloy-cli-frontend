---
description: "Render a TypeScript interface extending BasedAtomicModel for a component's type definition"
---

# Type Template

Generates a TypeScript interface definition to be **appended** to an existing `.d.ts` file. The interface extends `BasedAtomicModel`.

## Inputs

- `componentModelName` — `{componentName}Model` (e.g., `ProductCardModel`)
- `properties` — *(optional)* list of resolved properties from `#prompt:resolve-model-properties`. Each has `name`, `type`, and `optional` (always `true`).

## Template

**Without properties** (default — backward compatible):

```typescript
interface ${componentModelName} extends BasedAtomicModel {
}
```

**With properties** — add each property as an optional field:

```typescript
interface ${componentModelName} extends BasedAtomicModel {
  ${propertyName}?: ${propertyType};
}
```

## Example Output

**Without properties** — for `ProductCard`:

```typescript
interface ProductCardModel extends BasedAtomicModel {
}
```

**With properties** — for `Hero` with `[title: string, description: string, image: ImageModel, ctaButton: ButtonModel]`:

```typescript
interface HeroModel extends BasedAtomicModel {
  title?: string;
  description?: string;
  image?: ImageModel;
  ctaButton?: ButtonModel;
}
```

## Important

This content must be **appended to the BOTTOM** of the existing type file, not written as a new file and **not prepended to the top**:
- Atoms → append to the end of `src/_types/atoms.d.ts`
- Molecules → append to the end of `src/_types/molecules.d.ts`
- Organisms → append to the end of `src/_types/organisms.d.ts`

**NEVER prepend, insert at the top, or place the new interface before existing interfaces.** Always add the new interface AFTER all existing content in the file — at the very last line.

## Strict Output

Output ONLY the exact interface structure shown above with placeholders replaced. Do NOT add extra imports, export statements, comments, utility types, or any other code. The interface block MUST be appended to the very end (bottom) of the file, preserving all existing content above it unchanged.

