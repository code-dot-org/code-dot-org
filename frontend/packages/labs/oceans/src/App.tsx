import {useCallback} from 'react';

import {registerLevelKindSchema} from '@code-dot-org/core/api';
import type {LevelPropertiesMap} from '@code-dot-org/core/api';
import {Lab, continueOrFinishLesson} from '@code-dot-org/lab';
import {useMaybeLevelProperties} from '@code-dot-org/lab/contexts';
import {useAppDispatch} from '@code-dot-org/lab/redux';

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
  const dispatch = useAppDispatch();

  // Advancing past the activity hands off to base lesson progression: send a
  // success report and continue to the next level (or finish the lesson).
  const onContinue = useCallback(() => {
    dispatch(continueOrFinishLesson());
  }, [dispatch]);

  return (
    <OceansActivity
      appMode={levelProperties?.appMode}
      guides={levelProperties?.guides}
      textToSpeechLocale={levelProperties?.textToSpeechLocale}
      onContinue={onContinue}
    />
  );
}

/**
 * The oceans lab entrypoint, built on the base `@code-dot-org/lab` package. The
 * host (studio) provides the redux store and level data; `<Lab>` sets up
 * theming and the level-properties context that {@link OceansActivityFromLevel}
 * reads to configure the activity.
 *
 * The lab owns its own framing: the CSS-only responsive shell (16:9, clamped,
 * proportional font size) mirrors the FishView curriculum-path layout, so a
 * generic host can mount this entrypoint with no lab-specific wrapper. The
 * shell styles ship from this package (`oceans/styles/oceansLab.css`).
 */
export default function OceansLab(props: OceansLabProps) {
  return (
    <div className="oceans-lab-shell">
      <div className="oceans-lab-frame">
        <Lab {...props}>
          <OceansActivityFromLevel />
        </Lab>
      </div>
    </div>
  );
}
