import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {fireEvent, render, screen, within} from '@testing-library/react';
import React from 'react';

import BehindTheScenes from '@cdo/apps/p5lab/spritelab/lab2/views/images/teaching/BehindTheScenes';
import {sentPromptsFor} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/sentPrompts';

const OPTIONS = {imageType: 'sprite', style: 'pixel', pixelGrid: 64} as const;

const renderBehind = (props: React.ComponentProps<typeof BehindTheScenes>) =>
  render(
    <ThemeProvider>
      <BehindTheScenes {...props} />
    </ThemeProvider>
  );

describe('BehindTheScenes', () => {
  it('opens a dialog with the picture and the words as sent, and Got it closes it', () => {
    renderBehind({
      sent: sentPromptsFor('A cat', OPTIONS, 'pixel', false),
      picture: {src: 'data:image/png;base64,AA==', pixelated: true},
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Behind the scenes'}));
    const dialog = screen.getByRole('alertdialog');
    expect(dialog.textContent).toContain('Behind the scenes');
    expect(screen.getByText(/^A cat\. /).textContent).toContain('pixel');
    expect(
      within(dialog).getByRole('img', {name: 'Your picture'}).style
        .backgroundImage
    ).toContain('data:image/png;base64,AA==');
    // One picture: no second view to switch to.
    expect(screen.queryByRole('button', {name: 'Other poses'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Got it'}));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('closes on the corner x as well', () => {
    renderBehind({sent: sentPromptsFor('A cat', OPTIONS, 'pixel', false)});
    fireEvent.click(screen.getByRole('button', {name: 'Behind the scenes'}));
    fireEvent.click(screen.getByRole('button', {name: 'Close dialog'}));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it("switches between a set's first-picture words and the shared pose words", () => {
    renderBehind({
      sent: sentPromptsFor('A dragon', OPTIONS, 'pixel', true, 'quadruped'),
    });
    fireEvent.click(screen.getByRole('button', {name: 'Behind the scenes'}));
    expect(
      screen
        .getByRole('button', {name: 'First picture'})
        .getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      screen.getByText(/^A dragon\. Show the whole character/)
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Other poses'}));
    const poses = screen.getAllByRole('listitem');
    expect(poses).toHaveLength(4);
    expect(poses.map(pose => pose.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('standing:'),
        expect.stringContaining('walking:'),
      ])
    );
  });
});
