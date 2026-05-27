/** Counts where the announcement adds a celebratory suffix. Exact-match: fires once per session. */
export const TRAINING_MILESTONES: Record<number, string> = {
  10: 'Good start.',
  25: 'Keep going.',
  50: 'Great work.',
  100: "You're doing excellent.",
  150: 'Outstanding progress.',
  200: 'Incredible effort.',
};

/** "1 item classified" vs "5 items classified". Shared by badge aria-label and announcement. */
export const formatItemsClassified = (total: number): string =>
  `${total} ${total === 1 ? 'item' : 'items'} classified`;

/** Polite post-classify announcement; appends milestone suffix at threshold. */
export const buildClassificationAnnouncement = (total: number): string => {
  const milestone = TRAINING_MILESTONES[total];
  return milestone
    ? `${formatItemsClassified(total)}. ${milestone}`
    : `${formatItemsClassified(total)}.`;
};
