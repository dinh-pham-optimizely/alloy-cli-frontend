---
description: "Generate an Organism component with optional page, template, data, style, state, script, and type definition"
---

# Generate Organism Component

Generate an **Organism** component following the Atomic Design pattern. Organisms are the most complex component type — they can have pages, templates, data files, and all optional files.

## Required Inputs

- `componentName`: PascalCase component name (e.g., `ProductCard`, `Header`)
- `projectPrefix`: CSS class prefix (e.g., `xx`)
- `properties`: *(optional)* resolved property list from `#prompt:resolve-model-properties` — each with `name`, `type`, `source`

## Optional Files & Features

Ask the user about each:
- **Separate page view** — creates a page component. If yes, also ask:
  - **Story template** — use the story collection page format instead of standard page
- **Data file** — creates a typed data/props file
- **Style file** (`.scss`)
- **Script file** (`.entry.ts`)
- **State file** (`.states.json`)

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

### 1. Component file (always generated)

**Path**: `src/organisms/{kebab-name}/{componentName}.tsx`

Use `#prompt:tpl-component` with `type` = `o` and the component's inputs to generate this file. If `properties` are provided, pass them to `#prompt:tpl-component` so it renders property-aware JSX.

### 2. Type definition (always generated — APPENDED)

**Path**: `src/_types/organisms.d.ts`

Use `#prompt:tpl-type` and **append** the output to the file. If `properties` are provided, pass them so the interface is populated with typed fields.

### 3. Template component (generated when page view is requested)

**Path**: `src/templates/{kebab-name}/{componentName}Template.tsx`

Use `#prompt:tpl-wrapper` with `componentTypePlural` = `organisms` to generate this file.

### 4. Page component (generated when page view is requested)

**Path**: `src/pages/{componentName}Page.tsx`

**Without story template** — Use `#prompt:tpl-page`:
```tsx
import { productCardData } from '@data/product-card';
import { ProductCardTemplate } from '@templates/product-card/ProductCard';

const ProductCardPage = () => {
  return <ProductCardTemplate productCardData={productCardData} />;
};

export default ProductCardPage;
```

**With story template** — Use `#prompt:tpl-page-story`:
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

### 5. Data file (optional)

**Path**: `src/_data/{camelCase}.ts`

Use `#prompt:tpl-data` to generate this file. If `properties` are provided, pass them so the data object is populated with default values.

### 6. Style file (optional)

**Path**: `src/organisms/{kebab-name}/{componentName}.scss`

Use `#prompt:tpl-style` with `type` = `o` to generate this file.

### 7. State file (optional)

**Path**: `src/organisms/{kebab-name}/{componentName}.states.json`

Use `#prompt:tpl-state` with `type` = `o` to generate this file.

### 8. Script file (optional)

**Path**: `src/assets/scripts/{kebab-name}.entry.ts`

Create an empty file.

## Generation Order

1. State file (if requested)
2. Page component (if requested)
3. Template component (if page is requested)
4. Data file (if requested)
5. Type definition (append to `organisms.d.ts`)
6. Style file (if requested)
7. Script file (if requested)
8. Component file (last)

## Important Notes

- The type file uses **append** mode — add to end of `src/_types/organisms.d.ts`
- Template component is ONLY generated when the user wants a separate page view
- The page component imports from the template, which imports from the organism
- Data file name uses **camelCase** (e.g., `productCard.ts`), NOT kebab-case
- Create all necessary directories if they don't exist
- Component, style, and state go in `src/organisms/{kebab-name}/`
- Template goes in `src/templates/{kebab-name}/`
- Page goes in `src/pages/`
- Data goes in `src/_data/`
- Script goes in `src/assets/scripts/`
