import {fireEvent, render, screen} from '@testing-library/react';
import React, {useState} from 'react';

import {
  Choices,
  Sentence,
  sentenceFor,
} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/exploreSentences';
import WordMenus from '@cdo/apps/p5lab/spritelab/lab2/views/explore/WordMenus';

const CHARACTER_SENTENCE = sentenceFor('sprite');

// The character sentence with two more phrases, for the chaining tests.
const CHAINED_SENTENCE: Sentence = {
  id: 'chained',
  segments: [
    ...CHARACTER_SENTENCE.segments,
    {phrase: [{text: ' holding a '}, {slot: 'thing'}]},
    {phrase: [{text: ', drawn with '}, {slot: 'detail'}]},
  ],
  slots: {
    ...CHARACTER_SENTENCE.slots,
    thing: {
      id: 'thing',
      label: 'thing',
      words: [
        {id: 'wand', text: 'wand'},
        {id: 'balloon', text: 'balloon'},
      ],
    },
    detail: {
      id: 'detail',
      label: 'detail',
      words: [{id: 'lots', text: 'lots of detail'}],
    },
  },
};

const Harness: React.FunctionComponent<{
  initial?: Choices;
  sentence?: Sentence;
}> = ({initial = {}, sentence = CHARACTER_SENTENCE}) => {
  const [choices, setChoices] = useState<Choices>(initial);
  return (
    <WordMenus sentence={sentence} choices={choices} onChange={setChoices} />
  );
};

// The sentence as read: without the emoji and blanks that are hidden
// from the accessible tree.
const sentenceText = () => {
  const p = (document.querySelector('p') as HTMLElement).cloneNode(
    true
  ) as HTMLElement;
  p.querySelectorAll('[aria-hidden]').forEach(e => e.remove());
  return p.textContent?.replace(/\s+/g, ' ').trim();
};
const placeholderShown = () =>
  !!document.querySelector('p [class*="placeholder"]');
const next = () =>
  fireEvent.click(screen.getByRole('button', {name: 'Next words'}));

describe('WordMenus', () => {
  it('holds on the required set until its word is chosen', () => {
    render(<Harness />);
    expect(
      screen.getByRole('group', {name: 'creature (pick one)'})
    ).toBeTruthy();
    const nextButton = screen.getByRole('button', {
      name: 'Next words',
    }) as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
    // Only the required set's dot is out until its word is chosen.
    expect(
      screen.getAllByRole('button', {name: /^[a-z ]+ words/})
    ).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', {name: 'dragon'}));
    expect(nextButton.disabled).toBe(false);
    expect(
      screen.getAllByRole('button', {name: /^[a-z ]+ words/})
    ).toHaveLength(3);
  });

  it('returns to the required set when its word is removed elsewhere', () => {
    render(<Harness initial={{creature: 'cat'}} />);
    next();
    expect(screen.getByRole('group', {name: 'adjective'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Remove cat'}));
    expect(
      screen.getByRole('group', {name: 'creature (pick one)'})
    ).toBeTruthy();
    expect(screen.getByRole('button', {name: 'dragon'})).toBeTruthy();
  });

  it('shows one set of words at a time, starting with the required one', () => {
    render(<Harness initial={{creature: 'cat'}} />);
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
    fireEvent.click(screen.getByRole('button', {name: 'clothing words'}));
    expect(screen.getByRole('group', {name: 'clothing'})).toBeTruthy();
    expect(
      (screen.getByRole('button', {name: 'Next words'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it('lays out a hidden longest sentence beside the real one', () => {
    render(<Harness initial={{creature: 'cat'}} />);
    const ghost = document.querySelector('p[aria-hidden]') as HTMLElement;
    expect(ghost.textContent?.replace(/\s+/g, ' ')).toBe(
      'A 😊friendly 👾monster wearing a 👓glasses.'
    );
    expect(sentenceText()).toBe('A cat.');
  });

  it('jumps to the set a word came from when its chip is clicked', () => {
    render(<Harness initial={{creature: 'cat', adjective: 'cute'}} />);
    next();
    next();
    expect(screen.getByRole('group', {name: 'clothing'})).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', {name: 'cat. Show creature words'})
    );
    expect(
      screen.getByRole('group', {name: 'creature (pick one)'})
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', {name: 'cute. Show adjective words'})
    );
    expect(screen.getByRole('group', {name: 'adjective'})).toBeTruthy();
  });

  it('shows a chip as plain text while the creature is missing', () => {
    render(<Harness initial={{creature: 'cat', adjective: 'cute'}} />);
    fireEvent.click(screen.getByRole('button', {name: 'Remove cat'}));
    expect(
      screen.getByRole('group', {name: 'creature (pick one)'})
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', {name: 'cute. Show adjective words'})
    ).toBeNull();
    expect(sentenceText()).toBe('A cute .');
  });

  it('opens the phrases one after another and clears them from the back', () => {
    render(<Harness initial={{creature: 'cat'}} sentence={CHAINED_SENTENCE} />);
    // Creature, adjective and the first phrase are open; the rest wait.
    expect(
      screen.getAllByRole('button', {name: /^[a-z ]+ words/})
    ).toHaveLength(3);
    expect(screen.queryByRole('button', {name: 'thing words'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'clothing words'}));
    fireEvent.click(screen.getByRole('button', {name: 'hat'}));
    expect(screen.getByRole('button', {name: 'thing words'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'detail words'})).toBeNull();
    next();
    fireEvent.click(screen.getByRole('button', {name: 'wand'}));
    expect(screen.getByRole('button', {name: 'detail words'})).toBeTruthy();
    expect(sentenceText()).toBe('A cat wearing a hat holding a wand.');
    // Clearing the hat takes the wand with it and closes the later sets.
    fireEvent.click(screen.getByRole('button', {name: 'Remove hat'}));
    expect(sentenceText()).toBe('A cat wearing a .');
    expect(screen.queryByRole('button', {name: 'thing words'})).toBeNull();
    expect(screen.getByRole('group', {name: 'clothing'})).toBeTruthy();
  });

  it('shows where the set on show would land, dimmed, until a word is chosen', () => {
    render(<Harness initial={{creature: 'cat'}} />);
    expect(placeholderShown()).toBe(false);
    next();
    expect(placeholderShown()).toBe(true);
    expect(sentenceText()).toBe('A cat.');
    fireEvent.click(screen.getByRole('button', {name: 'sparkly'}));
    expect(placeholderShown()).toBe(false);
    expect(sentenceText()).toBe('A sparkly cat.');
    next();
    expect(placeholderShown()).toBe(true);
    expect(sentenceText()).toBe('A sparkly cat wearing a .');
  });

  it('starts as the sentence waiting for its noun, then reads as prose', () => {
    render(<Harness />);
    expect(placeholderShown()).toBe(true);
    expect(sentenceText()).toBe('A .');
    fireEvent.click(screen.getByRole('button', {name: 'dragon'}));
    expect(placeholderShown()).toBe(false);
    expect(sentenceText()).toBe('A dragon.');
    next();
    fireEvent.click(screen.getByRole('button', {name: 'sparkly'}));
    next();
    fireEvent.click(screen.getByRole('button', {name: 'crown'}));
    expect(sentenceText()).toBe('A sparkly dragon wearing a crown.');
  });

  it('clears a word on a second click or its x, the required one included', () => {
    render(<Harness initial={{creature: 'cat', adjective: 'cute'}} />);
    fireEvent.click(screen.getByRole('button', {name: 'cat'}));
    expect(sentenceText()).toBe('A cute .');
    expect(
      (screen.getByRole('button', {name: 'Next words'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', {name: 'cat'}));
    expect(sentenceText()).toBe('A cute cat.');
    next();
    fireEvent.click(screen.getByRole('button', {name: 'cute'}));
    expect(sentenceText()).toBe('A cat.');
    next();
    fireEvent.click(screen.getByRole('button', {name: 'hat'}));
    expect(sentenceText()).toBe('A cat wearing a hat.');
    fireEvent.click(screen.getByRole('button', {name: 'Remove hat'}));
    // The clothing set is still on show, so its blank comes back.
    expect(sentenceText()).toBe('A cat wearing a .');
    expect(placeholderShown()).toBe(true);
  });

  it('takes a word dragged from the set on show onto its blank in the sentence', () => {
    render(<Harness initial={{creature: 'cat'}} />);
    next();
    const data: Record<string, string> = {};
    const dataTransfer = {
      setData: (type: string, value: string) => {
        data[type] = value;
      },
      getData: (type: string) => data[type] ?? '',
      types: ['application/x-spritelab2-word'],
      effectAllowed: 'copy',
    };
    fireEvent.dragStart(screen.getByRole('button', {name: 'grumpy'}), {
      dataTransfer,
    });
    const blank = document.querySelector(
      'p [class*="placeholder"]'
    ) as HTMLElement;
    fireEvent.drop(blank, {dataTransfer});
    expect(sentenceText()).toBe('A grumpy cat.');
  });
});
