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
| `tpl-wrapper` | Template wrapper `.tsx` file (works for all component types) |
| `tpl-page` | Standard page file template |
| `tpl-page-story` | Story collection page template |
| `tpl-data` | Data/props file template |
| `tpl-state` | State JSON file template |
| `tpl-style` | SCSS style file template |
| `tpl-type` | TypeScript interface/type definition template |
| `manage-dependencies` | Updates barrel exports and import statements |
| `resolve-model-properties` | Resolves property names into typed TypeScript interface fields |

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
