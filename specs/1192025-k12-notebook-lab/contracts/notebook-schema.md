# Contract: Notebook JSON Schema

The lab consumes and produces Jupyter `nbformat 4.x` documents with a small, well-defined set of extensions. This contract is what curriculum authors, importers, and the renderer all rely on; any change here must rev the contract version in `package.json`.

## Compatibility envelope

- **Read**: any valid `nbformat 4.x` notebook. Unknown metadata keys are preserved on save (lossless round-trip).
- **Write**: the lab writes `nbformat: 4, nbformat_minor: 5`.

## Required top-level shape

```json
{
  "nbformat": 4,
  "nbformat_minor": 5,
  "metadata": { ... },
  "cells": [ ... ]
}
```

## Notebook metadata extensions

All extensions are optional. Authors who do not use them get jupyter-k12-equivalent behavior.

| Key | Type | Meaning |
|---|---|---|
| `title` | `string` | Friendly display name. Falls back to the filename or "Untitled Notebook". |
| `folder` | `string` | Unix-style unit identifier, e.g. `/lessons/unit3`. Normalized to leading slash on import. Never rendered as a path string in chrome — drives the Library section grouping only. |
| `goal` | `string` or `LocalizedString` | One-line learner-facing summary; shown under the title and echoed on lesson complete. |
| `author` | `string` | Curriculum author or teacher attribution. Surfaces in the Assigned section. |
| `globals` | `Record<string, Global>` | Named substitutions. Each `Global` is `{ default: string, [locale: string]: string }`. Referenced in cells via `{{NAME}}`. |
| `cdo` | `object` | Reserved namespace for lab-internal state. **Not authored by curriculum**; written only by the lab. Currently houses `cdo.runHistory: CellRunRecord[]` for the lesson-completion derivation. |

Pass-through keys (the standard Jupyter `kernelspec`, `language_info`, plus anything else) are preserved verbatim.

### `LocalizedString`

```ts
type LocalizedString = string | { default: string; [locale: string]: string };
```

When a `LocalizedString` is a bare string, the active locale is ignored and the string is used as-is. When it is an object, the resolution chain is **active locale → `en-US` → `default` → first defined key**.

### `Global` example

```json
{
  "globals": {
    "FOOD": {
      "default": "Pizza",
      "hi-IN": "Puri",
      "ja-JP": "Sukiyaki"
    }
  }
}
```

`{{FOOD}}` is substituted in markdown source at render time and in code source at run time (after locale resolution).

## Cell shape

```json
{
  "id": "<UUIDv4>",
  "cell_type": "code | markdown | raw",
  "metadata": { ... },
  "source": ["line1\n", "line2\n"],
  "outputs": [ ... ],
  "execution_count": null
}
```

Cells without `id` are backfilled on import with a fresh UUIDv4.

### Cell metadata

| Key | Type | Meaning |
|---|---|---|
| `tags` | `string[]` | Cell-level tags. Recognized: `"video"`, `"chat"`, `"hide_code"`. Unknown tags are preserved but ignored. |
| `i18n` | `Record<string, string[]>` | Per-locale source overrides. Use only on markdown cells (using on code cells risks overwriting learner edits — the renderer surfaces a console warning). |

### Cell dispatch (canonical)

| `cell_type` | tag includes | Renderer |
|---|---|---|
| `markdown` | — | Markdown cell |
| `code` | — | Code cell |
| `code` | `hide_code` | Code cell with editor hidden, controls + outputs visible |
| `raw` | `video` | Video cell |
| `raw` | `chat` | Chat placeholder (v1 — no network call) |
| `raw` | other / none | Unsupported placeholder |

## Raw-cell payloads

Raw cells with a recognized tag carry a JSON payload in `source`.

### Video

```json
{
  "url": "https://www.youtube.com/watch?v=…",
  "controls": true,
  "autoplay": false,
  "loop": false,
  "muted": false,
  "poster": "https://example.com/poster.png"
}
```

`url` is required. Recognized hosts: `youtube.com`, `youtu.be`, `vimeo.com`. Any other URL is treated as a direct media file (`.mp4` / `.webm` etc.) and rendered with `video.js`.

### Chat (parsed but not invoked in v1)

```json
{
  "url": "https://endpoint/v1/chat/completions",
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "You are a friendly Python tutor."}
  ],
  "temperature": 0.7,
  "max_tokens": -1,
  "stream": false
}
```

In v1, the lab parses the payload, validates it, and renders a placeholder. No network call is made. This is forward-compatible with v2 chat.

## `#@param` annotations (code cells)

The renderer parses Colab-compatible parameter annotations in code cell source. Annotations live as trailing comments on assignment lines:

```python
AGE = 51              #@param
NAME = "Maya"         #@param
TEMPERATURE = 1.0     #@param {type:"slider", min:0, max:2, step:0.1, prompt:"How creative?"}
MODEL = "small"       #@param ["small", "medium", "large"]
IS_ENABLED = True     #@param {type:"boolean"}
```

Recognized fields inside the `{...}` JSON object: `type`, `min`, `max`, `step`, `prompt`. Locale overrides for `prompt` are honored via a side-table:

```python
#@param-i18n {prompt: {"hi-IN": "कितनी रचनात्मक?", "ja-JP": "どれくらい創造的に？"}}
```

On widget change, the source line is rewritten in place, preserving the trailing comment exactly. The lab MUST highlight the rewritten line in the editor for ≥ 500 ms.

## Pass-through guarantees

- The lab MUST preserve unknown notebook metadata keys on save (lossless round-trip).
- The lab MUST preserve unknown cell metadata keys on save.
- The lab MUST preserve unknown output MIME types in `execute_result.data` even when it cannot render them (so other tools — Jupyter Lab, Colab — see them).
- The lab MUST NOT write the `cdo` namespace into exported notebook files (the share flow strips it).

## Versioning

This contract is v1.0. The lab pins to `nbformat 4` and lists supported extensions in `package.json` under `nblab.contract.version`. Adding a recognized tag or metadata key is a MINOR bump; removing or repurposing one is a MAJOR bump.
