---
description: "Render a data/props file typed with the component model"
---

# Data Template

Generates a data/props `.ts` file that exports a typed empty object for providing default component data.

## Inputs

- `componentName` — PascalCase (e.g., `ProductCard`)
- `componentModelName` — `{componentName}Model` (e.g., `ProductCardModel`)
- `componentDataName` — `{camelCase}Data` (e.g., `productCardData`)
- `properties` — *(optional)* list of resolved properties from `#prompt:resolve-model-properties`. Each has `name`, `type`, and `optional`.

## Template

**Without properties** (default — backward compatible):

```typescript
import { ${componentModelName} } from '@_types/types';

const ${componentDataName}: ${componentModelName} = {};

export { ${componentDataName} };
```

**With properties** — populate the object with sensible default values:

```typescript
import { ${componentModelName} } from '@_types/types';

const ${componentDataName}: ${componentModelName} = {
  ${propertyName}: ${defaultValue},
};

export { ${componentDataName} };
```

### Default Values by Type

| Type | Default Value |
|---|---|
| `string` | `''` |
| `number` | `0` |
| `boolean` | `false` |
| `() => void` | `() => {}` |
| Any `*Model` | `{}` |
| Any array (`*[]`) | `[]` |
| `Record<string, unknown>` | `{}` |

## Example Output

**Without properties** — for `ProductCard`:

```typescript
import { ProductCardModel } from '@_types/types';

const productCardData: ProductCardModel = {};

export { productCardData };
```

**With properties** — for `Hero` with `[title: string, description: string, image: ImageModel, ctaButton: ButtonModel]`:

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
