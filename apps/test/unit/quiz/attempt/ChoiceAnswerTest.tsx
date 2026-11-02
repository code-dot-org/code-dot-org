import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ChoiceAnswer, {
  ChoiceAnswerOption,
} from '@cdo/apps/quiz/attempt/ChoiceAnswer';

const CHOICES: ChoiceAnswerOption[] = [
  {id: '0', text: 'Three', status: 'neutral', isSelected: false},
  {
    id: '1',
    text: 'Four',
    status: 'incorrect',
    isSelected: true,
    srText: 'Your answer, incorrect',
  },
];

describe('ChoiceAnswer', () => {
  it('lists each choice with its letter', () => {
    render(<ChoiceAnswer indicator="radio" choices={CHOICES} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/^A\. Three$/);
    expect(items[1]).toHaveTextContent('B. Four');
  });

  it("renders a choice's screen reader text", () => {
    render(<ChoiceAnswer indicator="checkbox" choices={CHOICES} />);

    expect(screen.getByText('Your answer, incorrect')).toBeInTheDocument();
  });
});
