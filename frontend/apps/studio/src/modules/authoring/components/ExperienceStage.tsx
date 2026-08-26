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
}: {
  experience: ExistingLevelExperience;
  onStageEvent?: (event: StageEvent) => void;
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
        levelNumericId={experience.levelNumericId}
        levelKey={experience.levelKey}
        levelType={experience.levelType}
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
  levelNumericId,
  levelKey,
  levelType,
}: {
  levelNumericId: number;
  levelKey: string;
  levelType: string;
}) {
  const {data: properties, isLoading} = useLevelProperties(levelNumericId);

  if (isLoading) {
    return <Loading />;
  }

  const appName = properties?.[String(levelNumericId)]?.appName as
    | string
    | undefined;
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

  return (
    <div className={styles.labStage}>
      <Suspense fallback={<Loading />}>
        <Lab levelId={levelNumericId} levelPropertiesMap={properties}>
          <LabEntrypoint />
        </Lab>
      </Suspense>
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
