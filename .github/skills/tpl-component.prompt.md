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
      {/* rendered properties */}
    </div>
  );
}

export default ${componentName};
```

### Property Rendering Rules

When properties are provided, render them inside the `<div>` using these rules:

| Property type | Rendering | Example |
|---|---|---|
| `string` (named title/heading/name) | `<h2>{model.title}</h2>` | heading element |
| `string` (named description/content/text/subtitle/caption) | `<p>{model.description}</p>` | paragraph element |
| `string` (named label) | `<span>{model.label}</span>` | inline element |
| `string` (named url/href/src/link) | Do not render directly | used as attribute |
| `string` (other) | `<span>{model.propName}</span>` | generic inline |
| `boolean` | Conditional wrapper: `{model.isVisible && (...)}` | conditional rendering |
| `number` | `<span>{model.count}</span>` | inline element |
| `*Model` (project type) | `<ChildComponent {...model.propName} />` | render sub-component |
| `*[]` array | `{model.items?.map((item, index) => <div key={index}>{item}</div>)}` | mapped list |
| `() => void` | Do not render — used as event handler | attached to elements |

### Sub-component Import Rules

When a property type is a project `*Model` (e.g., `ImageModel`, `ButtonModel`):
- Import the corresponding component: derive the component name by removing `Model` suffix
- Import path follows Atomic Design convention: `@atoms/{kebab}/{Name}`, `@molecules/{kebab}/{Name}`, or `@organisms/{kebab}/{Name}`
- Determine the correct type directory by checking which `*.d.ts` file contains the model definition

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
