// Public API for @code-dot-org/widgets-catalog/propose — the shared
// propose-widget flow, imported by authoring-service (as a thin HTTP
// wrapper) and by this package's own `widgets:propose` CLI. See propose.ts.
export {proposeWidget} from './propose.js';
export type {ProposeWidgetInput, ProposeWidgetResult} from './propose.js';
export type {ProposeCatalogInput, ProposeCatalogResult} from './catalogTarget.js';
export type {ProposeStaffAppsInput, ProposeStaffAppsResult} from './staffAppsTarget.js';

export {findWidgetReference, filterAuthorshipTrail, filterChatTurns, buildProvenance, buildPullRequestBody, buildChangelog} from './provenance.js';
export type {ProvenanceInput} from './provenance.js';

export {readSrcFiles} from './srcFiles.js';
export {parseProposeArgs} from './cliArgs.js';
export type {ParseArgsResult, ProposeCliArgs} from './cliArgs.js';

export {createPullRequest} from './github.js';
export type {
  CreatePullRequestInput,
  CreatePullRequestResult,
  CreatePullRequestDeps,
} from './github.js';

export type {
  AuthorshipEntry,
  ChangeLike,
  ChatTurn,
  ChatTurnLike,
  CurriculumSnapshotLike,
  WidgetDescriptorLike,
  WidgetReference,
} from './types.js';

export {
  addRemote,
  commitFilesOnto,
  deleteRemoteBranch,
  diffStat,
  discoverDefaultBranch,
  fetchShallowBranch,
  initBareScratchRepo,
  listDirNames,
  parseGithubOwnerRepo,
  pushCommit,
  readFileAtRef,
  refExists,
  removeScratchRepo,
  remoteOwner,
  remoteOwnerRepo,
  resolveRef,
} from './gitPlumbing.js';
export type {GitFile} from './gitPlumbing.js';
