import {registerLevelKindSchema} from '@code-dot-org/core/api';
import type {LevelPropertiesMap} from '@code-dot-org/core/api';
import {Lab} from '@code-dot-org/lab';
import {useMaybeLevelProperties} from '@code-dot-org/lab/contexts';

import OceansActivity from './OceansActivity';
import {LevelKindSchema} from './schema';
import type {OceansLevelProperties} from './schema';

// Register the oceans level kind so appMode/guides/textToSpeechLocale survive
// level-properties validation (zod strips unknown keys otherwise).
registerLevelKindSchema('oceans', LevelKindSchema);

/**
 * Host-supplied props for the oceans entrypoint. AI for Oceans is a no-sources
 * lab, so it needs only the base `<Lab>` host props — no project, app options,
 * or external-load management. (Mirrors the base `LabProps` host fields; the
 * `<Lab {...props}>` site below type-checks them against `Lab`'s signature.)
 */
export interface OceansLabProps {
  /** Whether the host is still resolving level properties. */
  isLoading: boolean;
  /** Current level id (host-resolved; for standalone projects, the map's first key). */
  levelId?: string;
  /** Standalone project type, when not a particular level. */
  standaloneProjectType?: string;
  /** Channel id for the project. */
  channelId?: string;
  /** Resolved level-properties map (host-fetched). */
  levelPropertiesMap?: LevelPropertiesMap;
}

/**
 * Reads the resolved oceans level properties and renders the activity. Falls
 * back to OceansActivity's own defaults (FishVTrash) when no level properties
 * are present yet — e.g. before the host supplies them.
 */
function OceansActivityFromLevel() {
  const levelProperties = useMaybeLevelProperties<OceansLevelProperties>();

  return (
    <OceansActivity
      appMode={levelProperties?.appMode}
      guides={levelProperties?.guides}
      textToSpeechLocale={levelProperties?.textToSpeechLocale}
    />
  );
}

/**
 * The oceans lab entrypoint, built on the base `@code-dot-org/lab` package. The
 * host (studio) provides the redux store and level data; `<Lab>` sets up
 * theming and the level-properties context that {@link OceansActivityFromLevel}
 * reads to configure the activity.
 */
export default function OceansLab(props: OceansLabProps) {
  return (
    <Lab {...props}>
      <OceansActivityFromLevel />
    </Lab>
  );
}
