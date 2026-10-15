import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import {useEffect, useState} from 'react';
import ReactPlayer from 'react-player';
import {JsonLd} from 'react-schemaorg';
import type {VideoObject} from 'schema-dts';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import Facade from '@/video/Facade';
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
  videoDesc,
  videoFallback,
  showCaption,
  downloadLabel,
  uploadDate,
  errorHeading,
  errorBody,
  className,
  isYouTubeCookieAllowed,
  posterThumbnailFallback,
}: VideoProps) => {
  const youtubeVideoUrl = `https://www.youtube-nocookie.com/watch?v=${youTubeId}`;

  const [renderState, setRenderState] = useState<RenderState>('facade');
  // YouTube's maxres poster is 1280x720, but many videos do not have one and
  // YouTube answers 404 for those. Show a poster that is certain to load,
  // then swap to maxres once it loads. Showing maxres first would leave a
  // blank box on every video without one.
  //
  // posterThumbnailFallback lets a caller supply an image that loads on a
  // network that blocks YouTube's image host. Without one, use hqdefault,
  // which YouTube always has.
  //
  // Latch the id, so swapping youTubeId re-probes the new video.
  const posterBase =
    posterThumbnailFallback ?? `//i.ytimg.com/vi/${youTubeId}/hqdefault.jpg`;
  const [maxResLoadedFor, setMaxResLoadedFor] = useState<string | undefined>();

  useEffect(() => {
    const probe = new Image();
    // YouTube answers 404 for a missing maxres poster, but the body is still
    // a valid 120x90 image. Some browsers decode it and report a load. Check
    // the size, and upgrade only for an image larger than hqdefault.
    probe.onload = () => {
      if (probe.naturalWidth > 480) {
        setMaxResLoadedFor(youTubeId);
      }
    };
    probe.src = `//i.ytimg.com/vi/${youTubeId}/maxresdefault.jpg`;
    return () => {
      probe.onload = null;
    };
  }, [youTubeId]);

  const resolvedPosterThumbnail =
    maxResLoadedFor === youTubeId
      ? `//i.ytimg.com/vi/${youTubeId}/maxresdefault.jpg`
      : posterBase;

  const handleError = (
    event: string | Event | undefined,
    nextRenderState: RenderState,
  ) => {
    // If blocked due to an interaction autoplay issue, don't move to the next render state but allow the user to
    // manually click the play button
    if (typeof event !== 'string') {
      const error = (event?.target as HTMLVideoElement | undefined)?.error as
        | MediaError
        | Error
        | undefined;

      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.warn(error);
      } else {
        setRenderState(nextRenderState);
      }
    }
  };

  const handleFacadeClick = () => {
    if (isYouTubeCookieAllowed && !window.CDOVideoPlayer?.isYouTubeBlocked) {
      setRenderState('youtube');
    } else {
      if (videoFallback && ReactPlayer.canPlay?.(videoFallback)) {
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
            posterThumbnail={resolvedPosterThumbnail}
            onClick={handleFacadeClick}
          />
        );
      case 'youtube':
        return (
          <YouTubeVideo
            posterThumbnail={resolvedPosterThumbnail}
            videoTitle={videoTitle}
            src={youtubeVideoUrl}
            onError={error => {
              const nextRenderState =
                videoFallback && ReactPlayer.canPlay?.(videoFallback)
                  ? 'native'
                  : 'error';

              handleError(error, nextRenderState);
            }}
          />
        );
      case 'native':
        return (
          <NativeVideo
            posterThumbnail={resolvedPosterThumbnail}
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
            <MuiTypography variant="body2" gutterBottom>
              <MuiTypography variant="strong">
                {errorHeading || 'Video unavailable'}
              </MuiTypography>
            </MuiTypography>
            <MuiTypography variant="body3" gutterBottom>
              {errorBody || 'This video is blocked on your network.'}
            </MuiTypography>
          </div>
        );
      case 'cookie-blocked':
        return (
          <div className={classNames(moduleStyles.errorPlaceholder)}>
            <FontAwesomeV6Icon
              iconName="exclamation-circle"
              iconStyle="solid"
            />
            <MuiTypography variant="body2" gutterBottom>
              <MuiTypography variant="strong">
                {errorHeading || 'Cookie consent required'}
              </MuiTypography>
            </MuiTypography>
            <MuiTypography variant="body3" gutterBottom>
              {errorBody ||
                'Please enable "Functional Cookies" and refresh the page to play this video.'}
            </MuiTypography>
            <MuiButton
              variant="contained"
              color="primary"
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
          <MuiTypography variant="figcaption" gutterBottom>
            {videoTitle}
          </MuiTypography>
        )}
        {videoFallback && (
          <MuiButton
            className={moduleStyles.download}
            color="tertiary"
            href={videoFallback}
            startIcon={
              <FontAwesomeV6Icon iconName="download" iconStyle="solid" />
            }
            size="extraSmall"
            variant="outlined"
            target="_blank"
            rel="noopener noreferrer"
          >
            {downloadLabel || 'Download'}
          </MuiButton>
        )}
      </div>
      {/* JSON-LD for structured data. Needed for Google SEO.
      (see https://developers.google.com/search/docs/appearance/structured-data/video#json-ld) */}
      {videoTitle && resolvedPosterThumbnail && uploadDate && (
        <JsonLd<VideoObject>
          item={{
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: videoTitle,
            description: videoDesc,
            thumbnailUrl: resolvedPosterThumbnail,
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
