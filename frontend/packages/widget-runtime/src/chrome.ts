// React-free entry point: widget document assembly only. The Node authoring
// service imports this subpath to wrap widget HTML at serve time without
// pulling React into a server process.
export {buildWidgetDocument, injectWidgetChrome} from './widgetChrome';
export {WIDGET_APP_SHIM_JS} from './appShim';
export {MCP_APP_MIME_TYPE, MCP_APPS_PROTOCOL_VERSION} from './types';
