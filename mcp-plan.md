# Plan: MCP Tools for Alloy CLI Frontend

## TL;DR

Build an MCP server (stdio transport) exposing 5 consolidated tools to replace the most token-expensive agent operations: name resolution, content rendering, file scaffolding, type appending, and registry management. Slim down `.github/skills/tpl-*.prompt.md` template skills to add "prefer MCP" headers and remove raw template blocks (since `render_file` handles those), while keeping property-variant instructions and behavioral rules as LLM-only fallback. Reduces a typical organism generation from ~15+ agent operations to **2-3 tool calls**.

---

## Problem Analysis

### Current Token-Burning Pain Points

1. **Type definition appending**: Agent reads entire `organisms.d.ts` to find last model, decides insertion line. `appendContentToFile()` + `updateModelRegistry()` already do this programmatically.
2. **Name transformations**: Agent mentally applies ~10 naming rules per request. Already pure functions in `lib/helpers.ts`.
3. **Template rendering**: Agent reads `.prompt.md` skill files (which contain template examples), mentally constructs output. 7 renderers in `lib/renderers.ts` already do this from `.txt` templates.
4. **File path computation**: Agent computes 8+ paths based on conventions. Already in `lib/generators.ts`.
5. **Model registry access**: Agent reads `.models.json` to look up models. Already in `lib/scanner.ts`.
6. **Multi-file orchestration**: 8+ file creates + 1 append + 1 registry update per organism. Agent burns tokens confirming each.
7. **Validation**: Agent verifies PascalCase, checks duplicates — all manually.

### Two Template Systems

| System | Files | Consumer | Purpose |
|---|---|---|---|
| CLI templates | `public/templates/*.txt` | `lib/renderers.ts` (programmatic) | Raw `${placeholder}` templates used by CLI + MCP `render_file` tool |
| Skill templates | `.github/skills/tpl-*.prompt.md` | Copilot agent (LLM) | Instructions + property-aware variants + behavioral rules for agent |

**Decision**: Keep both. The `.prompt.md` files contain logic the `.txt` files don't: property-aware generation, behavioral rules, conditional modifications. They also serve as fallback when MCP isn't available. But slim them down to reduce token cost when MCP IS available.

### Token Savings Estimate (per organism generation)
- **Current**: ~15-20 tool calls + mental computations
- **With MCP tools**: 2-3 tool calls (`resolve_names` → confirm → `scaffold`)
- **Estimated reduction**: ~80% fewer tokens

---

## Architecture

### Transport & Entry Point
- **Transport**: stdio (standard for VS Code MCP)
- **Entry point**: `mcp/index.ts` → builds to `dist/mcp/index.cjs`
- **CLI integration**: New `alloy-cli-frontend mcp` subcommand
- **Binary**: Additional `"alloy-mcp"` bin entry in `package.json`

### MCP Server Configuration (target project `.vscode/mcp.json`)
```json
{
  "servers": {
    "alloy-scaffold": {
      "command": "npx",
      "args": ["alloy-cli-frontend", "mcp"]
    }
  }
}
```

### File Organization
```
mcp/
  index.ts                    # Server setup, stdio transport, tool registration
  tools/
    resolve-names.ts          # Tool 1: name + path computation
    render-file.ts            # Tool 2: template rendering
    scaffold.ts               # Tool 3: full file scaffolding
    registry.ts               # Tool 4: model registry management
    validate.ts               # Tool 5: pre-flight validation
```

---

## Tools Design (5 Consolidated Tools)

### Tool 1: `resolve_names` (Read-only)

**Purpose**: Compute ALL derived names and file paths in one call.

**Inputs (zod schema)**:
- `componentName` (z.string()) — PascalCase name, required
- `type` (z.enum(['a','m','o'])) — component type, required
- `projectPrefix` (z.string()) — CSS prefix, required
- `directories` (z.object(), optional):
  - `component` (z.string()) — default: `{typeFullText}` (e.g., "organisms")
  - `type` (z.string()) — default: `"_types"`
  - `page` (z.string()) — default: `"pages"`
  - `template` (z.string()) — default: `"templates"`
  - `data` (z.string()) — default: `"_data"`
  - `script` (z.string()) — default: `"assets/scripts"`

**Returns**: JSON with `names` (9 derivations) and `paths` (8 file paths)

**Sample Return** (for `componentName: "ProductCard"`, `type: "o"`, `projectPrefix: "xx"`):
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "names": {
          "componentName": "ProductCard",
          "modelName": "ProductCardModel",
          "kebabCase": "product-card",
          "camelCase": "productCard",
          "templateName": "ProductCardTemplate",
          "dataName": "productCardData",
          "pageName": "ProductCardPage",
          "capCase": "Product Card",
          "cssClass": "xx-o-product-card"
        },
        "paths": {
          "component": "src/organisms/product-card/ProductCard.tsx",
          "type": "src/_types/organisms.d.ts",
          "style": "src/organisms/product-card/ProductCard.scss",
          "state": "src/organisms/product-card/ProductCard.states.json",
          "script": "src/assets/scripts/product-card.entry.ts",
          "page": "src/pages/ProductCardPage.tsx",
          "template": "src/templates/product-card/ProductCardTemplate.tsx",
          "data": "src/_data/productCard.ts"
        }
      }
    }
  ]
}
```

**Implementation**: Call `getComponentModelName()`, `getComponentAsKebabCase()`, `getComponentAsCamelCase()`, `getComponentTemplateName()`, `getComponentDataName()`, `getComponentPageName()`, `getComponentAsCapCaseWithSpacing()` from `lib/helpers.ts`. Compose paths using `path.join('src', dir, kebab, fileName)`.

---

### Tool 2: `render_file` (Read-only)

**Purpose**: Return ready-to-write file content from templates.

**Inputs (zod schema)**:
- `componentName` (z.string()) — required
- `fileType` (z.enum(['component','template','page','page-story','data','type','style','state'])) — required
- `type` (z.enum(['a','m','o'])) — required for component/style/state/type
- `projectPrefix` (z.string()) — required for component/style/state
- `isNeedScript` (z.boolean()) — for component only, default false
- `isNeedStyle` (z.boolean()) — for component only, default false

**Returns**: Text content of the rendered file.

**Sample Return** (for `componentName: "ProductCard"`, `fileType: "component"`, `type: "o"`, `projectPrefix: "xx"`, `isNeedScript: true`, `isNeedStyle: true`):
```json
{
  "content": [
    {
      "type": "text",
      "text": "import RequireJs from '@helpers/RequireJs';\nimport RequireCss from '@helpers/RequireCss';\nimport { ProductCardModel } from '@_types/types';\nimport { getModifiers } from '@helpers/functions';\n\nconst ProductCard = (model: ProductCardModel) => {\n  const styleModifier = getModifiers(model, 'xx-o-product-card');\n\n  return (\n    <div className={styleModifier}>\n\n      <RequireJs path={'product-card'} defer />\n      <RequireCss path={'b-product-card'} />\n    </div>\n  );\n}\n\nexport default ProductCard;\n"
    }
  ]
}
```

**Sample Return** (for `componentName: "ProductCard"`, `fileType: "type"`, `type: "o"`):
```json
{
  "content": [
    {
      "type": "text",
      "text": "interface ProductCardModel extends BasedAtomicModel {\n}\n"
    }
  ]
}
```

**Sample Return — Error** (missing required `projectPrefix` for `fileType: "style"`):
```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: projectPrefix is required for fileType 'style'"
    }
  ],
  "isError": true
}
```

**Implementation**: Route by `fileType` to the matching renderer in `lib/renderers.ts`:
- `component` → `renderComponentContent()`
- `template` → `renderTemplateComponent()`
- `page` → `renderPageComponent({ isUsingPageStoryTemplate: false })`
- `page-story` → `renderPageComponent({ isUsingPageStoryTemplate: true })`
- `data` → `renderComponentData()`
- `type` → `renderComponentType()`
- `style` → `renderComponentStyle()`
- `state` → `renderComponentState()`

---

### Tool 3: `scaffold` (Write)

**Purpose**: Full component scaffolding in one call. Creates all requested files, appends type, updates registry.

**Inputs (zod schema)**:
- `componentName` (z.string()) — required
- `type` (z.enum(['a','m','o'])) — required
- `projectPrefix` (z.string()) — required
- `files` (z.object()) — required:
  - `style` (z.boolean(), default false)
  - `script` (z.boolean(), default false)
  - `state` (z.boolean(), default false)
  - `page` (z.boolean(), default false)
  - `pageStory` (z.boolean(), default false) — only when page=true
  - `data` (z.boolean(), default false)
- `directories` (z.object(), optional) — same as resolve_names
- `force` (z.boolean(), optional, default false) — overwrite existing files

**Returns**: JSON `{ created: [{path, action, fileType}], registry: {action, model, category}, skipped: [{path, reason}] }`

**Sample Return** (for `componentName: "ProductCard"`, `type: "o"`, `projectPrefix: "xx"`, `files: { style: true, script: true, state: true, page: true, pageStory: true, data: true }`):
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "created": [
          { "path": "src/_types/organisms.d.ts", "action": "appended", "fileType": "type" },
          { "path": "src/organisms/product-card/ProductCard.states.json", "action": "created", "fileType": "state" },
          { "path": "src/organisms/product-card/ProductCard.scss", "action": "created", "fileType": "style" },
          { "path": "src/assets/scripts/product-card.entry.ts", "action": "created", "fileType": "script" },
          { "path": "src/pages/ProductCardPage.tsx", "action": "created", "fileType": "page" },
          { "path": "src/templates/product-card/ProductCardTemplate.tsx", "action": "created", "fileType": "template" },
          { "path": "src/_data/productCard.ts", "action": "created", "fileType": "data" },
          { "path": "src/organisms/product-card/ProductCard.tsx", "action": "created", "fileType": "component" }
        ],
        "registry": {
          "action": "updated",
          "model": "ProductCardModel",
          "category": "organisms"
        },
        "skipped": []
      }
    }
  ]
}
```

**Sample Return — Partial skip** (component already exists, `force: false`):
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "created": [
          { "path": "src/_types/organisms.d.ts", "action": "appended", "fileType": "type" },
          { "path": "src/organisms/product-card/ProductCard.scss", "action": "created", "fileType": "style" }
        ],
        "registry": {
          "action": "updated",
          "model": "ProductCardModel",
          "category": "organisms"
        },
        "skipped": [
          { "path": "src/organisms/product-card/ProductCard.tsx", "reason": "file already exists" },
          { "path": "src/organisms/product-card/ProductCard.states.json", "reason": "file already exists" }
        ]
      }
    }
  ]
}
```

**Implementation**: Orchestrate generators in correct order (matching `lib/commands.ts`):
1. `generateComponentType()` — append to `{type}s.d.ts`
2. `generateComponentState()` — if `files.state`
3. `generateComponentStyle()` — if `files.style`
4. `generateComponentScript()` — if `files.script`
5. `generatePageComponent()` — if `files.page`
6. `generateTemplateComponent()` — if `files.page` (auto-created with page)
7. `generateComponentData()` — if `files.data`
8. `generateComponent()` — always last (depends on knowing imports)

Capture results: track which files were created vs skipped (already exist).

---

### Tool 4: `registry` (Read/Write)

**Purpose**: Manage `.models.json` without agent reading/parsing.

**Inputs (zod schema)**:
- `action` (z.enum(['read','update','scan'])) — required
- `componentName` (z.string()) — required for `update`
- `type` (z.enum(['a','m','o'])) — required for `update`
- `typeDirectory` (z.string(), default '_types') — for `scan`

**Returns**: JSON registry object `{ atoms: [...], molecules: [...], organisms: [...] }`

**Sample Return — `read`**:
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "atoms": ["ButtonModel", "ImageModel", "IconModel"],
        "molecules": ["SearchBarModel", "FormFieldModel"],
        "organisms": ["HeaderModel", "ProductCardModel"]
      }
    }
  ]
}
```

**Sample Return — `update`** (for `componentName: "Footer"`, `type: "o"`):
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "action": "added",
        "model": "FooterModel",
        "category": "organisms",
        "registry": {
          "atoms": ["ButtonModel", "ImageModel", "IconModel"],
          "molecules": ["SearchBarModel", "FormFieldModel"],
          "organisms": ["HeaderModel", "ProductCardModel", "FooterModel"]
        }
      }
    }
  ]
}
```

**Sample Return — `update` duplicate** (model already exists):
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "action": "skipped",
        "model": "ProductCardModel",
        "category": "organisms",
        "reason": "model already exists in registry",
        "registry": {
          "atoms": ["ButtonModel", "ImageModel", "IconModel"],
          "molecules": ["SearchBarModel", "FormFieldModel"],
          "organisms": ["HeaderModel", "ProductCardModel"]
        }
      }
    }
  ]
}
```

**Sample Return — `scan`** (rescans type files):
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "action": "scanned",
        "counts": { "atoms": 3, "molecules": 2, "organisms": 2, "total": 7 },
        "registry": {
          "atoms": ["ButtonModel", "ImageModel", "IconModel"],
          "molecules": ["SearchBarModel", "FormFieldModel"],
          "organisms": ["HeaderModel", "ProductCardModel"]
        }
      }
    }
  ]
}
```

**Implementation**:
- `read` → `readModelRegistry(process.cwd())`
- `update` → `updateModelRegistry(process.cwd(), componentName, type)` then return updated registry
- `scan` → `scanModels(typesDir)` + `writeModelRegistry()` then return registry with counts

---

### Tool 5: `validate` (Read-only)

**Purpose**: Pre-flight checks before scaffolding.

**Inputs (zod schema)**:
- `componentName` (z.string()) — required
- `type` (z.enum(['a','m','o'])) — required
- `directories` (z.object(), optional)

**Returns**: JSON `{ valid: boolean, checks: { pascalCase, componentExists, typeFileExists, registryConflict } }`

**Sample Return — All checks pass** (for `componentName: "ProductCard"`, `type: "o"`):
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "valid": true,
        "checks": {
          "pascalCase": { "pass": true },
          "componentExists": { "pass": true, "message": "No existing component at src/organisms/product-card/ProductCard.tsx" },
          "typeFileExists": { "pass": true, "message": "organisms.d.ts exists, type will be appended" },
          "registryConflict": { "pass": true, "message": "ProductCardModel not found in registry" }
        }
      }
    }
  ]
}
```

**Sample Return — Validation failures** (for `componentName: "product-card"`, `type: "o"`):
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "valid": false,
        "checks": {
          "pascalCase": { "pass": false, "message": "Name must be PascalCase (e.g., ProductCard). Got: product-card" },
          "componentExists": { "pass": true, "message": "No existing component found" },
          "typeFileExists": { "pass": true, "message": "organisms.d.ts exists, type will be appended" },
          "registryConflict": { "pass": true, "message": "Not checked (invalid name)" }
        }
      }
    }
  ]
}
```

**Sample Return — Component already exists** (for `componentName: "Header"`, `type: "o"`):
```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "valid": false,
        "checks": {
          "pascalCase": { "pass": true },
          "componentExists": { "pass": false, "message": "Component already exists at src/organisms/header/Header.tsx" },
          "typeFileExists": { "pass": true, "message": "organisms.d.ts exists, type will be appended" },
          "registryConflict": { "pass": false, "message": "HeaderModel already exists in organisms registry" }
        }
      }
    }
  ]
}
```

**Implementation**:
- `pascalCase`: test `/^[A-Z][a-zA-Z0-9]*$/`
- `componentExists`: `fs.existsSync()` on computed component directory + file
- `typeFileExists`: `fs.existsSync()` on `src/_types/{type}s.d.ts`
- `registryConflict`: `readModelRegistry()` → check if `{ComponentName}Model` already in category

---

## Steps

### Phase 1: MCP Server Foundation

**Step 1**: Update `mcp/index.ts`
- Import `McpServer` and `StdioServerTransport` from `@modelcontextprotocol/server`
- Create server instance with name `"alloy-scaffold"`, version from `package.json`
- Register all 5 tools using `server.tool(name, description, zodSchema, handler)`
- Call `server.connect(transport)` at the end
- Add shebang `#!/usr/bin/env node` for direct execution

**Step 2**: Update `tsup.config.ts` (*parallel with step 3*)
- Change `entry` from `['index.ts']` to `['index.ts', 'mcp/index.ts']`
- Verify `format: ['cjs']` still works for both entries
- Output: `dist/index.cjs` (CLI) + `dist/mcp/index.cjs` (MCP server)

**Step 3**: Update `package.json` (*parallel with step 2*)
- Add bin: `"alloy-mcp": "./dist/mcp/index.cjs"`
- Add dependency: `"zod": "^3.23.0"` (required by `@modelcontextprotocol/server` for tool schemas)
- Run `bun install`

**Step 4**: Add `mcp` subcommand to `index.ts` (*depends on step 1*)
- Add `program.command('mcp').description('Start MCP stdio server for IDE integration').action(async () => { await import('./mcp/index'); })`
- This allows `npx alloy-cli-frontend mcp` to start the server

### Phase 2: Read-Only Tools

**Step 5**: Implement `resolve_names` in `mcp/tools/resolve-names.ts`
- Import name helpers from `../../lib/helpers`
- Define zod input schema with `componentName`, `type`, `projectPrefix`, optional `directories`
- Compute all 9 name derivations using helper functions
- Compute all 8 file paths using `path.join('src', ...)` with directory defaults
- Return JSON with `names` and `paths` objects
- Export the tool handler function

**Step 6**: Implement `render_file` in `mcp/tools/render-file.ts` (*parallel with step 5*)
- Import all 7 renderers from `../../lib/renderers`
- Define zod schema with `fileType` enum routing
- Switch on `fileType` → call matching renderer
- Return rendered text content
- Handle errors: wrap in try/catch, return `isError: true` with message

**Step 7**: Implement `validate` in `mcp/tools/validate.ts` (*parallel with step 5*)
- Import `readModelRegistry` from `../../lib/scanner`
- Import name helpers for path computation
- PascalCase regex check
- `fs.existsSync()` for component file and type file
- Registry duplicate check
- Return structured checks object

### Phase 3: Write Tools

**Step 8**: Implement `scaffold` in `mcp/tools/scaffold.ts` (*depends on steps 5, 6*)
- Import all 8 generators from `../../lib/generators`
- Define comprehensive zod schema with `files` and `directories` objects
- Orchestrate in correct order: type → state → style → script → page → template → data → component
- Track results: capture `created` and `skipped` arrays
- Wrap each generator call: check if file exists before calling (unless `force`)
- Return structured result JSON

**Step 9**: Implement `registry` in `mcp/tools/registry.ts` (*parallel with step 8*)
- Import scanner functions from `../../lib/scanner`
- Three-branch switch on `action`
- `read`: return `readModelRegistry(process.cwd())`
- `update`: call `updateModelRegistry()`, return updated registry
- `scan`: resolve `typesDir` from `process.cwd()` + `src` + `typeDirectory`, call `scanModels()` + `writeModelRegistry()`, return registry with count summary

### Phase 4: Integration

**Step 10**: Wire tools into MCP server in `mcp/index.ts`
- Import all 5 tool handlers from `mcp/tools/`
- Register each with `server.tool()`:
  - `server.tool("resolve_names", "Compute all derived names and file paths for a component", resolveNamesSchema, resolveNamesHandler)`
  - `server.tool("render_file", "Render a component file from templates", renderFileSchema, renderFileHandler)`
  - `server.tool("scaffold", "Scaffold a complete component with all requested files", scaffoldSchema, scaffoldHandler)`
  - `server.tool("registry", "Read, update, or scan the model registry", registrySchema, registryHandler)`
  - `server.tool("validate", "Pre-flight validation before scaffolding", validateSchema, validateHandler)`

**Step 11**: Update `init` command in `lib/init.ts` (*depends on step 10*)
- Add new category `"MCP Configuration"` to the `categories[]` array
- This category copies `mcp-config.json` → `.vscode/mcp.json` in the target project
- Follow existing pattern: check if file exists, ask to overwrite if `--force` not set

**Step 12**: Create MCP config template (*parallel with step 11*)
- Create `public/templates/mcp-config.json`:
  ```json
  {
    "servers": {
      "alloy-scaffold": {
        "command": "npx",
        "args": ["alloy-cli-frontend", "mcp"]
      }
    }
  }
  ```

### Phase 5: Skill & Agent Updates

**Step 13**: Update `.github/agents/alloy.agent.md`
- Add new section `## MCP Tools (Preferred)` after `## Your Capabilities`
- List all 5 tools with one-line descriptions
- Update workflow step 4 (Confirm the plan): "After confirmation, use the `scaffold` MCP tool instead of calling individual skills"
- Update step 5 (Delegate to skill): "If MCP tools are unavailable, fall back to skill-based generation"
- Add note: "Use `resolve_names` to compute names instead of manual transformation"
- Add note: "Use `registry` tool's `read` action instead of reading `.models.json` directly"
- Add note: "Use `validate` before `scaffold` to catch conflicts early"

**Step 14**: Slim down `tpl-*.prompt.md` skill files (8 files)
- Add "## Preferred: MCP Tool" section at the top of each, telling the agent to use `render_file` with the appropriate `fileType`:
  - `tpl-component.prompt.md`: `render_file` with `fileType: "component"`
  - `tpl-wrapper.prompt.md`: `render_file` with `fileType: "template"`
  - `tpl-page.prompt.md`: `render_file` with `fileType: "page"`
  - `tpl-page-story.prompt.md`: `render_file` with `fileType: "page-story"`
  - `tpl-data.prompt.md`: `render_file` with `fileType: "data"`
  - `tpl-state.prompt.md`: `render_file` with `fileType: "state"`
  - `tpl-style.prompt.md`: `render_file` with `fileType: "style"`
  - `tpl-type.prompt.md`: `render_file` with `fileType: "type"`
- Keep the "With properties" sections intact (LLM-only logic)
- Keep behavioral rules (append mode, conditional imports, directory conventions)
- Remove raw template blocks that duplicate what `render_file` produces — replace with "See MCP `render_file` tool output for base template"
- Keep "Example Output" sections as reference for property-aware variants only

**Step 15**: Update generation skills (4 files) (*parallel with step 14*)
- `generate-atom.prompt.md`, `generate-molecule.prompt.md`, `generate-organism.prompt.md`, `generate-page.prompt.md`
- Add "## Preferred: MCP Scaffold" section at the top:
  - "If the `alloy-scaffold` MCP server is available, use the `scaffold` tool with `type: 'a'` (or m/o) and the appropriate `files` object. This replaces all individual file generation steps below."
  - "Use `validate` first to check for conflicts."
  - "Only follow the manual generation steps below if MCP tools are unavailable."
- Keep full manual instructions as fallback

**Step 16**: Update `resolve-model-properties.prompt.md` (*parallel with step 14*)
- In "Step 1: Read Model Registry", add:
  - "**Preferred**: Use the `registry` MCP tool with `action: 'read'` instead of reading `.models.json` directly."
- Keep the rest unchanged (property matching logic is LLM-only)

### Phase 6: Testing

**Step 17**: Add MCP tool unit tests in `__tests__/mcp-tools.test.ts`
- Test `resolve_names`:
  - Input `{ componentName: "ProductCard", type: "o", projectPrefix: "xx" }` → verify all 9 names correct
  - Verify all 8 paths correct
  - Test with custom directories
- Test `render_file`:
  - Each of 8 fileTypes → verify non-empty string returned
  - Verify component with isNeedScript/isNeedStyle adds RequireJs/RequireCss
  - Verify page-story vs page variants
- Test `validate`:
  - Valid PascalCase passes
  - Invalid name (kebab-case, camelCase) fails
  - Non-existent component returns `componentExists: pass`
- Test `registry`:
  - `read` action returns valid registry shape
  - `update` action adds model, returns updated registry
  - `scan` action scans and writes registry
- Test `scaffold`:
  - Full organism with all files → verify correct number of files created
  - Verify type file appended (not overwritten)
  - Verify registry updated
  - Test skip behavior for existing files

**Step 18**: Integration test (*depends on step 17*)
- Test flow: `validate` → `resolve_names` → `scaffold` → verify all files exist with correct content
- Test against a temp directory to avoid polluting workspace

**Step 19**: Manual E2E validation (*depends on step 18*)
- Build: `bun run build`
- Start: `node dist/mcp/index.cjs` — verify MCP handshake on stdio
- VS Code: Configure `.vscode/mcp.json`, verify 5 tools appear in Copilot tool list
- Generate organism through agent conversation — verify agent uses MCP tools

---

## Relevant Files

### Files to Modify
- `mcp/index.ts` — Full MCP server setup (stdio transport, 5 tool registrations, server start)
- `mcp/tools.ts` — Remove stub (replaced by `mcp/tools/` directory)
- `tsup.config.ts` — Add second entry point `mcp/index.ts`
- `package.json` — Add `alloy-mcp` bin, add `zod` dependency
- `index.ts` — Add `mcp` subcommand to commander
- `lib/init.ts` — Add MCP config installation category to `categories[]`
- `.github/agents/alloy.agent.md` — Add MCP tool section, update workflow to prefer MCP
- `.github/skills/tpl-component.prompt.md` — Add MCP preferred header, trim raw template
- `.github/skills/tpl-wrapper.prompt.md` — Add MCP preferred header, trim raw template
- `.github/skills/tpl-page.prompt.md` — Add MCP preferred header, trim raw template
- `.github/skills/tpl-page-story.prompt.md` — Add MCP preferred header, trim raw template
- `.github/skills/tpl-data.prompt.md` — Add MCP preferred header, trim raw template
- `.github/skills/tpl-state.prompt.md` — Add MCP preferred header, trim raw template
- `.github/skills/tpl-style.prompt.md` — Add MCP preferred header, trim raw template
- `.github/skills/tpl-type.prompt.md` — Add MCP preferred header, trim raw template
- `.github/skills/generate-atom.prompt.md` — Add MCP scaffold preferred section
- `.github/skills/generate-molecule.prompt.md` — Add MCP scaffold preferred section
- `.github/skills/generate-organism.prompt.md` — Add MCP scaffold preferred section
- `.github/skills/generate-page.prompt.md` — Add MCP scaffold preferred section
- `.github/skills/resolve-model-properties.prompt.md` — Use `registry` tool for model lookup

### Files to Create
- `mcp/tools/resolve-names.ts` — resolve_names tool implementation
- `mcp/tools/render-file.ts` — render_file tool implementation
- `mcp/tools/scaffold.ts` — scaffold tool implementation
- `mcp/tools/registry.ts` — registry tool implementation
- `mcp/tools/validate.ts` — validate tool implementation
- `public/templates/mcp-config.json` — `.vscode/mcp.json` template for target projects
- `__tests__/mcp-tools.test.ts` — Tool unit + integration tests

### Files to Remove
- `mcp/tools.ts` — replaced by `mcp/tools/` directory

### Files to Reuse (no changes)
- `lib/helpers.ts` — name transforms, file ops, template replacement
- `lib/renderers.ts` — 7 render functions
- `lib/generators.ts` — 8 generator functions
- `lib/scanner.ts` — registry CRUD + scan
- `lib/commands.ts` — orchestration order reference

---

## Verification

1. `bun test` — all existing tests pass (no regressions)
2. `bun test __tests__/mcp-tools.test.ts` — all 5 tool test suites pass
3. `bun run build` — produces `dist/index.cjs` AND `dist/mcp/index.cjs`
4. `node dist/mcp/index.cjs` — starts without errors, MCP handshake on stdio
5. VS Code: `.vscode/mcp.json` configured → 5 tools visible in Copilot agent tool list
6. E2E `resolve_names`: `ProductCard/o/xx` → all 9 names + 8 paths correct
7. E2E `render_file`: each of 8 fileTypes → content matches lib renderer output
8. E2E `scaffold`: full organism → all files created, type appended, registry updated
9. E2E `registry read` → returns parsed `.models.json` content
10. E2E `validate`: new name → valid, existing name → componentExists conflict

---

## Decisions

1. **5 consolidated tools** over 15+ granular: fewer tools = lower system prompt token cost
2. **stdio transport**: standard for VS Code MCP, no HTTP needed
3. **`mcp` subcommand + separate bin**: `npx alloy-cli-frontend mcp` or direct `alloy-mcp`
4. **Tools reuse existing lib**: zero duplication, thin wrappers around tested functions
5. **Read-only vs write separation**: read tools for planning, write tools after user approval
6. **Keep both template systems, slim `.prompt.md`**: Keep `.prompt.md` for property-aware LLM logic + fallback. Add "prefer MCP" headers. Remove raw template blocks that `render_file` handles. Property resolution stays LLM-only (not in MCP server).
7. **Tool file organization**: `mcp/tools/` directory with one file per tool — distinct concerns, scales better
8. **`scaffold` defaults to skip existing**: matches current `createFile()` behavior, optional `force` flag
9. **Scope boundary**: Property resolution via MCP excluded — requires LLM inference, belongs in agent
