---
description: "Render a standard page component that imports data and template"
version: 1
---

# Page Template (v1)

Generates a standard page `.tsx` file that imports a data object and renders it through a template component.

## Inputs

- `componentName` — PascalCase (e.g., `ProductCard`)
- `componentNameKebabCase` — kebab-case (e.g., `product-card`)
- `componentTemplateName` — `{componentName}Template` (e.g., `ProductCardTemplate`)
- `componentDataName` — `{camelCase}Data` (e.g., `productCardData`)
- `componentPageName` — `{componentName}Page` (e.g., `ProductCardPage`)

## Template

```tsx
import { ${componentDataName} } from '@data/${componentNameKebabCase}';
import { ${componentTemplateName} } from '@templates/${componentNameKebabCase}/${componentName}';

const ${componentPageName} = () => {
  return <${componentTemplateName} ${componentDataName}={${componentDataName}} />;
};

export default ${componentPageName};
```

## Example Output

For `ProductCard`:

```tsx
import { productCardData } from '@data/product-card';
import { ProductCardTemplate } from '@templates/product-card/ProductCard';

const ProductCardPage = () => {
  return <ProductCardTemplate productCardData={productCardData} />;
};

export default ProductCardPage;
```

## Strict Output

Output ONLY the exact structure shown above with placeholders replaced. Do NOT add extra imports, JSX elements, hooks, comments, or any other code.

