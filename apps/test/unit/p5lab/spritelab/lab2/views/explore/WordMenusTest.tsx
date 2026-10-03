import {fireEvent, render, screen} from '@testing-library/react';
import React, {useState} from 'react';

import {
  CHARACTER_SENTENCE,
  Choices,
} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/exploreSentences';
import WordMenus, {
  slotsToOffer,
} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/WordMenus';

const Harness: React.FunctionComponent<{initial?: Choices}> = ({
  initial = {},
}) => {
  const [choices, setChoices] = useState<Choices>(initial);
  return (
    <WordMenus
      sentence={CHARACTER_SENTENCE}
      choices={choices}
      onChange={setChoices}
    />
  );
};

const sentenceText = () =>
  (document.querySelector('p') as HTMLElement).textContent?.replace(
    /\s+/g,
    ' '
  );
const next = () =>
  fireEvent.click(screen.getByRole('button', {name: 'Next words'}));

describe('WordMenus', () => {
  it('offers the required slot first, then the rest in sentence order', () => {
    expect(slotsToOffer(CHARACTER_SENTENCE).map(s => s.id)).toEqual([
      'creature',
      'adjective',
      'clothing',
      'thing',
      'detail',
    ]);
  });

  it('shows one set of words at a time, starting with the required one', () => {
    render(<Harness />);
    expect(
      screen.getByRole('group', {name: 'creature (pick one)'})
    ).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'sparkly'})).toBeNull();
    expect(
      (
        screen.getByRole('button', {
          name: 'Previous words',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    next();
    expect(screen.getByRole('group', {name: 'adjective'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'sparkly'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'detail words'}));
    expect(screen.getByRole('group', {name: 'detail'})).toBeTruthy();
    expect(
      (screen.getByRole('button', {name: 'Next words'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it('shows a hint until the required word is chosen, then finished prose', () => {
    render(<Harness />);
    expect(sentenceText()).toBe('Pick a word below to start.');
    fireEvent.click(screen.getByRole('button', {name: 'dragon'}));
    expect(sentenceText()).toBe('A dragon.');
    next();
    fireEvent.click(screen.getByRole('button', {name: 'sparkly'}));
    next();
    fireEvent.click(screen.getByRole('button', {name: 'crown'}));
    expect(sentenceText()).toBe('A sparkly dragon wearing a crown.');
  });

  it('clears an optional word on a second click or its x, never the required one', () => {
    render(<Harness initial={{creature: 'cat', adjective: 'cute'}} />);
    fireEvent.click(screen.getByRole('button', {name: 'cat'}));
    expect(sentenceText()).toBe('A cute cat.');
    next();
    fireEvent.click(screen.getByRole('button', {name: 'cute'}));
    expect(sentenceText()).toBe('A cat.');
    next();
    fireEvent.click(screen.getByRole('button', {name: 'hat'}));
    expect(sentenceText()).toBe('A cat wearing a hat.');
    fireEvent.click(screen.getByRole('button', {name: 'Remove hat'}));
    expect(sentenceText()).toBe('A cat.');
  });
});
