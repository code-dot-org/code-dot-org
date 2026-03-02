import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import NetworkPanel from '@cdo/apps/weblab2/debugPanel/NetworkPanel';
import networkReducer, {
  addRequestData,
  addResponseData,
} from '@cdo/apps/weblab2/redux/networkRedux';

// Helpers matching the Redux action payload shapes.
function makeRequest(
  id: string,
  url: string,
  overrides: {
    method?: string;
    startTime?: string;
    cspDirectiveViolated?: string;
  } = {}
) {
  return {
    id,
    request: {method: 'GET', url, startTime: '10:00:00', ...overrides},
  };
}

function makeResponse(
  id: string,
  url: string,
  status: number,
  extras: {timeElapsed?: number; body?: string; contentType?: string} = {}
) {
  return {id, response: {url, status, ...extras}};
}

describe('NetworkPanel', () => {
  let store: Store;

  beforeEach(() => {
    // jsdom does not implement scrollIntoView; mock it to avoid errors from
    // NetworkRequestChip's scroll-selected-chip-into-view effect.
    Element.prototype.scrollIntoView = jest.fn();

    stubRedux();
    registerReducers({weblab2Network: networkReducer});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderPanel() {
    return render(
      <Provider store={store}>
        <NetworkPanel />
      </Provider>
    );
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  describe('empty state', () => {
    it('shows a placeholder when there are no network requests', () => {
      renderPanel();
      expect(document.body.textContent).toContain('No network activity');
      expect(document.body.textContent).toContain(
        'Network requests will appear here when your app makes API calls.'
      );
    });

    it('does not show the Activity section when empty', () => {
      renderPanel();
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Request list
  // ---------------------------------------------------------------------------

  describe('request list', () => {
    it('shows the Activity header and a chip when a request exists', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      renderPanel();
      expect(document.body.textContent).toContain('Activity');
      expect(screen.getByRole('radio', {name: 'data'})).toBeInTheDocument();
    });

    it('renders a chip for each request', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/users'))
      );
      store.dispatch(
        addRequestData(makeRequest('2', 'https://api.example.com/posts'))
      );
      renderPanel();
      expect(screen.getByRole('radio', {name: 'users'})).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: 'posts'})).toBeInTheDocument();
    });

    it('uses the hostname as the chip label when the URL has no path segment', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com'))
      );
      renderPanel();
      expect(
        screen.getByRole('radio', {name: 'api.example.com'})
      ).toBeInTheDocument();
    });

    it('shows "Newest first" sort button by default', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      renderPanel();
      expect(
        screen.getByRole('button', {name: /Newest first/})
      ).toBeInTheDocument();
    });

    it('toggles to "Oldest first" when the sort button is clicked', async () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      renderPanel();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', {name: /Newest first/}));
      expect(
        screen.getByRole('button', {name: /Oldest first/})
      ).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Request details
  // ---------------------------------------------------------------------------

  describe('request details', () => {
    it('auto-selects the newest request and shows its method, URL, and start time', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/users'))
      );
      store.dispatch(
        addRequestData(
          makeRequest('2', 'https://api.example.com/posts', {
            method: 'POST',
            startTime: '11:30:00',
          })
        )
      );
      renderPanel();
      // Newest request (id=2) should be auto-selected.
      expect(document.body.textContent).toContain('POST');
      expect(document.body.textContent).toContain(
        'https://api.example.com/posts'
      );
      expect(document.body.textContent).toContain('11:30:00');
    });

    it('shows the error message with the blocked domain for a CSP violation', () => {
      store.dispatch(
        addRequestData(
          makeRequest('1', 'https://evil.com/api', {
            cspDirectiveViolated: 'connect-src',
          })
        )
      );
      renderPanel();
      expect(document.body.textContent).toContain(
        'https://evil.com is not in our list of available APIs.'
      );
    });

    it('shows the request failure divider icon for a CSP violation', () => {
      store.dispatch(
        addRequestData(
          makeRequest('1', 'https://evil.com/api', {
            cspDirectiveViolated: 'connect-src',
          })
        )
      );
      renderPanel();
      expect(screen.getByAltText('Request failure')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Response state
  // ---------------------------------------------------------------------------

  describe('response state', () => {
    it('shows the pending divider when no response has been received yet', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      renderPanel();
      expect(
        screen.getByAltText('Request success, response pending')
      ).toBeInTheDocument();
    });

    it('shows the success divider and response details for a 2xx response', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      store.dispatch(
        addResponseData(
          makeResponse('1', 'https://api.example.com/data', 200, {
            timeElapsed: 123,
          })
        )
      );
      renderPanel();
      expect(
        screen.getByAltText('Request and response success')
      ).toBeInTheDocument();
      expect(document.body.textContent).toContain('200');
      expect(document.body.textContent).toContain('123 ms');
    });

    it('shows the response failure divider and error message for a 4xx response', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      store.dispatch(
        addResponseData(makeResponse('1', 'https://api.example.com/data', 404))
      );
      renderPanel();
      expect(screen.getByAltText('Response failure')).toBeInTheDocument();
      expect(document.body.textContent).toContain(
        'Response failed with status code 404'
      );
    });

    it('does not show response detail fields for a CSP-blocked request', () => {
      store.dispatch(
        addRequestData(
          makeRequest('1', 'https://evil.com/api', {
            cspDirectiveViolated: 'connect-src',
          })
        )
      );
      renderPanel();
      // The response DetailsBox (with its "Status" / "Duration" labels) should
      // not be shown when showResponseDetails is false.
      expect(document.body.textContent).not.toContain('Duration');
    });
  });

  // ---------------------------------------------------------------------------
  // Response body display
  // ---------------------------------------------------------------------------

  describe('response body display', () => {
    it('shows the raw body text for text/* content type', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      store.dispatch(
        addResponseData(
          makeResponse('1', 'https://api.example.com/data', 200, {
            contentType: 'text/plain',
            body: 'Hello, world!',
          })
        )
      );
      renderPanel();
      expect(document.body.textContent).toContain('Hello, world!');
    });

    it('pretty-prints JSON for application/json content type', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      store.dispatch(
        addResponseData(
          makeResponse('1', 'https://api.example.com/data', 200, {
            contentType: 'application/json',
            body: '{"name":"Alice","age":30}',
          })
        )
      );
      renderPanel();
      // Formatted JSON has spaces; the raw minified string should not appear.
      expect(document.body.textContent).toContain('"name": "Alice"');
      expect(document.body.textContent).not.toContain(
        '{"name":"Alice","age":30}'
      );
    });

    it('pretty-prints JSON for application/geo+json content type', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      store.dispatch(
        addResponseData(
          makeResponse('1', 'https://api.example.com/data', 200, {
            contentType: 'application/geo+json',
            body: '{"name":"Alice","age":30}',
          })
        )
      );
      renderPanel();
      // Formatted JSON has spaces; the raw minified string should not appear.
      expect(document.body.textContent).toContain('"name": "Alice"');
      expect(document.body.textContent).not.toContain(
        '{"name":"Alice","age":30}'
      );
    });

    it('shows a "cannot display" message for unrecognized content types', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      store.dispatch(
        addResponseData(
          makeResponse('1', 'https://api.example.com/data', 200, {
            contentType: 'image/png',
            body: 'binary-data',
          })
        )
      );
      renderPanel();
      expect(document.body.textContent).toContain(
        'Cannot display response data of type image/png'
      );
    });

    it('shows a dash for response data when the response has no body', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      store.dispatch(
        addResponseData(makeResponse('1', 'https://api.example.com/data', 200))
      );
      renderPanel();
      // Navigate from the label to the value <pre> inside the same field
      // container.
      const [labelEl] = screen.getAllByText('Response Data');
      const valueEl = labelEl
        .closest('.ui-test-details-field')
        ?.querySelector('pre');
      expect(valueEl?.textContent?.trim()).toBe('-');
    });
  });

  // ---------------------------------------------------------------------------
  // Request selection
  // ---------------------------------------------------------------------------

  describe('request selection', () => {
    it('shows details for the newly selected request when a chip is clicked', async () => {
      store.dispatch(
        addRequestData(
          makeRequest('1', 'https://api.example.com/users', {method: 'GET'})
        )
      );
      store.dispatch(
        addRequestData(
          makeRequest('2', 'https://api.example.com/posts', {method: 'POST'})
        )
      );
      renderPanel();
      const user = userEvent.setup();

      // Newest-first default: posts (id=2, POST) is auto-selected.
      expect(document.body.textContent).toContain('POST');

      // Click the users chip (id=1).
      await user.click(screen.getByRole('radio', {name: 'users'}));

      expect(document.body.textContent).toContain(
        'https://api.example.com/users'
      );
    });

    it('updates the view when a response arrives for the selected request', () => {
      store.dispatch(
        addRequestData(makeRequest('1', 'https://api.example.com/data'))
      );
      renderPanel();

      // Initially pending.
      expect(
        screen.getByAltText('Request success, response pending')
      ).toBeInTheDocument();

      // Response arrives while the request is selected.
      act(() => {
        store.dispatch(
          addResponseData(
            makeResponse('1', 'https://api.example.com/data', 201)
          )
        );
      });

      expect(
        screen.getByAltText('Request and response success')
      ).toBeInTheDocument();
    });
  });
});
