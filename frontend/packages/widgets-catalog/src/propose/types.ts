// Shapes the propose flow needs from authoring-service's session/model
// types, restated here structurally rather than imported — this package
// must not depend on the service (the service depends on it). Anything the
// service passes in that has these fields at minimum satisfies these types
// without either side importing the other.

/** The subset of authoring-service's `WidgetDescriptor` the propose flow
 * reads. Drops `id`/`resourceUri` — session-local addressing, not part of a
 * graduated widget's manifest. */
export interface WidgetDescriptorLike {
  toolName: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  visibility: ('model' | 'app')[];
  network: 'none';
  eventTypes?: string[];
}

/** One `changes.jsonl` entry, narrowed to what PROVENANCE.md reports:
 * which op, when, by whom. `filterAuthorshipTrail` narrows further by
 * op-specific fields it reads via an index signature, since the full
 * `CurriculumChange` union is service-owned. */
export interface ChangeLike {
  op: string;
  seq: number;
  at: string;
  actor: string;
  [key: string]: unknown;
}

/** One line of `changes.jsonl` that is about this widget — the shape
 * PROVENANCE.md actually renders. */
export interface AuthorshipEntry {
  seq: number;
  at: string;
  actor: string;
  op: string;
}

/** One `chat.jsonl` entry, narrowed to what PROVENANCE.md reports. */
export interface ChatTurnLike {
  role: string;
  at: string;
  text: string;
  scope?: {lessonId?: string; experienceId?: string};
}

export interface ChatTurn {
  role: string;
  at: string;
  text: string;
}

/** The course/unit/lesson/experience a widget is attached to, if any. */
export interface WidgetReference {
  courseId: string;
  courseName: string;
  unitId: string;
  unitName: string;
  lessonId: string;
  lessonName: string;
  experienceId: string;
}

/** The minimal curriculum-tree shape `findWidgetReference` walks — a
 * structural subset of authoring-service's `CurriculumSnapshot`. */
export interface CurriculumSnapshotLike {
  courses: {
    id: string;
    displayName: string;
    units: {
      id: string;
      displayName: string;
      lessons: {
        id: string;
        displayName: string;
        experiences: {
          id: string;
          kind: string;
          widgetId?: string;
        }[];
      }[];
    }[];
  }[];
}
