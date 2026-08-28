// Transcribed from docs/prototypes/author-mode.md (repo root).

export interface WidgetDescriptor {
  id: string;
  toolName: string;
  title: string;
  description: string; // model-facing
  inputSchema: Record<string, unknown>; // JSON schema
  resourceUri: string; // ui://widgets/<id>.html
  visibility: ('model' | 'app')[];
  network: 'none'; // offline default, explicit and validated
  eventTypes?: string[]; // structured events the widget emits
}

/**
 * Points a WidgetExperience at a graduated @code-dot-org/widgets-catalog
 * widget (slug + exact version) instead of the session's own draft store.
 * A separate field from `widgetId`, not a punctuation-laden encoding of one
 * — WIDGET_ID_PATTERN (authoring-service's model.ts) forbids `@`/`.`/`:`,
 * which a combined "slug@version" reference would need.
 */
export interface CatalogRef {
  slug: string;
  version: string;
}
