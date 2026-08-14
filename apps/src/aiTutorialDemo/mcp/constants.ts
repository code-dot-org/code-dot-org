// Media type the MCP Apps extension (SEP-1865, spec 2026-01-26) requires for
// UI template resources. Hosts use it to decide a resource is renderable.
export const MCP_APP_MIME_TYPE = 'text/html;profile=mcp-app';

// Spec revision this host and its widgets implement. Sent back to widgets in
// the ui/initialize response so a widget could branch on protocol changes.
export const MCP_APPS_PROTOCOL_VERSION = '2026-01-26';

// Shape of the `_meta.ui` object on a tool definition, per the extension.
export interface ToolUiMeta {
  resourceUri: string;
  visibility?: ('model' | 'app')[];
}
