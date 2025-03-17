import classNames from 'classnames';
import {useState, useEffect, HTMLAttributes} from 'react';

import {LinkButton} from '@/button';
import {checkIfYouTubeIsBlocked} from '@/common/helpers';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import {BodyTwoText, BodyThreeText, Figcaption, StrongText} from '@/typography';

import moduleStyles from './video.module.scss';

export interface VideoProps extends HTMLAttributes<HTMLElement> {
  /** Video title */
  videoTitle?: string;
  /** Video YouTube ID */
  youTubeId?: string;
  /** Video fallback */
  videoFallback?: string;
  /** Show caption */
  showCaption?: boolean;
  /** Label for Download button */
  downloadLabel?: string;
  /** Error heading for placeholder  */
  errorHeading?: string;
  /** Error body for placeholder */
  errorBody?: string;
  /** Video custom className */
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Video.test.tsx)
 * * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Video Component.
 * This component is used to display a video from YouTube with a fallback HTML video player,
 * and the option to download it, if an externally hosted fallback is provided.
 * The video can also be displayed with a caption and works with responsive screen sizes.
 */
const Video: React.FC<VideoProps> = ({
  youTubeId,
  videoTitle,
  videoFallback,
  showCaption,
  downloadLabel,
  errorHeading,
  errorBody,
  className,
  ...HTMLAttributes
}: VideoProps) => {
  const [isYouTubeBlocked, setIsYouTubeBlocked] = useState(false);
  const posterThumbnail = `//i.ytimg.com/vi/${youTubeId}/mqdefault.jpg`;

  // Check to see if YouTube is blocked.
  // If it is, we'll use the fallback video player.
  useEffect(() => {
    checkIfYouTubeIsBlocked().then(setIsYouTubeBlocked);
  }, []);

  return (
    <figure className={moduleStyles.videoComponentContainer}>
      <div className={moduleStyles.videoWrapper}>
        {isYouTubeBlocked ? (
          videoFallback ? (
            // Disabling this eslint rule since we don't support captions on all of our videos.
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              className={classNames(className)}
              title={videoTitle || 'Video player'}
              poster={posterThumbnail}
              src={videoFallback}
              controls
              {...HTMLAttributes}
            />
          ) : (
            <div className={classNames(moduleStyles.errorPlaceholder)}>
              <FontAwesomeV6Icon
                iconName="exclamation-circle"
                iconStyle="solid"
              />
              <BodyTwoText>
                <StrongText>{errorHeading || 'Video unavailable'}</StrongText>
              </BodyTwoText>
              <BodyThreeText>
                {errorBody || 'This video is blocked on your network.'}
              </BodyThreeText>
            </div>
          )
        ) : (
          <iframe
            className={classNames(className)}
            src={`https://www.youtube-nocookie.com/embed/${youTubeId}`}
            title={videoTitle || 'YouTube video player'}
            allowFullScreen
            {...HTMLAttributes}
          />
        )}
      </div>
      <div className={moduleStyles.footer}>
        {showCaption && <Figcaption>{videoTitle}</Figcaption>}
        {videoFallback && (
          <LinkButton
            className={moduleStyles.download}
            color="gray"
            href={videoFallback}
            iconLeft={{
              iconName: 'download',
              iconStyle: 'solid',
            }}
            size="xs"
            text={downloadLabel || 'Download'}
            type="secondary"
          />
        )}
      </div>
    </figure>
  );
};

export default Video;
