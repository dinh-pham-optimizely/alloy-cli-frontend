---
description: "Resolve model properties from user hints by scanning project types first, then falling back to LLM inference"
---

# Resolve Model Properties

Takes property hints from the user's request and resolves them into typed properties for a component's model interface. **Project types always take priority over inferred types.**

## Inputs

- `propertyHints` — list of property names/descriptions extracted from the user's request (e.g., `["title", "description", "image", "cta button"]`)
- `componentType` — `a`, `m`, or `o`

## Resolution Process

### Step 1: Scan Project Types (PRIORITY)

Read existing type definition files to discover available model interfaces:
- `src/_types/atoms.d.ts`
- `src/_types/molecules.d.ts`
- `src/_types/organisms.d.ts`

Extract all `interface *Model extends BasedAtomicModel` definitions and their properties. Build a registry of available types.

### Step 2: Match Each Property Hint

For each property hint from the user, resolve its type using this priority order:

**Priority 1 — Exact model name match in project:**
- Hint `"image"` → look for `ImageModel` in project types → if found, use `ImageModel`
- Hint `"button"` → look for `ButtonModel` → if found, use `ButtonModel`
- Hint `"card"` → look for `CardModel` → if found, use `CardModel`

**Priority 2 — Related model match by keyword:**
- Hint `"cta button"` → extract `button` → look for `ButtonModel`
- Hint `"hero image"` → extract `image` → look for `ImageModel`
- Hint `"navigation link"` → extract `link` → look for `LinkModel`

**Priority 3 — LLM base knowledge (fallback when no project type matches):**

| Hint pattern | Inferred type | Examples |
|---|---|---|
| text/label/name/title/description/content/alt/placeholder/caption/heading/subtitle | `string` | `title`, `buttonLabel`, `altText` |
| count/index/size/width/height/order/max/min/limit/offset/zIndex/columns | `number` | `itemCount`, `maxWidth` |
| is*/has*/show*/enable*/disable*/can*/should*/visible/active/checked/open/loading/selected | `boolean` | `isVisible`, `hasIcon`, `showTitle` |
| items/list/options/tags/categories/children/slides/cards/links/features | `string[]` or matched `*Model[]` | `items`, `navLinks` |
| on*/handle* | `() => void` | `onClick`, `onSubmit`, `handleChange` |
| url/href/src/path/link/to/redirect | `string` | `imageUrl`, `href` |
| date/time/created/updated/timestamp | `string` | `createdAt`, `publishDate` |
| style/className/modifier | `string` | `customStyle`, `className` |
| data/config/settings/options (as object) | `Record<string, unknown>` | `config`, `settings` |

### Step 3: Determine Property Name

Convert the user's hint to a valid camelCase property name:
- `"title"` → `title`
- `"cta button"` → `ctaButton`
- `"hero image"` → `heroImage`
- `"is visible"` → `isVisible`
- `"background color"` → `backgroundColor`

## Output Format

For each resolved property, return:
- `name` — camelCase property name
- `type` — TypeScript type string
- `source` — `"project"` or `"inferred"`
- `optional` — always `true` (all properties use `?`)

## Example

**User request**: `"create organism Hero with title, description, image, cta button"`

**After scanning project types** (found `ImageModel` in `atoms.d.ts`, `ButtonModel` in `atoms.d.ts`):

| Hint | Property Name | Type | Source |
|---|---|---|---|
| title | `title` | `string` | inferred |
| description | `description` | `string` | inferred |
| image | `image` | `ImageModel` | project |
| cta button | `ctaButton` | `ButtonModel` | project |

## Default Values by Type

When generating data files, use these defaults:
- `string` → `''`
- `number` → `0`
- `boolean` → `false`
- `() => void` → `() => {}`
- Any `*Model` → `{}`
- Any array (`*[]`) → `[]`
- `Record<string, unknown>` → `{}`

## Important

- ALL properties must be optional (`?`) — this aligns with `BasedAtomicModel` convention
- Project types ALWAYS take priority over inferred types
- If the project type files don't exist yet, skip step 1 and use only LLM inference
- When a project type is matched, the generated type file may need to import it — check if the type is in the same file or needs a reference
- Property names must be valid TypeScript identifiers (camelCase, no spaces, no special characters)
