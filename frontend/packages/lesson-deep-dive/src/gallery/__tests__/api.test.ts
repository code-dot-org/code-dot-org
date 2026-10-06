import {type Mock, describe, expect, it, vi} from 'vitest';

import {setApproved} from '../api';

const makeTransport = () => {
  const request: Mock = vi.fn();
  return {transport: {request}, request};
};

describe('setApproved', () => {
  it('sends a PATCH to the approve endpoint with approved: true', async () => {
    const {transport, request} = makeTransport();
    request.mockResolvedValue({});

    await setApproved(transport, 42, true);

    expect(request).toHaveBeenCalledWith({
      method: 'PATCH',
      url: '/challenge_responses/42/approve',
      body: {approved: true},
    });
  });

  it('sends approved: false when disabling visibility', async () => {
    const {transport, request} = makeTransport();
    request.mockResolvedValue({});

    await setApproved(transport, 99, false);

    expect(request).toHaveBeenCalledWith({
      method: 'PATCH',
      url: '/challenge_responses/99/approve',
      body: {approved: false},
    });
  });
});
