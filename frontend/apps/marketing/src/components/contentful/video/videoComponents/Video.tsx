import DownloadIcon from '@mui/icons-material/Download';
import ErrorIcon from '@mui/icons-material/Error';
import MuiButton from '@mui/material/Button';
import MuiTypography from '@mui/material/Typography';
import classNames from 'classnames';
import {useState} from 'react';
import ReactPlayer from 'react-player/file';
import {JsonLd} from 'react-schemaorg';
import type {VideoObject} from 'schema-dts';

import Paragraph from '@/components/contentful/paragraph';

import Facade from './Facade';
import NativeVideo from './NativeVideo';
import {RenderState, VideoProps} from './types';
import YouTubeVideo from './YoutubeVideo';

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
  videoDesc,
  videoFallback,
  showCaption,
  downloadLabel,
  uploadDate,
  errorHeading,
  errorBody,
  className,
  isYouTubeCookieAllowed,
}: VideoProps) => {
  const youtubeVideoUrl = `https://www.youtube-nocookie.com/watch?v=${youTubeId}`;

  const [renderState, setRenderState] = useState<RenderState>('facade');
  const posterThumbnail = `//i.ytimg.com/vi/${youTubeId}/hqdefault.jpg`;

  const handleError = (
    error: Error | undefined,
    nextRenderState: RenderState,
  ) => {
    // If blocked due to an interaction autoplay issue, don't move to the next render state but allow the user to
    // manually click the play button
    if (error?.name === 'NotAllowedError') {
      console.warn(error);
    } else {
      setRenderState(nextRenderState);
    }
  };

  const handleFacadeClick = () => {
    if (isYouTubeCookieAllowed && !window.CDOVideoPlayer?.isYouTubeBlocked) {
      setRenderState('youtube');
    } else {
      if (videoFallback && ReactPlayer.canPlay(videoFallback)) {
        setRenderState('native');
      } else {
        if (window.CDOVideoPlayer?.isYouTubeBlocked) {
          setRenderState('error');
        } else {
          setRenderState('cookie-blocked');
        }
      }
    }
  };

  const getVideoPlayer = () => {
    switch (renderState) {
      case 'facade':
        return (
          <Facade
            label={`Play video ${videoTitle}`}
            posterThumbnail={posterThumbnail}
            onClick={handleFacadeClick}
          />
        );
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
            <ErrorIcon />
            <Paragraph visualAppearance="body-two" removeMarginBottom>
              <strong>{errorHeading || 'Video unavailable'}</strong>
            </Paragraph>
            <Paragraph visualAppearance="body-three" removeMarginBottom>
              {errorBody || 'This video is blocked on your network.'}
            </Paragraph>
          </div>
        );
      case 'cookie-blocked':
        return (
          <div className={classNames(moduleStyles.errorPlaceholder)}>
            <ErrorIcon />
            <Paragraph visualAppearance="body-two" removeMarginBottom>
              <strong>{errorHeading || 'Cookie consent required'}</strong>
            </Paragraph>
            <Paragraph visualAppearance="body-two" removeMarginBottom>
              {errorBody ||
                'Please enable "Functional Cookies" and refresh the page to play this video.'}
            </Paragraph>
            <MuiButton
              className={moduleStyles.cookieConsentButton}
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).OneTrust.ToggleInfoDisplay();
              }}
            >
              Cookie Settings
            </MuiButton>
          </div>
        );
    }
  };
  return (
    <figure
      className={classNames(moduleStyles.videoComponentContainer, className)}
    >
      <div className={moduleStyles.videoWrapper}>{getVideoPlayer()}</div>
      <div className={moduleStyles.footer}>
        {showCaption && (
          <MuiTypography variant="caption" component="figcaption">
            {videoTitle}
          </MuiTypography>
        )}
        {videoFallback && (
          <MuiButton
            className={moduleStyles.download}
            href={videoFallback}
            type="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon />
            {downloadLabel || 'Download'}
          </MuiButton>
        )}
      </div>

      {/* JSON-LD for structured data. Needed for Google SEO.
      (see https://developers.google.com/search/docs/appearance/structured-data/video#json-ld) */}
      {videoTitle && posterThumbnail && uploadDate && (
        <JsonLd<VideoObject>
          item={{
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: videoTitle,
            description: videoDesc,
            thumbnailUrl: posterThumbnail,
            uploadDate: uploadDate,
            embedUrl: youtubeVideoUrl,
            contentUrl: videoFallback,
          }}
        />
      )}
    </figure>
  );
};

export default Video;
