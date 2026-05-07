---
description: "Render a data/props file with explicit type import"
version: 2
---

# Data Template (v2)

Generates a data/props `.ts` file that exports a typed empty object. This is the **v1** version with explicit type import and separate export statement.

## Inputs

- `componentName` — PascalCase (e.g., `ProductCard`)
- `componentModelName` — `{componentName}Model` (e.g., `ProductCardModel`)
- `componentDataName` — `{camelCase}` (e.g., `productCard`)

## Template

```typescript
const ${componentDataName}: ${componentModelName} = {};

export { ${componentDataName} };
```

## Example Output

For `ProductCard`:

```typescript
const productCardData: ProductCardModel = {};

export { productCardData };
```

## Strict Output

Output ONLY the exact structure shown above with placeholders replaced. Do NOT add extra imports, properties, comments, helper functions, or any other code.

