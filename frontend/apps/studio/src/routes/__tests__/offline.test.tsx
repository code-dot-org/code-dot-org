import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {fetchAuthOutcome} from '@/modules/auth';
import router from '@/modules/router';

vi.mock('@/modules/auth', async importOriginal => {
  const original = await importOriginal<typeof import('@/modules/auth')>();
  return {
    ...original,
    fetchAuthOutcome: vi.fn(async () => ({status: 'signed-out'})),
    primeCsrfToken: vi.fn(async () => undefined),
  };
});

const COURSE = 'https://studio.code.org/courses/express-2025/units/1';
const HOME = 'https://studio.code.org/codeai-app/home';

function renderApp(initialEntries: string[]): void {
  const testRouter = createRouter({
    routeTree: router.routeTree,
    basepath: '/',
    history: createMemoryHistory({initialEntries}),
  });
  render(<RouterProvider router={testRouter} />);
}

function offlineAt(url: string): string {
  return `/offline?url=${encodeURIComponent(url)}`;
}

describe('/offline in the mobile build', () => {
  const location = {replace: vi.fn(), assign: vi.fn()};

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('MODE', 'mobile');
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      ...location,
    });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should explain the problem without any Rails call', async () => {
    renderApp([offlineAt(COURSE)]);
    expect(
      await screen.findByRole('heading', {name: 'No internet connection'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Check that Wi-Fi is on, or ask a grown-up for help.',
    );
    expect(fetchAuthOutcome).not.toHaveBeenCalled();
  });

  it('should retry the page it stands in for', async () => {
    renderApp([offlineAt(COURSE)]);
    await userEvent.click(
      await screen.findByRole('button', {name: 'Try again'}),
    );
    expect(location.replace).toHaveBeenCalledWith(COURSE);
  });

  it('should retry when the tablet reconnects', async () => {
    renderApp([offlineAt(COURSE)]);
    await screen.findByRole('button', {name: 'Try again'});
    window.dispatchEvent(new Event('online'));
    expect(location.replace).toHaveBeenCalledWith(COURSE);
  });

  it('should go home from Back to curricula', async () => {
    renderApp([offlineAt(COURSE)]);
    await userEvent.click(
      await screen.findByRole('button', {name: 'Back to curricula'}),
    );
    expect(location.assign).toHaveBeenCalledWith(HOME);
  });

  it('should not retry a page outside studio.code.org', async () => {
    renderApp([offlineAt('https://example.com/')]);
    await userEvent.click(
      await screen.findByRole('button', {name: 'Try again'}),
    );
    expect(location.replace).toHaveBeenCalledWith(HOME);
  });
});

describe('/offline in a web build', () => {
  it('should be not found', async () => {
    renderApp([offlineAt(COURSE)]);
    expect(await screen.findByText('Not Found')).toBeInTheDocument();
  });
});
