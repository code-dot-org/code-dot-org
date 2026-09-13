// Asking for a picture in words, wherever the question comes up.
//
// Two places ask it and they ask the same thing, so this is where the asking
// is tested: what is offered, what happens while it waits, what it says when
// it fails, and what pressing one means. Each place's own test then covers
// only what it does with the file that lands.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {DescribePicture} from '../DescribePicture';
import type {GeneratedPicture, ImageGenerator} from '../imageGenerator';

const DRAWN: GeneratedPicture[] = [
  {name: 'crab', dataUrl: 'data:image/png;base64,AAAA', mediaType: 'image/png'},
];

const draw = vi.fn(async () => DRAWN);
const drawing: ImageGenerator = {kind: 'fixture', draw};
const onKeep = vi.fn(async () => 'crab.png');
const onKept = vi.fn();

const show = (
  props: Partial<React.ComponentProps<typeof DescribePicture>> = {},
) =>
  render(
    <DescribePicture
      drawing={drawing}
      kind="actor"
      onKeep={onKeep}
      onKept={onKept}
      {...props}
    />,
  );

const field = () => screen.getByLabelText('Describe a picture');

beforeEach(() => vi.clearAllMocks());

describe('describing a picture', () => {
  it('is nothing at all when nothing can draw', () => {
    // A lab with no service behind it should look like a lab without the
    // feature, not like one whose button fails.
    show({drawing: undefined});

    expect(screen.queryByLabelText('Describe a picture')).toBeNull();
  });

  it('will not ask for nothing', () => {
    show();

    expect(screen.getByRole('button', {name: 'Draw'})).toBeDisabled();
    fireEvent.change(field(), {target: {value: '  '}});
    expect(screen.getByRole('button', {name: 'Draw'})).toBeDisabled();
  });

  it('asks with the words, and says what the picture is for', async () => {
    // The kind is the call site's, and it decides how the words are asked.
    show({kind: 'background'});
    fireEvent.change(field(), {target: {value: '  a cave  '}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [
      {prompt: string; kind: string},
    ];
    expect(asked[0]).toMatchObject({prompt: 'a cave', kind: 'background'});
  });

  it('keeps the words, and offers to draw again', async () => {
    // The commonest second action is a small edit to the prompt, not a fresh
    // thought — so the field holds and the button says so.
    show();
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await screen.findByRole('button', {name: 'Keep crab'});
    expect((field() as HTMLInputElement).value).toBe('a crab');
    expect(screen.getByRole('button', {name: 'Draw again'})).toBeTruthy();
  });

  it('says when it failed, rather than showing nothing', async () => {
    draw.mockRejectedValueOnce(
      new Error('The service refused the key.') as never,
    );
    show();
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    expect(
      await screen.findByText('The service refused the key.'),
    ).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Draw'})).not.toBeDisabled();
  });

  it('hands a pressed picture to the caller, and tells it what landed', async () => {
    show();
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    fireEvent.click(await screen.findByRole('button', {name: 'Keep crab'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalledWith(DRAWN[0]));
    await vi.waitFor(() => expect(onKept).toHaveBeenCalledWith('crab.png'));
    // Gone from the tray: it is one of the project's pictures now.
    expect(screen.queryByRole('button', {name: 'Keep crab'})).toBeNull();
  });

  it('leaves it to try again when the write refused', async () => {
    onKeep.mockResolvedValueOnce(undefined as never);
    show();
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    fireEvent.click(await screen.findByRole('button', {name: 'Keep crab'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalled());
    expect(onKept).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Keep crab'})).toBeTruthy();
  });
});
