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
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('Behind the scenes');
    expect(screen.getByText(/^A cat\. /).textContent).toContain('pixel');
    expect(
      within(dialog).getByRole('img', {name: 'Your picture'}).style
        .backgroundImage
    ).toContain('data:image/png;base64,AA==');
    // One picture: no second view to switch to.
    expect(screen.queryByRole('button', {name: 'Other poses'})).toBeNull();
    // No story to lead on to.
    expect(screen.queryByRole('button', {name: 'How AI made this'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Got it'}));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it("leads on to the picture's story when there is one to tell, closing itself first", () => {
    const onTellStory = jest.fn();
    const story = {
      picture: {src: 'data:image/png;base64,AA=='},
      prompt: 'A cat',
      imageType: 'sprite' as const,
    };
    renderBehind({
      sent: sentPromptsFor('A cat', OPTIONS, 'pixel', false),
      story,
      onTellStory,
    });
    fireEvent.click(screen.getByRole('button', {name: 'Behind the scenes'}));
    fireEvent.click(screen.getByRole('button', {name: 'How AI made this'}));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onTellStory).toHaveBeenCalledWith(story);
  });

  it('keeps the words as sent out of page translation, and the rest in', () => {
    const notranslate = (element: Element) =>
      !!element.closest('[data-notranslate]');
    renderBehind({
      sent: sentPromptsFor('A dragon', OPTIONS, 'pixel', true, 'quadruped'),
    });
    fireEvent.click(screen.getByRole('button', {name: 'Behind the scenes'}));
    expect(
      notranslate(screen.getByText(/^A dragon\. Show the whole character/))
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', {name: 'Other poses'}));
    expect(notranslate(screen.getByText(/^Then, for each pose/))).toBe(false);
    screen.getAllByRole('listitem').forEach(pose => {
      const [label, words] = Array.from(pose.children);
      expect(notranslate(label)).toBe(false);
      expect(notranslate(words)).toBe(true);
    });
  });

  it('closes on the corner x as well', () => {
    renderBehind({sent: sentPromptsFor('A cat', OPTIONS, 'pixel', false)});
    fireEvent.click(screen.getByRole('button', {name: 'Behind the scenes'}));
    fireEvent.click(screen.getByRole('button', {name: 'Close modal'}));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('draws the dialog in the nearest themed element, not beside its button', () => {
    render(
      <ThemeProvider>
        <div data-theme="Dark">
          <div role="toolbar">
            <BehindTheScenes
              sent={sentPromptsFor('A cat', OPTIONS, 'pixel', false)}
            />
          </div>
        </div>
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', {name: 'Behind the scenes'}));
    const dialog = screen.getByRole('dialog');
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.contains(dialog)).toBe(false);
    expect(dialog.closest('[data-theme]')).toBe(toolbar.parentElement);
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
