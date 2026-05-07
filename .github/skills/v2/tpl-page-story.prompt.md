---
description: "Render a story collection page with Story/StoryCollectionMeta import"
version: 2
---

# Page Story Template (v2)

Generates a story collection page `.tsx` file with `StoryCollectionMeta` metadata and a default story render function. This is the **v1** version with explicit `Story, StoryCollectionMeta` import.

## Inputs

- `componentName` — PascalCase (e.g., `ProductCard`)
- `componentNameKebabCase` — kebab-case (e.g., `product-card`)
- `componentNameCamelCase` — camelCase (e.g., `productCard`)
- `componentTemplateName` — `{componentName}Template` (e.g., `ProductCardTemplate`)
- `componentDataName` — `{camelCase}Data` (e.g., `productCardData`)
- `componentPageName` — `{componentName}Page` (e.g., `ProductCardPage`)
- `componentAsCapCaseWithSpacing` — Cap Case (e.g., `Product Card`)

## Template

```tsx
import { ${componentTemplateName} } from '@templates/${componentNameKebabCase}';
import { ${componentDataName} } from '@data/${componentNameKebabCase}';

export default {
  $$name: '${componentName}',
  $$path: '${componentNameKebabCase}',
} as StoryCollectionMeta;

export const ${componentName}: Story = {
  name: '${componentAsCapCaseWithSpacing} - Default',
  path: 'default',
  render: () => {
    return <${componentTemplateName} ${componentDataName}={${componentDataName}} />;
  },
};
```

## Example Output

For `ProductCard`:

```tsx
import { ProductCardTemplate } from '@templates/product-card';
import { productCardData } from '@data/product-card';

export default {
  $$name: 'ProductCard',
  $$path: 'product-card',
} as StoryCollectionMeta;

export const ProductCard: Story = {
  name: 'Product Card - Default',
  path: 'default',
  render: () => {
    return <ProductCardTemplate productCardData={productCardData} />;
  },
};
```

## Strict Output

Output ONLY the exact structure shown above with placeholders replaced. Do NOT add extra imports, stories, metadata fields, comments, or any other code.

