import type {Transport} from '../../transports/types';

export interface ReportMilestoneParams {
  // A required segment of the route that the controller never reads;
  // identity comes from the session.
  userId: number;
  scriptLevelId: string | number;
  levelId: number;
  result: boolean;
  testResult?: number;
  app?: string;
  program?: string;
  submitted?: boolean;
  /** Milliseconds; the server stores it as UserLevel#time_spent. */
  timeSinceLastMilestone?: number;
  /** Sets UserLevel#unit_group_id. */
  courseId?: number;
}

export const createActivitiesApi = (transport: Transport) => ({
  /**
   * POST /milestone/:user_id/:script_level_id/:level_id
   *
   * The controller compares `result` and `submitted` against the string
   * 'true', so both are sent as strings.
   */
  async reportMilestone(params: ReportMilestoneParams) {
    const {
      userId,
      scriptLevelId,
      levelId,
      result,
      testResult,
      app,
      program,
      submitted,
      timeSinceLastMilestone,
      courseId,
    } = params;
    await transport.request({
      method: 'POST',
      url: `/milestone/${userId}/${scriptLevelId}/${levelId}`,
      ...(courseId !== undefined && {query: {course_id: courseId}}),
      body: {
        result: String(result),
        testResult: testResult ?? 100,
        ...(app !== undefined && {app}),
        ...(program !== undefined && {program}),
        ...(submitted !== undefined && {submitted: String(submitted)}),
        ...(timeSinceLastMilestone !== undefined && {timeSinceLastMilestone}),
      },
    });
  },
});
