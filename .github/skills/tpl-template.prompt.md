---
description: "Render a template wrapper component that imports and renders a child component"
---

# Template Wrapper Component

Generates a template wrapper `.tsx` file. Templates wrap a component with layout markup and pass data props through.

## Inputs

- `componentName` — PascalCase (e.g., `ProductCard`)
- `componentModelName` — `{componentName}Model` (e.g., `ProductCardModel`)
- `componentNameKebabCase` — kebab-case (e.g., `product-card`)
- `componentTemplateName` — `{componentName}Template` (e.g., `ProductCardTemplate`)
- `componentDataName` — `{camelCase}Data` (e.g., `productCardData`)
- `componentTypePlural` — the plural type directory: `atoms`, `molecules`, or `organisms`

## Template

Generate the file with this structure. Replace `${componentTypePlural}` with the correct type directory (`atoms`, `molecules`, or `organisms`):

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