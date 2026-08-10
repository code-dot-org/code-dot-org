import {requestEvaluation} from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/requestEvaluation';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn()},
}));

const post = HttpClient.post as jest.Mock;

describe('requestEvaluation', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('posts to the evaluate endpoint', async () => {
    post.mockResolvedValue({});

    await requestEvaluation(7);

    expect(post).toHaveBeenCalledWith(
      '/challenge_responses/7/evaluate',
      '',
      true
    );
  });

  it('swallows request failures (fire-and-forget)', async () => {
    post.mockRejectedValue(new Error('network'));
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(requestEvaluation(7)).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
