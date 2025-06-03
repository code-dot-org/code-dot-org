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
