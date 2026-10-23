import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import {MatchPairs} from '@cdo/apps/quiz/attempt/matchPairing';
import MatchQuestionContainer, {
  MatchItem,
} from '@cdo/apps/quiz/attempt/MatchQuestionContainer';

const MATCH_SETS: [MatchItem[], MatchItem[]] = [
  [
    {id: 'a', text: '1 + 1'},
    {id: 'b', text: '2 + 1'},
  ],
  [
    {id: 'x', text: '3'},
    {id: 'y', text: '2'},
  ],
];

// Stands in for QuizAttemptWorkspace, which owns the pairs.
function renderContainer(initialPairs: MatchPairs = []) {
  const onChangePairs = jest.fn();
  const Wrapper = () => {
    const [pairs, setPairs] = useState(initialPairs);
    return (
      <MatchQuestionContainer
        question={{
          id: 1,
          type: 'MatchQuestion',
          questionName: 'Sums',
          questionTitle: 'Match each expression to its value.',
        }}
        matchSets={MATCH_SETS}
        pairs={pairs}
        onChangePairs={newPairs => {
          onChangePairs(newPairs);
          setPairs(newPairs);
        }}
      />
    );
  };
  render(<Wrapper />);
  return {onChangePairs};
}

const card = (name: string) => screen.getByRole('button', {name});

describe('MatchQuestionContainer', () => {
  it('pairs a card in one set with a card in the other', () => {
    const {onChangePairs} = renderContainer();

    fireEvent.click(card('1 + 1'));
    fireEvent.click(card('2'));

    expect(onChangePairs).toHaveBeenLastCalledWith([['a', 'y']]);
  });

  it('pairs in either order, always as [first set, second set]', () => {
    const {onChangePairs} = renderContainer();

    fireEvent.click(card('2'));
    fireEvent.click(card('1 + 1'));

    expect(onChangePairs).toHaveBeenLastCalledWith([['a', 'y']]);
  });

  it('names each paired card with its partner', () => {
    renderContainer([['a', 'y']]);

    expect(card('1 + 1, matched with 2')).toBeInTheDocument();
    expect(card('2, matched with 1 + 1')).toBeInTheDocument();
    expect(card('2 + 1')).toBeInTheDocument();
  });

  it('marks the selected card as pressed, and deselects it on a second click', () => {
    renderContainer();

    fireEvent.click(card('1 + 1'));
    expect(card('1 + 1')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(card('1 + 1'));
    expect(card('1 + 1')).toHaveAttribute('aria-pressed', 'false');
  });

  it('moves the selection within a set instead of pairing', () => {
    const {onChangePairs} = renderContainer();

    fireEvent.click(card('1 + 1'));
    fireEvent.click(card('2 + 1'));

    expect(card('1 + 1')).toHaveAttribute('aria-pressed', 'false');
    expect(card('2 + 1')).toHaveAttribute('aria-pressed', 'true');
    expect(onChangePairs).not.toHaveBeenCalled();
  });

  it('unpairs two partners when they are paired again', () => {
    const {onChangePairs} = renderContainer([['a', 'y']]);

    fireEvent.click(card('1 + 1, matched with 2'));
    fireEvent.click(card('2, matched with 1 + 1'));

    expect(onChangePairs).toHaveBeenLastCalledWith([]);
    expect(card('1 + 1')).toBeInTheDocument();
  });
});
