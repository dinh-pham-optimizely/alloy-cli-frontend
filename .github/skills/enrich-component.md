---
description: "Enrich a scaffolded component TSX file with resolved model properties. Use this ONLY after the base file has been created by the renderer-scaffolder MCP tool."
---

# Enrich Component

Modifies an already-scaffolded `.tsx` component file to add property destructuring and semantic JSX for each resolved property. The base file structure (imports, `getModifiers`, `RequireJs`, `RequireCss`) is produced by the MCP tool — do not regenerate it. Only add what is missing.

> **Fallback only**: If the `renderer-scaffolder` MCP tool is unavailable, see the base template in the tool's `render_files` implementation. Reproduce it manually, then apply the enrichment rules below.

## When to apply

Only when the user's request includes property hints (e.g., "create Hero with title, description, image"). If no properties were provided, skip this skill entirely.

## Inputs

- `properties` — resolved list from `#prompt:resolve-model-properties`. Each item has `name`, `type`, `optional: true`.
- The existing scaffolded component file content (read from disk before editing).

## Enrichment Rules

### 1 — Destructure the model

Inside the component function body, add destructuring immediately after the `styleModifier` line:

```tsx
const { ${destructuredProps} } = model;
```

Where `${destructuredProps}` is the comma-separated list of all property names.

### 2 — Render each property using semantic HTML

Inside the return `<div>`, add JSX for each property following these rules:

| Property type | JSX pattern |
|---|---|
| `string` (title/heading/name) | `<h2>{propertyName}</h2>` or `<p>{propertyName}</p>` based on semantic meaning |
| `string` (label/button text) | `<span>{propertyName}</span>` |
| `string` (url/href/src) | Use as `src` or `href` attribute on the appropriate element |
| `*Model` (e.g. `ImageModel`) | `<ComponentName {...propertyName} />` — import the matching component |
| `boolean` | Conditional render: `{propertyName && <element />}` |
| `() => void` | Attach to `onClick` or appropriate event on the nearest interactive element |
| `string[]` or `*Model[]` | `.map()` with a keyed wrapper element |
| `number` | Render inline or use as attribute (`width`, `height`, etc.) based on name |

### 3 — Add component imports for project model types

For each property whose type is a project `*Model` (source: `"project"`), add the corresponding component import:

```tsx
import ComponentName from '@{typeDir}/{kebab-name}/ComponentName';
```

Insert this import after the existing `@_types/types` import. Derive the `{typeDir}` (atoms/molecules/organisms) and `{kebab-name}` from the type name.

## Example

**Resolved properties**: `title: string`, `description: string`, `image: ImageModel` (project), `ctaButton: ButtonModel` (project)

**Enriched component** for `Hero` organism, prefix `xx`:

```tsx
import RequireJs from '@helpers/RequireJs';
import RequireCss from '@helpers/RequireCss';
import { HeroModel } from '@_types/types';
import { getModifiers } from '@helpers/functions';
import Image from '@atoms/image/Image';
import Button from '@atoms/button/Button';

const Hero = (model: HeroModel) => {
  const { title, description, image, ctaButton } = model;
  const styleModifier = getModifiers(model, 'xx-o-hero');

  return (
    <div className={styleModifier}>
      <h2>{title}</h2>
      <p>{description}</p>
      <Image {...image} />
      <Button {...ctaButton} />

      <RequireJs path={'hero'} defer />
        <RequireCss path={'b-hero'} />
        </div>
        );
      }

export default Hero;
```
