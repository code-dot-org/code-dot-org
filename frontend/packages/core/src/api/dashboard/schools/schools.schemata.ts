import {z} from 'zod';

// Wire (snake_case) shape of GET /dashboardapi/v1/schoolzipsearch/:zip,
// transformed to the camelCase model callers consume.
export const SchoolZipSearchResultsSchema = z
  .array(z.object({nces_id: z.number(), name: z.string()}))
  .transform(schools =>
    schools.map(school => ({ncesId: school.nces_id, name: school.name})),
  );
