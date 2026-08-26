import type {
  CourseModel,
  CurriculumChange,
  WidgetDescriptor,
} from '@code-dot-org/authoring';
import type {LevelPropertiesMap} from '@code-dot-org/lab/contexts';

// The authoring service is a local prototype process, not the dashboard API,
// so it is reached with plain fetch through the Vite dev proxy rather than
// DashboardApiClient (which is reserved for Rails endpoints).
const BASE = '/authoring-api';

/** Scope a chat message applies to: whole course down to one experience. */
export interface AuthoringScope {
  courseId?: string;
  unitId?: string;
  lessonId?: string;
  experienceId?: string;
  /** Author clicked an insertion point: where new experiences should land. */
  insertPosition?: number;
}

export interface AuthoringStateResponse {
  version: number;
  courses: CourseModel[];
  widgets: WidgetDescriptor[];
}

export interface ChatMessage {
  id: string;
  at: string;
  role: 'author' | 'agent' | 'status';
  text: string;
  scope?: AuthoringScope;
}

export interface WidgetResponse {
  // The server can return html before the descriptor is ready.
  descriptor?: WidgetDescriptor;
  html: string;
}

export type TutorEvent = {
  kind: 'widget_event' | 'learner_message' | 'experience_shown';
  experienceId?: string;
  text?: string;
  data?: unknown;
};

export type TutorAction =
  | {type: 'hint'; text: string}
  | {
      type: 'select_experience';
      experienceId: string;
      input?: Record<string, unknown>;
    }
  | {type: 'none'; text?: string};

// Plain Omit doesn't distribute over a discriminated union — keyof CurriculumChange
// collapses to only the keys every op shares, dropping op-specific fields like
// lessonId. Distribute manually so each member keeps its own fields.
type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

/** What a client sends to POST /api/changes — the server assigns seq/at/actor. */
export type CurriculumChangeInput = DistributiveOmit<
  CurriculumChange,
  'seq' | 'at' | 'actor'
>;

// Mirrors the server's own draftId('exp') convention (ClaudeAgentRunner), so
// author-typed and agent-generated content experiences are indistinguishable
// in the change log.
export function draftExperienceId(): string {
  return `draft-exp-${crypto.randomUUID().slice(0, 8)}`;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`authoring-service GET ${path}: ${res.status}`);
  }
  return (await res.json()) as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`authoring-service POST ${path}: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const authoringApi = {
  fetchState: () => get<AuthoringStateResponse>('/state'),
  fetchWidget: (widgetId: string) =>
    get<WidgetResponse>(`/widgets/${encodeURIComponent(widgetId)}`),
  fetchChatLog: () =>
    get<{messages: ChatMessage[]}>('/chat/log').then(r => r.messages),
  sendChat: (scope: AuthoringScope, message: string) =>
    post<{turnId: string}>('/chat', {scope, message}),
  searchLevels: (q: string) =>
    get<{levels: {levelKey: string; levelType: string}[]}>(
      `/levels/search?q=${encodeURIComponent(q)}`,
    ).then(r => r.levels),
  fetchLevelProperties: (numericId: number) =>
    get<LevelPropertiesMap>(`/levels/${numericId}/level_properties`),
  tutorTurn: (lessonId: string, transcript: TutorEvent[]) =>
    post<TutorAction>('/tutor', {lessonId, transcript}),
  publish: () => post<Record<string, unknown>>('/publish', {}),
  applyChange: (change: CurriculumChangeInput) =>
    post<{version: number}>('/changes', {change}),
};

export type {CourseModel, CurriculumChange, WidgetDescriptor};
