// Structural mirrors of host types the feature imports type-only. At runtime
// these imports are erased; tsc and the IDE resolve them here so typechecking
// never crawls into apps/. Kept intentionally minimal — this file is the
// de facto typed host contract for the feature's AI seams.

export type AichatContext = {
  clientType: string;
  currentLevelId: number | null;
  scriptId: number | null;
  channelId: string | undefined;
  lessonId?: number;
};

export interface ModelParameters {
  selectedModelId: string;
  temperature: number;
  systemPrompt: string;
  retrievalContexts: string[];
  responseJsonSchema?: object;
}

interface BaseChatMessage {
  role: string;
  status: string;
  chatMessageText: string;
  timestamp: number;
}

export interface PendingChatMessage extends BaseChatMessage {
  status: 'unknown';
}

export interface CompletedChatMessage extends BaseChatMessage {
  requestId: number;
  structuredOutput?: unknown;
}

// @cdo/apps/sketchlab/reactFlow/types
export type ReactFlowSketchLabSources = {
  source: {nodes: unknown[]; edges: unknown[]};
};
