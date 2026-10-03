import {fireEvent, render, screen} from '@testing-library/react';
import React, {useState} from 'react';

import {
  CHARACTER_SENTENCE,
  Choices,
} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/exploreSentences';
import WordMenus, {
  slotsInOrder,
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

describe('WordMenus', () => {
  it('lists the slots in the order the sentence reads them', () => {
    expect(slotsInOrder(CHARACTER_SENTENCE).map(s => s.id)).toEqual([
      'adjective',
      'creature',
      'clothing',
      'thing',
      'detail',
    ]);
  });

  it('shows a hint until the required word is chosen, then finished prose', () => {
    render(<Harness />);
    expect(sentenceText()).toBe('Pick a word below to start.');
    fireEvent.click(screen.getByRole('button', {name: 'dragon'}));
    expect(sentenceText()).toBe('A dragon.');
    fireEvent.click(screen.getByRole('button', {name: 'sparkly'}));
    fireEvent.click(screen.getByRole('button', {name: 'crown'}));
    expect(sentenceText()).toBe('A sparkly dragon wearing a crown.');
  });

  it('marks the required row and the chosen words', () => {
    render(<Harness initial={{creature: 'cat'}} />);
    expect(
      screen.getByRole('group', {name: 'creature (pick one)'})
    ).toBeTruthy();
    expect(screen.getByRole('group', {name: 'adjective'})).toBeTruthy();
    expect(
      screen.getByRole('button', {name: 'cat'}).getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('clears an optional word on a second click or its x, never the required one', () => {
    render(<Harness initial={{creature: 'cat', adjective: 'cute'}} />);
    fireEvent.click(screen.getByRole('button', {name: 'cute'}));
    expect(sentenceText()).toBe('A cat.');
    fireEvent.click(screen.getByRole('button', {name: 'cat'}));
    expect(sentenceText()).toBe('A cat.');
    fireEvent.click(screen.getByRole('button', {name: 'hat'}));
    expect(sentenceText()).toBe('A cat wearing a hat.');
    fireEvent.click(screen.getByRole('button', {name: 'Remove hat'}));
    expect(sentenceText()).toBe('A cat.');
  });
});
