---
description: "Enrich a scaffolded TypeScript interface with resolved model properties. Use this ONLY after the base interface has been appended by the render_and_scaffold MCP tool."
---

# Enrich Type

Modifies an already-scaffolded `interface *Model extends BasedAtomicModel` definition to add typed optional property fields. The base empty interface is produced by the MCP tool — do not re-append it. Only add the property fields inside the existing interface.

> **Fallback only**: If the MCP tool is unavailable, the base interface is:
> ```typescript
> interface ${componentModelName} extends BasedAtomicModel {
> }
> ```
> Append it to the correct `src/_types/{type}s.d.ts` file, then apply enrichment.

## When to apply

Only when the user's request includes property hints. If no properties were provided, the base empty interface is correct as-is.

## Inputs

- `properties` — resolved list from `#prompt:resolve-model-properties`. Each item: `name`, `type`, `optional: true`.
- The existing type file content (read from disk before editing).

## Enrichment Rules

### 1 — Add property fields

Inside the interface body, add each resolved property as an optional field:

```typescript
  propertyName?: PropertyType;
```

All properties MUST use `?` — this aligns with the `BasedAtomicModel` convention. Never use required fields.

### 2 — Add imports for cross-file project model types

If a property type is a project `*Model` that lives in a **different** `.d.ts` file than the one being edited:
- Atoms' properties → no import needed (atoms import nothing from other atomic layers)
- Molecules/Organisms that reference `*Model` from atoms or molecules → the `.d.ts` files are global ambient declarations — no `import` needed as long as all `.d.ts` files are included in `tsconfig`. Note this in a comment if the type origin is ambiguous.

If a project model type is referenced that does NOT appear in the registry, add a `// TODO: verify type source` comment on that property line.

## Example

**Resolved properties**: `title: string`, `description: string`, `image: ImageModel`, `ctaButton: ButtonModel`

```typescript
interface HeroModel extends BasedAtomicModel {
  title?: string;
  description?: string;
  image?: ImageModel;
  ctaButton?: ButtonModel;
}
```
