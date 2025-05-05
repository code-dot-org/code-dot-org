// Show a 'New' tag if the content was published in the last 3 months
export const showNewTag = (publishedDate: string) => {
  if (!publishedDate) return false;

  // Get the content entry publishedDate from Contentful
  const contentPublished = new Date(publishedDate);
  // Get the current date
  const now = new Date();
  // Get the date 3 months ago from the current date
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  return contentPublished >= threeMonthsAgo && contentPublished <= now;
};
