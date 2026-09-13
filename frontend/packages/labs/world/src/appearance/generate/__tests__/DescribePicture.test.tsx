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
      kind="thing"
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

    await screen.findByRole('button', {name: 'Keep this one'});
    expect((field() as HTMLTextAreaElement).value).toBe('a crab');
    expect(screen.getByRole('button', {name: 'Draw again'})).toBeTruthy();
  });

  it('shows what came back, big enough to judge', async () => {
    // The reason to wait half a minute for a picture is to see it; one shown
    // at thumbnail size is one nobody looked at.
    show();
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    const picture = await screen.findByRole('img');
    expect(picture.getAttribute('src')).toBe(DRAWN[0].dataUrl);
  });

  it('says it is working, and what the panel is for before it is', () => {
    show();

    expect(screen.getByText(/What comes back will show here/)).toBeTruthy();
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

  it('hands the kept picture to the caller, and tells it what landed', async () => {
    show();
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    fireEvent.click(await screen.findByRole('button', {name: 'Keep this one'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalledWith(DRAWN[0]));
    await vi.waitFor(() => expect(onKept).toHaveBeenCalledWith('crab.png'));
    // Gone from the panel: it is one of the project's pictures now.
    expect(screen.queryByRole('button', {name: 'Keep this one'})).toBeNull();
  });

  it('leaves it to try again when the write refused', async () => {
    onKeep.mockResolvedValueOnce(undefined as never);
    show();
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    fireEvent.click(await screen.findByRole('button', {name: 'Keep this one'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalled());
    expect(onKept).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Keep this one'})).toBeTruthy();
  });

  it('says what is drawn and unkept, for a caller with its own way on', async () => {
    // The wizard's `Next` is how a learner keeps one there, so the step above
    // has to be able to see what is on screen
    // (`actors/create/ActorCreator`). Cleared again once it has landed, so
    // nothing writes it twice.
    const onDrew = vi.fn();
    show({onDrew});
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(onDrew).toHaveBeenCalledWith(DRAWN[0]));

    fireEvent.click(screen.getByRole('button', {name: 'Keep this one'}));
    await vi.waitFor(() => expect(onDrew).toHaveBeenLastCalledWith(undefined));
  });

  it('says so when a failed ask left nothing drawn', async () => {
    draw.mockRejectedValueOnce(new Error('Busy.') as never);
    const onDrew = vi.fn();
    show({onDrew});
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await screen.findByText('Busy.');
    expect(onDrew).toHaveBeenCalledWith(undefined);
  });
});

describe('what it is asking for', () => {
  it('asks only where the call site cannot tell', () => {
    // A backdrop is known by its folder; a thing and a surface land in the
    // same one (`generate/imagePrompts`).
    show();
    expect(screen.queryByLabelText('What it is')).toBeNull();

    show({kinds: ['thing'], onKind: vi.fn()});
    expect(screen.queryByLabelText('What it is')).toBeNull();

    show({kinds: ['thing', 'surface'], onKind: vi.fn()});
    expect(screen.getByLabelText('What it is')).toBeTruthy();
  });

  it('says what the difference is, rather than naming the two prompts', () => {
    show({kinds: ['thing', 'surface'], onKind: vi.fn()});

    expect(
      screen.getByRole('button', {
        name: /drawn on its own with nothing behind/i,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', {name: /ground, a wall, a platform/i}),
    ).toBeTruthy();
  });

  it('shows which one is chosen, and hands back the other', () => {
    const onKind = vi.fn();
    show({kind: 'thing', kinds: ['thing', 'surface'], onKind});

    expect(screen.getByRole('button', {name: /A thing/})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', {name: /A surface/}));
    expect(onKind).toHaveBeenCalledWith('surface');
  });

  it('asks the generator for the kind it was given', async () => {
    // The whole point of the question: a surface is a different ask, not a
    // differently labelled one.
    show({kind: 'surface', kinds: ['thing', 'surface'], onKind: vi.fn()});
    fireEvent.change(field(), {target: {value: 'stone bricks'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [{kind?: string}];
    expect(asked[0].kind).toBe('surface');
  });
});

describe('the two questions a surface answers', () => {
  const surface = {
    kind: 'surface' as const,
    kinds: ['thing', 'surface'] as const,
    onKind: vi.fn(),
  };

  it('asks them of a surface and of nothing else', () => {
    // A thing is see-through around itself by definition and joins nothing, so
    // asking would be asking something with one answer.
    show({kind: 'thing', kinds: ['thing', 'surface'], onKind: vi.fn()});
    expect(screen.queryByLabelText('Which way it joins up')).toBeNull();
    expect(screen.queryByLabelText('How much of it is drawn')).toBeNull();

    show(surface);
    expect(screen.getByLabelText('Which way it joins up')).toBeTruthy();
    expect(screen.getByLabelText('How much of it is drawn')).toBeTruthy();
  });

  it('starts at the weaker promise of each', async () => {
    // A surface that need not join is easier art than one that must, and solid
    // is what most surfaces are.
    show(surface);
    fireEvent.change(field(), {target: {value: 'stone'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [
      {surface?: {ways: string; through: boolean}},
    ];
    expect(asked[0].surface).toEqual({ways: 'none', through: false});
  });

  it('carries both answers to the generator', async () => {
    // THE COMBINATION THE OLD KINDS COULD NOT SPELL: material, joining side to
    // side, and see-through underneath — a mossy platform with vines.
    show(surface);
    fireEvent.click(screen.getByRole('button', {name: 'Side to side'}));
    fireEvent.click(screen.getByRole('button', {name: 'Partly see-through'}));
    fireEvent.change(field(), {target: {value: 'a mossy platform'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [
      {surface?: {ways: string; through: boolean}},
    ];
    expect(asked[0].surface).toEqual({ways: 'across', through: true});
  });

  it('says nothing about a surface when it is drawing a thing', async () => {
    show({kind: 'thing'});
    fireEvent.change(field(), {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [{surface?: object}];
    expect(asked[0].surface).toBeUndefined();
  });
});

describe('what the preview shows', () => {
  const surface = {
    kind: 'surface' as const,
    kinds: ['thing', 'surface'] as const,
    onKind: vi.fn(),
  };

  it('repeats it where it joins, because one copy cannot be judged', async () => {
    // A seam is invisible in a single picture and obvious in nine.
    show(surface);
    fireEvent.click(screen.getByRole('button', {name: 'Every way'}));
    fireEvent.change(field(), {target: {value: 'stone bricks'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    const shown = await screen.findByRole('img', {name: /shown repeated/});
    expect(shown.style.backgroundImage).toContain(DRAWN[0].dataUrl);
    expect(screen.getByText(/where the copies meet/)).toBeTruthy();
  });

  it('repeats it the way it was asked to', async () => {
    // A picture meant to lie in a row would show a seam it was never going to
    // be asked for, stacked up.
    show(surface);
    fireEvent.click(screen.getByRole('button', {name: 'Side to side'}));
    fireEvent.change(field(), {target: {value: 'earth'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    const shown = await screen.findByRole('img', {name: /shown repeated/});
    expect(shown.style.backgroundRepeat).toBe('repeat-x');
  });

  it('shows one copy of a surface that joins nothing', async () => {
    show(surface);
    fireEvent.change(field(), {target: {value: 'a wall face'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    const shown = await screen.findByRole('img');
    expect(shown.tagName).toBe('IMG');
    expect(screen.queryByText(/where the copies meet/)).toBeNull();
  });

  it('puts a chequer behind anything with transparency in it', () => {
    // On a flat dark ground a see-through picture reads as a hole rather than
    // as a picture with a hole in it — which is the one thing the learner
    // asked for and the one thing they could not check.
    const chequered = (where: HTMLElement) =>
      where.querySelector('[class*="through"]') !== null;

    const thing = show({kind: 'thing'});
    expect(chequered(thing.container)).toBe(true);
    thing.unmount();

    const solid = show(surface);
    expect(chequered(solid.container)).toBe(false);

    fireEvent.click(screen.getByRole('button', {name: 'Partly see-through'}));
    expect(chequered(solid.container)).toBe(true);
  });
});

describe('the shape it asks for', () => {
  it('offers the grid only where a shape means something', () => {
    // A backdrop is stretched over the viewport and has no tiles to fill, so
    // the backdrop shelf gets the same panel without a question that would
    // mean nothing there.
    show();
    expect(screen.queryByLabelText('How many tiles it fills')).toBeNull();

    show({scale: {x: 1, y: 1}, onScale: vi.fn()});
    expect(screen.getByLabelText('How many tiles it fills')).toBeTruthy();
  });

  it('tells the generator the shape that was drawn', async () => {
    // Asked for in the shape it will be drawn in, a picture arrives right;
    // drawn square and stretched over two tiles it is a stretched picture.
    show({scale: {x: 2, y: 1}, onScale: vi.fn()});
    fireEvent.change(field(), {target: {value: 'a log'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [{shape?: object}];
    expect(asked[0].shape).toEqual({x: 2, y: 1});
  });

  it('offers the way back to the pictures there are', () => {
    // Leaving the grid is a press and coming back is a press: the project's
    // own pictures are still the likelier answer.
    const onBack = vi.fn();
    show({onBack});

    fireEvent.click(screen.getByRole('button', {name: /Choose a picture/}));
    expect(onBack).toHaveBeenCalled();
  });
});
