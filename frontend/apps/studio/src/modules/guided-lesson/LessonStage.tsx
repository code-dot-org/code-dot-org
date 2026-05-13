import AiTrainerLabStage from './AiTrainerLabStage';
import DatasciLabStage from './DatasciLabStage';
import MazeLabStage from './MazeLabStage';
import MusicLabStage from './MusicLabStage';
import type {StageVisual} from './types';

import styles from './guidedLesson.module.scss';

interface LessonStageProps {
  visual: StageVisual;
}

/**
 * The right-hand canvas. Step navigation lives inside the AI Tutor chat
 * panel (so advancing reads conversationally) — this component is just the
 * stage content for whatever step the chat says is active.
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
          <p className={styles.noteBody}>{visual.body}</p>
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

    case 'music-lab':
      return <MusicLabStage />;

    case 'maze-lab':
      return <MazeLabStage config={visual.config} />;

    case 'datasci-lab':
      return <DatasciLabStage config={visual.config} />;

    case 'ai-trainer-lab':
      return <AiTrainerLabStage config={visual.config} />;
  }
}

export default LessonStage;
