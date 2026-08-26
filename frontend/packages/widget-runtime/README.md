# widget-runtime

Sandboxed widget host runtime for Author Mode (see
`frontend/docs/prototypes/author-mode.md`). Adapted from PR #74649
(`apps/src/aiTutorialDemo/mcp/*` on branch `ai-tutor-mcp-demo`).

A "widget" is a self-contained HTML document, served over the Model Context
Protocol's Apps extension (SEP-1865), rendered in a sandboxed iframe with no
network access. This package provides both ends of that: the host side that
renders one (`WidgetFrame`) and the plumbing that turns an authored widget
into an MCP server (`WidgetHostRuntime`, `createWidgetServer`).

## Exports

```ts
import {
  WidgetFrame, // React host component: <iframe sandbox="allow-scripts" srcDoc>
  WidgetHostRuntime, // connects a Client to widget MCP servers, discovers tools
  createWidgetServer, // authored WidgetDescriptor + html -> McpServer
  buildWidgetDocument, // assembles a widget document from markup/css/js
  injectWidgetChrome, // patches CSP + protocol shim into an already-complete document
  WIDGET_APP_SHIM_JS, // the in-iframe window.McpApp client, as a string
} from '@code-dot-org/widget-runtime';
```

`@code-dot-org/widget-runtime/chrome` re-exports `buildWidgetDocument`,
`injectWidgetChrome`, and `WIDGET_APP_SHIM_JS` from a React-free entry point,
for use from the Node authoring service (which wraps widget HTML at serve
time and has no reason to pull in React).

## Protocol

```
view: ui/initialize → host: hostContext → view: ui/notifications/initialized
host: ui/notifications/tool-input, ui/notifications/tool-result
view: tools/call | ui/update-model-context | ui/message | ui/notifications/size-changed
```

`WidgetFrame` speaks the host side of this over `window.postMessage`,
identifying its widget by window reference (`event.source ===
iframe.contentWindow`) rather than origin — a sandboxed `srcDoc` iframe has
an opaque origin, so there is no origin to check. `WIDGET_APP_SHIM_JS` is the
matching widget-side client, inlined into every widget document because a
sandboxed iframe cannot import modules from the host bundle.

## Widget servers

`WidgetHostRuntime.create({servers})` connects an MCP `Client` to each
`{name, create}` factory over `InMemoryTransport.createLinkedPair()`,
discovers tools from `tools/list`, reads each tool's `_meta.ui`, and
prefetches its `ui://` resource. Nothing in the runtime knows the transport
is in-memory — swapping a factory's `create()` for one that connects a
remote `StreamableHTTPClientTransport` changes nothing else.

`createWidgetServer(descriptor, html)` builds that server generically from
an authored `WidgetDescriptor` (see `src/types.ts` — re-points to
`@code-dot-org/authoring` once that package lands) and its rendered HTML.
Calling the registered tool is the render trigger; the tool handler just
echoes its arguments back as `structuredContent.input` because the widget
receives its actual data through `WidgetFrame`'s tool-input/tool-result
notifications, not through the tool result.
