import {hashWidgetDoc, hashWidgetSource} from '../hash.js';
import type {WidgetManifest, WidgetToolchain} from '../manifest.js';
import {checkSlugCollision, mintSlug} from '../slug.js';

import {createPullRequest, type CreatePullRequestDeps} from './github.js';
import {
  addRemote,
  commitFilesOnto,
  diffStat,
  discoverDefaultBranch,
  fetchShallowBranch,
  initBareScratchRepo,
  listDirNames,
  parseGithubOwnerRepo,
  pushCommit,
  readFileAtRef,
  removeScratchRepo,
  type GitFile,
} from './gitPlumbing.js';
import {buildProvenance, buildPullRequestBody} from './provenance.js';
import type {AuthorshipEntry, ChatTurn, WidgetDescriptorLike, WidgetReference} from './types.js';

const WIDGETS_PATH = 'widgets';
const VERSION = '1.0.0';

export interface ProposeStaffAppsInput {
  target: 'staff-apps';
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
  /** `codeai-staff-apps/widgets`'s remote, e.g.
   * `git@github.com:codeai-staff-apps/widgets.git` — required even for a
   * dry-run, since the target's existing slugs, its `widgets/manifest.json`,
   * and the commit's parent all come from that remote's real tip, not from
   * anything local. */
  remote: string;
  /** Attempts `createPullRequest` after a successful push. Defaults to
   * true — "propose opens a PR there" is this target's whole point — but a
   * caller (or a test) can turn it off to get push-only behavior. */
  openPr?: boolean;
  /** Passed through to `createPullRequest` for dependency injection in
   * tests; production callers should only ever set `token`. */
  ghDeps?: CreatePullRequestDeps;
}

export type ProposeStaffAppsResult =
  | {ok: false; reason: string; violations?: string[]; suggestion?: string}
  | {
      ok: true;
      target: 'staff-apps';
      mode: 'dry-run' | 'push';
      slug: string;
      version: string;
      branch: string;
      baseCommit: string;
      commit: string;
      files: GitFile[];
      diffstat: string;
      compareUrl?: string;
      prUrl?: string;
      prError?: string;
    };

/**
 * The `codeai-staff-apps/widgets` target: a built self-contained
 * `widget.html` (that repo's own model is built, deployed apps — the
 * opposite of the monorepo catalog's CI-built, source-only convention), a
 * `widget.json` manifest, `PROVENANCE.md`, and a `src/` snapshot, laid out
 * as `widgets/<slug>/` — a sibling to that repo's own `apps/<id>/`, kept
 * separate so this flow never touches `apps/`, `gallery/`, `packages/
 * runtime`, or `template/` (that repo's own AGENTS.md: "never edit sibling
 * apps... or workflows"). `widgets/manifest.json` is a generated aggregate
 * index over every widget's `widget.json`, extended the same way that
 * repo's own `gen-manifest.mjs` extends its gallery index — but written to
 * a path this flow owns, so it never has to modify that repo's `scripts/`
 * or `gallery/`.
 *
 * Builds the commit in a throwaway bare scratch repo fetched shallow from
 * `remote`'s real default-branch tip (never this monorepo's own refs), then
 * — on `mode: 'push'` — pushes it and, unlike the catalog target, attempts
 * to open the pull request itself (`createPullRequest`: `gh`, then the
 * REST API if a token is configured, else a plain compare-URL fallback).
 */
export async function proposeStaffApps(
  input: ProposeStaffAppsInput,
): Promise<ProposeStaffAppsResult> {
  const scratchDir = initBareScratchRepo();
  try {
    addRemote(scratchDir, 'origin', input.remote);
    const defaultBranch = discoverDefaultBranch(input.remote);
    fetchShallowBranch(scratchDir, 'origin', defaultBranch);

    const existingSlugs = listDirNames(scratchDir, defaultBranch, WIDGETS_PATH);
    const slug = mintSlug(input.descriptor.toolName);
    const collision = checkSlugCollision(slug, existingSlugs);
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

    const widgetDir = `${WIDGETS_PATH}/${slug}`;
    const aggregateManifest = mergeAggregateManifest(
      readFileAtRef(scratchDir, defaultBranch, `${WIDGETS_PATH}/manifest.json`),
      slug,
      manifest,
    );

    const provenanceInput = {
      slug,
      sessionId: input.sessionId,
      widgetId: input.widgetId,
      authorshipTrail: input.authorshipTrail,
      chatTurns: input.chatTurns,
      reference: input.reference,
    };
    const files: GitFile[] = [
      {path: `${widgetDir}/widget.html`, content: input.servedHtml},
      {path: `${widgetDir}/widget.json`, content: `${JSON.stringify(manifest, null, 2)}\n`},
      {path: `${widgetDir}/PROVENANCE.md`, content: buildProvenance(provenanceInput)},
      ...input.srcFiles.map(f => ({path: `${widgetDir}/src/${f.path}`, content: f.content})),
      {
        path: `${WIDGETS_PATH}/manifest.json`,
        content: `${JSON.stringify(aggregateManifest, null, 2)}\n`,
      },
    ];

    const branch = `widget/${slug}-v${VERSION}`;
    const message = `Add ${slug} widget (graduated from Author Mode)\n\nSession ${input.sessionId}, widget ${input.widgetId}.\n${input.authorshipTrail.length} authorship change(s) recorded in PROVENANCE.md.`;

    const {baseCommit, commit} = commitFilesOnto(scratchDir, defaultBranch, files, message);
    const diffstat = diffStat(scratchDir, baseCommit, commit, widgetDir);

    if (input.mode === 'dry-run') {
      return {
        ok: true,
        target: 'staff-apps',
        mode: 'dry-run',
        slug,
        version: VERSION,
        branch,
        baseCommit,
        commit,
        files,
        diffstat,
      };
    }

    pushCommit(scratchDir, 'origin', commit, branch);
    // Parsed from the URL the caller passed in, not re-read back through
    // git — `git remote get-url` applies the caller's own `url.*.insteadOf`
    // rewrites (if any), which would silently disagree with what the
    // caller thinks it configured.
    const ownerRepo = parseGithubOwnerRepo(input.remote);
    const compareUrl = ownerRepo
      ? `https://github.com/${ownerRepo.owner}/${ownerRepo.repo}/compare/${defaultBranch}...${branch}?expand=1`
      : undefined;

    let prUrl: string | undefined;
    let prError: string | undefined;
    if ((input.openPr ?? true) && ownerRepo) {
      const prResult = await createPullRequest(
        {
          owner: ownerRepo.owner,
          repo: ownerRepo.repo,
          base: defaultBranch,
          head: branch,
          title: `Add ${slug} widget`,
          body: buildPullRequestBody(provenanceInput),
        },
        input.ghDeps,
      );
      if (prResult.ok) {
        prUrl = prResult.url;
      } else if (prResult.method !== 'none') {
        prError = prResult.error;
      }
      // method 'none' (no gh, no token) is not an error — it is the
      // expected, silent fallback to the compare URL.
    }

    return {
      ok: true,
      target: 'staff-apps',
      mode: 'push',
      slug,
      version: VERSION,
      branch,
      baseCommit,
      commit,
      files,
      diffstat,
      ...(compareUrl ? {compareUrl} : {}),
      ...(prUrl ? {prUrl} : {}),
      ...(prError ? {prError} : {}),
    };
  } finally {
    removeScratchRepo(scratchDir);
  }
}

/** Adds/overwrites `slug`'s entry in the aggregate `widgets/manifest.json`,
 * keeping every other widget's entry untouched — the same additive
 * discipline as the target repo's own `gen-manifest.mjs`, applied to a
 * manifest this flow owns rather than that repo's gallery scripts. */
function mergeAggregateManifest(
  existingJson: string | undefined,
  slug: string,
  manifest: WidgetManifest,
): Record<string, WidgetManifest> {
  let existing: Record<string, WidgetManifest> = {};
  if (existingJson !== undefined) {
    try {
      existing = JSON.parse(existingJson) as Record<string, WidgetManifest>;
    } catch {
      existing = {};
    }
  }
  const merged = {...existing, [slug]: manifest};
  return Object.fromEntries(
    Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)),
  );
}
