import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import Launchpad from '@/modules/launchpad/Launchpad';

const {open, native} = vi.hoisted(() => ({open: vi.fn(), native: vi.fn()}));
vi.mock('@capacitor/core', () => ({Capacitor: {isNativePlatform: native}}));
vi.mock('@/modules/launchpad/openActivity', () => ({openActivity: open}));

describe('Launchpad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    native.mockReturnValue(true);
    open.mockResolvedValue(undefined);
  });
  afterEach(cleanup);

  it('should offer the five selected Exhibit A activities', () => {
    render(<Launchpad />);
    expect(
      screen.getByRole('heading', {level: 1, name: 'Choose an activity'}),
    ).toBeVisible();
    expect(screen.getAllByRole('link')).toHaveLength(5);
    for (const title of [
      'Pre-Reader Express',
      'AI for Oceans',
      'Dance Party: AI Edition',
      'Minecraft Adventurer',
      'Music Lab',
    ]) {
      expect(screen.getByRole('link', {name: `Start ${title}`})).toBeVisible();
    }
  });

  it('should prevent overlapping launches and restore focus after returning Home', async () => {
    let close: (() => void) | undefined;
    open.mockReturnValue(
      new Promise<void>(resolve => {
        close = resolve;
      }),
    );
    render(<Launchpad />);
    const trigger = screen.getByRole('link', {name: 'Start AI for Oceans'});
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(open).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', {name: 'Start Music Lab'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    close?.();
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should report an opening failure and allow another attempt', async () => {
    open.mockRejectedValueOnce(new Error('Native view unavailable'));
    render(<Launchpad />);
    const trigger = screen.getByRole('link', {
      name: 'Start Minecraft Adventurer',
    });
    fireEvent.click(trigger);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please try again',
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    fireEvent.click(trigger);
    await waitFor(() => expect(open).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should provide ordinary course links and explain containment limits in browser preview', () => {
    native.mockReturnValue(false);
    render(<Launchpad />);
    expect(screen.getByText(/Browser preview/)).toBeVisible();
    const link = screen.getByRole('link', {name: 'Start AI for Oceans'});
    expect(link).toHaveAttribute('href', 'https://studio.code.org/s/oceans');
    expect(link).toHaveAttribute('target', '_blank');
    fireEvent.click(link);
    expect(open).not.toHaveBeenCalled();
  });
});
