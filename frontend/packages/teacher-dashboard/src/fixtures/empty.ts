import type {z} from 'zod';

import type {SectionListSummarySchema} from '@code-dot-org/core/api';

/**
 * GET /api/v1/sections → 200 `[]` — a teacher with zero sections
 * (TD-HOME-EMPTY). Shaped to satisfy `SectionListSummarySchema`.
 */
export const emptySections: z.input<typeof SectionListSummarySchema>[] = [];
