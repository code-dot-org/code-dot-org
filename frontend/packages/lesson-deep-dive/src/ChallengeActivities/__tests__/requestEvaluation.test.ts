import {type Mock, vi} from 'vitest';

import {requestEvaluation} from '../requestEvaluation';

const request: Mock = vi.fn();
const transport = {request, requestBlob: vi.fn(), requestWithMeta: vi.fn()};

describe('requestEvaluation', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('posts to the evaluate endpoint', async () => {
    request.mockResolvedValue({});

    await expect(requestEvaluation(transport, 7)).resolves.toBe('pending');

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/challenge_responses/7/evaluate',
    });
  });

  it('swallows request failures (fire-and-forget)', async () => {
    request.mockRejectedValue(new Error('network'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(requestEvaluation(transport, 7)).resolves.toBe('error');

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
