import {describe, expect, it, vi} from 'vitest';

import {generateBuildLabText} from '../ai';

describe('Build Lab generative AI requests', () => {
  it('starts a Flow Lab request and returns the completed response', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({
        backoffRate: 1,
        pollingIntervalMs: 1000,
        requestId: 42,
      })
      .mockResolvedValueOnce({
        executionStatus: 3,
        response: 'Welcome to the app!',
      });

    vi.useFakeTimers();
    try {
      const resultPromise = generateBuildLabText('  Say hello  ', 'channel-1', {
        request,
      });
      await vi.runAllTimersAsync();

      await expect(resultPromise).resolves.toBe('Welcome to the app!');
      expect(request).toHaveBeenNthCalledWith(1, {
        body: expect.objectContaining({
          aichatContext: expect.objectContaining({
            channelId: 'channel-1',
            clientType: 'flow-lab',
          }),
          newMessage: expect.objectContaining({
            chatMessageText: 'Say hello',
          }),
        }),
        method: 'POST',
        url: '/aichat_request/start_chat_completion',
      });
      expect(request).toHaveBeenNthCalledWith(2, {
        method: 'GET',
        url: '/aichat_request/chat_request/42',
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
