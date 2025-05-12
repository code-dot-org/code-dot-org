// Shows a "New" tag on Action Blocks with content that was published in the last 3 months.
export const showNewTag = (publishedDate: string) => {
  if (!publishedDate) return false;

  // Uses the "publishedDate" field from Contentful
  const contentPublished = new Date(publishedDate);

  // Get today's date
  const now = new Date();

  // Get the date from 3 months ago
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // If the date is invalid (ex: Feb 31), set it to the last day of the previous month
  if (threeMonthsAgo.getDate() !== now.getDate()) {
    threeMonthsAgo.setDate(0);
  }

  return contentPublished >= threeMonthsAgo && contentPublished <= now;
};
