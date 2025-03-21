export type RenderState = 'youtube' | 'native' | 'error';

export interface VideoProps {
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
