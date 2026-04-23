# Alloy CLI Frontend — Copilot Instructions

## Project Overview

This is a frontend component boilerplate generator following **Atomic Design** patterns. It scaffolds TypeScript/React components with optional styles, scripts, state files, data templates, and type definitions.

## Atomic Design Hierarchy

- **Atom** (`a`): Smallest reusable UI unit (buttons, inputs, icons)
- **Molecule** (`m`): Combination of atoms (search bar = input + button)
- **Organism** (`o`): Complex components composed of molecules/atoms (header, product card). Can have pages, templates, and data files.

## Directory Structure

```
src/
  atoms/{kebab-name}/              # Atom components
    ComponentName.tsx
    ComponentName.scss
    ComponentName.states.json
  molecules/{kebab-name}/          # Molecule components
    ComponentName.tsx
    ComponentName.scss
    ComponentName.states.json
  organisms/{kebab-name}/          # Organism components
    ComponentName.tsx
    ComponentName.scss
    ComponentName.states.json
  templates/{kebab-name}/          # Template wrappers for organisms
    ComponentNameTemplate.tsx
  pages/                           # Page components
    ComponentNamePage.tsx
  _types/                          # Type definitions
    atoms.d.ts
    molecules.d.ts
    organisms.d.ts
  _data/                           # Data/props files
    componentNameCamelCase.ts
  assets/scripts/                  # Script entry points
    component-name.entry.ts
```

## Naming Conventions

All component names must be **PascalCase** (e.g., `ProductCard`, `SearchBar`).

| Context | Convention | Example (`ProductCard`) |
|---------|-----------|------------------------|
| Component name | PascalCase | `ProductCard` |
| Folder/file slug | kebab-case | `product-card` |
| Model type | PascalCase + "Model" | `ProductCardModel` |
| Template name | PascalCase + "Template" | `ProductCardTemplate` |
| Data variable | camelCase + "Data" | `productCardData` |
| Page name | PascalCase + "Page" | `ProductCardPage` |
| CSS class | `{prefix}-{type}-{kebab}` | `xx-o-product-card` |
| Script file | `{kebab}.entry.ts` | `product-card.entry.ts` |
| Style file | `{PascalCase}.scss` | `ProductCard.scss` |
| State file | `{PascalCase}.states.json` | `ProductCard.states.json` |
| Type file | `{type}s.d.ts` (appended) | `organisms.d.ts` |

### Name Transformation Rules

- **PascalCase → kebab-case**: Insert `-` before each uppercase letter boundary, lowercase all. `HTTPRequest` → `http-request`
- **PascalCase → camelCase**: Lowercase the first letter. `ProductCard` → `productCard`
- **PascalCase → Cap Case with Spacing**: Insert space before uppercase boundaries. `ProductCard` → `Product Card`

## Template Placeholder System

Templates in `.github/skills/tpl-**.prompt.md` use `${variableName}` placeholders that get replaced during generation:

| Placeholder | Replacement |
|------------|-------------|
| `${componentName}` | PascalCase component name |
| `${componentModelName}` | `{ComponentName}Model` |
| `${componentNameKebabCase}` | kebab-case version |
| `${componentNameCamelCase}` | camelCase version |
| `${componentTemplateName}` | `{ComponentName}Template` |
| `${componentDataName}` | `{componentNameCamelCase}Data` |
| `${componentPageName}` | `{ComponentName}Page` |
| `${componentAsCapCaseWithSpacing}` | `Component Name` |
| `${projectPrefix}` | Project CSS prefix (e.g., `xx`) |
| `${type}` | Component type abbreviation (`a`, `m`, `o`) |

## Template Files Reference

Located in `.github/skills/`:
- `tpl-component.prompt.md` — React component with imports, model type, style modifier, and CLI placeholder for RequireJs/RequireCss
- `tpl-template.prompt.md` — Template wrapper that imports and renders an organism
- `tpl-page.prompt.md` — Standard page importing data and template
- `tpl-page-story.prompt.md` — Story collection page with metadata and render function
- `tpl-data.prompt.md` — Data/props object typed with component model
- `tpl-state.prompt.md` — JSON state config with selector, button config, and states array
- `tpl-style.prompt.md` — SCSS file with class selector
- `tpl-type.prompt.md` — TypeScript interface extending `BasedAtomicModel`

## Import Aliases

The target projects use these TypeScript path aliases:
- `@_types/types` — Type definitions
- `@helpers/functions` — Helper utilities (e.g., `getModifiers`)
- `@helpers/RequireJs` — Script loader component
- `@helpers/RequireCss` — Style loader component
- `@organisms/{kebab-name}/{ComponentName}` — Organism components
- `@templates/{kebab-name}/{ComponentName}` — Template components
- `@data/{kebab-name}` — Data files
