# Alloy CLI Frontend

[![npm version](https://img.shields.io/npm/v/alloy-cli-frontend)](https://www.npmjs.com/package/alloy-cli-frontend)
[![license](https://img.shields.io/npm/l/alloy-cli-frontend)](LICENSE)

Alloy CLI Frontend is a command-line tool that installs a **GitHub Copilot agent** (`@alloy`) and scans your project's type definitions to build a model registry. The Copilot agent generates frontend components following **Atomic Design** patterns directly from VS Code Copilot Chat using natural language.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Commands](#commands)
  - [Init](#init)
  - [Scan](#scan)
- [Version Differences (v1 vs v2)](#version-differences-v1-vs-v2)
- [Copilot Agent & Skills](#copilot-agent--skills)
  - [What You Get](#what-you-get)
  - [Using @alloy in Copilot Chat](#using-alloy-in-copilot-chat)
  - [Included Skills](#included-skills)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- **Node.js** ≥ 20
- **VS Code** with [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) enabled
- A TypeScript/React project using **Atomic Design** conventions

## Quick Start

```bash
# 1. Install the Copilot agent and skills
npx alloy-cli-frontend init

# 2. Scan your type definitions to build the model registry
npx alloy-cli-frontend scan

# 3. Restart VS Code, open Copilot Chat, and start generating
#    @alloy Create an atom Button with label, onClick, and disabled. Prefix: acme
```

## Commands

The tool is designed to be run via `npx` in your project root — no global install needed. This keeps the agent and skills in sync with your project.

### Init

Installs the **Copilot agent and skills** into your project. This copies the `.github/agents/`, `.github/skills/`, and `.github/instructions/` files that power the `@alloy` Copilot Chat agent.

```bash
npx alloy-cli-frontend init
```

You'll be guided through two interactive prompts:

1. **Template version** — choose v1 or v2 (see [Version Differences](#version-differences-v1-vs-v2))
2. **Categories to install** — select which file groups to copy:

| Category | Description |
|----------|-------------|
| **Alloy Agent** | The `@alloy` orchestrator agent |
| **Generation Skills** | Atom, molecule, organism, and page generators |
| **Template Skills** | Blueprints for component, style, state, type, data, page, and template files |
| **Utility Skills** | Model property resolution |

Existing files are skipped by default. Use `--force` to overwrite:

```bash
npx alloy-cli-frontend init --force
```

### Scan

Scans your project's type definition files (`src/_types/*.d.ts`) and generates a **model registry** (`.alloy-models.json`) at the project root. The `@alloy` agent reads this registry to resolve property types instantly — instead of grepping through `.d.ts` files on every invocation.

```bash
npx alloy-cli-frontend scan
```

Your type definitions must extend `BasedAtomicModel` for the scanner to detect them. Both syntaxes are supported:

```typescript
// v1 — interface syntax
interface ButtonModel extends BasedAtomicModel { /* ... */ }

// v2 — type alias syntax
type ButtonModel = BasedAtomicModel & { /* ... */ }
```

The scanner looks for three files — `atoms.d.ts`, `molecules.d.ts`, and `organisms.d.ts` — inside the type definitions directory and produces a categorized registry:

```json
{
  "atoms": ["ButtonModel", "ImageModel"],
  "molecules": ["SearchBarModel"],
  "organisms": ["HeaderModel", "ProductCardModel"]
}
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-td, --type-directory <dir>` | Type definitions directory (relative to `src/`) | `_types` |

## Version Differences (v1 vs v2)

When running `init` you choose between two template versions. The core Atomic Design structure is the same; the differences are in file naming and import style:

| Aspect | v1 | v2 |
|--------|----|----|
| **Component files** | `ComponentName.tsx`, `ComponentName.scss` | `index.tsx`, `index.scss` |
| **Data files** | `componentNameCamelCase.ts` | `component-name-kebab-case.ts` |
| **Type definitions** | `interface … extends BasedAtomicModel` | `type … = BasedAtomicModel & { }` |
| **Imports** | Explicit (`import { Model } from '@_types/types'`) | Implicit (auto-import / no explicit path) |

Choose **v2** for new projects. Use **v1** if your existing codebase already follows v1 conventions.

## Copilot Agent & Skills

Alloy CLI Frontend includes a **GitHub Copilot agent** that brings component generation directly into VS Code Copilot Chat. Describe what you want in natural language and the agent generates all the files for you.

### What You Get

After running `init`, the following files are added to your project's `.github/` directory:

| Category | Files | Purpose |
|----------|-------|---------|
| Agent | `alloy.agent.md` | Orchestrator that parses your request and delegates to skills |
| Generation Skills | 4 skills | Generate atoms, molecules, organisms, and pages |
| Template Skills | 8 skills | Embedded template blueprints for every file type |
| Utility Skills | 1 skill | Smart property type resolution |

> Restart VS Code (or reload the window) after running `init` to activate the agent.

### Using @alloy in Copilot Chat

Open **Copilot Chat** in VS Code and mention `@alloy` to invoke the agent:

```
@alloy Create an organism called ProductCard with title, description, image, and price.
       Include style, state, script, and a page view with data.
       Prefix: xx
```

The agent will:

1. **Parse your request** — extract component type, name, prefix, optional files, and properties
2. **Resolve property types** — infer TypeScript types from property names (e.g., `title` → `string`, `items` → `unknown[]`, `onClick` → `() => void`)
3. **Confirm the plan** — show you a summary of all files to be generated
4. **Generate files** — create every file using the correct Atomic Design conventions
5. **Populate models** — fill in the TypeScript interface with resolved properties

#### More Examples

```
@alloy Create an atom Button with label, onClick, disabled, and variant. Prefix: acme
```

```
@alloy Generate a molecule SearchBar with placeholder, onSearch, and isLoading. Include style and state. Prefix: xx
```

```
@alloy Create a page for an existing organism called HeroBanner
```

```
@alloy What files would an organism with a page view generate?
```

### Included Skills

| Skill | Description |
|-------|-------------|
| `generate-atom` | Scaffolds an atom component with all optional files |
| `generate-molecule` | Scaffolds a molecule component with all optional files |
| `generate-organism` | Scaffolds an organism component with page, template, data, and all optional files |
| `generate-page` | Creates a standalone page and template component |
| `tpl-component` | Component `.tsx` file template |
| `tpl-template` | Template wrapper `.tsx` file (works for all component types) |
| `tpl-page` | Standard page file template |
| `tpl-page-story` | Story collection page template |
| `tpl-data` | Data/props file template |
| `tpl-state` | State JSON file template |
| `tpl-style` | SCSS style file template |
| `tpl-type` | TypeScript interface/type definition template |
| `resolve-model-properties` | Resolves property names into typed TypeScript interface fields |

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Clone your fork and install dependencies:
   ```bash
   bun install
   ```
3. Run the CLI locally:
   ```bash
   bun run cli -- <command>
   ```
4. Run tests:
   ```bash
   bun run test
   ```
5. Create a feature branch, commit your changes, and open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
