import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import BehindTheScenes from '@cdo/apps/p5lab/spritelab/lab2/views/explore/BehindTheScenes';
import {sentPromptsFor} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/sentPrompts';

const OPTIONS = {imageType: 'sprite', style: 'pixel', pixelGrid: 64} as const;

describe('BehindTheScenes', () => {
  it('shows the prompt as sent behind the link, and closes', () => {
    render(
      <BehindTheScenes
        sent={sentPromptsFor('A cat', OPTIONS, 'pixel', false)}
      />
    );
    const info = screen.getByRole('button', {name: 'Behind the scenes'});
    expect(info.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(/^A cat\. /)).toBeNull();
    fireEvent.click(info);
    expect(info.getAttribute('aria-expanded')).toBe('true');
    const sent = screen.getByText(/^A cat\. /);
    expect(sent.textContent).toContain('pixel');
    // One picture: plain text, not a tab panel.
    expect(sent.getAttribute('role')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Close'}));
    expect(screen.queryByText(/^A cat\. /)).toBeNull();
  });

  it("shows a set's first-picture words and the shared pose words in two tabs", () => {
    render(
      <BehindTheScenes
        sent={sentPromptsFor('A dragon', OPTIONS, 'pixel', true, 'quadruped')}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Behind the scenes'}));
    expect(screen.getByRole('tab', {name: 'First picture'})).toBeTruthy();
    expect(screen.getByRole('tabpanel').textContent).toMatch(
      /^A dragon\. Show the whole character/
    );
    fireEvent.click(screen.getByRole('tab', {name: 'Other poses'}));
    const panel = screen.getByRole('tabpanel');
    expect(panel.textContent).toContain('[pose]');
    expect(panel.textContent).toContain('standing:');
    expect(panel.textContent).toContain('walking:');
    expect(panel.querySelectorAll('li')).toHaveLength(4);
  });

  it('moves between the tabs with the arrow keys', () => {
    render(
      <BehindTheScenes
        sent={sentPromptsFor('A dragon', OPTIONS, 'pixel', true, 'quadruped')}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Behind the scenes'}));
    const first = screen.getByRole('tab', {name: 'First picture'});
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, {key: 'ArrowRight'});
    expect(
      screen
        .getByRole('tab', {name: 'Other poses'})
        .getAttribute('aria-selected')
    ).toBe('true');
  });
});
