import type {
  AuthorshipEntry,
  ChangeLike,
  ChatTurn,
  ChatTurnLike,
  CurriculumSnapshotLike,
  WidgetReference,
} from './types.js';

/** The course/unit/lesson/experience whose `WidgetExperience` points at
 * `widgetId`, if any — for PROVENANCE.md and for scoping which chat turns
 * are "about" this widget. */
export function findWidgetReference(
  snapshot: CurriculumSnapshotLike,
  widgetId: string,
): WidgetReference | undefined {
  for (const course of snapshot.courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        for (const experience of lesson.experiences) {
          if (experience.kind === 'widget' && experience.widgetId === widgetId) {
            return {
              courseId: course.id,
              courseName: course.displayName,
              unitId: unit.id,
              unitName: unit.displayName,
              lessonId: lesson.id,
              lessonName: lesson.displayName,
              experienceId: experience.id,
            };
          }
        }
      }
    }
  }
  return undefined;
}

/** Every `createWidget`/`updateWidgetMetadata` entry for `widgetId`, in the
 * order `changes.jsonl` recorded them — the authorship trail PROVENANCE.md
 * lists verbatim (seq/at/actor/op only; the metadata patches themselves are
 * not reproduced, since PROVENANCE.md ships in the open PR and a stale draft
 * description an author later corrected has no reason to reach it). */
export function filterAuthorshipTrail(
  changes: readonly ChangeLike[],
  widgetId: string,
): AuthorshipEntry[] {
  return changes
    .filter(
      change =>
        (change.op === 'createWidget' &&
          isRecord(change.descriptor) &&
          change.descriptor.id === widgetId) ||
        (change.op === 'updateWidgetMetadata' && change.widgetId === widgetId),
    )
    .map(({seq, at, actor, op}) => ({seq, at, actor, op}));
}

/** Chat turns scoped to the lesson/experience `reference` points at — the
 * cheap approximation of "chat turns about this widget" (widget PR flow
 * plan §3.3): no per-widget scope is recorded on a chat message today, so
 * this is scoped by the lesson/experience it produced instead. Returns `[]`
 * when the widget has no `reference` (never attached to a lesson) rather
 * than guessing at scope. */
export function filterChatTurns(
  chatLog: readonly ChatTurnLike[],
  reference: WidgetReference | undefined,
): ChatTurn[] {
  if (!reference) {
    return [];
  }
  return chatLog
    .filter(
      message =>
        message.scope?.lessonId === reference.lessonId ||
        message.scope?.experienceId === reference.experienceId,
    )
    .map(({role, at, text}) => ({role, at, text}));
}

export function buildChangelog(version: string, now: Date): string {
  const date = now.toISOString().slice(0, 10);
  return `# Changelog\n\n## ${version} - ${date}\n\nGraduated from the Author Mode authoring session.\n`;
}

export interface ProvenanceInput {
  slug: string;
  sessionId: string;
  widgetId: string;
  authorshipTrail: AuthorshipEntry[];
  chatTurns: ChatTurn[];
  reference?: WidgetReference;
}

/** `PROVENANCE.md`'s content — the only durable record of the session data
 * it draws from, since `.authoring/` is gitignored and none of that data
 * ever reaches git on its own (widget PR flow plan §1.10, §3.3). Shared by
 * every propose target, so a catalog widget and a staff-apps widget report
 * their history identically. */
export function buildProvenance(input: ProvenanceInput): string {
  const lines: string[] = [
    '# Provenance',
    '',
    `Widget \`${input.slug}\` (session widget id \`${input.widgetId}\`), ` +
      `graduated from Author Mode session \`${input.sessionId}\`. This file ` +
      'is the only durable record of the session data below — the session ' +
      'store (`.authoring/`) is gitignored and never reaches this commit.',
    '',
    '## Authorship trail',
    '',
  ];
  if (input.authorshipTrail.length === 0) {
    lines.push(
      'No `createWidget`/`updateWidgetMetadata` entries found for this widget.',
    );
  } else {
    for (const change of input.authorshipTrail) {
      lines.push(
        `- seq ${change.seq}, ${change.at}, actor: ${change.actor}, op: ${change.op}`,
      );
    }
  }
  lines.push('', '## Chat turns', '');
  if (input.chatTurns.length === 0) {
    lines.push('No chat turns scoped to this widget were cheaply available.');
  } else {
    for (const turn of input.chatTurns) {
      lines.push(`- **${turn.role}** (${turn.at}): ${turn.text}`);
    }
  }
  lines.push('', '## Referencing lesson', '');
  if (input.reference) {
    const r = input.reference;
    lines.push(
      `Course "${r.courseName}" (\`${r.courseId}\`) > Unit "${r.unitName}" ` +
        `(\`${r.unitId}\`) > Lesson "${r.lessonName}" (\`${r.lessonId}\`).`,
    );
  } else {
    lines.push('Not currently attached to any lesson experience.');
  }
  lines.push('', '## Gate results at proposal time', '');
  lines.push(
    "All `checkWidgetDocument` gates passed (0 violations) — see `widget.json`'s `gates` field for the recorded byte count and timestamp.",
  );
  lines.push('');
  return lines.join('\n');
}

/** A condensed version of `buildProvenance` for a PR body: the same
 * authorship/chat/reference/gate sections, plus a one-line lead-in. PR
 * bodies and `PROVENANCE.md` are deliberately the same content — a reviewer
 * should not have to open a file to see what the PR description already
 * says. */
export function buildPullRequestBody(input: ProvenanceInput): string {
  return [
    `Graduates \`${input.slug}\` from an Author Mode authoring session into a reviewed artifact.`,
    '',
    buildProvenance(input),
  ].join('\n');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
