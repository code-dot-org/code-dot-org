import type {
  WidgetManifest,
  WidgetToolchain,
} from '@code-dot-org/widgets-catalog';
import {
  checkSlugCollision,
  hashWidgetDoc,
  hashWidgetSource,
  mintSlug,
} from '@code-dot-org/widgets-catalog';

import type {CurriculumChange, WidgetDescriptor} from '../authoring/model.js';
import type {ChatMessage, CurriculumSnapshot} from '../store/SessionStore.js';

import {
  commitFilesOnto,
  diffStat,
  pushCommit,
  remoteOwner,
  type GitFile,
} from './gitPlumbing.js';

const CATALOG_WIDGETS_PATH = 'frontend/packages/widgets-catalog/widgets';
const DEFAULT_BASE_REF = 'origin/staging';
const REPO_SLUG = 'code-dot-org/code-dot-org';

export interface WidgetReference {
  courseId: string;
  courseName: string;
  unitId: string;
  unitName: string;
  lessonId: string;
  lessonName: string;
  experienceId: string;
}

/** The course/unit/lesson whose `WidgetExperience` points at `widgetId`, if any — for PROVENANCE.md and for scoping which chat turns are "about" this widget. */
export function findWidgetReference(
  snapshot: CurriculumSnapshot,
  widgetId: string,
): WidgetReference | undefined {
  for (const course of snapshot.courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        for (const experience of lesson.experiences) {
          if (
            experience.kind === 'widget' &&
            experience.widgetId === widgetId
          ) {
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

export interface ProposeWidgetInput {
  mode: 'dry-run' | 'push';
  sessionId: string;
  widgetId: string;
  descriptor: WidgetDescriptor;
  /** `checkWidgetDocument(servedHtml)` — the caller runs the pre-flight gate; a non-empty list refuses here too, redundantly but cheaply. */
  violations: string[];
  servedHtml: string;
  /** The session widget's `src/` directory on disk — hashed with the exact same `hashWidgetSource` `test:gates` later recomputes from, so the two can never disagree. */
  sessionSrcDir: string;
  /** Paths relative to the widget's own `src/`, e.g. `index.tsx`. Copied verbatim into the commit. */
  srcFiles: GitFile[];
  toolchain: WidgetToolchain;
  existingSlugs: readonly string[];
  authorshipTrail: CurriculumChange[];
  chatTurns: ChatMessage[];
  reference?: WidgetReference;
  repoRoot: string;
  baseRef?: string;
  /** Required for mode: 'push'. */
  remote?: string;
  now?: Date;
}

export type ProposeWidgetResult =
  | {ok: false; reason: string; violations?: string[]; suggestion?: string}
  | {
      ok: true;
      mode: 'dry-run' | 'push';
      slug: string;
      version: string;
      branch: string;
      baseCommit: string;
      commit: string;
      files: GitFile[];
      diffstat: string;
      compareUrl?: string;
    };

const VERSION = '1.0.0';

export function proposeWidget(input: ProposeWidgetInput): ProposeWidgetResult {
  if (input.violations.length > 0) {
    return {
      ok: false,
      reason: 'widget document fails one or more contract gates',
      violations: input.violations,
    };
  }
  if (input.mode === 'push' && !input.remote) {
    return {ok: false, reason: '"remote" is required for mode: push'};
  }

  const slug = mintSlug(input.descriptor.toolName);
  const collision = checkSlugCollision(slug, input.existingSlugs);
  if (!collision.ok) {
    return {
      ok: false,
      reason: collision.reason,
      suggestion: collision.suggestion,
    };
  }

  const now = input.now ?? new Date();
  const docBytes = Buffer.byteLength(input.servedHtml, 'utf8');
  const manifest: WidgetManifest = {
    slug,
    version: VERSION,
    toolName: input.descriptor.toolName,
    title: input.descriptor.title,
    description: input.descriptor.description,
    inputSchema: input.descriptor.inputSchema,
    visibility: input.descriptor.visibility,
    network: input.descriptor.network,
    ...(input.descriptor.eventTypes
      ? {eventTypes: input.descriptor.eventTypes}
      : {}),
    sourceHash: hashWidgetSource(input.sessionSrcDir),
    docHash: hashWidgetDoc(input.servedHtml),
    toolchain: input.toolchain,
    gates: {checkedAt: now.toISOString(), violations: [], docBytes},
  };

  const widgetDir = `${CATALOG_WIDGETS_PATH}/${slug}`;
  const files: GitFile[] = [
    ...input.srcFiles.map(f => ({
      path: `${widgetDir}/src/${f.path}`,
      content: f.content,
    })),
    {
      path: `${widgetDir}/widget.json`,
      content: `${JSON.stringify(manifest, null, 2)}\n`,
    },
    {
      path: `${widgetDir}/CHANGELOG.md`,
      content: buildChangelog(VERSION, now),
    },
    {
      path: `${widgetDir}/PROVENANCE.md`,
      content: buildProvenance(input, slug),
    },
  ];

  const baseRef = input.baseRef ?? DEFAULT_BASE_REF;
  const branch = `widget-catalog/${slug}-v${VERSION}`;
  const message = `Add ${slug} widget (graduated from Author Mode)\n\nSession ${input.sessionId}, widget ${input.widgetId}.\n${input.authorshipTrail.length} authorship change(s) recorded in PROVENANCE.md.`;

  const {baseCommit, commit} = commitFilesOnto(
    input.repoRoot,
    baseRef,
    files,
    message,
  );
  const diffstat = diffStat(input.repoRoot, baseCommit, commit, widgetDir);

  if (input.mode === 'push') {
    // input.remote is checked non-empty above.
    pushCommit(input.repoRoot, input.remote as string, commit, branch);
  }

  const owner =
    input.mode === 'push'
      ? remoteOwner(input.repoRoot, input.remote as string)
      : undefined;
  const compareUrl =
    input.mode === 'push' && owner
      ? `https://github.com/${REPO_SLUG}/compare/staging...${owner}:${branch}?expand=1`
      : undefined;

  return {
    ok: true,
    mode: input.mode,
    slug,
    version: VERSION,
    branch,
    baseCommit,
    commit,
    files,
    diffstat,
    ...(compareUrl ? {compareUrl} : {}),
  };
}

function buildChangelog(version: string, now: Date): string {
  const date = now.toISOString().slice(0, 10);
  return `# Changelog\n\n## ${version} - ${date}\n\nGraduated from the Author Mode authoring session.\n`;
}

function buildProvenance(input: ProposeWidgetInput, slug: string): string {
  const lines: string[] = [
    '# Provenance',
    '',
    `Widget \`${slug}\` (session widget id \`${input.widgetId}\`), graduated from ` +
      `Author Mode session \`${input.sessionId}\`. This file is the only ` +
      'durable record of the session data below — the session store ' +
      '(`.authoring/`) is gitignored and never reaches this commit.',
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
