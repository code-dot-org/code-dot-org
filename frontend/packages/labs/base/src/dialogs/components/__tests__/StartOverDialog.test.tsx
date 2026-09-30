import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import StartOverDialog from '../StartOverDialog';

let appName: string | undefined;
vi.mock('../../../contexts/AppContext', () => ({
  useApp: () => ({lab: {levelProperties: {appName}}}),
}));
// What is under test is the message chosen, not the modal around it.
vi.mock('../GenericDialog', () => ({
  default: ({message}: {message?: string}) => <p>{message}</p>,
}));

describe('StartOverDialog', () => {
  it("shows the caller's message over the lab's", () => {
    appName = 'aichat';
    render(
      <StartOverDialog onConfirm={vi.fn()} message="Your images go too." />,
    );
    expect(screen.getByText('Your images go too.')).toBeTruthy();
  });

  it("falls back to the lab's message", () => {
    appName = 'aichat';
    render(<StartOverDialog onConfirm={vi.fn()} />);
    expect(screen.getByText(/model customizations/)).toBeTruthy();
  });

  it('falls back to the blocks message for any other lab', () => {
    appName = 'spritelab';
    render(<StartOverDialog onConfirm={vi.fn()} />);
    expect(screen.getByText(/remove all the blocks/)).toBeTruthy();
  });
});
