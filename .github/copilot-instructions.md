# Alloy CLI Frontend — Copilot Instructions

## Project Overview

Frontend component boilerplate generator following **Atomic Design** patterns.
Scaffolds TypeScript/React components with optional styles, scripts, state files,
data templates, and type definitions via a multi-agent pipeline.

## Atomic Design Hierarchy

- **Atom** (`a`): Smallest reusable UI unit (buttons, inputs, icons)
- **Molecule** (`m`): Combination of atoms (search bar = input + button)
- **Organism** (`o`): Complex components composed of molecules/atoms (header, product card).
  Can have pages, templates, and data files.

## Template Placeholder System

Templates in `.github/skills/enrich-*.prompt.md` use `${variableName}` placeholders:

| Placeholder | Replacement |
|---|---|
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

## Import Aliases

TypeScript path aliases used across the project:

- `@_types/types` — Type definitions
- `@helpers/functions` — Helper utilities (e.g., `getModifiers`)
- `@helpers/RequireJs` — Script loader component
- `@helpers/RequireCss` — Style loader component
- `@organisms/{kebab-name}/{ComponentName}` — Organism components
- `@templates/{kebab-name}/{ComponentName}` — Template components
- `@data/{kebab-name}` — Data files