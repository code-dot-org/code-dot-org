/**
 * @vitest-environment jsdom
 */

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {PageFlashMessage} from '../getPageFlash';

const {mockGetPageFlash, location} = vi.hoisted(() => ({
  mockGetPageFlash: vi.fn(),
  location: {pathname: '/users/edit'},
}));

vi.mock('../getPageFlash', () => ({getPageFlash: mockGetPageFlash}));

vi.mock('@tanstack/react-router', () => ({
  useLocation: ({select}: {select: (l: typeof location) => string}) =>
    select(location),
}));

// The component keeps page-load state at module level, so each test imports
// a fresh module.
async function importPageFlash(flash: PageFlashMessage[]) {
  mockGetPageFlash.mockReturnValue(flash);
  vi.resetModules();
  const {default: PageFlash} = await import('../index');
  return PageFlash;
}

describe('PageFlash', () => {
  beforeEach(() => {
    location.pathname = '/users/edit';
  });

  it('should render a danger alert with role alert when the type is alert', async () => {
    const PageFlash = await importPageFlash([
      {type: 'alert', message: 'Failed'},
    ]);

    render(<PageFlash />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Failed');
    expect(alert.className).toMatch(/alert-danger/);
  });

  it('should render a success status when the type is notice', async () => {
    const PageFlash = await importPageFlash([
      {type: 'notice', message: 'Linked'},
    ]);

    render(<PageFlash />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Linked');
    expect(status.className).toMatch(/alert-success/);
  });

  it('should render an info status when the type is info', async () => {
    const PageFlash = await importPageFlash([{type: 'info', message: 'FYI'}]);

    render(<PageFlash />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('FYI');
    expect(status.className).toMatch(/alert-info/);
  });

  it('should remove only the dismissed alert when its close control is activated', async () => {
    const PageFlash = await importPageFlash([
      {type: 'notice', message: 'Linked'},
      {type: 'alert', message: 'Failed'},
    ]);
    render(<PageFlash />);

    await userEvent.click(
      screen.getAllByRole('button', {name: 'Close alert'})[0],
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  });

  it('should keep a dismissal when the component remounts', async () => {
    const PageFlash = await importPageFlash([
      {type: 'notice', message: 'Linked'},
    ]);
    const {unmount} = render(<PageFlash />);
    await userEvent.click(screen.getByRole('button', {name: 'Close alert'}));
    unmount();

    render(<PageFlash />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should remove every alert when the pathname changes', async () => {
    const PageFlash = await importPageFlash([
      {type: 'notice', message: 'Linked'},
      {type: 'alert', message: 'Failed'},
    ]);
    const {rerender} = render(<PageFlash />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    location.pathname = '/courses';
    rerender(<PageFlash />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should stay hidden when the pathname returns to the one that loaded it', async () => {
    const PageFlash = await importPageFlash([
      {type: 'notice', message: 'Linked'},
    ]);
    const {rerender} = render(<PageFlash />);
    location.pathname = '/courses';
    rerender(<PageFlash />);

    location.pathname = '/users/edit';
    rerender(<PageFlash />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should render nothing when it remounts on another pathname', async () => {
    const PageFlash = await importPageFlash([
      {type: 'alert', message: 'Failed'},
    ]);
    const {unmount} = render(<PageFlash />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    unmount();

    location.pathname = '/courses';
    render(<PageFlash />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render nothing when there is no page flash', async () => {
    const PageFlash = await importPageFlash([]);

    const {container} = render(<PageFlash />);

    expect(container).toBeEmptyDOMElement();
  });
});
