// Show New tag if the content was published within the last 3 months
export const showNewTag = (publishedDate: string) => {
  if (!publishedDate) return false;

  // Get the content entry publishedDate from Contentful
  const contentPublished = new Date(publishedDate);

  // Get the date 3 months from the publishedDate
  const threeMonthsLater = new Date(contentPublished);
  threeMonthsLater.setMonth(contentPublished.getMonth() + 3);

  // Get the current date
  const currentDate = new Date();

  // Check if the current date is within the range of publishedDate and three months later
  return currentDate >= contentPublished && currentDate <= threeMonthsLater;
};
