// The sound shelf (specs/SOUND.md).
//
// The backdrop shelf's tests read what a screen reader reads, because its tiles
// are pictures with no text. Here the names ARE the tiles, so what these read
// instead is the thing that shelf did not have: a play button per row, and one
// sound at a time.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {setSoundBaseUrl} from '../../runtime/worldConfig';
import {SoundLibraryDialog} from '../SoundLibraryDialog';
import type {Playable} from '../soundPreview';

/** A player that records, so a test can hear without a browser that can. */
const recorder = () => {
  const played: string[] = [];
  const stopped: string[] = [];
  const make = (url: string): Playable => {
    played.push(url);
    return {
      currentTime: 0,
      play: () => {},
      pause: () => stopped.push(url),
    };
  };
  return {make, played, stopped};
};

const open = (
  props: Partial<React.ComponentProps<typeof SoundLibraryDialog>> = {},
) =>
  render(
    <SoundLibraryDialog onImport={vi.fn()} onCancel={vi.fn()} {...props} />,
  );

describe('SoundLibraryDialog', () => {
  it('lists the shelf by name', () => {
    open();

    expect(screen.getByRole('button', {name: 'coin'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'big jump'})).toBeInTheDocument();
  });

  it('waits for the button rather than importing on a click', () => {
    // Select-then-confirm, like the backdrop shelf — and more so here, since
    // browsing IS clicking.
    const onImport = vi.fn();
    open({onImport});

    fireEvent.click(screen.getByRole('button', {name: 'coin'}));

    expect(onImport).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'coin'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('imports the selected one when the button is pressed', () => {
    const onImport = vi.fn();
    open({onImport});
    fireEvent.click(screen.getByRole('button', {name: 'coin'}));

    fireEvent.click(screen.getByRole('button', {name: 'Use this sound'}));

    expect(onImport).toHaveBeenCalledWith(
      expect.objectContaining({id: 'coin'}),
    );
  });

  it('offers nothing to import until something is chosen', () => {
    open();

    expect(screen.getByRole('button', {name: 'Use this sound'})).toBeDisabled();
  });

  it('plays a row from where setup put the bytes', () => {
    setSoundBaseUrl('/sounds/');
    const {make, played} = recorder();
    open({makePlayer: make});

    fireEvent.click(screen.getByRole('button', {name: 'Play coin'}));

    expect(played).toEqual(['/sounds/coin.mp3']);
  });

  it('turns the row’s button into a stop while it sounds', () => {
    // The same control stops what it started, so its label says what it does
    // NEXT rather than what it is.
    const {make} = recorder();
    open({makePlayer: make});

    fireEvent.click(screen.getByRole('button', {name: 'Play coin'}));

    expect(screen.getByRole('button', {name: 'Stop coin'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Play coin'})).toBeNull();
  });

  it('stops the first when a second is played', () => {
    const {make, played, stopped} = recorder();
    open({makePlayer: make});

    fireEvent.click(screen.getByRole('button', {name: 'Play coin'}));
    fireEvent.click(screen.getByRole('button', {name: 'Play jump'}));

    expect(played).toEqual(['/sounds/coin.mp3', '/sounds/jump.mp3']);
    expect(stopped).toEqual(['/sounds/coin.mp3']);
  });

  it('stops it when the same button is pressed again', () => {
    const {make, stopped} = recorder();
    open({makePlayer: make});

    fireEvent.click(screen.getByRole('button', {name: 'Play coin'}));
    fireEvent.click(screen.getByRole('button', {name: 'Stop coin'}));

    expect(stopped).toEqual(['/sounds/coin.mp3']);
    expect(screen.getByRole('button', {name: 'Play coin'})).toBeInTheDocument();
  });

  it('stops the preview before handing the sound over', () => {
    // The game that is about to start is the thing to listen to.
    const {make, stopped} = recorder();
    open({makePlayer: make, onImport: vi.fn()});
    fireEvent.click(screen.getByRole('button', {name: 'Play coin'}));
    fireEvent.click(screen.getByRole('button', {name: 'coin'}));

    fireEvent.click(screen.getByRole('button', {name: 'Use this sound'}));

    expect(stopped).toEqual(['/sounds/coin.mp3']);
  });

  it('stops the preview when the dialog goes', () => {
    // A noise with no source on screen is the failure this prevents.
    const {make, stopped} = recorder();
    const {unmount} = open({makePlayer: make});
    fireEvent.click(screen.getByRole('button', {name: 'Play coin'}));

    unmount();

    expect(stopped).toEqual(['/sounds/coin.mp3']);
  });

  it('says what went wrong with the last import', () => {
    // A sound's bytes are served rather than bundled, so choosing one can fail
    // in a way choosing a sprite cannot.
    open({error: 'Could not load the sound “coin” (404).'});

    expect(
      screen.getByText('Could not load the sound “coin” (404).'),
    ).toBeInTheDocument();
  });

  it('says it is working while the bytes are on their way', () => {
    open({busy: true});

    expect(screen.getByRole('button', {name: 'Adding…'})).toBeDisabled();
  });
});
