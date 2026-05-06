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

Use `#prompt:tpl-page` to generate this file. See `#prompt:tpl-page` for expected output.

**With story template**:

Use `#prompt:tpl-page-story` instead. See `#prompt:tpl-page-story` for expected output.

### 2. Template component (optional)

**Path**: `src/templates/{kebab-name}/{componentName}Template.tsx`

Use `#prompt:tpl-template` with `componentTypePlural` = `organisms` to generate this file (standalone pages wrap organisms by default). See `#prompt:tpl-template` for expected output.

## Generation Order

1. Page component
2. Template component (if requested)

## Important Notes

- Each file's content MUST exactly match the output of its corresponding `#prompt:tpl-*` skill — do NOT add, modify, or embellish beyond what the template produces
- Create the `src/pages/` directory if it doesn't exist
- Create `src/templates/{kebab-name}/` directory if generating a template
- The page imports data from `@data/{kebab-name}` and template from `@templates/{kebab-name}/{componentName}`
- The template imports the organism from `@organisms/{kebab-name}/{componentName}`
