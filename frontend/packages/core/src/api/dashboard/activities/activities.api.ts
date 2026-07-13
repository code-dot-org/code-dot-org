import type {Transport} from '../../transports/types';

export const createActivitiesApi = (transport: Transport) => ({
  async reportMilestone(params: {
    userId: number;
    scriptLevelId: string;
    levelId: number;
    result: boolean;
    testResult?: number;
  }) {
    const {userId, scriptLevelId, levelId, result, testResult} = params;
    await transport.request({
      method: 'POST',
      url: `/milestone/${userId}/${scriptLevelId}/${levelId}`,
      body: {
        result: String(result),
        testResult: testResult ?? 100,
      },
    });
  },
});
