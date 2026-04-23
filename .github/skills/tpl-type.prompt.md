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

This content must be **appended** to the existing type file, not written as a new file:
- Atoms → append to `src/_types/atoms.d.ts`
- Molecules → append to `src/_types/molecules.d.ts`
- Organisms → append to `src/_types/organisms.d.ts`
