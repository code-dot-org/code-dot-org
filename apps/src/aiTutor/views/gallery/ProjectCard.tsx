import classNames from 'classnames';
import React, {FC} from 'react';

import {
  ChallengeResponse,
  ChallengeResponseAsset,
} from '../lessonDeepDive/types';

import ReactionChips from './ReactionChips';

import styles from './challenge-gallery.module.scss';

export type ProjectVariant = 'video' | 'whiteboard';

interface ProjectCardProps {
  response: ChallengeResponse;
  variant: ProjectVariant;
  unitPosition: number | null;
  // Opens the project's page. The card links to ?project=<id> and lets
  // this handler do the in-page navigation.
  onOpen?: () => void;
}

interface CardTag {
  label: string;
  color: 'brand' | 'pink' | 'green' | 'orange';
}

const assetWithUrl = (
  response: ChallengeResponse,
  assetType: ChallengeResponseAsset['asset_type']
): ChallengeResponseAsset | null =>
  response.assets.find(
    asset => asset.asset_type === assetType && asset.download_url
  ) || null;

// The modality tags on a card: video submissions carry the "Video Story"
// label; whiteboard submissions are tagged "Whiteboard" plus one tag per
// extra artifact on the response.
const cardTags = (
  response: ChallengeResponse,
  variant: ProjectVariant
): CardTag[] => {
  if (variant === 'video') {
    return [{label: 'Video Story', color: 'brand'}];
  }
  const tags: CardTag[] = [{label: 'Whiteboard', color: 'pink'}];
  if (assetWithUrl(response, 'video')) {
    tags.push({label: 'Video', color: 'brand'});
  }
  if (response.student_text) {
    tags.push({label: 'Text', color: 'green'});
  }
  if (assetWithUrl(response, 'audio')) {
    tags.push({label: 'Audio', color: 'orange'});
  }
  return tags;
};

const TAG_COLOR_CLASSES: Record<CardTag['color'], string> = {
  brand: styles.tagBrand,
  pink: styles.tagPink,
  green: styles.tagGreen,
  orange: styles.tagOrange,
};

// One project in the gallery grid: the submission's media, its unit/lesson
// label and modality tags, the author, and the class's emoji reactions.
const ProjectCard: FC<ProjectCardProps> = ({
  response,
  variant,
  unitPosition,
  onOpen,
}) => {
  const projectHref = `?project=${response.id}`;
  const handleOpen = (event: React.MouseEvent) => {
    if (!onOpen) {
      return;
    }
    event.preventDefault();
    onOpen();
  };

  const renderMedia = () => {
    if (variant === 'video') {
      // The video keeps its inline playback controls, so it is not wrapped
      // in the project link; the author's name below is the link instead.
      const video = assetWithUrl(response, 'video');
      if (video?.download_url) {
        return (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- student recordings have no caption track
          <video
            className={styles.media}
            src={video.download_url}
            controls
            preload="metadata"
          />
        );
      }
    } else {
      const image = assetWithUrl(response, 'whiteboard_image');
      if (image?.download_url) {
        return (
          <a href={projectHref} onClick={handleOpen} tabIndex={-1}>
            <img
              className={styles.media}
              src={image.download_url}
              alt={`${response.user_name}'s whiteboard project`}
            />
          </a>
        );
      }
    }
    return <div className={styles.media} />;
  };

  return (
    <div
      className={classNames(
        styles.card,
        variant === 'video' ? styles.videoCard : styles.whiteboardCard
      )}
    >
      {renderMedia()}
      <div className={styles.details}>
        <div className={styles.metaRow}>
          {unitPosition !== null && response.lesson_position !== null && (
            <span className={styles.unitLabel}>
              Unit {unitPosition}, Lesson {response.lesson_position}
            </span>
          )}
          <div className={styles.tags}>
            {cardTags(response, variant).map(tag => (
              <span
                key={tag.label}
                className={classNames(styles.tag, TAG_COLOR_CLASSES[tag.color])}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
        <p className={styles.name}>
          <a
            className={styles.nameLink}
            href={projectHref}
            onClick={handleOpen}
          >
            {response.user_name}
          </a>
        </p>
        <ReactionChips
          responseId={response.id}
          reactions={response.reactions}
          readOnly
        />
      </div>
    </div>
  );
};

export default ProjectCard;
