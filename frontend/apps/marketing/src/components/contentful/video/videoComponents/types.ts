export type RenderState =
  | 'facade'
  | 'youtube'
  | 'native'
  | 'error'
  | 'cookie-blocked';

export interface VideoProps {
  /** Video title */
  videoTitle?: string;
  /** Video description */
  videoDesc?: string;
  /** Video YouTube ID */
  youTubeId?: string;
  /** Video fallback */
  videoFallback?: string;
  /** Show caption */
  showCaption?: boolean;
  /** Label for Download button */
  downloadLabel?: string;
  /** The date and time the video was first published, in ISO 8601 format. */
  uploadDate?: string;
  /** Error heading for placeholder  */
  errorHeading?: string;
  /** Error body for placeholder */
  errorBody?: string;
  /** Video custom className */
  className?: string;
  /** Whether YouTube is allowed by cookie policy */
  isYouTubeCookieAllowed?: boolean;
}

export interface CDOVideoPlayer {
  isYouTubeBlocked?: boolean;
  isYouTubeInjected?: boolean;
}

interface YouTube {
  Player: object;
}

declare global {
  interface Window {
    CDOVideoPlayer?: CDOVideoPlayer;
    YT?: YouTube;
  }
}
