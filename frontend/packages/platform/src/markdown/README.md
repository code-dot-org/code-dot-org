# Markdown

Renders a markdown string as sanitized HTML mapped onto design-system
components. Safe to use on untrusted input: output passes through a
`rehype-sanitize` allowlist before it reaches React.

```tsx
import {Markdown} from '@code-dot-org/platform/markdown';

<Markdown content="# Hello\n\nSome **bold** text." />
// or, equivalently, as a single string child:
<Markdown>{markdownString}</Markdown>
```

| Prop         | Type                  | Description                                                        |
| ------------ | --------------------- | ------------------------------------------------------------------ |
| `content`    | `string`              | Markdown source. Used instead of `children` when both are present. |
| `children`   | `string`              | Markdown source as a string child.                                 |
| `className`  | `string`              | Added to the wrapping `<div>`.                                     |
| `extensions` | `MarkdownExtension[]` | Behaviors to enable for this render. See below.                    |

Base behavior, always on: GFM (tables, strikethrough, autolinks), the
design-system mappings (`h1`–`h4`, `strong`, `em`, `a` → `Link`, `p` →
body-two `Typography`), and the localization wrappers (`data-isolate` on
paragraphs, `data-lz-url`/`data-localize` on links). Everything else is opt-in
via `extensions`.

## The pipeline

```
remark-parse            markdown text  → mdast
remark-gfm              GFM syntax
<extension remark plugins>             ← new markdown SYNTAX
remark-rehype           mdast          → hast        (allowDangerousHtml)
rehype-raw              reparse raw HTML in the source
<extension rehype plugins>             ← transform the HTML TREE
rehypeLocalize          translate block text         ← when localization is active
rehype-sanitize         enforce the allowlist        ← SECURITY BOUNDARY
rehype-react            hast           → React elements (component map)
```

Two facts follow from this ordering, and both matter when authoring an
extension:

- Extension rehype plugins run **before** sanitization, so anything they emit
  is still subject to the allowlist. A plugin cannot smuggle a tag past the
  sanitizer; it must also widen the allowlist (see `sanitizeSchema`) for its
  tags to survive.
- Sanitization is the single security boundary. If a tag or attribute is not on
  the (possibly extension-widened) allowlist, it is dropped here regardless of
  what any plugin or component map says.

## Extensions

An extension is a self-contained bundle of one feature's concerns. A consumer
enables only the extensions it wants; no use of `Markdown` pays for behaviors it
did not ask for. The contract (`extension.ts`):

```ts
interface MarkdownExtension {
  name: string; // unique; aids debugging/dedup
  remarkPlugins?: PluggableList; // new markdown syntax
  rehypePlugins?: PluggableList; // HTML-tree transforms
  sanitizeSchema?: Partial<SanitizeSchema>; // allowlist additions
  components?: Partial<Components>; // how this feature's tags render
}
```

A facet is optional; supply only the ones your feature needs. Most extensions
need just one or two.

### How the facets compose

- **`sanitizeSchema`** is _merged_ into the base schema, never replaced. Arrays
  (`tagNames`, per-tag attribute lists, `protocols`) are concatenated and
  de-duplicated; nested objects are merged recursively; scalars overwrite. So an
  extension _widens_ the allowlist for its own tags without weakening the
  baseline for everyone else.
- **`components`** are spread over the base map. Later extensions win on
  conflict, and all extensions win over the base mappings. Mapping a tag the
  base already handles (e.g. `a`) replaces that mapping — including its
  localization wrapper — so prefer introducing your own tag over overriding a
  base one.
- **`remarkPlugins` / `rehypePlugins`** are concatenated in extension order and
  spliced into the pipeline at the stages shown above.

### Authoring an extension

1. Create a module under `extensions/`, one file per extension.
2. Export a single `MarkdownExtension` value.
3. Widen `sanitizeSchema` to cover exactly the tags/attributes you introduce —
   no more.
4. Re-export it from `extensions/index.ts`.
5. Add a test asserting your feature is **absent when not enabled** and present
   when it is (the isolation guarantee).

Attribute names in `sanitizeSchema` are **hast property names**, not raw HTML
attribute names: `data-url` → `dataUrl`, `class` → `className`,
`frameborder` → `frameBorder`. When in doubt, inspect `defaultSchema` from
`rehype-sanitize` — many common attributes (`width`, `height`, ...) are already
permitted globally via its `*` entry, so you may not need to add them at all.

### Worked example: a custom element (`callout.tsx`)

The common case — a new tag plus the component that renders it. Allow the tag
and the one attribute it reads; map the tag to a component.

```tsx
const Callout = ({variant, children}: CalloutProps) => (
  <aside role="note" data-variant={variant} className={styles.callout}>
    {children}
  </aside>
);

export const callout: MarkdownExtension = {
  name: 'callout',
  sanitizeSchema: {
    tagNames: ['callout'],
    attributes: {callout: ['variant']},
  },
  // `callout` is not a known intrinsic element, so cast after building the map.
  components: {callout: Callout} as Partial<Components>,
};
```

```tsx
// Block-level elements (anything rendering to non-phrasing content like
// <aside>) must start the opening tag on its own line, or markdown parses them
// as inline HTML and wraps them in a paragraph — and <aside> can't nest in <p>.
<Markdown
  content={'<callout variant="tip">\nHeads up\n</callout>'}
  extensions={[callout]}
/>
```

For new _syntax_ (rather than a literal HTML tag), supply a `remarkPlugins`
entry instead; for tree rewrites, a `rehypePlugins` entry. The facets combine
freely within one extension.

### Configured extensions (factories)

An extension that needs configuration — typically an interaction handler — is a
**factory** that takes options and returns a `MarkdownExtension`. Call it; pass
the result to `extensions`:

```tsx
const exts = useMemo(
  () => [clickableText({onActivate: id => focusBlock(id)})],
  [],
);
<Markdown content={md} extensions={exts} />;
```

Note this interacts with memoization (below): a factory returns a fresh object
each call, so build it once (module scope or `useMemo`) rather than inline in
render. A factory called with no options degrades gracefully — `clickableText()`
renders its targets as plain bold, `expandableImages()` as inline images.

## Shipped extensions

Import from `@code-dot-org/platform/markdown` as `extensions`. Plain-object
extensions go straight into the array; factories are called first:

```ts
import {Markdown, extensions} from '@code-dot-org/platform/markdown';

const exts = [
  extensions.inlineStyles,                       // object
  extensions.embeds,                             // object
  extensions.clickableText({onActivate: handle}),// factory
];
<Markdown content={md} extensions={exts} />;
```

| Extension          | Kind    | Behavior                                                                        | Caveat                                                                                                                                                   |
| ------------------ | ------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `callout`          | object  | `<callout variant>` → styled aside                                              | Reference example.                                                                                                                                       |
| `details`          | object  | `::: details [summary] … :::` → `<details>`/`<summary>` disclosure              | Legacy syntax with flexible spacing; summary and body are markdown. Raw `<details>` HTML also works without it.                                          |
| `inlineStyles`     | object  | permits `style` + `className` on any element                                    | The sanitizer does not inspect style _contents_; inline styles are an authoring smell. Ported verbatim from legacy.                                      |
| `clickableText`    | factory | `[label](#clickable=id)` → button calling `onActivate(id)` on click/Enter/Space | Without `onActivate`, renders plain bold.                                                                                                                |
| `expandableImages` | factory | `![alt expandable](url)` → image calling `onExpand(url, alt)` on click          | Without `onExpand`, renders an inline, non-interactive image.                                                                                            |
| `visualCodeBlock`  | object  | `` `text`(#rrggbb) `` → inline code with that background color                  | Color is validated hex, applied by the component (not sanitized CSS). Plain inline code is unaffected.                                                   |
| `externalLinks`    | factory | opens links in a new tab (`target="_blank"` + `rel="noopener noreferrer"`)      | Defaults to all links (legacy `openExternalLinksInNewTab`); pass `isExternal` to scope.                                                                  |
| `embeds`           | object  | permits `<iframe>` and its attributes                                           | Enable **only** for non-student audiences; the caller owns that gating.                                                                                  |
| `blockly`          | object  | permits Blockly XML tags (`<xml>`, `<block>`, ...)                              | Clears `clobberPrefix` document-wide so `id`/`name` are not rewritten — enable only for trusted Blockly content. Renders each tag as its custom element. |

These mirror the allowlist that the legacy `apps/src/templates/SafeMarkdown.jsx`
applied unconditionally; here each is opt-in and isolated. `clickableText` and
`expandableImages` also carry the interactive behavior the legacy
`EnhancedSafeMarkdown` added on top, reimplemented declaratively as React
components rather than post-render DOM passes — and each ships the markdown
syntax that produced its HTML, as a `remarkPlugins` transformer. Because both
features reuse existing markdown (links, images), those transformers
post-process the parsed mdast (rewriting matched nodes via `data.hName` /
`hProperties` / `hChildren`) rather than extending the tokenizer; the equivalent
raw HTML (`<b data-id>`, `<span data-url>`) is accepted too.

### Native / sugar notes

- **Collapsible details.** `<details>`/`<summary>` are in the default allowlist,
  so collapsible content works by writing the raw HTML directly (keep the block
  contiguous — a blank line ends the HTML block). The legacy `::: details
[summary]` sugar — with its flexible spacing — is provided by the `details`
  extension, which rewrites it to that HTML before parsing.
- **Blockly block vs. inline (`xmlAsTopLevelBlock`).** Modern micromark already
  treats an `<xml>` whose opening tag is alone on its line as a top-level block,
  and an inline `<xml>` as paragraph content — the same distinction the legacy
  plugin existed to create. Author for the placement you want (see the `callout`
  block-level note above); enable the `blockly` extension for the tags to survive
  sanitization.

## Localization

Translation is built in and wired directly to the core localization plugin
(`@code-dot-org/core/plugins/localization`). There is **no host setup** beyond
having that plugin in play, which apps already do at bootstrap — every
`Markdown` localizes automatically and re-renders on locale change.

When LocalizeJS is loaded, `rehypeLocalize` translates block text **at build
time** and marks the paragraph `data-notranslate`. Until then — and on a host
that never loads LocalizeJS — localization is a no-op with no per-render cost,
and paragraphs carry `data-isolate` for the runtime translation path.

### Why a plugin, and what it solves

Our translation engine refuses to translate a paragraph that contains Blockly
XML (`<xml>`, `<block>`, ...) or other non-phrasing elements, and mishandles
`<code>`. `rehypeLocalize` works around this on the hast tree, before
sanitization:

1. Within each block (default `<p>`), elements the translator can't handle are
   replaced by a `<code>` placeholder carrying a stash index and stashed
   verbatim; elements it mishandles (default `<code>`) are renamed to a tag it
   accepts (default `<span>`). The translator ignores `<code>`, so the
   placeholder and its index survive untouched — the same blind spot that makes
   renaming real `<code>` necessary.
2. The block's inner HTML is serialized and handed to the injected `translate`.
3. The result is reparsed and the placeholders / renamed tags are restored —
   the stashed elements come back byte-for-byte.

The stashed and reparsed nodes still pass through sanitization, so the trust
boundary is unchanged. This replaces the legacy approach of building a detached
DOM tree from rendered React and walking it back, which was fragile.

## Notes

- **Memoization.** The processor is rebuilt when the `extensions` array
  _identity_ changes, or when localization becomes active. Define the array once
  (module scope, or `useMemo`); do not pass a fresh literal on every render.
- **Trust boundary.** This component is for rendering markdown safely. Do not
  reach around the sanitizer (e.g. by mapping a tag to a component that injects
  `dangerouslySetInnerHTML`); that defeats the one guarantee it provides.
