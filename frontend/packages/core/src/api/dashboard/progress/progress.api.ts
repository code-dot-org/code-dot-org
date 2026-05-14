import type {Transport} from '../../transports/types';

import {
  MilestoneReportSchema,
  UserProgressResponseSchema,
} from './progress.schemata';
import type {
  MilestoneReport,
  OptionalMilestoneData,
  UserProgressResponse,
} from './progress.types';

export function createProgressApi(transport: Transport) {
  return {
    /**
     * POST /milestone/:userId/:scriptLevelId/:levelId
     *
     * Reports a milestone (level result) to the dashboard. The `userId`
     * path segment is vestigial — the server uses the session cookie for
     * authentication and ignores this value, so callers commonly pass
     * `0`. Kept here for parity with the existing Rails route.
     *
     * `result: true` is always true; see `MilestoneReportSchema`.
     */
    async reportMilestone(params: {
      userId: number;
      scriptLevelId: number;
      levelId: number;
      app: string;
      testResult: number;
      extraData?: OptionalMilestoneData;
    }) {
      const {userId, scriptLevelId, levelId, app, testResult, extraData} =
        params;

      const body: MilestoneReport = MilestoneReportSchema.parse({
        app,
        result: true,
        testResult,
        ...(extraData ?? {}),
      });

      return transport.request<unknown>({
        method: 'POST',
        url: `/milestone/${userId}/${scriptLevelId}/${levelId}`,
        body,
      });
    },

    /**
     * GET /api/user_progress/:scriptName[?user_id=:userId]
     *
     * Fetches the user's progress for a script. When `userId` is
     * provided (teacher "view as" path) it's passed as a query param.
     *
     * The previous implementation in platform put `user_id` in the body
     * with no `method` set — fetch defaults to GET and most browsers
     * silently strip the body, so the userId likely never reached the
     * server. Moving to a query param so the field is actually wired up
     * if/when the dashboard endpoint starts honoring it.
     */
    async getUserProgress(params: {
      scriptName: string;
      userId?: string;
    }): Promise<UserProgressResponse> {
      const {scriptName, userId} = params;
      const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/api/user_progress/${scriptName}${query}`,
      });

      return UserProgressResponseSchema.parse(raw);
    },
  };
}
