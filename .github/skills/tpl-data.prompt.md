---
description: "Render a data/props file typed with the component model"
---

# Data Template

Generates a data/props `.ts` file that exports a typed empty object for providing default component data.

## Inputs

- `componentName` — PascalCase (e.g., `ProductCard`)
- `componentModelName` — `{componentName}Model` (e.g., `ProductCardModel`)
- `componentDataName` — `{camelCase}Data` (e.g., `productCardData`)

## Template

**Without properties** (default — backward compatible):

```typescript
import { ${componentModelName} } from '@_types/types';

const ${componentDataName}: ${componentModelName} = {};

export { ${componentDataName} };
```

## Example Output

**Without properties** — for `ProductCard`:

```typescript
import { ProductCardModel } from '@_types/types';

const productCardData: ProductCardModel = {};

export { productCardData };
```

## Strict Output

Output ONLY the exact structure shown above with placeholders replaced. Do NOT add extra imports, properties, comments, helper functions, or any other code beyond what the template defines. Default values MUST come from the "Default Values by Type" table — do not invent custom defaults.

