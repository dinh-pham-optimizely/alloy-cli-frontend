---
description: "Render a JSON state configuration file for a component"
---

# State Template

Generates a `.states.json` file with the component selector, button configuration, and empty states array.

## Inputs

- `componentAsCapCaseWithSpacing` — Cap Case (e.g., `Product Card`)
- `projectPrefix` — CSS prefix (e.g., `xx`)
- `type` — type abbreviation: `a`, `m`, or `o`
- `componentNameKebabCase` — kebab-case (e.g., `product-card`)

## Template

```json
{
  "name": "${componentAsCapCaseWithSpacing}",
  "selector": ".${projectPrefix}-${type}-${componentNameKebabCase}",
  "button": {
    "zIndex": 0,
    "styleModifier": ""
  },
  "states": []
}
```

## Example Output

For `ProductCard` organism, prefix `xx`:

```json
{
  "name": "Product Card",
  "selector": ".xx-o-product-card",
  "button": {
    "zIndex": 0,
    "styleModifier": ""
  },
  "states": []
}
```

## Strict Output

Output ONLY the exact JSON structure shown above with placeholders replaced. Do NOT add extra keys, states entries, comments, or any other content.

