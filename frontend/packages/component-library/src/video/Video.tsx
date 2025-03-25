import classNames from 'classnames';
import {useState} from 'react';
import ReactPlayer from 'react-player/file';

import {LinkButton} from '@/button';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import {BodyTwoText, BodyThreeText, Figcaption, StrongText} from '@/typography';
import NativeVideo from '@/video/NativeVideo';
import {RenderState, VideoProps} from '@/video/types';
import YouTubeVideo from '@/video/YoutubeVideo';

import moduleStyles from './video.module.scss';

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
}: VideoProps) => {
  const youtubeVideoUrl = `https://www.youtube-nocookie.com/watch?v=${youTubeId}`;

  const [renderState, setRenderState] = useState<RenderState>('youtube');
  const posterThumbnail = `//i.ytimg.com/vi/${youTubeId}/hqdefault.jpg`;

  const handleError = (error: Error, nextRenderState: RenderState) => {
    // If blocked due to an interaction autoplay issue, don't move to the next render state but allow the user to
    // manually click the play button
    if (error.name === 'NotAllowedError') {
      console.warn(error);
    } else {
      setRenderState(nextRenderState);
    }
  };

  const getVideoPlayer = () => {
    switch (renderState) {
      case 'youtube':
        return (
          <YouTubeVideo
            posterThumbnail={posterThumbnail}
            videoTitle={videoTitle}
            src={youtubeVideoUrl}
            onError={error => {
              const nextRenderState =
                videoFallback && ReactPlayer.canPlay(videoFallback)
                  ? 'native'
                  : 'error';

              handleError(error, nextRenderState);
            }}
          />
        );
      case 'native':
        return (
          <NativeVideo
            posterThumbnail={posterThumbnail}
            videoTitle={videoTitle}
            src={videoFallback}
            className={className}
            onError={error => handleError(error, 'error')}
          />
        );
      case 'error':
        return (
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
        );
    }
  };
  return (
    <figure className={moduleStyles.videoComponentContainer}>
      <div className={moduleStyles.videoWrapper}>{getVideoPlayer()}</div>
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
