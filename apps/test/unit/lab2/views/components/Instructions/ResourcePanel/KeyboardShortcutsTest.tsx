import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import KeyboardShortcuts, {
  KeyboardShortcutCategories,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/StudentResources/KeyboardShortcuts';

const SHORTCUTS: KeyboardShortcutCategories = {
  Navigation: [{shortcut: 'Tab', explanation: 'Move focus between elements'}],
  'Move & resize': [
    {shortcut: 'Arrow keys', explanation: 'Move the focused element'},
    {shortcut: '[ / ]', explanation: 'Shrink or grow the focused shape'},
  ],
};

describe('KeyboardShortcuts', () => {
  it('renders a heading for each category', () => {
    render(<KeyboardShortcuts shortcuts={SHORTCUTS} />);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Move & resize')).toBeInTheDocument();
  });

  it('renders each shortcut key with its explanation', () => {
    render(<KeyboardShortcuts shortcuts={SHORTCUTS} />);
    expect(screen.getByText('Tab')).toBeInTheDocument();
    expect(screen.getByText('Move focus between elements')).toBeInTheDocument();
    expect(screen.getByText('Arrow keys')).toBeInTheDocument();
    expect(screen.getByText('Move the focused element')).toBeInTheDocument();
    expect(screen.getByText('[ / ]')).toBeInTheDocument();
    expect(
      screen.getByText('Shrink or grow the focused shape')
    ).toBeInTheDocument();
  });
});
