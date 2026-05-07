---
description: "Generate a Molecule component with optional style, state, script, type definition, page, template, and data file (v1)"
version: 2
---

# Generate Molecule Component (v2)

Generate a **Molecule** component following the Atomic Design pattern. Molecules are combinations of atoms (search bars, form fields, navigation items).

## Required Inputs

- `componentName`: PascalCase component name (e.g., `SearchBar`, `FormField`)
- `projectPrefix`: CSS class prefix (e.g., `xx`)
- `properties`: *(optional)* resolved property list from `#prompt:resolve-model-properties` — each with `name`, `type`, `source`

## Optional Files

Ask the user which optional files to include:
- Style file (`.scss`)
- Script file (`.entry.ts`)
- State file (`.states.json`)
- Page view (if yes → also creates a template component, and asks about data file and story template)

## Name Derivations

From the PascalCase `componentName`, derive:
- **kebab-case**: Insert `-` before uppercase boundaries, lowercase all (e.g., `SearchBar` → `search-bar`)
- **camelCase**: Lowercase the first letter (e.g., `SearchBar` → `searchBar`)
- **Model name**: `{componentName}Model` (e.g., `SearchBarModel`)
- **Template name**: `{componentName}Template` (e.g., `SearchBarTemplate`)
- **Data name**: `{camelCase}Data` (e.g., `searchBarData`)
- **Page name**: `{componentName}Page` (e.g., `SearchBarPage`)
- **Cap Case**: Insert space before uppercase boundaries (e.g., `SearchBar` → `Search Bar`)

## Files to Generate

### 1. Component file (always generated)

**Path**: `src/molecules/{kebab-name}/index.tsx`

Use `#prompt:tpl-component` with `type` = `m` and the component's inputs to generate this file. If `properties` are provided, pass them to `#prompt:tpl-component` so it renders the destructuring line.

### 2. Type definition (always generated — APPENDED)

**Path**: `src/_types/molecules.d.ts`

Use `#prompt:tpl-type` and **append** the output to the file (do not overwrite). If `properties` are provided, pass them so the interface is populated with typed fields.

### 3. Style file (optional)

**Path**: `src/molecules/{kebab-name}/index.scss`

Use `#prompt:tpl-style` with `type` = `m` to generate this file.

### 4. State file (optional)

**Path**: `src/molecules/{kebab-name}/index.states.json`

Use `#prompt:tpl-state` with `type` = `m` to generate this file.

### 5. Script file (optional)

**Path**: `src/assets/scripts/{kebab-name}.entry.ts`

Create an empty file.

### 6. Page component (optional — when user wants a page view)

**Path**: `src/pages/{kebab-name}.tsx`

When the user requests a page, ask if they want to use the **story template** format.

- **Without story template** — Use `#prompt:tpl-page` to generate the file. See `#prompt:tpl-page` for expected output.
- **With story template** — Use `#prompt:tpl-page-story` to generate the file. See `#prompt:tpl-page-story` for expected output.

### 7. Template component (auto-created when page is requested)

**Path**: `src/templates/{kebab-name}/index.tsx`

Use `#prompt:tpl-template` with `componentTypePlural` = `molecules` to generate this file. See `#prompt:tpl-template` for expected output.

### 8. Data file (optional — asked when page is requested)

**Path**: `src/_data/{kebab-name}.ts`

Use `#prompt:tpl-data` to generate this file.

## Generation Order

1. Type definition (append to `molecules.d.ts`)
2. State file (if requested)
3. Style file (if requested)
4. Script file (if requested)
5. Page component (if requested)
6. Template component (if page is requested)
7. Data file (if requested)
8. Component file

## Important Notes

- Each file's content MUST exactly match the output of its corresponding `#prompt:tpl-*` skill — do NOT add, modify, or embellish beyond what the template produces
- The type file uses **append** mode — add the new definition to the very BOTTOM (end) of `src/_types/molecules.d.ts`. NEVER prepend to the top or insert before existing definitions
- Create directories if they don't exist
- The component, style, and state files all go in `src/molecules/{kebab-name}/`
- The script file goes in `src/assets/scripts/`
- The template goes in `src/templates/{kebab-name}/`
- The page goes in `src/pages/`
- The data file goes in `src/_data/`
- When generating the template component, use `componentTypePlural` = `molecules` (results in `@molecules/` import path)
- The template component is automatically created when a page is requested (pages need templates)
- When a page is requested, also ask if the user wants to create a data file (pages import data)
