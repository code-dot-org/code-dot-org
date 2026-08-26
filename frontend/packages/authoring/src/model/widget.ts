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
