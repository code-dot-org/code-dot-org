import React, {FC} from 'react';

import {assetWithUrl} from './assetUtils';
import {ChallengeResponseDetail} from './types';

import styles from './project-view.module.scss';

interface ProjectStageProps {
  detail: ChallengeResponseDetail;
}

// The project page's work area: the submitted media — a portrait story
// video, or a whiteboard image with its audio narration and typed
// explanation when present.
const ProjectStage: FC<ProjectStageProps> = ({detail}) => {
  const video = assetWithUrl(detail, 'video');
  const whiteboard = assetWithUrl(detail, 'whiteboard_image');
  const audio = assetWithUrl(detail, 'audio');
  const showExplanation = !video && !!detail.student_text;

  const renderMedia = () => {
    if (video?.download_url) {
      return (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- student recordings have no caption track
        <video
          className={styles.storyVideo}
          src={video.download_url}
          controls
          preload="metadata"
          aria-label={`${detail.user_name}'s video story`}
        />
      );
    }
    if (whiteboard?.download_url) {
      return (
        <img
          className={styles.whiteboardImage}
          src={whiteboard.download_url}
          alt={`${detail.user_name}'s whiteboard project`}
        />
      );
    }
    return null;
  };

  return (
    <div className={styles.projectRow}>
      <div className={styles.mediaColumn}>
        <div className={styles.mediaArea}>{renderMedia()}</div>
        {audio?.download_url && (
          <div className={styles.audioBar}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- student recordings have no caption track */}
            <audio
              src={audio.download_url}
              controls
              preload="metadata"
              aria-label="Audio narration"
            />
          </div>
        )}
      </div>
      {showExplanation && (
        <aside className={styles.explanation}>
          <h3 className={styles.sectionLabel}>Text Explanation</h3>
          <div className={styles.explanationCard}>
            <p>{detail.student_text}</p>
          </div>
        </aside>
      )}
    </div>
  );
};

export default ProjectStage;
