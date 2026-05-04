# Alloy CLI Frontend

Alloy CLI Frontend is a command-line tool designed to generate frontend components following an **atomic design
methodology**. It
streamlines the creation of structured and reusable components (Atoms, Molecules, and Organisms) by automating the
generation of scripts, styles, states, types, and other related files.

It also ships with a **GitHub Copilot agent** (`@alloy`) and a set of skills that let you generate components directly from VS Code Copilot Chat using natural language.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
    - [Organism](#organism)
    - [Molecule](#molecule)
    - [Atom](#atom)
    - [Page](#page)
    - [Init](#init)
    - [Scan](#scan)
    - [Edit Generated files](#edit-generated-files)
- [Copilot Agent & Skills](#copilot-agent--skills)
    - [What You Get](#what-you-get)
    - [Using @alloy in Copilot Chat](#using-alloy-in-copilot-chat)
    - [Included Skills](#included-skills)
- [Options](#options)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

Ensure you have **Node.js** installed. Install Alloy CLI Frontend globally via npm:

```bash
npm install -g alloy-cli-frontend
```

or

```bash
yarn install -g alloy-cli-frontend
```

or

```bash
npx alloy-cli-frontend
```

## Usage

Before running any commands, navigate to the `src` folder of your frontend project directory.

```bash
cd src
```

Run Alloy CLI Frontend using the following syntax:

```bash
alloy-cli-frontend <command> [options]
```

Example:

```bash
alloy-cli-frontend organism
```

## Commands

### Organism

Generates an **Organism** component, optionally creating a page view, template, data file, script, style, and type
definition.

```bash
alloy-cli-frontend organism [options]
```

#### Options

Each command accepts a set of options to configure component generation:

| Option                       | Description                | Default          |
|------------------------------|----------------------------|------------------|
| `-cd, --component-directory` | Select component directory | `organisms`      |
| `-pd, --page-directory`      | Select page directory      | `pages`          |
| `-tpd, --template-directory` | Select template directory  | `templates`      |
| `-dd, --data-directory`      | Select data directory      | `_data`          |
| `-td, --type-directory`      | Select type directory      | `_types`         |
| `-sd, --script-directory`    | Select script directory    | `assets/scripts` |

### Molecule

Generates a **Molecule** component with options for script, style, and type definition.

```bash
alloy-cli-frontend molecule [options]
```

#### Options

Each command accepts a set of options to configure component generation:

| Option                       | Description                | Default          |
|------------------------------|----------------------------|------------------|
| `-cd, --component-directory` | Select component directory | `molecules`      |
| `-td, --type-directory`      | Select type directory      | `_types`         |
| `-sd, --script-directory`    | Select script directory    | `assets/scripts` |

### Atom

Generates an **Atom** component with options for script, style, and type definition.

```bash
alloy-cli-frontend atom [options]
```

#### Options

Each command accepts a set of options to configure component generation:

| Option                       | Description                | Default          |
|------------------------------|----------------------------|------------------|
| `-cd, --component-directory` | Select component directory | `atoms`          |
| `-td, --type-directory`      | Select type directory      | `_types`         |
| `-sd, --script-directory`    | Select script directory    | `assets/scripts` |

### Page

Generates a **Page** with options to add a story template and a new template component.

```bash
alloy page [options]
```

Follow the prompts to:

1. Enter the page name in PascalCase format (e.g., `Home`).
2. Decide whether to include a story template for the page.
3. Choose whether to add a new template component or reuse an existing one.

#### Options

Each command accepts a set of options to configure component generation:

| Option                       | Description               | Default     |
|------------------------------|---------------------------|-------------|
| `-pd, --page-directory`      | Select page directory     | `pages`     |
| `-tpd, --template-directory` | Select template directory | `templates` |

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

Scans your project's type definition files (`src/_types/*.d.ts`) and generates a **model registry** (`.models.json`) at the project root. The Copilot `@alloy` agent reads this compact registry to resolve property types instantly — instead of grepping through large `.d.ts` files on every invocation.

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

The registry is also **auto-updated** every time you generate a component via the CLI, so you typically only need to run `scan` once to bootstrap from existing types.

#### Options

| Option                    | Description                   | Default  |
|---------------------------|-------------------------------|----------|
| `-td, --type-directory`   | Type definitions directory    | `_types` |

### Edit Generated Files

Allows you to modify files that will be generated by the CLI using an editor of your choice. You can select from various
file types (Page, Component, Style, etc.) and editors (VSCode, IntelliJ IDEA, etc.).

```bash
alloy-cli-frontend edit-generated-file
```

This command allows you to:

1. Select the file type to modify, such as Page, Component, Style, etc.
2. Choose an editor like VSCode, Sublime, or Notepad++.
3. Open the file in the selected editor for easy editing.

**Note:** For users who want to edit generated files, it is recommended to install this package locally. This ensures
that each project can manage its specific generated files independently, avoiding conflicts when working on multiple
projects.

## Examples

### Generate an Organism

```bash
alloy-cli-frontend organism
```

Follow the interactive prompts to:

- Add state
- Create a page view
- Use a story template
- Generate a new data file

## Project Structure

The Alloy CLI Frontend generates files like:

```
src/
  components/
    atoms/
      Button/
        Button.tsx
        Button.scss
        Button.states.json
    molecules/
      Card/
        Card.tsx
        Card.scss
        Card.states.json
    organisms/
      Header/
        Header.tsx
        Header.scss
        Header.states.json
  pages/
    HeaderPage.tsx
  templates/
    HeaderTemplate.tsx
  _data/
    Header.tsx
  _types/
    organisms.d.ts
    molecules.d.ts
    atoms.d.ts
  assets/
    scripts/
      header.entry.ts
```

## Copilot Agent & Skills

Alloy CLI Frontend includes a **multi-agent GitHub Copilot system** that brings component
scaffolding directly into VS Code Copilot Chat. Instead of running CLI commands and answering
prompts one by one, you describe what you want in natural language — a pipeline of specialized
agents and MCP tools handles validation, name resolution, file generation, registry updates,
and optional property enrichment automatically.

### Architecture

The system is split into three layers:

| Layer | Location | Responsibility |
|---|---|---|
| **Agent layer** | `.github/agents/` | Orchestration, decisions, state machine |
| **MCP tool layer** | `alloy-scaffold` MCP server | Deterministic execution (no LLM, no token cost) |
| **Enrichment skills** | `.github/skills/` | LLM-driven property population for typed interfaces |

The key principle: **agents decide, MCP tools execute.** The render+write loop runs entirely
in JavaScript inside the MCP tools — agents never loop over files.

### Setup

Run the `init` command in your project root:

```bash
npx alloy-cli-frontend init
```

This installs agent files, skill files, and workspace Copilot instructions into your project's
`.github/` directory. Restart VS Code (or reload the window) to activate.

Then start the MCP server so the tools are available to agents:

```bash
npx alloy-cli-frontend mcp
```

Existing files are skipped by default. Use `--force` to overwrite:

```bash
npx alloy-cli-frontend init --force
```

### Invoking the Orchestrator

Open **Copilot Chat** in VS Code and use `@orchestrator` (or the agent name you configured):

```text
Create an organism HeroBanner with prefix xx, including style, data, and type files. It should have properties: title, description, image, cta button. Also needs CSS and JS loaded.
```

```text
Create an atom Button with prefix xx. Include style.
```

```text
Create a molecule SearchBar with prefix xx, include style and state. Properties: placeholder, onSearch, isLoading.
```

The orchestrator accepts these inputs:

| Input | Required | Default | Description |
|---|---|---|---|
| `componentName` | ✅ | — | PascalCase name (e.g. `HeroBanner`) |
| `type` | ✅ | — | `a` (atom), `m` (molecule), `o` (organism) |
| `projectPrefix` | ✅ | — | CSS BEM prefix (e.g. `xx`) |
| `fileTypes` | ❌ | `component`, `type` | Any of: `component`, `template`, `page`, `page-story`, `data`, `type`, `style`, `state` |
| `propertyHints` | ❌ | — | Property names extracted from your message — triggers enrichment phase |
| `isNeedScript` | ❌ | `false` | Add `RequireJs` import to component file |
| `isNeedStyle` | ❌ | `false` | Add `RequireCss` import to component file |
| `force` | ❌ | `false` | Overwrite existing files |
| `directories` | ❌ | type-based defaults | Override output directories |

### Agent Pipeline

The orchestrator drives a state machine with up to 6 steps:

```text
INTAKE → VALIDATE → RESOLVE → renderer-scaffolder → REGISTER → [ENRICH] → DONE
```

| Step                    | Agent | What happens |
|-------------------------|---|---|
| **VALIDATE**            | `01-validator` | Pre-flight checks: PascalCase, no duplicate files, no registry conflicts. Blocks immediately on failure. |
| **RESOLVE**             | `02-path-resolver` | Computes all derived names (kebab, camelCase, CSS class, model name) and file paths. Shows confirmation preview. |
| **RENDERER_SCAFFOLDER** | `03-renderer-scaffolder` | Renders all templates and writes all files in a single MCP tool call. Performs self-check; retries once on transient failures. |
| **REGISTER**            | `04-model-registrar` | Adds the new component model to `.models.json` registry. |
| **ENRICH** _(optional)_ | `05-enricher` | Populates typed TypeScript properties into component, type, and data files. Runs only when property hints are provided. |

If any step fails, the orchestrator enters **BLOCKED** and reports the exact failure with a suggested fix — no further agents are dispatched.

When `RENDERER_SCAFFOLDER` returns a partial result (some files written, some failed), the orchestrator pauses and asks whether to continue to REGISTER or stop.

### MCP Tools

The `alloy-scaffold` MCP server exposes four deterministic tools. These run as pure JavaScript — no LLM inference, instant execution, zero token cost:

| Tool | Called by                | What it does                                                                         |
|---|--------------------------|--------------------------------------------------------------------------------------|
| `validate` | `01-validator`           | Checks PascalCase, file existence, type file writability, registry conflicts         |
| `resolve_paths` | `02-path-resolver`       | Computes all file paths from `componentName` + `type` + `projectPrefix`              |
| `renderer-scaffolder` | `03-renderer-scaffolder` | Renders every requested file type from templates and writes them to disk in one call |
| `model_register` | `04-model-registrar`     | Reads and updates `.models.json` with the new component model entry                  |

### Enrichment Skills

Skills in `.github/skills/` are invoked only during the optional **ENRICH** phase, when the user
provides property hints (e.g. `"title, image, cta button"`). They contain LLM instructions for
populating typed TypeScript properties into already-scaffolded files:

| Skill | Enriches |
|---|---|
| `enrich-component.prompt.md` | Adds typed props to the React component interface |
| `enrich-type.prompt.md` | Populates the TypeScript model interface with resolved property types |
| `enrich-data.prompt.md` | Fills in the data file with typed default values |
| `resolve-model-properties.prompt.md` | Resolves property names to TypeScript types using `.models.json` registry |

> **Base file generation** (component structure, SCSS skeleton, state JSON, etc.) is handled
> entirely by `renderer-scaffolder` MCP tool — not by skills. Skills only activate for
> property-aware enrichment on top of already-written files.


## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
