/** "1 item classified" vs "5 items classified". Shared by badge aria-label and announcement. */
export const formatItemsClassified = (total: number): string =>
  `${total} ${total === 1 ? 'item' : 'items'} classified`;

/** Polite post-classify announcement for the SR live region. */
export const buildClassificationAnnouncement = (total: number): string =>
  `${formatItemsClassified(total)}.`;
