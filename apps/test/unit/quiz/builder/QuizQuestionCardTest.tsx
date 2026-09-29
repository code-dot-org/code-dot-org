import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import QuizQuestionCard from '@cdo/apps/quiz/builder/QuizQuestionCard';
import {QuizBuilderQuestion} from '@cdo/apps/quiz/builder/types';

const QUESTION: QuizBuilderQuestion = {
  id: 7,
  type: 'MultipleChoiceQuestion',
  questionName: 'Existing question',
  stem: 'What is 2 + 2?',
  choices: [
    {id: 'a', text: '3'},
    {id: 'b', text: '4'},
  ],
  correctChoiceId: 'b',
  explanation: null,
  standards: [],
  attachedToOtherQuizzes: false,
  usedInPublishedUnit: false,
  page: 1,
};

// QuizQuestionCard doesn't own its expanded state (QuizBuilderWorkspace does,
// so only one card in the outline can be expanded at a time) - this wrapper
// stands in for that parent.
function renderCard(
  props: Partial<React.ComponentProps<typeof QuizQuestionCard>> = {}
) {
  const onSave = jest.fn().mockResolvedValue(QUESTION.id);
  const onRemove = jest.fn().mockResolvedValue(true);
  const Wrapper = () => {
    const [isExpanded, setIsExpanded] = useState(props.isExpanded ?? false);
    return (
      <QuizQuestionCard
        question={QUESTION}
        onSave={onSave}
        onRemove={onRemove}
        {...props}
        isExpanded={isExpanded}
        onExpandedChange={setIsExpanded}
      />
    );
  };
  const utils = render(<Wrapper />);
  return {...utils, onSave, onRemove};
}

describe('QuizQuestionCard', () => {
  it('shows a collapsed preview by default', () => {
    renderCard();

    expect(screen.getByText('Existing question')).toBeInTheDocument();
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.queryByRole('tab', {name: 'Question'})).toBeNull();
  });

  it('expands into the editor when the edit button is clicked', () => {
    renderCard();

    fireEvent.click(screen.getByRole('button', {name: 'Edit question'}));

    expect(screen.getByRole('tab', {name: 'Question'})).toBeInTheDocument();
    expect(screen.getByLabelText('Internal name')).toHaveValue(
      'Existing question'
    );
  });

  it('starts expanded when isExpanded is set', () => {
    renderCard({isExpanded: true});

    expect(screen.getByRole('tab', {name: 'Question'})).toBeInTheDocument();
  });

  it('saves the edited draft and collapses on success', async () => {
    const {onSave} = renderCard({isExpanded: true});

    fireEvent.change(screen.getByLabelText('Internal name'), {
      target: {value: 'Renamed question'},
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    });

    expect(onSave).toHaveBeenCalledWith(
      7,
      expect.objectContaining({questionName: 'Renamed question'})
    );
    expect(screen.queryByRole('tab', {name: 'Question'})).toBeNull();
  });

  it('disables Save and Discard until something is edited', () => {
    renderCard({isExpanded: true});

    expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();
    expect(
      screen.getByRole('button', {name: 'Discard changes'})
    ).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Internal name'), {
      target: {value: 'Something else'},
    });

    expect(screen.getByRole('button', {name: 'Save'})).toBeEnabled();
    expect(screen.getByRole('button', {name: 'Discard changes'})).toBeEnabled();
  });

  it('disables editable fields while a save is in flight', async () => {
    let resolveSave: (id: number) => void = () => {};
    const onSave = jest.fn(
      () =>
        new Promise<number>(resolve => {
          resolveSave = resolve;
        })
    );
    renderCard({isExpanded: true, onSave});

    fireEvent.change(screen.getByLabelText('Internal name'), {
      target: {value: 'Something else'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    expect(screen.getByLabelText('Internal name')).toBeDisabled();

    await act(async () => {
      resolveSave(7);
    });
  });

  it('discards edits back to the saved question', () => {
    renderCard({isExpanded: true});

    const nameField = screen.getByLabelText('Internal name');
    fireEvent.change(nameField, {target: {value: 'Something else'}});
    fireEvent.click(screen.getByRole('button', {name: 'Discard changes'}));

    expect(nameField).toHaveValue('Existing question');
  });

  it('does not show an unsaved-changes badge before any edit', () => {
    renderCard({isExpanded: true});

    expect(screen.queryByLabelText('Unsaved changes')).toBeNull();
  });

  it('shows an unsaved-changes badge after an edit, even once collapsed', () => {
    renderCard({isExpanded: true});

    fireEvent.change(screen.getByLabelText('Internal name'), {
      target: {value: 'Something else'},
    });
    expect(screen.getByLabelText('Unsaved changes')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Collapse question'}));
    expect(screen.getByLabelText('Unsaved changes')).toBeInTheDocument();
  });

  it('removes the question from the quiz on click, with no confirmation step', async () => {
    const {onRemove} = renderCard({isExpanded: true});

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Remove from quiz'}));
    });
    expect(onRemove).toHaveBeenCalledWith(7);
  });

  describe('a pending (not yet saved) question', () => {
    const PENDING_QUESTION: QuizBuilderQuestion = {...QUESTION, id: -1};

    it('enables Save immediately, with nothing edited', () => {
      renderCard({question: PENDING_QUESTION, isExpanded: true});

      expect(screen.getByRole('button', {name: 'Save'})).toBeEnabled();
    });

    it('shows the unsaved-changes badge immediately, with nothing edited', () => {
      renderCard({question: PENDING_QUESTION, isExpanded: true});

      expect(screen.getByLabelText('Unsaved changes')).toBeInTheDocument();
    });
  });
});
