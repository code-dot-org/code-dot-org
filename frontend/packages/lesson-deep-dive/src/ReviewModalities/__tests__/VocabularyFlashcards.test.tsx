import {fireEvent, render, screen} from '@testing-library/react';

import VocabularyFlashcards, {
  type VocabularyItem,
} from '../VocabularyFlashcards';

const VOCABULARY: VocabularyItem[] = [
  {id: '1', word: 'algorithm', definition: 'A list of steps to finish a task'},
  {id: '2', word: 'loop', definition: 'Repeating a set of steps'},
  {id: '3', word: 'variable', definition: 'A name that holds a value'},
];

// The card face holding this text; each face carries aria-hidden.
const faceOf = (text: string) =>
  screen.getByText(text).closest('[aria-hidden]');

const clickButton = (name: string) =>
  fireEvent.click(screen.getByRole('button', {name}));

describe('VocabularyFlashcards', () => {
  it('starts on the first term, with the definition hidden', () => {
    render(<VocabularyFlashcards vocabulary={VOCABULARY} />);

    expect(screen.getByText('Card 1 of 3')).toBeInTheDocument();
    expect(faceOf('algorithm')).toHaveAttribute('aria-hidden', 'false');
    expect(faceOf('A list of steps to finish a task')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('flips to the definition and back, announcing each face', () => {
    render(<VocabularyFlashcards vocabulary={VOCABULARY} />);

    clickButton('Flip card');
    expect(faceOf('algorithm')).toHaveAttribute('aria-hidden', 'true');
    expect(faceOf('A list of steps to finish a task')).toHaveAttribute(
      'aria-hidden',
      'false',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Definition: A list of steps to finish a task',
    );

    clickButton('Flip card');
    expect(faceOf('algorithm')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Term: algorithm');
  });

  it('flips when the card itself is clicked', () => {
    render(<VocabularyFlashcards vocabulary={VOCABULARY} />);

    fireEvent.click(screen.getByText('algorithm'));
    expect(faceOf('A list of steps to finish a task')).toHaveAttribute(
      'aria-hidden',
      'false',
    );
  });

  it('moves to the next card face up, announcing its position and term', () => {
    render(<VocabularyFlashcards vocabulary={VOCABULARY} />);

    clickButton('Flip card');
    clickButton('Next card');

    expect(screen.getByText('Card 2 of 3')).toBeInTheDocument();
    expect(faceOf('loop')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Card 2 of 3: loop');
  });

  it('wraps around at both ends', () => {
    render(<VocabularyFlashcards vocabulary={VOCABULARY} />);

    clickButton('Previous card');
    expect(screen.getByText('Card 3 of 3')).toBeInTheDocument();
    expect(screen.getByText('variable')).toBeInTheDocument();

    clickButton('Next card');
    expect(screen.getByText('Card 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('algorithm')).toBeInTheDocument();
  });

  it('disables the arrows when there is only one card', () => {
    render(<VocabularyFlashcards vocabulary={[VOCABULARY[0]]} />);

    expect(screen.getByRole('button', {name: 'Previous card'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Next card'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Flip card'})).toBeEnabled();
  });

  it('says so when there is no vocabulary', () => {
    render(<VocabularyFlashcards vocabulary={[]} />);

    expect(screen.getByText('No vocabulary available.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
