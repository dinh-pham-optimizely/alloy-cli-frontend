---
name: generate-component
description: 'Generate Atomic Design components (atoms, molecules, organisms) with optional styles, scripts, states, pages, templates, data, and type definitions. Use when: user wants to create, scaffold, generate, or add a new component, atom, molecule, or organism.'
argument-hint: 'Describe the component to generate (e.g., "organism ProductCard with style and state, prefix xx")'
---

# Generate Component

Generate a component following the **Atomic Design** pattern by running the CLI engine. The engine handles all template rendering, naming transforms, and file creation deterministically.

## When to Use

- User wants to create/scaffold a new atom, molecule, organism, or page
- User says "generate", "create", "scaffold", "add", or "new" followed by a component type or name

## Required Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `name` | PascalCase component name | `ProductCard`, `Button`, `SearchBar` |
| `type` | Component type: `a` (atom), `m` (molecule), `o` (organism) | `o` |
| `prefix` | CSS class prefix | `xx` |

## Optional Flags

| Flag | Description |
|------|-------------|
| `--style` | Generate `.scss` style file |
| `--script` | Generate `.entry.ts` script file |
| `--state` | Generate `.states.json` state file |
| `--page` | Generate page component (auto-creates template) |
| `--story` | Use story template for page (requires `--page`) |
| `--data` | Generate data/props file |
| `--properties` | Component properties (e.g., `"title:string, image:ImageModel"`) |
| `--compose` | Compose with existing components (e.g., `"Button, Image, SearchBar"`) |

## Procedure

1. **Parse the request** — Extract component name, type, prefix, and optional files from the user's message
2. **Validate** — Component name must be PascalCase (e.g., `ProductCard`, not `product-card` or `productCard`). If invalid, suggest the corrected version
3. **Ask for missing info** — If name, type, or prefix are not provided, ask the user
4. **Confirm the plan** — Show the user what will be generated:
   ```
   I'll generate the following for [Type] "ComponentName" (prefix: xx):
   - Component: src/{type}s/{kebab-name}/{ComponentName}.tsx
   - Type: src/_types/{type}s.d.ts (appended)
   - Style: src/{type}s/{kebab-name}/{ComponentName}.scss (if --style)
   - State: src/{type}s/{kebab-name}/{ComponentName}.states.json (if --state)
   - Script: src/assets/scripts/{kebab-name}.entry.ts (if --script)
   - Page: src/pages/{ComponentName}Page.tsx (if --page)
   - Template: src/templates/{kebab-name}/{ComponentName}Template.tsx (if --page)
   - Data: src/_data/{camelCase}.ts (if --data)
   ```
5. **Run the CLI** — Execute the generation command:
   ```
   alloy-cli-frontend generate <name> --type <t> --prefix <p> [flags] --json
   ```
   Or use the [generate script](./scripts/generate.js):
   ```
   node .github/skills/generate-component/scripts/generate.js <name> --type <t> --prefix <p> [flags]
   ```
6. **Report results** — Show the created/appended files from the JSON output
7. **Offer follow-up** — Ask if the user wants to run `#prompt:manage-dependencies` to update barrel exports

## Name Derivation Reference

See [naming conventions](./references/naming-conventions.md) for the full PascalCase → kebab-case / camelCase / Model / Template derivation rules.

## Directory Structure Reference

See [file structure](./references/file-structure.md) for the complete directory layout.

## Example

User: "Create an organism ProductCard with style and state, prefix xx"

→ Run: `alloy-cli-frontend generate ProductCard --type o --prefix xx --style --state --json`

User: "Create organism Hero with title, image, cta button — prefix xx"

→ First resolve properties via `resolve-model-properties` skill, then run:
`alloy-cli-frontend generate Hero --type o --prefix xx --properties "title:string, image:ImageModel, ctaButton:ButtonModel" --json`

User: "Create organism NavBar composed of Button, Icon, and SearchBar — prefix xx"

→ Run:
`alloy-cli-frontend generate NavBar --type o --prefix xx --compose "Button, Icon, SearchBar" --json`

The `--compose` flag reads `.alloy-models.json` to find matching components and generates import statements + JSX placeholders in the component file.

Output:
```json
{
  "componentName": "ProductCard",
  "type": "o",
  "files": [
    { "path": "src/_types/organisms.d.ts", "action": "appended" },
    { "path": "src/organisms/product-card/ProductCard.states.json", "action": "created" },
    { "path": "src/organisms/product-card/ProductCard.scss", "action": "created" },
    { "path": "src/organisms/product-card/ProductCard.tsx", "action": "created" }
  ]
}
```
