---
description: "Render a template wrapper component with explicit type import"
version: 1
---

# Template Wrapper Component (v1)

Generates a template wrapper `.tsx` file. This is the **v1** version with explicit type import.

## Inputs

- `componentName` — PascalCase (e.g., `ProductCard`)
- `componentModelName` — `{componentName}Model` (e.g., `ProductCardModel`)
- `componentNameKebabCase` — kebab-case (e.g., `product-card`)
- `componentTemplateName` — `{componentName}Template` (e.g., `ProductCardTemplate`)
- `componentDataName` — `{camelCase}Data` (e.g., `productCardData`)
- `componentTypePlural` — the plural type directory: `atoms`, `molecules`, or `organisms`

## Template

```tsx
import { ${componentModelName} } from '@_types/types';
import ${componentName} from '@${componentTypePlural}/${componentNameKebabCase}/${componentName}';

interface Props {
  ${componentDataName}?: ${componentModelName};
}

export const ${componentTemplateName} = (model: Props) => {
  const { ${componentDataName} } = model;

  return (
    <>
      <main>
        <${componentName} {...${componentDataName}} />
      </main>
    </>
  );
}

export default ${componentTemplateName};
```

## Important

The import path for the component MUST match the component's type:
- Atoms: `@atoms/{kebab-name}/{ComponentName}`
- Molecules: `@molecules/{kebab-name}/{ComponentName}`
- Organisms: `@organisms/{kebab-name}/{ComponentName}`

## Example Output

For `Button` atom:

```tsx
import { ButtonModel } from '@_types/types';
import Button from '@atoms/button/Button';

interface Props {
  buttonData?: ButtonModel;
}

export const ButtonTemplate = (model: Props) => {
  const { buttonData } = model;

  return (
    <>
      <main>
        <Button {...buttonData} />
      </main>
    </>
  );
}

export default ButtonTemplate;
```

## Strict Output

Output ONLY the exact structure shown above with placeholders replaced. Do NOT add extra imports, JSX elements, hooks, comments, or any other code.

