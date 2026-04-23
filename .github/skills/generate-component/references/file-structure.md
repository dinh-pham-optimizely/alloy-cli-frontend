# File Structure

## Directory Layout

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
  templates/{kebab-name}/          # Template wrappers
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

## Import Aliases

| Alias | Target |
|-------|--------|
| `@_types/types` | Type definitions |
| `@helpers/functions` | Helper utilities (`getModifiers`) |
| `@helpers/RequireJs` | Script loader component |
| `@helpers/RequireCss` | Style loader component |
| `@atoms/{kebab}/{Name}` | Atom components |
| `@molecules/{kebab}/{Name}` | Molecule components |
| `@organisms/{kebab}/{Name}` | Organism components |
| `@templates/{kebab}/{Name}` | Template components |
| `@data/{kebab}` | Data files |
