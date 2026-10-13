import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';

import router from '../router';

function renderApp(initialEntries: string[]): void {
  const testRouter = createRouter({
    routeTree: router.routeTree,
    history: createMemoryHistory({initialEntries}),
  });
  render(<RouterProvider router={testRouter} />);
}

describe('App routing', () => {
  it('should show the launcher when opening the home route', async () => {
    renderApp(['/']);
    expect(
      await screen.findByRole('heading', {level: 1, name: 'CodeAI'}),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', {name: /^Try /})).toHaveLength(22);
  });

  it('should show completion when the native app opens a finished fragment', async () => {
    renderApp(['/#finished=oceans']);
    expect(
      await screen.findByRole('heading', {name: 'Congratulations!'}),
    ).toBeInTheDocument();
    expect(screen.getByText('AI for Oceans')).toBeInTheDocument();
  });

  it('should return to the launcher when choosing another curriculum', async () => {
    renderApp(['/', '/#finished=oceans']);
    await userEvent.click(
      await screen.findByRole('button', {name: 'Choose another curriculum'}),
    );
    expect(
      await screen.findByRole('heading', {level: 1, name: 'CodeAI'}),
    ).toBeInTheDocument();
  });
});
