import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@code-dot-org/core/plugins/analytics', () => ({sendEvent: vi.fn()}));

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';
import {sendEvent} from '@code-dot-org/core/plugins/analytics';

import UnlinkLmsAccountModal from '../UnlinkLmsAccountModal';

function renderModal() {
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <UnlinkLmsAccountModal
        open
        onClose={() => {}}
        lmsName="Canvas"
        authenticationOptionId={42}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('UnlinkLmsAccountModal analytics', () => {
  it('reports the unlink confirmation before the request is sent', async () => {
    let sentBeforeRequest = false;
    let requested = false;
    mockServer.use(
      http.post('*/lti/v1/account_linking/unlink', () => {
        sentBeforeRequest = vi.mocked(sendEvent).mock.calls.length === 1;
        requested = true;
        // A failure keeps the dialog from navigating away.
        return new HttpResponse(null, {status: 404});
      }),
    );
    renderModal();

    fireEvent.click(screen.getByRole('button', {name: 'Unlink account'}));

    await waitFor(() => expect(requested).toBe(true));
    expect(sentBeforeRequest).toBe(true);
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith('lti_unlink_click', {
      lms_name: 'Canvas',
    });
  });

  it('reports the cancellation', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith('lti_unlink_cancel', {
      lms_name: 'Canvas',
    });
  });
});
