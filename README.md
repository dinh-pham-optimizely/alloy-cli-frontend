# Alloy CLI Frontend

Alloy CLI Frontend is a command-line tool that installs a **GitHub Copilot agent** (`@alloy`) and scans your project's type definitions to build a model registry. The Copilot agent generates frontend components following **Atomic Design** patterns directly from VS Code Copilot Chat using natural language.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
    - [Init](#init)
    - [Scan](#scan)
- [Copilot Agent & Skills](#copilot-agent--skills)
    - [What You Get](#what-you-get)
    - [Using @alloy in Copilot Chat](#using-alloy-in-copilot-chat)
    - [Included Skills](#included-skills)
- [Contributing](#contributing)
- [License](#license)

## Commands

### Init

Installs the **Copilot agent and skills** into your project. This copies the `.github/agents/` and `.github/skills/` files that power the `@alloy` Copilot Chat agent.

```bash
alloy-cli-frontend init
```

You'll be presented with an interactive checklist to select which categories to install:

- **Alloy Agent** — the `@alloy` orchestrator agent
- **Generation Skills** — atom, molecule, organism, and page generators
- **Template Skills** — blueprints for component, style, state, type, data, page, and template files
- **Utility Skills** — dependency management and model property resolution
- **Project Instructions** — project-wide Copilot context with Atomic Design conventions

Existing files are skipped by default. Use `--force` to overwrite:

```bash
alloy-cli-frontend init --force
```

### Scan

Scans your project's type definition files (`src/_types/*.d.ts`) and generates a **model registry** (`.alloy-models.json`) at the project root. The Copilot `@alloy` agent reads this compact registry to resolve property types instantly — instead of grepping through large `.d.ts` files on every invocation.

```bash
alloy-cli-frontend scan
```

The registry maps model names to their Atomic Design category:

```json
{
  "atoms": ["ButtonModel", "ImageModel"],
  "molecules": ["SearchBarModel"],
  "organisms": ["HeaderModel", "ProductCardModel"]
}
```

#### Options

| Option                    | Description                   | Default  |
|---------------------------|-------------------------------|----------|
| `-td, --type-directory`   | Type definitions directory    | `_types` |

## Copilot Agent & Skills

Alloy CLI Frontend includes a **GitHub Copilot agent** that brings component generation directly into VS Code Copilot Chat. Instead of running CLI commands and answering prompts one by one, you describe what you want in natural language and the agent generates all the files for you.

### Setup

Run the `init` command in your project root:

```bash
npx alloy-cli-frontend init
```

This installs the agent and skill files into your project's `.github/` directory. Restart VS Code (or reload the window) to activate.

### What You Get

| Category | Files | Purpose |
|----------|-------|---------|
| Agent | `alloy.agent.md` | Orchestrator that parses your request and delegates to skills |
| Generation Skills | 4 skills | Generate atoms, molecules, organisms, and pages |
| Template Skills | 8 skills | Embedded template blueprints for every file type |
| Utility Skills | 2 skills | Dependency management and smart property resolution |
| Instructions | `copilot-instructions.md` | Project-wide Atomic Design conventions for Copilot |

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

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
