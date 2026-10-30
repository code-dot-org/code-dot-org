import {z} from 'zod';

// Matches Video#summarize(false) in dashboard/app/models/video.rb.
// Level#summarize_for_lab2_properties camelCases it onto levelData.
export const VideoLevelDataSchema = z.object({
  src: z.string(),
  key: z.string().optional(),
  name: z.string().optional(),
  download: z.string().optional(),
  thumbnail: z.string().optional(),
  enableFallback: z.boolean().optional(),
  autoplay: z.boolean().optional(),
});
