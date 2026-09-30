import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import MultipleChoiceQuestion from '@cdo/apps/adaptive/views/steps/MultipleChoiceQuestion';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

const question: QuizQuestionSummary = {
  id: 1,
  type: 'MultipleChoiceQuestion',
  questionName: 'pick-one',
  stem: 'Pick one',
  choices: [
    {id: 'a', text: 'Alpha'},
    {id: 'b', text: 'Beta'},
    {id: 'c', text: 'Gamma'},
  ],
  page: 1,
};

function renderQuestion(
  props: Partial<React.ComponentProps<typeof MultipleChoiceQuestion>> = {}
) {
  const onSelectChoice = jest.fn();
  render(
    <MultipleChoiceQuestion
      question={question}
      selectedChoiceId={null}
      onSelectChoice={onSelectChoice}
      verdict={undefined}
      disabled={false}
      shakeNonce={0}
      focusOnMount={false}
      {...props}
    />
  );
  return {onSelectChoice};
}

describe('MultipleChoiceQuestion', () => {
  it('groups the choices as radios under the stem', () => {
    renderQuestion();
    expect(screen.getByRole('group', {name: 'Pick one'})).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('reports the chosen choice and shows the selection it is given', () => {
    const {onSelectChoice} = renderQuestion({selectedChoiceId: 'b'});
    expect(screen.getByLabelText('Beta')).toBeChecked();
    expect(screen.getByLabelText('Alpha')).not.toBeChecked();
    fireEvent.click(screen.getByLabelText('Gamma'));
    expect(onSelectChoice).toHaveBeenCalledWith('c');
  });

  it('disables every choice when asked', () => {
    renderQuestion({disabled: true, selectedChoiceId: 'a'});
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });

  it('moves focus to the stem only when asked', () => {
    renderQuestion({focusOnMount: true});
    expect(screen.getByText('Pick one')).toHaveFocus();
  });
});
