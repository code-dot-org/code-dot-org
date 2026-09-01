import type {
  CatalogRef,
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

/** The newest `publish-*.json` artifact's own stamp, or undefined if
 * `/api/publish` has never run this session — see SessionStore's
 * getLatestPublishInfo. Backs the top-bar status chip (publishStatus.ts). */
export interface LastPublishInfo {
  generatedAt: string;
  changeCount: number;
}

export interface AuthoringStateResponse {
  version: number;
  courses: CourseModel[];
  widgets: WidgetDescriptor[];
  changes: CurriculumChange[];
  lastPublish?: LastPublishInfo;
}

export interface ChatMessage {
  id: string;
  at: string;
  role: 'author' | 'agent' | 'status';
  text: string;
  scope?: AuthoringScope;
}

export interface LevelCatalogEntry {
  levelKey: string;
  levelType: string;
}

/** One grouped search-result row; see authoring-service's levelCatalog.ts. */
export interface LevelFamily {
  familyKey: string;
  defaultVariant: LevelCatalogEntry;
  variantCount: number;
  variants: LevelCatalogEntry[];
}

export interface WidgetResponse {
  // The server can return html before the descriptor is ready.
  descriptor?: WidgetDescriptor;
  html: string;
  /** Where `html` actually came from — the catalog build (a graduated,
   * reviewed widget) or the session's own draft store. See
   * authoring-service's GET /api/widgets/:id (widget-pr-flow plan Pass 6). */
  servedFrom?: 'catalog' | 'session';
  /** Present when the experience has a catalogRef but resolving it failed
   * (a stale version, a missing slug, a build error) — the session draft is
   * still served, but the UI should say so rather than showing "catalog" as
   * if nothing were wrong. */
  catalogFallback?: boolean;
  catalogRef?: CatalogRef;
}

export type ProposeTarget = 'catalog' | 'staff-apps';

/** Whether "Propose widget"'s push step is usable in this environment, per
 * target — see authoring-service's AUTHORING_PROPOSE_REMOTE (catalog) and
 * AUTHORING_PROPOSE_STAFF_APPS_REMOTE (staff-apps). A remote is undefined,
 * never a fabricated default, when the service has none configured for
 * that target — the dialog disables that target's push step rather than
 * guessing. */
export interface ProposeConfig {
  remote?: string;
  staffAppsRemote?: string;
}

/** One file `POST /widgets/:id/propose` would write (or wrote) onto the
 * catalog branch — src/ copied verbatim, plus widget.json/CHANGELOG.md/
 * PROVENANCE.md. */
export interface ProposeWidgetFile {
  path: string;
  content: string;
}

/** Mirrors @code-dot-org/widgets-catalog/propose's ProposeWidgetResult
 * verbatim — a refusal (gate violations, a slug collision, a missing
 * remote) and a built proposal share no fields beyond `ok`, so callers
 * narrow on it directly rather than juggling a separate error channel.
 * `prUrl`/`prError` only ever appear on a staff-apps result: the catalog
 * target never attempts to open a pull request. */
export type ProposeWidgetResult =
  | {ok: false; reason: string; violations?: string[]; suggestion?: string}
  | {
      ok: true;
      target: ProposeTarget;
      mode: 'dry-run' | 'push';
      slug: string;
      version: string;
      branch: string;
      baseCommit: string;
      commit: string;
      files: ProposeWidgetFile[];
      diffstat: string;
      compareUrl?: string;
      prUrl?: string;
      prError?: string;
    };

/** Result of the maze-family "Check level" authoring lint — see
 * authoring-service's importedLevelCheck.ts for what each field means. */
export interface LevelCheckResponse {
  ok: boolean;
  mode: 'simulated' | 'palette';
  reasons: string[];
  note?: string;
}

export type TutorEvent = {
  kind: 'widget_event' | 'learner_message' | 'experience_shown';
  experienceId?: string;
  text?: string;
  data?: unknown;
};

/** Subset of the server's LevelbuilderChangeSet the top-bar publish flow
 * needs — the full artifact (widgets, offline reports, ...) is written to
 * disk but not otherwise consumed client-side. */
export interface PublishResult {
  generatedAt: string;
  changes: unknown[];
  newObjects: {
    courses: unknown[];
    units: unknown[];
    lessons: unknown[];
    experiences: unknown[];
  };
}

/** One file the write-back plan would (or did) touch — authoring-service's
 * writeback/plan.ts WritebackPlanEdit, minus the full patched/new content
 * (that never leaves the server; a diff is what the dialog renders). */
export interface WritebackEdit {
  kind: 'edit';
  path: string;
  levelKey: string;
  unifiedDiff: string;
  beforeHash: string;
  afterHash: string;
}

/** A brand-new `.level` file a `createLevel` op would (or did) add — `name`
 * is editable in the dialog before apply (see WritebackButton's `nameOverrides`). */
export interface WritebackCreate {
  kind: 'create';
  path: string;
  levelKey: string;
  experienceId: string;
  name: string;
  unifiedDiff: string;
  afterHash: string;
}

export type WritebackPlanEdit = WritebackEdit | WritebackCreate;

/** One change the plan couldn't turn into a file edit, and why — see
 * authoring-service's writeback/plan.ts doc comment for the full taxonomy
 * (unmapped fields, draft levels, stale-import, ...). */
export interface WritebackSkip {
  experienceId: string;
  field?: string;
  reason: string;
}

export interface WritebackPlan {
  planHash: string;
  edits: WritebackPlanEdit[];
  skipped: WritebackSkip[];
}

export interface WritebackApplyResult {
  planHash: string;
  applied: {path: string; afterHash: string}[];
  skipped: WritebackSkip[];
}

export type WritebackApplyOutcome =
  | {ok: true; result: WritebackApplyResult}
  | {ok: false; reason: 'plan-changed'; plan: WritebackPlan};

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

// Mirrors the server's own draftId(prefix) convention (ClaudeAgentRunner), so
// author-typed and agent-generated courses/units/lessons/experiences are
// indistinguishable in the change log.
function draftId(prefix: string): string {
  return `draft-${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function draftExperienceId(): string {
  return draftId('exp');
}

export function draftCourseId(): string {
  return draftId('course');
}

export function draftUnitId(): string {
  return draftId('unit');
}

export function draftLessonId(): string {
  return draftId('lesson');
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
  // Every error response the server sends is `{error: string}` (see
  // server.ts's `c.json({error: ...}, 4xx)` handlers) — surface that message
  // rather than just the status code, so a caller (e.g. Undo, on the
  // moved-experience edge) can show the author something more useful than
  // "POST /changes: 400".
  const data: unknown = await res.json().catch(() => undefined);
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && typeof (data as {error?: unknown}).error === 'string'
        ? (data as {error: string}).error
        : `authoring-service POST ${path}: ${res.status}`;
    throw new Error(message);
  }
  return data as T;
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
    get<{levels: LevelFamily[]}>(
      `/levels/search?q=${encodeURIComponent(q)}`,
    ).then(r => r.levels),
  fetchLevelProperties: (numericId: number) =>
    get<LevelPropertiesMap>(`/levels/${numericId}/level_properties`),
  checkLevel: (numericId: number) =>
    post<LevelCheckResponse>(`/levels/${numericId}/check`, {}),
  createMazeLevel: (params: {
    lessonId: string;
    position: number;
    title?: string;
    skin?: string;
    rows?: number;
    cols?: number;
  }) =>
    post<{
      version: number;
      levelId: string;
      experienceId: string;
      levelNumericId: number;
    }>('/levels/create-maze', params),
  tutorTurn: (lessonId: string, transcript: TutorEvent[]) =>
    post<TutorAction>('/tutor', {lessonId, transcript}),
  publish: () => post<PublishResult>('/publish', {}),
  fetchProposeConfig: () => get<ProposeConfig>('/widgets/propose-config'),
  // Bypasses post()'s uniform throw-on-non-2xx, same reasoning as
  // applyWriteback: a refusal (`{ok: false, reason, violations?,
  // suggestion?}`) is a legitimate outcome the dialog renders, not an
  // exception. A response with no `ok` field at all (an unrelated 404/503
  // the route also returns, e.g. "unknown widget") is normalized into the
  // same shape so the dialog has one branch to handle either way.
  proposeWidget: async (
    widgetId: string,
    body: {
      target: ProposeTarget;
      mode: 'dry-run' | 'push';
      remote?: string;
      baseRef?: string;
      openPr?: boolean;
    },
  ): Promise<ProposeWidgetResult> => {
    const res = await fetch(
      `${BASE}/widgets/${encodeURIComponent(widgetId)}/propose`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      },
    );
    const data: unknown = await res.json().catch(() => undefined);
    if (data && typeof data === 'object' && 'ok' in data) {
      return data as ProposeWidgetResult;
    }
    const message =
      data && typeof data === 'object' && typeof (data as {error?: unknown}).error === 'string'
        ? (data as {error: string}).error
        : `authoring-service POST /widgets/${widgetId}/propose: ${res.status}`;
    return {ok: false, reason: message};
  },
  applyChange: (change: CurriculumChangeInput) =>
    post<{version: number; change: CurriculumChange}>('/changes', {change}),
  fetchWritebackPlan: () => get<WritebackPlan>('/writeback/plan'),
  // Bypasses post()'s uniform throw-on-non-2xx: a 409 here is a legitimate
  // "your plan is stale" outcome carrying the fresh plan the dialog needs to
  // re-render, not just an error string.
  applyWriteback: async (
    planHash: string,
    nameOverrides?: Record<string, string>,
  ): Promise<WritebackApplyOutcome> => {
    const res = await fetch(`${BASE}/writeback/apply`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({planHash, nameOverrides}),
    });
    const data: unknown = await res.json().catch(() => undefined);
    if (res.status === 409 && data && typeof data === 'object' && (data as {code?: unknown}).code === 'plan-changed') {
      const {planHash: freshHash, edits, skipped} = data as WritebackPlan;
      return {ok: false, reason: 'plan-changed', plan: {planHash: freshHash, edits, skipped}};
    }
    if (!res.ok) {
      const message =
        data && typeof data === 'object' && typeof (data as {error?: unknown}).error === 'string'
          ? (data as {error: string}).error
          : `authoring-service POST /writeback/apply: ${res.status}`;
      throw new Error(message);
    }
    return {ok: true, result: data as WritebackApplyResult};
  },
};

export type {CatalogRef, CourseModel, CurriculumChange, WidgetDescriptor};
