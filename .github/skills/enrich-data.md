---
description: "Enrich a scaffolded data file with resolved model property default values. Use this ONLY after the base data file has been created by the renderer-scaffolder MCP tool."
---

# Enrich Data

Modifies an already-scaffolded data `.ts` file to populate the empty typed object with default values for each resolved property. The base file structure is produced by the MCP tool — do not recreate it. Only populate the object body.

> **Fallback only**: If the MCP tool is unavailable, create the base file manually first:
> ```typescript
> import { ${componentModelName} } from '@_types/types';
> const ${componentDataName}: ${componentModelName} = {};
> export { ${componentDataName} };
> ```
> Then apply the enrichment rules below.

## When to apply

Only when the user's request includes property hints. If no properties were provided, the base empty object is correct as-is — do not modify it.

## Inputs

- `properties` — resolved list from `#prompt:resolve-model-properties`. Each item: `name`, `type`, `optional: true`.

## Default Values by Type

| Type | Default value |
|---|---|
| `string` | `''` |
| `number` | `0` |
| `boolean` | `false` |
| `() => void` | `() => {}` |
| Any `*Model` | `{}` |
| Any array `*[]` | `[]` |
| `Record<string, unknown>` | `{}` |

## Enrichment Rule

Replace the empty object `{}` with a populated object using the defaults table above:

```typescript
const ${componentDataName}: ${componentModelName} = {
  propertyName: defaultValue,
  ...
};
```

Use each property's resolved type to determine the correct default. For any `*Model` type use `{}` — the consuming component handles its own internal defaults.

## Example

**Resolved properties**: `title: string`, `description: string`, `image: ImageModel`, `ctaButton: ButtonModel`

```typescript
import { HeroModel } from '@_types/types';

const heroData: HeroModel = {
  title: '',
  description: '',
  image: {},
  ctaButton: {},
};

export { heroData };
```