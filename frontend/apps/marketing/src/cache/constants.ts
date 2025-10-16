// Stale while revalidate, fresh for an hour, continue serving stale up to one year
export const STALE_WHILE_REVALIDATE_ONE_HOUR =
  's-maxage=3600, stale-while-revalidate=31535100';

// Stale while revalidate, fresh for a day, continue serving stale up to one year
export const STALE_WHILE_REVALIDATE_ONE_DAY =
  's-maxage=86400, stale-while-revalidate=31535100';
