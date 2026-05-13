import Markdown from 'markdown-to-jsx';

import {MARKDOWN_OPTIONS} from '@code-dot-org/ai-tutor';

import AiTrainerLabStage from './AiTrainerLabStage';
import DatasciLabStage from './DatasciLabStage';
import MazeLabStage from './MazeLabStage';
import MusicLabStage from './MusicLabStage';
import OceansLabStage from './OceansLabStage';
import ConditionFork from './stage-primitives/ConditionFork';
import DataDietPlate from './stage-primitives/DataDietPlate';
import FeedMirror from './stage-primitives/FeedMirror';
import LabelBucket from './stage-primitives/LabelBucket';
import LessonCelebration from './stage-primitives/LessonCelebration';
import MultipleChoiceStage from './stage-primitives/MultipleChoiceStage';
import QuestionVsAction from './stage-primitives/QuestionVsAction';
import ReflectionInvitation from './stage-primitives/ReflectionInvitation';
import UnrollTape from './stage-primitives/UnrollTape';
import type {StageVisual} from './types';

import styles from './guidedLesson.module.scss';

interface LessonStageProps {
  visual: StageVisual;
}

/**
 * The right-hand canvas. Step navigation lives inside the AI Tutor chat
 * panel (so advancing reads conversationally) — this component is just the
 * stage content for whatever step the chat says is active.
 *
 * Most concept / quiz / reflection steps render a dedicated *teaching*
 * primitive from `./stage-primitives/`, each one designed to attack a
 * specific K-5 misconception about loops or conditions. Falls back to a
 * markdown-rendered note card for free-form text content.
 */
const LessonStage = ({visual}: LessonStageProps) => {
  const isLab =
    visual.kind === 'music-lab' ||
    visual.kind === 'maze-lab' ||
    visual.kind === 'datasci-lab' ||
    visual.kind === 'ai-trainer-lab';
  return (
    <section className={`${styles.panel} ${styles.stage}`} aria-label="Stage">
      <div
        className={`${styles.stageBody} ${isLab ? styles.stageBodyLab : ''}`}
      >
        {renderVisual(visual)}
      </div>
    </section>
  );
};

function renderVisual(visual: StageVisual) {
  switch (visual.kind) {
    case 'none':
      return <div className={styles.stageEmpty}>Waiting for your tutor…</div>;

    case 'note':
      return (
        <div className={styles.noteCard}>
          <h3 className={styles.noteTitle}>{visual.title}</h3>
          <div className={styles.noteBody}>
            <Markdown options={MARKDOWN_OPTIONS}>{visual.body}</Markdown>
          </div>
        </div>
      );

    case 'youtube':
      return (
        <div className={styles.noteCard}>
          {visual.title && <h3 className={styles.noteTitle}>{visual.title}</h3>}
          <iframe
            title={visual.title || 'video'}
            src={`https://www.youtube.com/embed/${visual.youTubeId}`}
            width="100%"
            height="360"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{border: 'none', borderRadius: 8}}
          />
        </div>
      );

    case 'image':
      return (
        <div className={styles.noteCard}>
          <img
            src={visual.src}
            alt={visual.alt}
            style={{maxWidth: '100%', borderRadius: 8}}
          />
        </div>
      );

    case 'loop-collapse':
    case 'unroll-tape':
      return <UnrollTape />;

    case 'question-vs-action':
      return <QuestionVsAction />;

    case 'condition-fork':
      return <ConditionFork />;

    case 'pegman-step-trace':
      // Reuse the maze lab for now — the dedicated trace component is on the
      // follow-up build list. Falling back keeps the lesson playable.
      return <MazeLabStage config={visual.mazeConfig} />;

    case 'reflection-invitation':
      return <ReflectionInvitation prompt={visual.prompt} />;

    case 'lesson-celebrate':
      return <LessonCelebration summary={visual.summary} />;

    case 'multiple-choice-stage':
      return (
        <MultipleChoiceStage
          question={visual.question}
          options={visual.options}
          onChoose={visual.onChoose}
        />
      );

    case 'multiple-choice-stage-slot':
      // The author wired up the slot but GuidedLesson hasn't resolved it.
      // Treat as empty so a misconfigured lesson is recoverable.
      return <div className={styles.stageEmpty}>Loading question…</div>;

    case 'music-lab':
      return <MusicLabStage />;

    case 'maze-lab':
      return <MazeLabStage config={visual.config} />;

    case 'datasci-lab':
      return <DatasciLabStage config={visual.config} />;

    case 'ai-trainer-lab':
      return <AiTrainerLabStage config={visual.config} />;

    case 'oceans-lab':
      return <OceansLabStage appMode={visual.appMode} />;

    case 'label-bucket':
      return <LabelBucket />;

    case 'data-diet-plate':
      return <DataDietPlate />;

    case 'feed-mirror':
      return <FeedMirror />;
  }
}

export default LessonStage;
