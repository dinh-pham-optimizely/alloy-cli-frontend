---
description: "Render a template wrapper component with explicit type import"
version: 2
---

# Template Wrapper Component (v2)

Generates a template wrapper `.tsx` file. This is the **v1** version with explicit type import.

## Inputs

- `componentName` — PascalCase (e.g., `ProductCard`)
- `componentModelName` — `{componentName}Model` (e.g., `ProductCardModel`)
- `componentNameKebabCase` — kebab-case (e.g., `product-card`)
- `componentTemplateName` — `{componentName}Template` (e.g., `ProductCardTemplate`)
- `componentTypePlural` — the plural type directory: `atoms`, `molecules`, or `organisms`

## Template

```tsx
import ${componentName} from '@${componentTypePlural}/${componentNameKebabCase}';

interface Props {
  ${camelCase}?: ${componentModelName};
}

export const ${componentTemplateName} = (model: Props) => {
  const { ${camelCase} } = model;

  return (
    <>
      <main>
        <${componentName} {...${camelCase}} />
      </main>
    </>
  );
}

export default ${componentTemplateName};
```

## Important

The import path for the component MUST match the component's type:
- Atoms: `@atoms/{kebab-name}`
- Molecules: `@molecules/{kebab-name}`
- Organisms: `@organisms/{kebab-name}`

## Example Output

For `Button` atom:

```tsx
import Button from '@atoms/button';

interface Props {
  button?: ButtonModel;
}

export const ButtonTemplate = (model: Props) => {
  const { button } = model;

  return (
    <>
      <main>
        <Button {...button} />
      </main>
    </>
  );
}

export default ButtonTemplate;
```

## Strict Output

Output ONLY the exact structure shown above with placeholders replaced. Do NOT add extra imports, JSX elements, hooks, comments, or any other code.

