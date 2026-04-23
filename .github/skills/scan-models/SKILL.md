---
name: scan-models
description: 'Scan project type definitions and generate the model registry (.alloy-models.json). Use when: user wants to update, refresh, rebuild, or check the model registry, or after manually editing type definition files.'
argument-hint: 'Optionally specify a custom type directory'
---

# Scan Models

Scan the project's `src/_types/*.d.ts` files to discover all model interfaces that extend `BasedAtomicModel`, then write the model registry (`.alloy-models.json`) to the project root.

## When to Use

- After manually adding/editing type definitions in `src/_types/`
- When `.alloy-models.json` is missing or out of date
- Before generating components that reference existing models
- When the user says "scan", "refresh models", "update registry"

## Procedure

1. Run the scan command:
   ```
   alloy-cli-frontend scan --json
   ```
   Or use the [scan script](./scripts/scan.js):
   ```
   node .github/skills/scan-models/scripts/scan.js
   ```
2. Report the discovered models by category (atoms, molecules, organisms)
3. Confirm that `.alloy-models.json` was written

## Output

```json
{
  "atoms": ["ButtonModel", "ImageModel"],
  "molecules": ["SearchBarModel"],
  "organisms": ["HeaderModel", "ProductCardModel"]
}
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--type-directory <dir>` | Custom type definitions directory | `_types` |
