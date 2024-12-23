# Alloy CLI Frontend

Alloy CLI Frontend is a command-line tool designed to generate frontend components following an **atomic design
methodology**. It
streamlines the creation of structured and reusable components (Atoms, Molecules, and Organisms) by automating the
generation of scripts, styles, states, types, and other related files.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
    - [Organism](#organism)
    - [Molecule](#molecule)
    - [Atom](#atom)
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

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
