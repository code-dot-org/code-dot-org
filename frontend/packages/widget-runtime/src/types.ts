// Media type the MCP Apps extension (SEP-1865, spec 2026-01-26) requires for
// UI template resources. Hosts use it to decide a resource is renderable.
export const MCP_APP_MIME_TYPE = 'text/html;profile=mcp-app';

// Spec revision this host and its widgets implement. Sent back to widgets in
// the ui/initialize response so a widget could branch on protocol changes.
export const MCP_APPS_PROTOCOL_VERSION = '2026-01-26';

// JSON-RPC methods on the postMessage wire between host and widget iframe.
export const UI_INITIALIZE = 'ui/initialize';
export const UI_NOTIFICATIONS_INITIALIZED = 'ui/notifications/initialized';
export const UI_NOTIFICATIONS_TOOL_INPUT = 'ui/notifications/tool-input';
export const UI_NOTIFICATIONS_TOOL_RESULT = 'ui/notifications/tool-result';
export const UI_NOTIFICATIONS_SIZE_CHANGED = 'ui/notifications/size-changed';
export const UI_NOTIFICATIONS_HOST_CONTEXT_CHANGED =
  'ui/notifications/host-context-changed';
export const UI_UPDATE_MODEL_CONTEXT = 'ui/update-model-context';
export const UI_MESSAGE = 'ui/message';
export const TOOLS_CALL = 'tools/call';
export const PING = 'ping';

// Where this host places a tool's view. The MCP Apps spec deliberately
// leaves placement to the host, so this is host-defined: unlike the demo
// this was adapted from (a 'stage' | 'instructions' union), a widget-runtime
// consumer picks its own slot vocabulary.
export type WidgetSlot = string;

// Shape of the `_meta.ui` object on a tool definition — the spec's fields
// plus a host-specific `slot` placement hint.
export interface ToolUiMeta {
  resourceUri: string;
  visibility?: ('model' | 'app')[];
  slot?: WidgetSlot;
}

// One tool as the host sees it after discovery: everything here came off the
// wire from tools/list, not from host-side knowledge of the servers.
export interface DiscoveredTool {
  serverName: string;
  name: string;
  description?: string;
  inputSchema: unknown;
  uiResourceUri?: string;
  slot?: WidgetSlot;
  // Per the MCP Apps spec: 'model' means offered to the model, 'app' means
  // callable from the tool's own view. Omitted on the wire means both.
  visibility: ('model' | 'app')[];
}

export interface ModelContextUpdate {
  content?: unknown;
  structuredContent?: unknown;
}

// One JSON-RPC 2.0 message on the postMessage wire. Kept loose on purpose:
// the iframe content is untrusted, so every field is checked before use.
export interface JsonRpcMessage {
  jsonrpc?: string;
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: {code: number; message: string};
}

// Canonical descriptor lives with the authoring domain model; the runtime
// consumes it (an authored widget IS data first, runtime behavior second).
export type {WidgetDescriptor} from '@code-dot-org/authoring';
