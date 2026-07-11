import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {afterEach, vi} from 'vitest';

import {localization} from '@code-dot-org/core/plugins/localization';

import {server} from '../../dev/msw/server';
import {CertificateSharePage, downloadBlob} from '../pages/SharePage';

const mayaEncodedParams =
  'eyJuYW1lIjoiTWF5YSDXqdec15XXnSIsImNvdXJzZSI6Im9jZWFucyIsImRvbm9yIjoiQ29kZS5vcmcifQ==';

// Favicon reachability probes resolve immediately so social buttons render.
class AutoLoadImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = '';
  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('renders the certificate canvas plus the real-text name and course', async () => {
  render(<CertificateSharePage encodedParams={mayaEncodedParams} />);

  await waitFor(() =>
    expect(
      screen.getByRole('img', {
        name: 'Maya שלום certificate of completion for AI for Oceans',
      }),
    ).toBeVisible(),
  );

  const nameText = screen.getByText('Maya שלום');
  expect(nameText).toBeVisible();
  expect(nameText).toHaveAttribute('data-notranslate');
  expect(screen.getByRole('button', {name: 'Download'})).toBeVisible();
  expect(screen.getByRole('button', {name: 'Share'})).toBeVisible();
});

it('renders an error state, never a blank certificate, on undecodable params', async () => {
  render(<CertificateSharePage encodedParams="%%%not-base64%%%" />);

  expect(
    await screen.findByText(/This certificate link is invalid/),
  ).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', {name: 'Download'}),
  ).not.toBeInTheDocument();
});

it('personalizes client-side without a session id', async () => {
  render(<CertificateSharePage encodedParams={btoa('{"course":"oceans"}')} />);

  await screen.findByRole('button', {name: 'Submit'});
  fireEvent.change(screen.getByPlaceholderText('Your name'), {
    target: {value: 'Ada Lovelace'},
  });
  fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

  expect(await screen.findByText('Thanks for submitting!')).toBeVisible();
  expect(screen.getByText('Ada Lovelace')).toHaveAttribute('data-notranslate');
});

it('shows the account-name alert and disables actions on PL without a name', async () => {
  server.use(
    http.get('*/api/v1/certificates/user_info', () =>
      HttpResponse.json({
        csrfToken: 'csrf-token',
        under13: false,
        userName: null,
        userType: 'teacher',
      }),
    ),
  );

  render(
    <CertificateSharePage encodedParams={btoa('{"course":"self-paced-pl"}')} />,
  );

  expect(
    await screen.findByText(/add your full name to your account/),
  ).toBeVisible();
  expect(
    screen.getByRole('link', {name: 'Go to account settings'}),
  ).toHaveAttribute('href', '/users/edit');
  await waitFor(() =>
    expect(screen.getByRole('button', {name: 'Download'})).toBeDisabled(),
  );
  expect(
    screen.queryByRole('button', {name: 'Submit'}),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('link', {name: 'Share to Facebook'}),
  ).not.toBeInTheDocument();
});

it('renders social share links for adults', async () => {
  vi.stubGlobal('Image', AutoLoadImage);
  render(<CertificateSharePage encodedParams={mayaEncodedParams} />);

  const facebook = await screen.findByRole('link', {
    name: 'Share to Facebook',
  });
  expect(facebook.getAttribute('href')).toContain(
    'facebook.com/sharer/sharer.php?u=',
  );
  const twitter = await screen.findByRole('link', {name: 'Share to Twitter'});
  expect(twitter.getAttribute('href')).toContain('related=codeorg');
  // LinkedIn is PL-only.
  expect(
    screen.queryByRole('link', {name: 'Share to LinkedIn'}),
  ).not.toBeInTheDocument();
  // Print is an in-place dialog, not a navigation.
  const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
  screen.getByRole('button', {name: 'Print'}).click();
  expect(printSpy).toHaveBeenCalledTimes(1);
  printSpy.mockRestore();
});

it('hides all social share links for under-13 users', async () => {
  vi.stubGlobal('Image', AutoLoadImage);
  server.use(
    http.get('*/api/v1/certificates/user_info', () =>
      HttpResponse.json({
        csrfToken: 'csrf-token',
        under13: true,
        userName: null,
        userType: 'student',
      }),
    ),
  );

  render(<CertificateSharePage encodedParams={mayaEncodedParams} />);

  // Print renders regardless; social buttons must not.
  await screen.findByRole('button', {name: 'Print'});
  expect(
    screen.queryByRole('link', {name: 'Share to Facebook'}),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('link', {name: 'Share to Twitter'}),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('link', {name: 'Share to LinkedIn'}),
  ).not.toBeInTheDocument();
});

it('fetches a CSRF token before PATCHing HOC personalization', async () => {
  let csrfHeader: string | null = null;
  server.use(
    http.patch('*/api/hour/certificates/:sessionId', async ({request}) => {
      csrfHeader = request.headers.get('X-CSRF-Token');
      const body = (await request.json()) as {name: string};
      return HttpResponse.json({certificate_sent: true, name: body.name});
    }),
  );

  render(
    <CertificateSharePage
      encodedParams={btoa('{"course":"oceans"}')}
      sessionId="hoc-session"
    />,
  );

  await screen.findByRole('button', {name: 'Submit'});
  fireEvent.change(screen.getByPlaceholderText('Your name'), {
    target: {value: 'Ada Lovelace'},
  });
  fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

  expect(await screen.findByText('Thanks for submitting!')).toBeVisible();
  expect(csrfHeader).toBe('test-csrf-token');
});

it('personalizes a non-HOC certificate locally even with a session id', async () => {
  const patchRequest = vi.fn();
  server.use(
    http.patch('*/api/hour/certificates/:sessionId', () => {
      patchRequest();
      return HttpResponse.json({certificate_sent: true});
    }),
  );

  render(
    <CertificateSharePage
      encodedParams={btoa('{"course":"coursea-2025"}')}
      sessionId="non-hoc-session"
    />,
  );

  await screen.findByRole('button', {name: 'Submit'});
  fireEvent.change(screen.getByPlaceholderText('Your name'), {
    target: {value: 'Grace Hopper'},
  });
  fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

  expect(await screen.findByText('Thanks for submitting!')).toBeVisible();
  expect(patchRequest).not.toHaveBeenCalled();
});

it('uses the LocalizeJS translation in the Twitter share URL', async () => {
  vi.stubGlobal('Image', AutoLoadImage);
  vi.spyOn(localization, 'translate').mockReturnValue('Localized share text');

  render(<CertificateSharePage encodedParams={mayaEncodedParams} />);

  const twitter = await screen.findByRole('link', {name: 'Share to Twitter'});
  expect(
    new URL(twitter.getAttribute('href') || '').searchParams.get('text'),
  ).toBe('Localized share text');
});

it('attaches downloads before clicking and defers object URL cleanup', () => {
  vi.useFakeTimers();
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(function (this: HTMLAnchorElement) {
      expect(document.body).toContainElement(this);
    });
  const revokeObjectURL = vi.fn();
  vi.stubGlobal('URL', {
    createObjectURL: () => 'blob:certificate',
    revokeObjectURL,
  });

  downloadBlob(new Blob(['certificate']), 'certificate.jpg');

  expect(click).toHaveBeenCalledOnce();
  expect(revokeObjectURL).not.toHaveBeenCalled();
  vi.runAllTimers();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:certificate');
});
