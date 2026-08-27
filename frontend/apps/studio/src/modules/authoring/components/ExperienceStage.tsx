import {Typography} from '@mui/material';
import {Suspense} from 'react';

import type {
  Experience,
  ExistingLevelExperience,
  GenericLevelData,
} from '@code-dot-org/authoring';
import {Lab, Loading} from '@code-dot-org/lab/host';
import {Markdown} from '@code-dot-org/markdown';
// oceans-lab ships its shell/guide-overlay CSS as a separate stylesheet
// (package.json `exports["./styles.css"]`) rather than bundling it into the
// JS entrypoint; nothing in studio pulled it in, so the lab rendered with the
// guide overlay unpositioned and stacked in normal flow instead of absolutely
// placed on the canvas.
import '@code-dot-org/oceans-lab/styles.css';

import {useLevelProperties} from '@/modules/authoring';
import {getLabEntrypointByAppName} from '@/modules/labs/router/getLabEntrypointByAppName';

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
  data: unknown;
}

interface ExperienceStageProps {
  experience: Experience;
  /** Learner interactions bubbling up (widget events, answers). */
  onStageEvent?: (event: StageEvent) => void;
  /** Shows the "Edit instructions" affordance on existingLevel experiences.
   * Everything else this component renders is identical in both modes. */
  authorMode?: boolean;
  /** Advance to the next experience — a lab's terminal "Continue" calls this. */
  onContinue?: () => void;
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
}: {
  experience: ExistingLevelExperience;
  onStageEvent?: (event: StageEvent) => void;
  authorMode: boolean;
  onContinue?: () => void;
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
}: {
  experienceId: string;
  levelNumericId: number;
  levelKey: string;
  levelType: string;
  authorMode: boolean;
  onContinue?: () => void;
}) {
  const {data: properties, isLoading} = useLevelProperties(levelNumericId);

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

  return (
    <>
      <LevelInstructions
        experienceId={experienceId}
        levelNumericId={levelNumericId}
        shortInstructions={levelProps?.shortInstructions}
        longInstructions={levelProps?.longInstructions}
        selfDisplayedByLab={selfDisplayedByLab}
        authorMode={authorMode}
      />
      <div className={styles.labStage}>
        <Suspense fallback={<Loading />}>
          <Lab levelId={levelNumericId} levelPropertiesMap={properties}>
            <LabEntrypoint onContinue={onContinue} />
          </Lab>
        </Suspense>
      </div>
    </>
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
