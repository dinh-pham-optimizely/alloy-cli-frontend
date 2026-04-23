# Naming Conventions

All component names must be **PascalCase** (e.g., `ProductCard`, `SearchBar`).

## Name Derivation Rules

| Derived Name | Rule | Example (`ProductCard`) |
|---|---|---|
| kebab-case | Insert `-` before uppercase boundaries, lowercase all | `product-card` |
| camelCase | Lowercase the first letter | `productCard` |
| Model name | Append `Model` | `ProductCardModel` |
| Template name | Append `Template` | `ProductCardTemplate` |
| Data name | camelCase + `Data` | `productCardData` |
| Page name | Append `Page` | `ProductCardPage` |
| Cap Case | Insert space before uppercase boundaries | `Product Card` |
| CSS class | `{prefix}-{type}-{kebab}` | `xx-o-product-card` |

## Type Abbreviations

| Type | Abbreviation | Plural |
|---|---|---|
| Atom | `a` | `atoms` |
| Molecule | `m` | `molecules` |
| Organism | `o` | `organisms` |

## File Naming

| File | Convention | Example |
|---|---|---|
| Component | `{PascalCase}.tsx` | `ProductCard.tsx` |
| Style | `{PascalCase}.scss` | `ProductCard.scss` |
| State | `{PascalCase}.states.json` | `ProductCard.states.json` |
| Script | `{kebab-case}.entry.ts` | `product-card.entry.ts` |
| Data | `{camelCase}.ts` | `productCard.ts` |
| Type | `{type}s.d.ts` (appended) | `organisms.d.ts` |
