---
description: "Render a component TSX file from the component template"
---

# Component Template

Generates the main React component `.tsx` file for any Atomic Design component type (atom, molecule, organism).

## Inputs

- `componentName` — PascalCase (e.g., `Button`)
- `componentModelName` — `{componentName}Model` (e.g., `ButtonModel`)
- `componentNameKebabCase` — kebab-case (e.g., `button`)
- `projectPrefix` — CSS prefix (e.g., `xx`)
- `type` — type abbreviation: `a`, `m`, or `o`
- `isNeedScript` — whether to add RequireJs import and JSX
- `isNeedStyle` — whether to add RequireCss import and JSX
- `properties` — *(optional)* list of resolved properties from `#prompt:resolve-model-properties`. Each has `name`, `type`, and `optional`.

## Template

**Without properties** (default — backward compatible):

```tsx
import { ${componentModelName} } from '@_types/types';
import { getModifiers } from '@helpers/functions';

const ${componentName} = (model: ${componentModelName}) => {
  const styleModifier = getModifiers(model, '${projectPrefix}-${type}-${componentNameKebabCase}');

  return (
    <div className={styleModifier}>

    </div>
  );
}

export default ${componentName};
```

**With properties** — destructure model and render properties using semantic HTML:

```tsx
import { ${componentModelName} } from '@_types/types';
import { getModifiers } from '@helpers/functions';

const ${componentName} = (model: ${componentModelName}) => {
  const { ${destructuredProps} } = model;
  const styleModifier = getModifiers(model, '${projectPrefix}-${type}-${componentNameKebabCase}');

  return (
    <div className={styleModifier}>
    </div>
  );
}

export default ${componentName};
```

## Conditional Modifications

If `isNeedScript` is true, **prepend** this import at the top of the file:
```typescript
import RequireJs from '@helpers/RequireJs';
```
And add this JSX inside the `<div>` (before the closing `</div>`):
```tsx
      <RequireJs path={'${componentNameKebabCase}'} defer />
```

If `isNeedStyle` is true, **prepend** this import at the top (after RequireJs if present):
```typescript
import RequireCss from '@helpers/RequireCss';
```
And add this JSX inside the `<div>` (after RequireJs if present):
```tsx
      <RequireCss path={'b-${componentNameKebabCase}'} />
```

## Example Output

For `Button` atom with both script and style, prefix `xx`:

```tsx
import RequireJs from '@helpers/RequireJs';
import RequireCss from '@helpers/RequireCss';
import { ButtonModel } from '@_types/types';
import { getModifiers } from '@helpers/functions';

const Button = (model: ButtonModel) => {
  const styleModifier = getModifiers(model, 'xx-a-button');

  return (
    <div className={styleModifier}>

      <RequireJs path={'button'} defer />
      <RequireCss path={'b-button'} />
    </div>
  );
}

export default Button;
```
