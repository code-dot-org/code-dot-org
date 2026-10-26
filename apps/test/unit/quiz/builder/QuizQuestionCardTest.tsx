import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {act, useState} from 'react';

import QuizQuestionCard from '@cdo/apps/quiz/builder/QuizQuestionCard';
import {MatchDraft, QuizBuilderQuestion} from '@cdo/apps/quiz/builder/types';

const QUESTION: QuizBuilderQuestion = {
  id: 7,
  type: 'MultipleChoiceQuestion',
  questionName: 'Existing question',
  questionTitle: 'What is 2 + 2?',
  choices: [
    {id: 'a', text: '3'},
    {id: 'b', text: '4'},
  ],
  correctChoiceId: 'b',
  description: null,
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
    expect(screen.getByLabelText('Internal name*')).toHaveValue(
      'Existing question'
    );
  });

  it('starts expanded when isExpanded is set', () => {
    renderCard({isExpanded: true});

    expect(screen.getByRole('tab', {name: 'Question'})).toBeInTheDocument();
  });

  it('marks Internal name and Question title as required', () => {
    renderCard({isExpanded: true});

    expect(screen.getByLabelText('Internal name*')).toBeRequired();
    expect(screen.getByLabelText('Question title*')).toBeRequired();
    expect(
      screen.getByRole('textbox', {name: 'Description'})
    ).not.toBeRequired();
  });

  it('describes each Question tab field with its helper text', () => {
    renderCard({isExpanded: true});

    expect(screen.getByLabelText('Internal name*')).toHaveAccessibleDescription(
      'Not shown to students. A short label to help you find and group this question.'
    );
    expect(
      screen.getByLabelText('Question title*')
    ).toHaveAccessibleDescription(
      'The main question text students see. For a simple question, this can be the whole question.'
    );
    expect(
      screen.getByRole('textbox', {name: 'Description'})
    ).toHaveAccessibleDescription(
      'Additional context, instructions or content (e.g. a code snippet) shown below the title. Supports Markdown.'
    );
  });

  it('saves the edited draft and collapses on success', async () => {
    const {onSave} = renderCard({isExpanded: true});

    fireEvent.change(screen.getByLabelText('Internal name*'), {
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

  it('saves an edited description', async () => {
    const {onSave} = renderCard({isExpanded: true});

    fireEvent.change(screen.getByLabelText(/Description/), {
      target: {value: 'Think about **lifecycle**.'},
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    });

    expect(onSave).toHaveBeenCalledWith(
      7,
      expect.objectContaining({description: 'Think about **lifecycle**.'})
    );
  });

  it('disables Save and Discard until something is edited', () => {
    renderCard({isExpanded: true});

    expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();
    expect(
      screen.getByRole('button', {name: 'Discard changes'})
    ).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Internal name*'), {
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

    fireEvent.change(screen.getByLabelText('Internal name*'), {
      target: {value: 'Something else'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    expect(screen.getByLabelText('Internal name*')).toBeDisabled();

    await act(async () => {
      resolveSave(7);
    });
  });

  it('discards edits back to the saved question', () => {
    renderCard({isExpanded: true});

    const nameField = screen.getByLabelText('Internal name*');
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

    fireEvent.change(screen.getByLabelText('Internal name*'), {
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

    it('focuses the Internal name field, since the create dropdown that made it loses focus', () => {
      renderCard({question: PENDING_QUESTION, isExpanded: true});

      expect(screen.getByLabelText('Internal name*')).toHaveFocus();
    });
  });

  it('does not take focus when an existing question opens expanded', () => {
    renderCard({isExpanded: true});

    expect(screen.getByLabelText('Internal name*')).not.toHaveFocus();
  });

  it('opens a free response question saved without choices', () => {
    // FreeResponseQuestion#builder_content_json sends no choices.
    const {choices, correctChoiceId, ...shared} = QUESTION;
    void choices;
    void correctChoiceId;
    renderCard({
      question: {...shared, type: 'FreeResponseQuestion'},
      isExpanded: true,
    });

    fireEvent.click(screen.getByRole('tab', {name: 'Answers'}));

    expect(screen.queryByRole('button', {name: 'Add option'})).toBeNull();
    expect(
      screen.getByLabelText('Answer explanation (optional)')
    ).toBeInTheDocument();
  });

  describe('a match question', () => {
    const {choices, correctChoiceId, ...shared} = QUESTION;
    void choices;
    void correctChoiceId;
    const MATCH_QUESTION: QuizBuilderQuestion = {
      ...shared,
      type: 'MatchQuestion',
      pairs: [
        {
          id: 'p1',
          items: [
            {id: 'k3f', text: '1 + 1'},
            {id: '9qz', text: '2'},
          ],
        },
        {
          id: 'p2',
          items: [
            {id: 'r7w', text: '2 + 1'},
            {id: 'm2d', text: '3'},
          ],
        },
      ],
    };

    function openAnswers() {
      const utils = renderCard({question: MATCH_QUESTION, isExpanded: true});
      fireEvent.click(screen.getByRole('tab', {name: 'Answers'}));
      return utils;
    }

    it('shows each pair as two labeled fields under an Options heading', () => {
      openAnswers();

      expect(screen.getByRole('group', {name: 'Options'})).toBeInTheDocument();
      expect(screen.getByLabelText('Pair 1, term')).toHaveAttribute(
        'placeholder',
        'Term'
      );
      expect(screen.getByLabelText('Pair 1, definition')).toHaveAttribute(
        'placeholder',
        'Definition'
      );
      expect(screen.getByLabelText('Pair 1, term')).toHaveValue('1 + 1');
      expect(screen.getByLabelText('Pair 1, definition')).toHaveValue('2');
      expect(screen.getByLabelText('Pair 2, term')).toHaveValue('2 + 1');
      expect(screen.getByLabelText('Pair 2, definition')).toHaveValue('3');
    });

    it('saves edited pair text', async () => {
      const {onSave} = openAnswers();

      fireEvent.change(screen.getByLabelText('Pair 2, definition'), {
        target: {value: 'three'},
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Save'}));
      });

      expect(onSave).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
          pairs: [
            MATCH_QUESTION.pairs[0],
            {
              id: 'p2',
              items: [
                {id: 'r7w', text: '2 + 1'},
                {id: 'm2d', text: 'three'},
              ],
            },
          ],
        })
      );
    });

    it('adds an empty pair with new, distinct ids', async () => {
      const {onSave} = openAnswers();

      fireEvent.click(screen.getByRole('button', {name: 'Add pair'}));

      expect(screen.getByLabelText('Pair 3, term')).toHaveValue('');
      expect(screen.getByLabelText('Pair 3, definition')).toHaveValue('');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Save'}));
      });
      const {pairs}: MatchDraft = onSave.mock.calls[0][1];
      const ids = pairs.flatMap(pair => [
        pair.id,
        ...pair.items.map(item => item.id),
      ]);
      expect(ids).toHaveLength(9);
      expect(new Set(ids).size).toBe(9);
    });

    it('does not delete below 2 pairs', () => {
      openAnswers();

      expect(
        screen.getByRole('button', {name: 'Delete pair 1'})
      ).toBeDisabled();

      fireEvent.click(screen.getByRole('button', {name: 'Add pair'}));
      fireEvent.click(screen.getByRole('button', {name: 'Delete pair 1'}));

      expect(screen.getByLabelText('Pair 1, term')).toHaveValue('2 + 1');
      expect(screen.queryByLabelText('Pair 3, term')).toBeNull();
    });
  });
});
