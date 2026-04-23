---
description: "Generate a Page component with optional story template and template component"
---

# Generate Page Component

Generate a **Page** component. Pages are top-level view components that import data and render through a template.

## Required Inputs

- `componentName`: PascalCase component name (e.g., `ProductCard`, `Header`)

## Optional Features

Ask the user:
- **Story template** — use the story collection page format instead of standard page
- **Template component** — generate a new template component for this page

## Name Derivations

From the PascalCase `componentName`, derive:
- **kebab-case**: `ProductCard` → `product-card`
- **camelCase**: `ProductCard` → `productCard`
- **Model name**: `ProductCardModel`
- **Template name**: `ProductCardTemplate`
- **Data name**: `productCardData`
- **Page name**: `ProductCardPage`
- **Cap Case**: `Product Card`

## Files to Generate

### 1. Page component (always generated)

**Without story template**:

**Path**: `src/pages/{componentName}Page.tsx`

Use `#prompt:tpl-page` to generate this file.

**Expected output** (example for `ProductCard`):
```tsx
import { productCardData } from '@data/product-card';
import { ProductCardTemplate } from '@templates/product-card/ProductCard';

const ProductCardPage = () => {
  return <ProductCardTemplate productCardData={productCardData} />;
};

export default ProductCardPage;
```

**With story template**:

Use `#prompt:tpl-page-story` instead.

**Expected output** (example for `ProductCard`):
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

### 2. Template component (optional)

**Path**: `src/templates/{kebab-name}/{componentName}Template.tsx`

Use `#prompt:tpl-wrapper` with `componentTypePlural` = `organisms` to generate this file (standalone pages wrap organisms by default).

**Expected output** (example for `ProductCard`):
```tsx
import { ProductCardModel } from '@_types/types';
import ProductCard from '@organisms/product-card/ProductCard';

interface Props {
  productCardData?: ProductCardModel;
}

export const ProductCardTemplate = (model: Props) => {
  const { productCardData } = model;

  return (
    <>
      <main>
        <ProductCard {...productCardData} />
      </main>
    </>
  );
}

export default ProductCardTemplate;
```

## Generation Order

1. Page component
2. Template component (if requested)

## Important Notes

- Create the `src/pages/` directory if it doesn't exist
- Create `src/templates/{kebab-name}/` directory if generating a template
- The page imports data from `@data/{kebab-name}` and template from `@templates/{kebab-name}/{componentName}`
- The template imports the organism from `@organisms/{kebab-name}/{componentName}`
