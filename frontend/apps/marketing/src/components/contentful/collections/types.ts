export type CollectionProps = {
  /** Sort order */
  sortOrder: 'alphabetical' | 'manual';
  /** Hide images */
  hideImages: boolean;
  /** Hide secondary button (action blocks and cards) */
  hideSecondaryButton?: boolean;
  /** Custom classname */
  className?: string;
};
