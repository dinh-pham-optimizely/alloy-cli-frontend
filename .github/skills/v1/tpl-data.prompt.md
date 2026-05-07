---
description: "Render a data/props file with explicit type import"
version: 1
---

# Data Template (v1)

Generates a data/props `.ts` file that exports a typed empty object. This is the **v1** version with explicit type import and separate export statement.

## Inputs

- `componentName` — PascalCase (e.g., `ProductCard`)
- `componentModelName` — `{componentName}Model` (e.g., `ProductCardModel`)
- `componentDataName` — `{camelCase}Data` (e.g., `productCardData`)

## Template

```typescript
import { ${componentModelName} } from '@_types/types';

const ${componentDataName}: ${componentModelName} = {};

export { ${componentDataName} };
```

## Example Output

For `ProductCard`:

```typescript
import { ProductCardModel } from '@_types/types';

const productCardData: ProductCardModel = {};

export { productCardData };
```

## Strict Output

Output ONLY the exact structure shown above with placeholders replaced. Do NOT add extra imports, properties, comments, helper functions, or any other code.

