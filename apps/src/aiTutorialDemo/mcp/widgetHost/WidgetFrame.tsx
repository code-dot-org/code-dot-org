import React, {useEffect, useRef, useState} from 'react';

import {MCP_APPS_PROTOCOL_VERSION} from '../constants';

// One JSON-RPC 2.0 message on the postMessage wire. Kept loose on purpose:
// the iframe content is untrusted, so every field is checked before use.
interface JsonRpcMessage {
  jsonrpc?: string;
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: {code: number; message: string};
}

export interface ModelContextUpdate {
  content?: unknown;
  structuredContent?: unknown;
}

interface WidgetFrameProps {
  html: string;
  toolName: string;
  toolInput: Record<string, unknown>;
  toolResult: unknown;
  /** Widget-initiated tools/call, routed back through the MCP host. */
  onToolCall: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  /** Widget reporting student activity the model should hear about. */
  onModelContextUpdate: (update: ModelContextUpdate) => void;
  /** Widget submitting text into the chat on the student's behalf. */
  onUserMessage: (text: string) => void;
  /** Floor for the auto-height; slim strips (instructions) pass a low one. */
  minHeight?: number;
}

const DEFAULT_MIN_HEIGHT = 160;
const MAX_HEIGHT = 640;

/**
 * The host side of one MCP App view: a sandboxed iframe speaking the MCP
 * Apps postMessage protocol. Mount one instance per tool invocation (key it
 * on the call) — the handshake and tool-input/tool-result delivery happen
 * once per mounted view, matching the spec's lifecycle:
 *
 *   view: ui/initialize → host: hostContext → view: initialized
 *   host: ui/notifications/tool-input, ui/notifications/tool-result
 *   view: tools/call | ui/update-model-context | ui/message | size-changed
 *
 * sandbox="allow-scripts" without allow-same-origin gives the widget an
 * opaque origin: no cookies, no parent DOM, no studio APIs. Combined with
 * the CSP baked into the widget HTML (no network), third-party widget code
 * gets the isolation the spec intends. Production hosts add a double-iframe
 * proxy on a separate physical origin; a demo does not need one.
 */
const WidgetFrame: React.FunctionComponent<WidgetFrameProps> = ({
  html,
  toolName,
  toolInput,
  toolResult,
  onToolCall,
  onModelContextUpdate,
  onUserMessage,
  minHeight = DEFAULT_MIN_HEIGHT,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  // Callbacks and data live in refs so the message listener (bound once per
  // mounted view) always sees the latest without re-subscribing. Data also
  // has to survive prop changes: a persistent view (the instructions strip,
  // keyed stably by its parent) receives fresh tool input across calls
  // without remounting.
  const callbacksRef = useRef({
    onToolCall,
    onModelContextUpdate,
    onUserMessage,
  });
  callbacksRef.current = {onToolCall, onModelContextUpdate, onUserMessage};
  const dataRef = useRef({toolInput, toolResult});
  dataRef.current = {toolInput, toolResult};
  const initializedRef = useRef(false);

  const sendToolData = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        jsonrpc: '2.0',
        method: 'ui/notifications/tool-input',
        params: {arguments: dataRef.current.toolInput},
      },
      '*'
    );
    iframeRef.current?.contentWindow?.postMessage(
      {
        jsonrpc: '2.0',
        method: 'ui/notifications/tool-result',
        params: (dataRef.current.toolResult as Record<string, unknown>) ?? {},
      },
      '*'
    );
  };

  // Re-deliver tool data when a new call lands on an already-initialized
  // persistent view. Remounted views (activity widgets keyed per call) never
  // hit this: they get their data on the initialized notification below.
  useEffect(() => {
    if (initializedRef.current) {
      sendToolData();
    }
  }, [toolInput, toolResult]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    const send = (message: JsonRpcMessage) => {
      iframe.contentWindow?.postMessage({jsonrpc: '2.0', ...message}, '*');
    };

    const handleRequest = async (msg: JsonRpcMessage) => {
      const params = msg.params ?? {};
      switch (msg.method) {
        case 'ui/initialize':
          return {
            protocolVersion: MCP_APPS_PROTOCOL_VERSION,
            hostContext: {
              theme: 'light',
              displayMode: 'inline',
              locale: 'en-US',
              platform: 'web',
            },
          };
        case 'tools/call':
          return callbacksRef.current.onToolCall(
            String(params.name),
            (params.arguments as Record<string, unknown>) ?? {}
          );
        case 'ui/update-model-context':
          callbacksRef.current.onModelContextUpdate(
            params as ModelContextUpdate
          );
          return {};
        case 'ui/message': {
          const content = params.content as {text?: string} | undefined;
          if (content?.text) {
            callbacksRef.current.onUserMessage(content.text);
          }
          return {};
        }
        case 'ping':
          return {};
        default:
          throw new Error(`Unsupported method: ${msg.method}`);
      }
    };

    const onMessage = (event: MessageEvent) => {
      // Sandboxed srcdoc iframes have an opaque origin, so identity is
      // established by the window reference, not event.origin.
      if (event.source !== iframe.contentWindow) {
        return;
      }
      const msg = event.data as JsonRpcMessage;
      if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
        return;
      }

      if (msg.id !== undefined) {
        handleRequest(msg).then(
          result => send({id: msg.id, result}),
          error =>
            send({
              id: msg.id,
              error: {code: -32000, message: String(error?.message ?? error)},
            })
        );
        return;
      }

      switch (msg.method) {
        case 'ui/notifications/initialized':
          // Per spec, data flows only after the view declares readiness.
          initializedRef.current = true;
          sendToolData();
          break;
        case 'ui/notifications/size-changed': {
          const requested = Number(msg.params?.height);
          if (Number.isFinite(requested)) {
            setHeight(
              Math.round(Math.min(MAX_HEIGHT, Math.max(minHeight, requested)))
            );
          }
          break;
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // Bound once per mounted view; everything volatile is read via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title={`Widget: ${toolName}`}
      sandbox="allow-scripts"
      srcDoc={html}
      style={{
        width: '100%',
        height,
        border: 'none',
        display: 'block',
      }}
    />
  );
};

export default WidgetFrame;
