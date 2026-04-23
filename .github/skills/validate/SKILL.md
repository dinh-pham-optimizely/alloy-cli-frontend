---
name: validate
description: 'Validate project structure, naming conventions, and registry consistency. Use when: user wants to check, lint, or audit the component structure for issues.'
argument-hint: 'Optionally specify --fix to auto-repair registry drift'
---

# Validate Project

Run structural validation on the project to detect naming violations, missing files, orphaned templates/pages, and registry drift.

## When to Use

- After manual file edits or renames
- When the user says "validate", "check", "lint", "audit", or "verify"
- Before a release or PR to ensure project consistency
- After deleting components to find orphaned templates/pages

## Procedure

1. Run the validate command:
   ```
   alloy-cli-frontend validate --json
   ```
2. Report any issues found, grouped by severity (errors first, then warnings)
3. If registry drift is detected, suggest running with `--fix` to re-scan

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--json` | Output structured JSON result | off |
| `--fix` | Auto-fix issues (re-scans registry) | off |
| `--type-directory <dir>` | Type definitions directory | `_types` |

## Validation Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `naming-convention` | error | Component folder not in kebab-case |
| `missing-component` | error | Component `.tsx` file missing from folder |
| `missing-style` | warning | `.scss` file missing |
| `missing-state` | warning | `.states.json` file missing |
| `orphaned-template` | warning | Template folder with no matching component |
| `orphaned-page` | warning | Page file with no matching template |
| `registry-drift` | warning | Mismatch between `.alloy-models.json` and type definitions |
| `registry-missing` | warning | `.alloy-models.json` not found |

## Output Example

```json
{
  "issues": [
    {
      "rule": "naming-convention",
      "severity": "error",
      "message": "Folder name \"ProductCard\" is not kebab-case",
      "file": "src/organisms/ProductCard"
    }
  ],
  "summary": { "errors": 1, "warnings": 0 }
}
```
