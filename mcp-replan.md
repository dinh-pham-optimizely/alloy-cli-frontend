# Replanned: Multi-Agent Architecture for Alloy CLI MCP Tools

## Overview

This document replans the MCP tool integration from a single-agent model into a **multi-agent team**: one orchestrator managing five specialized sub-agents, each owning exactly one MCP tool. All original problem analysis, token reduction goals, and tool designs from the original plan remain intact. Only the agent layer changes.

---

## What Changes vs. the Original Plan

| Dimension | Original Plan | New Plan |
|---|---|---|
| Agent count | 1 (`alloy.agent.md`) | 6 (orchestrator + 5 tool agents) |
| Tool ownership | All 5 tools in one agent | One tool per agent |
| Orchestration | Inline workflow inside `alloy.agent.md` | Dedicated `00-orchestrator.md` state machine |
| Sub-agent invocation | N/A | `runSubagent` via `agent` tool |
| Fallback path | Inline in `alloy.agent.md` | Orchestrator escalates to MCP-free mode |
| Agent files location | `.github/agents/alloy.agent.md` | `.github/agents/00–05-*.md` |

The 5 tools themselves (`resolve_names`, `render_files`, `scaffold`, `model_register`, `validate`) are **unchanged**. Only how they are invoked changes.

---

## New Agent Roster

| File | Agent Name | MCP Tool | Action |
|---|---|---|---|
| `00-orchestrator.md` | `orchestrator` | _(none — delegates only)_ | Drives the state machine, enforces gates |
| `01-validator.md` | `validator` | `validate` | Pre-flight PascalCase + conflict checks |
| `02-name-resolver.md` | `name-resolver` | `resolve_names` | Computes all names and file paths |
| `03-file-renderer.md` | `file-renderer` | `render_files` | Renders template content (read-only) |
| `04-scaffolder.md` | `scaffolder` | `scaffold` | Writes single file to disk |
| `05-model-registrar.md` | `model-registrar` | `model_register` | Reads, updates, or scans registry |

---

## Orchestrator State Machine

```
INTAKE
  └─► VALIDATE
        └─► (valid) ──► RESOLVE
        └─► (invalid) ──► BLOCKED (report errors, stop)

RESOLVE
  └─► RENDER_AND_WRITE_LOOP
        └─► for each fileType:
              ├─► RENDER  (dispatch file-renderer)
              └─► WRITE   (dispatch scaffolder with rendered content)

RENDER_AND_WRITE_LOOP complete
  └─► REGISTER
        └─► DONE
```

### State Descriptions

**INTAKE** — Collect `componentName`, `type`, `projectPrefix`, `fileTypes`, `isNeedScript`, `isNeedStyle`, `force`. Confirm with user before proceeding.

**VALIDATE** — Dispatch `validator`. On failure: surface all check errors and stop. On pass: proceed.

**RESOLVE** — Dispatch `name-resolver`. Store the full `names` + `paths` JSON — every downstream agent reads from this.

**RENDER_AND_WRITE_LOOP** — Iterate over each `fileType` in the requested list:
1. Dispatch `file-renderer` → receive `template` string
2. Dispatch `scaffolder` with the `template` + the `directoryPath` and `filePath` from the `name-resolver` result
3. Confirm write before moving to next `fileType`

**REGISTER** — Dispatch `model-registrar` with `action: "update"` to register the new model in `.models.json`.

**DONE** — Print a summary of all files created and the registry update status.

**BLOCKED** — Raised when `validate` fails OR when any downstream step fails. Include the failing agent name, error detail, and a proposed fix.

---

## Inter-Agent Data Flow

```
User request
    │
    ▼
00-orchestrator
    │
    ├──[1]──► 01-validator
    │           └── validate(componentName, type)
    │           └── returns: { valid, checks }
    │
    ├──[2]──► 02-name-resolver
    │           └── resolve_names(componentName, type, projectPrefix)
    │           └── returns: { names, paths }
    │
    │  [for each fileType]:
    ├──[3a]─► 03-file-renderer
    │           └── render_files(componentName, type, projectPrefix, fileType, ...)
    │           └── returns: { template: "..." }
    │
    ├──[3b]─► 04-scaffolder
    │           └── scaffold(template, { directoryPath, filePath }, force)
    │           └── returns: { created, skipped }
    │
    └──[4]──► 05-model-registrar
                └── model_register(componentName, type, action: "update")
                └── returns: { action, model, category }
```

---

## Agent File Specifications

### `00-orchestrator.md`

```yaml
name: orchestrator
description: >
  Orchestrates full component scaffolding for Alloy CLI projects.
  Drives a validate → resolve → render+write → register pipeline by
  delegating to five specialized sub-agents. Does not call MCP tools directly.
tools: [read, agent]
agents: ['validator', 'name-resolver', 'file-renderer', 'scaffolder', 'model-registrar']
model: copilot
target: vscode
```

**Body covers**: INTAKE inputs, state machine transitions, dispatch shapes for each agent, DONE summary format, BLOCKED escalation rules.

---

### `01-validator.md`

```yaml
name: validator
description: >
  Runs pre-flight checks on a component name before any files are created.
  Calls the validate MCP tool and returns a structured pass/fail report.
tools: [validate]
model: copilot
target: vscode
```

**Checks performed** (by the `validate` tool):
- `pascalCase` — name matches `/^[A-Z][a-zA-Z0-9]*$/`
- `componentExists` — no file at the computed component path
- `typeFileExists` — `src/_types/{type}s.d.ts` exists to be appended
- `registryConflict` — `{ComponentName}Model` not already in `.models.json`

**Output shape**:
```json
{
  "status": "OK | FAIL",
  "summary": "All checks passed for ProductCard",
  "result": {
    "valid": true,
    "checks": {
      "pascalCase": { "pass": true },
      "componentExists": { "pass": true, "message": "..." },
      "typeFileExists": { "pass": true, "message": "..." },
      "registryConflict": { "pass": true, "message": "..." }
    }
  }
}
```

---

### `02-name-resolver.md`

```yaml
name: name-resolver
description: >
  Computes all derived names and file paths for a component by calling
  the resolve_names MCP tool. Returns raw JSON. Does not write files.
tools: [resolve_names]
model: copilot
target: vscode
```

**Returns**: JSON with `names` (9 derivations) and `paths` (8 file paths — `component`, `type`, `style`, `state`, `script`, `page`, `template`, `data`).

---

### `03-file-renderer.md`

```yaml
name: file-renderer
description: >
  Renders a single component file's content by calling the render_files MCP tool.
  Returns the template string. Does not write to disk.
tools: [render_files]
model: copilot
target: vscode
```

**Key rule**: One `fileType` per invocation. The content from `render_files` is returned verbatim to the orchestrator, which passes it to `scaffolder`.

---

### `04-scaffolder.md`

```yaml
name: scaffolder
description: >
  Writes a single file to disk by calling the scaffold MCP tool.
  Receives a rendered template string and a resolved target path.
  Does not generate content.
tools: [scaffold]
model: copilot
target: vscode
```

**Key rule**: Receives `template` from the orchestrator (which got it from `file-renderer`). Never generates content independently.

---

### `05-model-registrar.md`

```yaml
name: model-registrar
description: >
  Manages the .models.json registry by calling the model_register MCP tool.
  Supports read, update (post-scaffold), and scan (full rebuild) actions.
tools: [model_register]
model: copilot
target: vscode
```

**Actions**:
- `update` — called automatically by orchestrator after all files are written
- `read` — can be called independently to inspect the registry
- `scan` — full rebuild from `src/_types/` — use when registry drifts out of sync

---

## Revised `scaffold` Tool Note

The `scaffold` tool as currently implemented takes a **single file** (`template` + `directories.directoryPath` + `directories.filePath`). This is the correct design for the new agent model — the loop in the orchestrator replaces what the original plan had as an all-in-one multi-file `scaffold` tool.

The original plan's Tool 3 (`scaffold` — all files in one call) is **not needed** in the multi-agent design, because the `RENDER_AND_WRITE_LOOP` state achieves the same result iteratively.

---

## Token Flow Analysis

### Original Plan (single agent, 5 consolidated tools)
```
validate → resolve_names → scaffold (all files) = 3 tool calls
```

### New Plan (multi-agent, same tools)
```
validate → resolve_names → [render_files + scaffold] × N files → model_register
= 2 + (2 × N) + 1 calls
```

For a full organism (8 files): **2 + 16 + 1 = 19 sub-agent dispatches**

> **Trade-off**: The multi-agent model adds more dispatches per scaffold compared to the original all-in-one `scaffold` tool approach. The payoff is explicit separation of concerns, independent testability of each agent, and the ability to retry individual steps (e.g. re-render one file without re-scaffolding all). If token efficiency is the primary concern, the orchestrator can be updated to batch render all fileTypes first, then batch write — but this only reduces orchestrator overhead, not total tool calls.

### Optimization Option: Batch Render Mode

The orchestrator can optionally run **all `file-renderer` dispatches first**, collecting all templates, then **all `scaffolder` dispatches in sequence**. This separates the read phase from the write phase — useful if the user wants to review all rendered content before any files are written.

```
RESOLVE
  └─► RENDER_ALL (dispatch file-renderer for all fileTypes, collect results)
  └─► CONFIRM_WITH_USER (optional gate)
  └─► WRITE_ALL (dispatch scaffolder for each, using collected templates)
  └─► REGISTER
```

---

## Files to Create / Modify (Delta from Original Plan)

### New files (`.github/agents/`)
- `00-orchestrator.md` — state machine, delegates to all 5 sub-agents
- `01-validator.md` — wraps `validate` tool
- `02-name-resolver.md` — wraps `resolve_names` tool
- `03-file-renderer.md` — wraps `render_files` tool
- `04-scaffolder.md` — wraps `scaffold` tool
- `05-model-registrar.md` — wraps `model_register` tool

### Files removed (vs. original plan)
- `.github/agents/alloy.agent.md` — replaced by the 6 agents above

### Unchanged from original plan
All MCP server files, tool implementations, skill updates (Phase 5 of original plan), tests (Phase 6), and infrastructure (Phases 1–4) remain exactly as designed. The multi-agent change is purely in `.github/agents/`.

---

## Revised Step 13 (from Original Plan Phase 5)

The original Step 13 updated `.github/agents/alloy.agent.md` to add MCP tool awareness. That file is now replaced. The equivalent change becomes:

**New Step 13**: Create all 6 agent files in `.github/agents/`. The orchestrator's body should include:
- The full state machine
- Dispatch schemas for each sub-agent
- Fallback instructions: "If MCP tools are unavailable, describe the scaffolding intent to the user and ask them to run the CLI directly: `npx alloy-cli-frontend generate organism ProductCard --style --script`"

Steps 14–16 (skill file updates) are unchanged — they direct agents to prefer MCP tools when available, and all still apply since `file-renderer` calls `render_files` and `model-registrar` calls `model_register`.

---

## Summary of Decisions

1. **One agent per tool** — each agent has a single, testable responsibility. Debugging a failed scaffold is as simple as identifying which agent returned a non-OK status.
2. **Orchestrator owns the state machine** — all sequencing logic lives in one place, not scattered across skill files.
3. **`render_files` + `scaffold` stay separate tools** — content generation and filesystem writes remain decoupled. The orchestrator loop ties them together.
4. **Original all-in-one `scaffold` tool not needed** — the loop pattern replaces it. The existing single-file `scaffold` implementation is correct as-is.
5. **`validate` runs first, always** — the orchestrator hard-gates on the validator result before any read or write operations.
6. **Registry update runs last, always** — `model-registrar` is the final step, ensuring the registry only reflects files that were actually written.
