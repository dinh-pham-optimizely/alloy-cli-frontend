---
description: "Render a story collection page component with metadata and render function"
---

# Page Story Template

Generates a story collection page `.tsx` file with `StoryCollectionMeta` metadata and a default story render function.

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
import { Story, StoryCollectionMeta } from '@_types/types';
import { ${componentTemplateName} } from '@templates/${componentNameKebabCase}/${componentTemplateName}';
import { ${componentDataName} } from '@data/${componentNameKebabCase}';

export default {
  $$name: '${componentName}',
  $$path: '${componentNameCamelCase}',
} as StoryCollectionMeta;

export const default${componentPageName}: Story = {
  name: '${componentAsCapCaseWithSpacing} - Default',
  path: 'default',
  render: () => {
    return <${componentTemplateName} ${componentDataName}={${componentDataName}} />;
  },
};
```

## Strict Output

Output ONLY the exact structure shown above with placeholders replaced. Do NOT add extra imports, stories, metadata fields, comments, or any other code.

## Example Output

For `ProductCard`:

```tsx
import { Story, StoryCollectionMeta } from '@_types/types';
import { ProductCardTemplate } from '@templates/product-card/ProductCardTemplate';
import { productCardData } from '@data/product-card';

export default {
  $$name: 'ProductCard',
  $$path: 'productCard',
} as StoryCollectionMeta;

export const defaultProductCardPage: Story = {
  name: 'Product Card - Default',
  path: 'default',
  render: () => {
    return <ProductCardTemplate productCardData={productCardData} />;
  },
};
```
