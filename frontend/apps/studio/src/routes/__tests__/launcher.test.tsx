import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {fetchAuthOutcome, primeCsrfToken} from '@/modules/auth';
import router from '@/modules/router';

vi.mock('@/modules/auth', async importOriginal => {
  const original = await importOriginal<typeof import('@/modules/auth')>();
  return {
    ...original,
    fetchAuthOutcome: vi.fn(async () => ({status: 'signed-out'})),
    primeCsrfToken: vi.fn(async () => undefined),
  };
});

function renderApp(initialEntries: string[]): void {
  const testRouter = createRouter({
    routeTree: router.routeTree,
    basepath: '/',
    history: createMemoryHistory({initialEntries}),
  });
  render(<RouterProvider router={testRouter} />);
}

describe('/launcher in the native build', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('MODE', 'native');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('should show the launcher without any Rails call', async () => {
    renderApp(['/launcher']);
    expect(
      await screen.findByRole('heading', {level: 1, name: 'CodeAI'}),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', {name: /^Try /})).toHaveLength(22);
    expect(fetchAuthOutcome).not.toHaveBeenCalled();
    expect(primeCsrfToken).not.toHaveBeenCalled();
  });

  it('should congratulate when the app opens a finished fragment', async () => {
    renderApp(['/launcher#finished=oceans']);
    expect(
      await screen.findByRole('heading', {name: 'Congratulations!'}),
    ).toBeInTheDocument();
    expect(screen.getByText('AI for Oceans')).toBeInTheDocument();
    expect(fetchAuthOutcome).not.toHaveBeenCalled();
  });

  it('should return to the launcher from Choose another curriculum', async () => {
    renderApp(['/launcher', '/launcher#finished=oceans']);
    await userEvent.click(
      await screen.findByRole('button', {name: 'Choose another curriculum'}),
    );
    expect(
      await screen.findByRole('heading', {level: 1, name: 'CodeAI'}),
    ).toBeInTheDocument();
    expect(fetchAuthOutcome).not.toHaveBeenCalled();
  });
});

describe('/launcher in a web build', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should be not found', async () => {
    renderApp(['/launcher']);
    expect(await screen.findByText('Not Found')).toBeInTheDocument();
  });

  it('should still run auth and CSRF priming for a Rails-backed route', async () => {
    renderApp(['/']);
    expect(await screen.findByText('Hello "/"!')).toBeInTheDocument();
    expect(fetchAuthOutcome).toHaveBeenCalledOnce();
    expect(primeCsrfToken).toHaveBeenCalledOnce();
  });
});
