---
description: "Render an SCSS style file with the component's CSS class selector"
version: 2
---

# Style Template (v2)

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

## Strict Output

Output ONLY the exact SCSS structure shown above with placeholders replaced. Do NOT add nested selectors, CSS properties, mixins, variables, comments, or any other content. The selector body MUST be empty.

