---
name: resolve-model-properties
description: 'Resolve model properties from user hints by scanning the project model registry first, then falling back to LLM inference. Use when: user mentions properties, fields, or attributes for a component (e.g., "with title, image, and cta button").'
user-invocable: false
---

# Resolve Model Properties

Takes property hints from the user's request and resolves them into typed properties for a component's model interface. **Project types always take priority over inferred types.**

## Inputs

- `propertyHints` — list of property names/descriptions extracted from the user's request (e.g., `["title", "description", "image", "cta button"]`)
- `componentType` — `a`, `m`, or `o`

## Resolution Process

### Step 1: Read Model Registry (PRIORITY)

Read `.alloy-models.json` from the project root. The registry uses a two-tier format:

```json
{
  "index": {
    "atoms": ["ButtonModel", "ImageModel"],
    "molecules": ["SearchBarModel"],
    "organisms": ["HeaderModel"]
  },
  "details": {
    "ButtonModel": { "label": "string", "onClick": "() => void" },
    "ImageModel": { "src": "string", "alt": "string" }
  }
}
```

Read only the `index` key for model name matching. Use `details` when you need to show property schemas to the user.

If `.alloy-models.json` does not exist, skip project type matching and suggest running `alloy-cli-frontend scan`.

### Step 2: Match Each Property Hint

**Priority 1 — Exact model name match:**
- Hint `"image"` → `ImageModel` in registry → use `ImageModel`
- Hint `"button"` → `ButtonModel` in registry → use `ButtonModel`

**Priority 2 — Keyword match:**
- Hint `"cta button"` → extract `button` → `ButtonModel`
- Hint `"hero image"` → extract `image` → `ImageModel`

**Priority 3 — LLM inference (fallback):**

| Pattern | Type |
|---|---|
| text/label/name/title/description/content/alt/placeholder/caption/heading/subtitle | `string` |
| count/index/size/width/height/order/max/min/limit/offset/zIndex/columns | `number` |
| is*/has*/show*/enable*/disable*/can*/should*/visible/active/checked/open/loading/selected | `boolean` |
| items/list/options/tags/categories/children/slides/cards/links/features | `string[]` or `*Model[]` |
| on*/handle* | `() => void` |
| url/href/src/path/link/to/redirect | `string` |
| style/className/modifier | `string` |
| data/config/settings/options (as object) | `Record<string, unknown>` |

### Step 3: Determine Property Name

Convert hints to camelCase: `"cta button"` → `ctaButton`, `"hero image"` → `heroImage`

## Output Format

For each resolved property: `name` (camelCase), `type` (TypeScript type), `source` (`"project"` or `"inferred"`), `optional` (always `true`).

Format as `--properties` flag for the generate command:
```
--properties "title:string, image:ImageModel, onClick:() => void"
```

## Important

- ALL properties must be optional (`?`) — aligns with `BasedAtomicModel` convention
- Project types ALWAYS take priority over inferred types
- Property names must be valid TypeScript identifiers
