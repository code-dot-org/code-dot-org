import {hashWidgetDoc, hashWidgetSource} from '../hash.js';
import type {WidgetManifest, WidgetToolchain} from '../manifest.js';
import {checkSlugCollision, mintSlug} from '../slug.js';

import {commitFilesOnto, diffStat, pushCommit, remoteOwner, type GitFile} from './gitPlumbing.js';
import {buildChangelog, buildProvenance} from './provenance.js';
import type {AuthorshipEntry, ChatTurn, WidgetDescriptorLike, WidgetReference} from './types.js';

const CATALOG_WIDGETS_PATH = 'frontend/packages/widgets-catalog/widgets';
const DEFAULT_BASE_REF = 'origin/staging';
const REPO_SLUG = 'code-dot-org/code-dot-org';
const VERSION = '1.0.0';

export interface ProposeCatalogInput {
  target: 'catalog';
  mode: 'dry-run' | 'push';
  sessionId: string;
  widgetId: string;
  descriptor: WidgetDescriptorLike;
  violations: string[];
  servedHtml: string;
  sessionSrcDir: string;
  srcFiles: GitFile[];
  toolchain: WidgetToolchain;
  authorshipTrail: AuthorshipEntry[];
  chatTurns: ChatTurn[];
  reference?: WidgetReference;
  now?: Date;
  repoRoot: string;
  baseRef?: string;
  existingSlugs: readonly string[];
  /** A git remote NAME already configured in `repoRoot` (e.g. a fork
   * remote) — unlike the staff-apps target, this is never a raw URL. */
  remote?: string;
}

export type ProposeCatalogResult =
  | {ok: false; reason: string; violations?: string[]; suggestion?: string}
  | {
      ok: true;
      target: 'catalog';
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

/** The monorepo catalog target — unchanged behavior from the original
 * propose endpoint. Never opens a pull request: a human opens it from the
 * returned compare URL. */
export function proposeCatalog(input: ProposeCatalogInput): ProposeCatalogResult {
  if (input.mode === 'push' && !input.remote) {
    return {ok: false, reason: '"remote" is required for mode: push'};
  }

  const slug = mintSlug(input.descriptor.toolName);
  const collision = checkSlugCollision(slug, input.existingSlugs);
  if (!collision.ok) {
    return {ok: false, reason: collision.reason, suggestion: collision.suggestion};
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
    ...(input.descriptor.eventTypes ? {eventTypes: input.descriptor.eventTypes} : {}),
    sourceHash: hashWidgetSource(input.sessionSrcDir),
    docHash: hashWidgetDoc(input.servedHtml),
    toolchain: input.toolchain,
    gates: {checkedAt: now.toISOString(), violations: [], docBytes},
  };

  const widgetDir = `${CATALOG_WIDGETS_PATH}/${slug}`;
  const files: GitFile[] = [
    ...input.srcFiles.map(f => ({path: `${widgetDir}/src/${f.path}`, content: f.content})),
    {path: `${widgetDir}/widget.json`, content: `${JSON.stringify(manifest, null, 2)}\n`},
    {path: `${widgetDir}/CHANGELOG.md`, content: buildChangelog(VERSION, now)},
    {
      path: `${widgetDir}/PROVENANCE.md`,
      content: buildProvenance({
        slug,
        sessionId: input.sessionId,
        widgetId: input.widgetId,
        authorshipTrail: input.authorshipTrail,
        chatTurns: input.chatTurns,
        reference: input.reference,
      }),
    },
  ];

  const baseRef = input.baseRef ?? DEFAULT_BASE_REF;
  const branch = `widget-catalog/${slug}-v${VERSION}`;
  const message = `Add ${slug} widget (graduated from Author Mode)\n\nSession ${input.sessionId}, widget ${input.widgetId}.\n${input.authorshipTrail.length} authorship change(s) recorded in PROVENANCE.md.`;

  const {baseCommit, commit} = commitFilesOnto(input.repoRoot, baseRef, files, message);
  const diffstat = diffStat(input.repoRoot, baseCommit, commit, widgetDir);

  if (input.mode === 'push') {
    // input.remote is checked non-empty above.
    pushCommit(input.repoRoot, input.remote as string, commit, branch);
  }

  const owner = input.mode === 'push' ? remoteOwner(input.repoRoot, input.remote as string) : undefined;
  const compareUrl =
    input.mode === 'push' && owner
      ? `https://github.com/${REPO_SLUG}/compare/staging...${owner}:${branch}?expand=1`
      : undefined;

  return {
    ok: true,
    target: 'catalog',
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
