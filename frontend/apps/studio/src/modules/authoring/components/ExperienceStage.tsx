import {Button, Typography} from '@mui/material';
import classNames from 'classnames';
import {Suspense, useCallback, useState} from 'react';

import type {
  Experience,
  ExistingLevelExperience,
  GenericLevelData,
} from '@code-dot-org/authoring';
import Alert from '@code-dot-org/component-library/alert';
import {Lab, Loading} from '@code-dot-org/lab/host';
import {Markdown} from '@code-dot-org/markdown';
// oceans-lab ships its shell/guide-overlay CSS as a separate stylesheet
// (package.json `exports["./styles.css"]`) rather than bundling it into the
// JS entrypoint; nothing in studio pulled it in, so the lab rendered with the
// guide overlay unpositioned and stacked in normal flow instead of absolutely
// placed on the canvas.
import '@code-dot-org/oceans-lab/styles.css';

import {authoringApi, useLevelProperties} from '@/modules/authoring';
import type {LevelCheckResponse} from '@/modules/authoring';
import {getLabEntrypointByAppName} from '@/modules/labs/router/getLabEntrypointByAppName';
import type {LevelResultDetail} from '@/modules/labs/router/getLabEntrypointByAppName';

import LevelInstructions from './LevelInstructions';
import BubbleChoiceLevel from './renderers/BubbleChoiceLevel';
import LevelGroupLevel from './renderers/LevelGroupLevel';
import MatchLevel from './renderers/MatchLevel';
import MultiLevel from './renderers/MultiLevel';
import UnsupportedLevel from './renderers/UnsupportedLevel';
import VideoLevel from './renderers/VideoLevel';
import WidgetExperienceView from './WidgetExperienceView';

import styles from './authoring.module.scss';

export interface StageEvent {
  experienceId: string;
  /**
   * Widget/lab-specific payload. A lab's completion signal uses the shape
   * `{type: 'levelResult', result: number, testStatus?: number}` — see
   * `LabHostStage`'s `handleLevelResult` below. Pass C will consume this to
   * drive lesson progress dots.
   */
  data: unknown;
}

/**
 * The two sections LessonPlayer's properties panel currently supports (see
 * docs/prototypes/author-mode-properties-panel.md §5.2 for the full design;
 * this is its first slice). Scoped to the active experience — only one is
 * ever on screen, so the section alone disambiguates.
 */
export type PanelSection = 'instructions' | 'level';

interface ExperienceStageProps {
  experience: Experience;
  /** Learner interactions bubbling up (widget events, answers). */
  onStageEvent?: (event: StageEvent) => void;
  /** Shows the hover-to-preview affordance on existingLevel experiences.
   * Everything else this component renders is identical in both modes. */
  authorMode?: boolean;
  /** Advance to the next experience — a lab's terminal "Continue" calls this. */
  onContinue?: () => void;
  /** Which section of this experience's stage the properties panel is
   * currently showing (hover preview or pinned) — drives the selected
   * outline, not the panel's open/closed state itself. */
  selectedSection?: PanelSection;
  /** Hovering a section previews it in the panel after a short intent
   * delay; LessonPlayer owns the delay/pin/dirty state machine. */
  onSectionHoverEnter?: (section: PanelSection) => void;
  onSectionHoverLeave?: () => void;
  /** Pins the panel open on that section. */
  onSectionClick?: (section: PanelSection) => void;
}

/**
 * Renders ONE experience — the single dispatch point shared by the
 * deterministic lesson path, author preview, and the AI tutor. There is no
 * author-specific rendering here by design: what the author sees is what the
 * learner gets.
 */
export default function ExperienceStage({
  experience,
  onStageEvent,
  authorMode = false,
  onContinue,
  selectedSection,
  onSectionHoverEnter,
  onSectionHoverLeave,
  onSectionClick,
}: ExperienceStageProps) {
  switch (experience.kind) {
    case 'content':
      return (
        <div className={styles.contentCard}>
          <Markdown>{experience.markdown}</Markdown>
        </div>
      );
    case 'existingLevel':
      return (
        <ExistingLevelStage
          experience={experience}
          onStageEvent={onStageEvent}
          authorMode={authorMode}
          onContinue={onContinue}
          selectedSection={selectedSection}
          onSectionHoverEnter={onSectionHoverEnter}
          onSectionHoverLeave={onSectionHoverLeave}
          onSectionClick={onSectionClick}
        />
      );
    case 'widget':
      return (
        <WidgetExperienceView
          experience={experience}
          onEvent={data => onStageEvent?.({experienceId: experience.id, data})}
        />
      );
  }
}

function ExistingLevelStage({
  experience,
  onStageEvent,
  authorMode,
  onContinue,
  selectedSection,
  onSectionHoverEnter,
  onSectionHoverLeave,
  onSectionClick,
}: {
  experience: ExistingLevelExperience;
  onStageEvent?: (event: StageEvent) => void;
  authorMode: boolean;
  onContinue?: () => void;
  selectedSection?: PanelSection;
  onSectionHoverEnter?: (section: PanelSection) => void;
  onSectionHoverLeave?: () => void;
  onSectionClick?: (section: PanelSection) => void;
}) {
  if (experience.runtime === 'labhost') {
    if (!experience.levelNumericId) {
      return (
        <UnsupportedLevel
          levelKey={experience.levelKey}
          levelType={experience.levelType}
          reason="no numeric level id"
        />
      );
    }
    return (
      <LabHostStage
        key={experience.id}
        experienceId={experience.id}
        levelNumericId={experience.levelNumericId}
        levelKey={experience.levelKey}
        levelType={experience.levelType}
        authorMode={authorMode}
        onContinue={onContinue}
        onStageEvent={onStageEvent}
        selectedSection={selectedSection}
        onSectionHoverEnter={onSectionHoverEnter}
        onSectionHoverLeave={onSectionHoverLeave}
        onSectionClick={onSectionClick}
      />
    );
  }

  if (experience.runtime === 'generic' && experience.data) {
    return (
      <div className={styles.contentCard}>
        <GenericLevel
          data={experience.data}
          onAnswer={data => onStageEvent?.({experienceId: experience.id, data})}
        />
      </div>
    );
  }

  return (
    <UnsupportedLevel
      levelKey={experience.levelKey}
      levelType={experience.levelType}
      properties={
        experience.data?.type === 'opaque'
          ? experience.data.properties
          : undefined
      }
    />
  );
}

/**
 * Fetches this level's properties from the authoring service and dispatches
 * to the matching lab by `appName` — the same contract the live-course route
 * uses (`routes/courses/.../levels/$levelPosition.tsx`). A lab kind with no
 * registered entrypoint (e.g. music) falls to UnsupportedLevel rather than
 * blocking the whole lesson.
 */
function LabHostStage({
  experienceId,
  levelNumericId,
  levelKey,
  levelType,
  authorMode,
  onContinue,
  onStageEvent,
  selectedSection,
  onSectionHoverEnter,
  onSectionHoverLeave,
  onSectionClick,
}: {
  experienceId: string;
  levelNumericId: number;
  levelKey: string;
  levelType: string;
  authorMode: boolean;
  onContinue?: () => void;
  onStageEvent?: (event: StageEvent) => void;
  selectedSection?: PanelSection;
  onSectionHoverEnter?: (section: PanelSection) => void;
  onSectionHoverLeave?: () => void;
  onSectionClick?: (section: PanelSection) => void;
}) {
  const {data: properties, isLoading} = useLevelProperties(levelNumericId);
  const [levelResult, setLevelResult] = useState<LevelResultDetail | null>(
    null,
  );
  const [checkResult, setCheckResult] = useState<LevelCheckResponse | null>(
    null,
  );
  const [checking, setChecking] = useState(false);

  const handleCheckLevel = useCallback(async () => {
    setChecking(true);
    try {
      setCheckResult(await authoringApi.checkLevel(levelNumericId));
    } catch (error) {
      setCheckResult({
        ok: false,
        mode: 'palette',
        reasons: [error instanceof Error ? error.message : 'check failed'],
      });
    } finally {
      setChecking(false);
    }
  }, [levelNumericId]);

  const handleLevelResult = useCallback(
    (detail: LevelResultDetail) => {
      setLevelResult(detail);
      if (detail.result === RESULT_SUCCESS) {
        onStageEvent?.({
          experienceId,
          data: {
            type: 'levelResult',
            result: detail.result,
            testStatus: detail.testStatus,
          },
        });
      }
    },
    [experienceId, onStageEvent],
  );

  if (isLoading) {
    return <Loading />;
  }

  const levelProps = properties?.[String(levelNumericId)];
  const appName = levelProps?.appName as string | undefined;
  const LabEntrypoint = appName
    ? getLabEntrypointByAppName(appName)
    : undefined;

  if (!properties || !LabEntrypoint) {
    return (
      <UnsupportedLevel
        levelKey={levelKey}
        levelType={levelType}
        reason="lab entry not registered"
      />
    );
  }

  // maze-lab always renders longInstructions itself (the character-avatar
  // bubble above the play area). music-lab does too, whenever
  // levelProperties.longInstructions is set — normally as an auto-opened
  // "Instructions" tab in its ResourcePanel sidebar, or (when the level's
  // level_data sets guideMode: 'instructions') as the GuideInstructions
  // overlay instead, with the ResourcePanel tab suppressed
  // (lab-classic/resourcePanel/components/ResourcePanel.tsx, sidebarOnly).
  // Either way it's already on screen — showing the host block on top would
  // put the same text on the page twice.
  const selfDisplayedByLab = appName === 'maze' || appName === 'music';

  // Maze-family only (grid + block-solution levels) — checks the served
  // solution against the served grid/toolbox the same way create_level's
  // gate does. Author mode only: it's an authoring lint, not something a
  // learner needs to see.
  const showCheckLevel = authorMode && appName === 'maze';
  // The properties panel's "level" section only has a maze field
  // (startDirection) so far — same scope as showCheckLevel.
  const levelSelectable = showCheckLevel;

  return (
    <>
      <LevelInstructions
        shortInstructions={levelProps?.shortInstructions}
        longInstructions={levelProps?.longInstructions}
        selfDisplayedByLab={selfDisplayedByLab}
        authorMode={authorMode}
        selected={selectedSection === 'instructions'}
        onHoverEnter={() => onSectionHoverEnter?.('instructions')}
        onHoverLeave={onSectionHoverLeave}
        onClick={() => onSectionClick?.('instructions')}
      />
      {(showCheckLevel || levelSelectable) && (
        <div
          className={styles.levelCheckBar}
          onPointerEnter={
            levelSelectable
              ? () => onSectionHoverEnter?.('level')
              : undefined
          }
          onPointerLeave={levelSelectable ? onSectionHoverLeave : undefined}
        >
          {levelSelectable && (
            <Button
              size="small"
              variant={selectedSection === 'level' ? 'contained' : 'outlined'}
              aria-pressed={selectedSection === 'level'}
              onClick={() => onSectionClick?.('level')}
            >
              Level
            </Button>
          )}
          {showCheckLevel && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleCheckLevel}
              disabled={checking}
            >
              {checking ? 'Checking…' : 'Check level'}
            </Button>
          )}
        </div>
      )}
      {showCheckLevel && checkResult && (
        <LevelCheckCard
          result={checkResult}
          onDismiss={() => setCheckResult(null)}
        />
      )}
      <div
        className={classNames(
          styles.labStage,
          levelSelectable && selectedSection === 'level' && styles.labStageSelected,
        )}
        onPointerEnter={
          levelSelectable ? () => onSectionHoverEnter?.('level') : undefined
        }
        onPointerLeave={levelSelectable ? onSectionHoverLeave : undefined}
      >
        <Suspense fallback={<Loading />}>
          <Lab levelId={levelNumericId} levelPropertiesMap={properties}>
            <LabEntrypoint
              onContinue={onContinue}
              onLevelResult={handleLevelResult}
            />
          </Lab>
        </Suspense>
      </div>
      {levelResult && (
        <LevelResultCard
          detail={levelResult}
          onDismiss={() => setLevelResult(null)}
          onContinue={onContinue}
        />
      )}
    </>
  );
}

/**
 * "Check level" result, inline below the button (not an overlay). `mode`
 * distinguishes a full grid+program simulation from a palette-only check
 * (the solution uses a block type the simulator doesn't model) — labeled
 * plainly rather than presented as if they were equally strong evidence.
 */
function LevelCheckCard({
  result,
  onDismiss,
}: {
  result: LevelCheckResponse;
  onDismiss: () => void;
}) {
  const reasonText = result.reasons.join(' ');
  const headline =
    result.mode === 'simulated'
      ? result.ok
        ? 'Solved in simulation.'
        : `Not solvable — ${reasonText}`
      : result.ok
        ? 'Palette check passed.'
        : `Palette check failed — ${reasonText}`;

  return (
    <div className={styles.levelResultCard}>
      <Alert
        type={result.ok ? 'success' : 'danger'}
        isImmediateImportance={false}
        onClose={onDismiss}
        closeLabel="Dismiss check result"
        text={
          <>
            {headline}
            {result.note && (
              <>
                <br />
                {result.note}
              </>
            )}
          </>
        }
      />
    </div>
  );
}

/** Mirrors a lab's `ResultType.SUCCESS` (e.g. maze-lab's Maze.ts). */
const RESULT_SUCCESS = 1;

/**
 * Success/failure feedback for a lab run, driven by `onLevelResult`. Renders
 * inline below the lab stage (not an overlay), so it never blocks the
 * workspace; the close button dismisses it without affecting the lab.
 */
function LevelResultCard({
  detail,
  onDismiss,
  onContinue,
}: {
  detail: LevelResultDetail;
  onDismiss: () => void;
  onContinue?: () => void;
}) {
  const passed = detail.result === RESULT_SUCCESS;
  const showBlockCount =
    passed &&
    detail.blocksUsed !== undefined &&
    detail.idealBlocks !== undefined;

  return (
    <div className={styles.levelResultCard}>
      <Alert
        type={passed ? 'success' : 'warning'}
        isImmediateImportance={false}
        onClose={onDismiss}
        closeLabel="Dismiss feedback"
        text={
          <>
            {passed ? 'You did it!' : 'Not quite — give it another try!'}
            {showBlockCount && (
              <>
                <br />
                {`You used ${detail.blocksUsed} blocks — this can be solved in ${detail.idealBlocks}.`}
              </>
            )}
            {!passed && (
              <>
                <br />
                Click Reset to clear the workspace and try again.
              </>
            )}
          </>
        }
      />
      {passed && onContinue && (
        <div className={styles.levelResultActions}>
          <Button size="small" variant="contained" onClick={onContinue}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

/** Lightweight renderers for simple Levelbuilder level types (no Rails). */
function GenericLevel({
  data,
  onAnswer,
}: {
  data: GenericLevelData;
  onAnswer: (data: unknown) => void;
}) {
  switch (data.type) {
    case 'markdown':
      return <Markdown>{data.markdown}</Markdown>;
    case 'video':
      return <VideoLevel data={data} />;
    case 'multi':
      return <MultiLevel data={data} onAnswer={onAnswer} />;
    case 'match':
      return <MatchLevel data={data} onAnswer={onAnswer} />;
    case 'levelGroup':
      return <LevelGroupLevel data={data} onAnswer={onAnswer} />;
    case 'bubbleChoice':
      return <BubbleChoiceLevel data={data} />;
    case 'opaque':
      return (
        <Typography variant="body2">
          Unsupported level payload ({data.levelType}).
        </Typography>
      );
  }
}
