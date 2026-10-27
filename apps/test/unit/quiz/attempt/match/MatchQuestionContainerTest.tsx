import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import MatchQuestionContainer from '@cdo/apps/quiz/attempt/match/MatchQuestionContainer';
import {MatchItems, MatchPairs} from '@cdo/apps/quiz/attempt/match/types';

const MATCH_ITEMS: MatchItems = {
  firstItems: [
    {id: 'a', text: '1 + 1'},
    {id: 'b', text: '2 + 1'},
  ],
  secondItems: [
    {id: 'x', text: '3'},
    {id: 'y', text: '2'},
  ],
};

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
          ...MATCH_ITEMS,
        }}
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
  it('pairs a card in one group with a card in the other', () => {
    const {onChangePairs} = renderContainer();

    fireEvent.click(card('1 + 1'));
    fireEvent.click(card('2'));

    expect(onChangePairs).toHaveBeenLastCalledWith([['a', 'y']]);
  });

  it('pairs in either order, always as [first group, second group]', () => {
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

  it("letters every first-group card, and a second-group card only once it's paired", () => {
    renderContainer([['b', 'x']]);

    expect(card('1 + 1')).toHaveTextContent(/A$/);
    expect(card('2 + 1, matched with 3')).toHaveTextContent(/B$/);
    expect(card('3, matched with 2 + 1')).toHaveTextContent(/B$/);
    expect(card('2')).toHaveTextContent(/^2$/);
  });

  it('marks the selected card as pressed, and deselects it on a second click', () => {
    renderContainer();

    fireEvent.click(card('1 + 1'));
    expect(card('1 + 1')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(card('1 + 1'));
    expect(card('1 + 1')).toHaveAttribute('aria-pressed', 'false');
  });

  it('moves the selection within a group instead of pairing', () => {
    const {onChangePairs} = renderContainer();

    fireEvent.click(card('1 + 1'));
    fireEvent.click(card('2 + 1'));

    expect(card('1 + 1')).toHaveAttribute('aria-pressed', 'false');
    expect(card('2 + 1')).toHaveAttribute('aria-pressed', 'true');
    expect(onChangePairs).not.toHaveBeenCalled();
  });

  it('unmatches a matched card when it is selected, and keeps it selected', () => {
    const {onChangePairs} = renderContainer([['a', 'y']]);

    fireEvent.click(card('2, matched with 1 + 1'));

    expect(onChangePairs).toHaveBeenLastCalledWith([]);
    expect(card('2')).toHaveAttribute('aria-pressed', 'true');
    expect(card('1 + 1')).toHaveAttribute('aria-pressed', 'false');
  });

  it('rematches an unmatched card with a new partner', () => {
    const {onChangePairs} = renderContainer([['a', 'y']]);

    fireEvent.click(card('1 + 1, matched with 2'));
    fireEvent.click(card('3'));

    expect(onChangePairs).toHaveBeenLastCalledWith([['a', 'x']]);
  });

  it('does not restore the pair when the unmatched card is deselected', () => {
    const {onChangePairs} = renderContainer([['a', 'y']]);

    fireEvent.click(card('1 + 1, matched with 2'));
    fireEvent.click(card('1 + 1'));

    expect(onChangePairs).toHaveBeenCalledTimes(1);
    expect(card('1 + 1')).toHaveAttribute('aria-pressed', 'false');
  });

  it('describes how to match, for screen readers', () => {
    renderContainer();

    expect(
      screen.getByRole('group', {name: 'Match each expression to its value.'})
    ).toHaveAccessibleDescription(
      'Select an item in one column, then an item in the other column to match them. Selecting a matched item unmatches it.'
    );
  });

  it('announces each match and unmatch', () => {
    renderContainer();

    fireEvent.click(card('1 + 1'));
    fireEvent.click(card('2'));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Matched 1 + 1 with 2.'
    );

    fireEvent.click(card('2, matched with 1 + 1'));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Unmatched 2 from 1 + 1. Select an item in the other column to match it.'
    );
  });

  it('announces the partner dropped when the second card was already matched', () => {
    renderContainer([['a', 'y']]);

    fireEvent.click(card('2 + 1'));
    fireEvent.click(card('2, matched with 1 + 1'));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Matched 2 + 1 with 2. 1 + 1 is no longer matched.'
    );
  });
});
