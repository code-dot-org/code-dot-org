// Can be used for components that require
// spacing props like margin or padding.
export interface SpacingProps {
  /** None */
  none: string;
  /** Extra small */
  xs: string;
  /** Small */
  s: string;
  /** Medium */
  m: string;
  /** Large */
  l: string;
}

export interface RemoveMarginBottomProps {
  /** Whether to remove the margin bottom */
  removeMarginBottom: boolean;
}

export interface VideoRelatedProps {
  /** Video URL */
  videoTitle?: string;
  /** Video Youtube ID */
  videoYouTubeId?: string;
  /** Video Fallback url */
  videoFallback?: string;
  /** Whether to show the video captions */
  videoShowCaption?: boolean;
}
