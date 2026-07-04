// F0-T13 (react-reviewer SHOULD-FIX): DevApp's dev-chrome composition was
// untested — the scenario selector must show by default and hide under
// ?devChrome=off. DevApp owns its own QueryClientProvider internally (no
// prop to inject one), so these tests render it directly; the sections
// fetch it triggers resolves against the default MSW fixture registered in
// sections.handlers.ts, no retry tuning needed.

import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';

import DevApp from '../DevApp';

function setUrl(search: string) {
  window.history.pushState({}, '', search);
}

afterEach(() => setUrl('/'));

describe('DevApp devChrome composition (F0-T13)', () => {
  it('shows the scenario selector at the default URL', async () => {
    setUrl('/');
    render(<DevApp />);
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
  });

  it('hides the scenario selector under ?devChrome=off', () => {
    setUrl('/?devChrome=off');
    render(<DevApp />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
