import {Button, Typography} from '@mui/material';
import {Suspense, useCallback, useState} from 'react';

import type {
  Experience,
  ExistingLevelExperience,
  GenericLevelData,
} from '@code-dot-org/authoring';
import type {BlocklySerialization, Toolbox} from '@code-dot-org/blockly';
import Alert from '@code-dot-org/component-library/alert';
import {Lab, Loading} from '@code-dot-org/lab/host';
import {Markdown} from '@code-dot-org/markdown';
// oceans-lab ships its shell/guide-overlay CSS as a separate stylesheet
// (package.json `exports["./styles.css"]`) rather than bundling it into the
// JS entrypoint; nothing in studio pulled it in, so the lab rendered with the
// guide overlay unpositioned and stacked in normal flow instead of absolutely
// placed on the canvas.
import '@code-dot-org/oceans-lab/styles.css';

import {useLevelProperties} from '@/modules/authoring';
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
 * The stage's four click-selectable logical components (product owner's
 * FINAL IA REVISION, 8/27, superseding the single-section 'instructions'
 * design in docs/prototypes/author-mode-properties-panel.md §5.2): a maze
 * level on stage decomposes into an instructions bubble, the
 * animation/visualization (grid + character), the block toolbox, and the
 * blocks workspace — each hover-highlightable and click-selectable, each
 * editing ITS OWN fields in the right panel. Level-WIDE settings (title,
 * target block count, solution status, Check level) stay page settings in
 * the left rail (LevelRail.tsx) — not a stage click-target. Music/oceans/
 * generic experiences only ever use 'instructions'; the other three are
 * maze-family only (see ExperienceStage's `levelEditable`).
 */
export type PanelSection =
  | 'instructions'
  | 'visualization'
  | 'toolbox'
  | 'workspace';

interface ExperienceStageProps {
  experience: Experience;
  /** Learner interactions bubbling up (widget events, answers). */
  onStageEvent?: (event: StageEvent) => void;
  /** Shows the click-to-edit affordance on existingLevel experiences.
   * Everything else this component renders is identical in both modes. */
  authorMode?: boolean;
  /** Advance to the next experience — a lab's terminal "Continue" calls this. */
  onContinue?: () => void;
  /** Which section of this experience's stage the properties panel is
   * currently pinned open on — drives the selected outline, not the
   * panel's open/closed state itself. Hover only highlights (CSS); it
   * never sets this. */
  selectedSection?: PanelSection;
  /** Opens (pins) the panel on that section. */
  onSectionClick?: (section: PanelSection) => void;
  /** Map-painting selection — see LessonPlayer's `selectedPaintToolId`
   * state comment for why this crosses through here rather than living in
   * LevelRail or the mounted lab directly. Maze-family only. */
  selectedPaintToolId?: string;
  onMapDraftChange?: (patch: {serialized_maze: string; maze: string}) => void;
  /** The left rail's toolbox-tray draft, live — see LessonPlayer's
   * `toolboxDraftXml` state comment. Maze-family only. */
  toolboxOverride?: Toolbox;
  /** LevelRail's "Student start | My solution" mode selector — see
   * MazeLabEditingProps.workspaceMode (Author Mode Pass D). Maze-family
   * only, undefined outside editing. */
  workspaceMode?: 'studentStart' | 'mySolution';
  /** Fresh JSON to (re)load on a mode switch — see LessonPlayer's
   * `workspaceOverrideXml` state comment. Maze-family only. */
  workspaceOverride?: BlocklySerialization;
  onWorkspaceChange?: (xml: string) => void;
  /** Fires on a passing run recorded while workspaceMode is 'mySolution' —
   * see LessonPlayer's `solutionOffer` state comment. Maze-family only. */
  onSolutionRun?: (detail: {
    solutionBlocksXml: string;
    blocksUsed: number;
  }) => void;
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
  onSectionClick,
  selectedPaintToolId,
  onMapDraftChange,
  toolboxOverride,
  workspaceMode,
  workspaceOverride,
  onWorkspaceChange,
  onSolutionRun,
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
          onSectionClick={onSectionClick}
          selectedPaintToolId={selectedPaintToolId}
          onMapDraftChange={onMapDraftChange}
          toolboxOverride={toolboxOverride}
          workspaceMode={workspaceMode}
          workspaceOverride={workspaceOverride}
          onWorkspaceChange={onWorkspaceChange}
          onSolutionRun={onSolutionRun}
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
  onSectionClick,
  selectedPaintToolId,
  onMapDraftChange,
  toolboxOverride,
  workspaceMode,
  workspaceOverride,
  onWorkspaceChange,
  onSolutionRun,
}: {
  experience: ExistingLevelExperience;
  onStageEvent?: (event: StageEvent) => void;
  authorMode: boolean;
  onContinue?: () => void;
  selectedSection?: PanelSection;
  onSectionClick?: (section: PanelSection) => void;
  selectedPaintToolId?: string;
  onMapDraftChange?: (patch: {serialized_maze: string; maze: string}) => void;
  toolboxOverride?: Toolbox;
  workspaceMode?: 'studentStart' | 'mySolution';
  workspaceOverride?: BlocklySerialization;
  onWorkspaceChange?: (xml: string) => void;
  onSolutionRun?: (detail: {
    solutionBlocksXml: string;
    blocksUsed: number;
  }) => void;
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
        onSectionClick={onSectionClick}
        selectedPaintToolId={selectedPaintToolId}
        onMapDraftChange={onMapDraftChange}
        toolboxOverride={toolboxOverride}
        workspaceMode={workspaceMode}
        workspaceOverride={workspaceOverride}
        onWorkspaceChange={onWorkspaceChange}
        onSolutionRun={onSolutionRun}
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
  onSectionClick,
  selectedPaintToolId,
  onMapDraftChange,
  toolboxOverride,
  workspaceMode,
  workspaceOverride,
  onWorkspaceChange,
  onSolutionRun,
}: {
  experienceId: string;
  levelNumericId: number;
  levelKey: string;
  levelType: string;
  authorMode: boolean;
  onContinue?: () => void;
  onStageEvent?: (event: StageEvent) => void;
  selectedSection?: PanelSection;
  onSectionClick?: (section: PanelSection) => void;
  selectedPaintToolId?: string;
  onMapDraftChange?: (patch: {serialized_maze: string; maze: string}) => void;
  toolboxOverride?: Toolbox;
  workspaceMode?: 'studentStart' | 'mySolution';
  workspaceOverride?: BlocklySerialization;
  onWorkspaceChange?: (xml: string) => void;
  onSolutionRun?: (detail: {
    solutionBlocksXml: string;
    blocksUsed: number;
  }) => void;
}) {
  const {data: properties, isLoading} = useLevelProperties(levelNumericId);
  const [levelResult, setLevelResult] = useState<LevelResultDetail | null>(
    null,
  );

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

  // music-lab renders longInstructions itself whenever
  // levelProperties.longInstructions is set — normally as an auto-opened
  // "Instructions" tab in its ResourcePanel sidebar, or (when the level's
  // level_data sets guideMode: 'instructions') as the GuideInstructions
  // overlay instead, with the ResourcePanel tab suppressed
  // (lab-classic/resourcePanel/components/ResourcePanel.tsx, sidebarOnly).
  // It's already on screen — showing the host block on top would put the
  // same text on the page twice, so LevelInstructions itself renders a
  // "shown in the lab below" note there instead of the real text.
  //
  // maze-lab ALSO renders longInstructions itself (the character-avatar
  // bubble above the play area), but unlike music its bubble is a plain,
  // always-mounted React component (Instructions/index.tsx — not part of
  // the ported Blockly/Maze engine's DOM that initEngine tears down and
  // rebuilds), so it's cheap to make THAT the click/hover target instead of
  // duplicating it as a host-side placeholder block. The host skips
  // <LevelInstructions> entirely for maze and hands the selection state
  // into the lab via `editing` below; music keeps the placeholder-note
  // approach for now (see docs/prototypes/author-mode-properties-panel.md
  // for the leftover).
  const selfDisplayedByLab = appName === 'music';
  const hostRendersInstructions = appName !== 'maze';

  // Maze-family only (grid + block-solution levels): the left rail
  // (LevelRail.tsx) replaces the outline with that level's settings, and the
  // map/toolbox/start-blocks editing surfaces below light up accordingly.
  // Product decision, 8/27 — level-wide settings are page settings, not a
  // stage click-target, so there is no more "Level" button/section here to
  // gate on; a maze level's editing surfaces are simply live whenever the
  // rail is showing them (authorMode && appName === 'maze').
  const levelEditable = authorMode && appName === 'maze';

  // Threaded into every lab entrypoint (harmless for the three that ignore
  // it); maze-lab uses it to make its own instructions bubble, play area,
  // Blocks header, and Workspace header the hover/click targets for the
  // panel's four sections, and (while levelEditable) to offer the map
  // painter, toolbox tray, and student-start capture on the stage.
  const editing = {
    authorMode,
    instructionsSelected: selectedSection === 'instructions',
    onInstructionsClick: () => onSectionClick?.('instructions'),
    visualizationSelected: levelEditable && selectedSection === 'visualization',
    onVisualizationClick: () => onSectionClick?.('visualization'),
    selectedPaintToolId,
    onMapDraftChange: onMapDraftChange ?? (() => {}),
    toolboxSelected: levelEditable && selectedSection === 'toolbox',
    onToolboxClick: () => onSectionClick?.('toolbox'),
    toolboxOverride,
    workspaceSelected: levelEditable && selectedSection === 'workspace',
    onWorkspaceClick: () => onSectionClick?.('workspace'),
    workspaceMode: levelEditable ? workspaceMode : undefined,
    workspaceOverride,
    onWorkspaceChange: onWorkspaceChange ?? (() => {}),
    onSolutionRun: onSolutionRun ?? (() => {}),
  };

  return (
    <>
      {hostRendersInstructions && (
        <LevelInstructions
          shortInstructions={levelProps?.shortInstructions}
          longInstructions={levelProps?.longInstructions}
          selfDisplayedByLab={selfDisplayedByLab}
          authorMode={authorMode}
          selected={selectedSection === 'instructions'}
          onClick={() => onSectionClick?.('instructions')}
        />
      )}
      <div className={styles.labStage}>
        <Suspense fallback={<Loading />}>
          <Lab levelId={levelNumericId} levelPropertiesMap={properties}>
            <LabEntrypoint
              onContinue={onContinue}
              onLevelResult={handleLevelResult}
              editing={editing}
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
export function LevelCheckCard({
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
