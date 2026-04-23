---
description: "Render an SCSS style file with the component's CSS class selector"
---

# Style Template

Generates a `.scss` file with an empty CSS class selector following the `{prefix}-{type}-{kebab}` naming convention.

## Inputs

- `projectPrefix` — CSS prefix (e.g., `xx`)
- `type` — type abbreviation: `a`, `m`, or `o`
- `componentNameKebabCase` — kebab-case (e.g., `product-card`)

## Template

```scss
.${projectPrefix}-${type}-${componentNameKebabCase} {
}
```

## Example Output

For `ProductCard` organism, prefix `xx`:

```scss
.xx-o-product-card {
}
```
