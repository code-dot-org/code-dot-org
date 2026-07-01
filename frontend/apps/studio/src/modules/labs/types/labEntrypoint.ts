import type {AppOptions, LevelPropertiesMap} from '@code-dot-org/core/api';

/**
 * The prop contract a `@code-dot-org/lab`-based lab entrypoint accepts from the
 * studio host under the host-owned loading model. Studio resolves the level
 * data and identity and passes them down; the lab forwards them to its own
 * `<LabWithSources>` and supplies the lab-specific bits (default sources, the
 * lab UI) itself.
 *
 * `manageLoadExternally` is always set by the host: studio drives the load via
 * `useLoadLab`, so the lab must not also self-drive from store-derived values.
 */
export interface LabEntrypointProps {
  /** Whether the host is still resolving level properties / app options. */
  isLoading: boolean;
  /** Current level id (host-resolved; for standalone projects, the map's first key). */
  levelId?: string;
  /** Standalone project type, when not a particular level. */
  standaloneProjectType?: string;
  /** Channel id for the project. */
  channelId?: string;
  /** Resolved level-properties map (host-fetched). */
  levelPropertiesMap?: LevelPropertiesMap;
  /** Resolved app options (host-fetched). */
  appOptions?: AppOptions;
  /** Always true from studio: the host owns the load dispatch. */
  manageLoadExternally?: boolean;
}
