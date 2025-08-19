import DownloadIcon from '@mui/icons-material/Download';
import ErrorIcon from '@mui/icons-material/Error';
import MuiButton from '@mui/material/Button';
import MuiContainer from '@mui/material/Container';
import MuiTypography from '@mui/material/Typography';
import classNames from 'classnames';
import {useState} from 'react';
import ReactPlayer from 'react-player/file';
import {JsonLd} from 'react-schemaorg';
import type {VideoObject} from 'schema-dts';

import Facade from './Facade';
import NativeVideo from './NativeVideo';
import {RenderState, VideoProps} from './types';
import YouTubeVideo from './YoutubeVideo';

import moduleStyles from './video.module.scss';

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
            onError={error => handleError(error, 'error')}
          />
        );
      case 'error':
        return (
          <MuiContainer
            className={classNames(
              moduleStyles.errorPlaceholder,
              'video-error-container',
            )}
          >
            <ErrorIcon />
            <MuiTypography variant="body2">
              <strong>{errorHeading || 'Video unavailable'}</strong>
            </MuiTypography>
            <MuiTypography variant="body3">
              {errorBody || 'This video is blocked on your network.'}
            </MuiTypography>
          </MuiContainer>
        );
      case 'cookie-blocked':
        return (
          <MuiContainer
            className={classNames(
              moduleStyles.errorPlaceholder,
              'video-error-container',
            )}
          >
            <ErrorIcon />
            <MuiTypography variant="body2">
              <strong>{errorHeading || 'Cookie consent required'}</strong>
            </MuiTypography>
            <MuiTypography variant="body2">
              {errorBody ||
                'Please enable "Functional Cookies" and refresh the page to play this video.'}
            </MuiTypography>
            <MuiButton
              className="button--color-emphasized"
              variant="contained"
              size="small"
              sx={{marginTop: '1rem'}}
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).OneTrust.ToggleInfoDisplay();
              }}
              disableElevation
              disableRipple
            >
              Cookie Settings
            </MuiButton>
          </MuiContainer>
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
            className={classNames(
              'button--color-secondary',
              moduleStyles.download,
              'video-download-button',
            )}
            size="small"
            variant="outlined"
            href={videoFallback}
            target="_blank"
            rel="noopener noreferrer"
            disableElevation
            disableRipple
          >
            <DownloadIcon fontSize="small" />
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
