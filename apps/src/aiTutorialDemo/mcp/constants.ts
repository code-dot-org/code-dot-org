// Media type the MCP Apps extension (SEP-1865, spec 2026-01-26) requires for
// UI template resources. Hosts use it to decide a resource is renderable.
export const MCP_APP_MIME_TYPE = 'text/html;profile=mcp-app';

// Spec revision this host and its widgets implement. Sent back to widgets in
// the ui/initialize response so a widget could branch on protocol changes.
export const MCP_APPS_PROTOCOL_VERSION = '2026-01-26';

// Where this host places a tool's view. The MCP Apps spec deliberately
// leaves placement to the host, so this is a host-specific hint riding in
// _meta.ui: 'stage' is the main activity area (one widget at a time, and
// presenting there ends the model's turn); 'instructions' is the persistent
// strip above it.
export type WidgetSlot = 'stage' | 'instructions';

// Shape of the `_meta.ui` object on a tool definition — the spec's fields
// plus this host's `slot` placement hint.
export interface ToolUiMeta {
  resourceUri: string;
  visibility?: ('model' | 'app')[];
  slot?: WidgetSlot;
}
