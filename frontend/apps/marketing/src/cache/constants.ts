// Stale while revalidate, fresh for an hour, continue serving stale up to one year
export const STALE_WHILE_REVALIDATE_ONE_HOUR =
  's-maxage=3600, stale-while-revalidate=31535100';
