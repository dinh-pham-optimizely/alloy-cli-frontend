---
description: "Render a TypeScript interface extending BasedAtomicModel"
version: 1
---

# Type Template (v1)

Generates a TypeScript interface to be **appended** to an existing `.d.ts` file. This is the **v1** version using `interface ... extends` syntax.

## Inputs

- `componentModelName` — `{componentName}Model` (e.g., `ProductCardModel`)
- `properties` — *(optional)* list of resolved properties. Each has `name`, `type`, and `optional` (always `true`).

## Template

**Without properties** (default):

```typescript
interface ${componentModelName} extends BasedAtomicModel {
}
```

**With properties**:

```typescript
interface ${componentModelName} extends BasedAtomicModel {
  ${propertyName}?: ${propertyType};
}
```

## Example Output

Without properties — `ProductCard`:

```typescript
interface ProductCardModel extends BasedAtomicModel {
}
```

With properties — `Hero`:

```typescript
interface HeroModel extends BasedAtomicModel {
  title?: string;
  description?: string;
  image?: ImageModel;
  ctaButton?: ButtonModel;
}
```

## Important

This content must be **appended to the BOTTOM** of the existing type file:
- Atoms → `src/_types/atoms.d.ts`
- Molecules → `src/_types/molecules.d.ts`
- Organisms → `src/_types/organisms.d.ts`

**NEVER prepend or insert before existing interfaces.**

## Strict Output

Output ONLY the exact structure shown above with placeholders replaced. Do NOT add extra imports, export statements, comments, utility types, or any other code.

