import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import IntroScreenCard from '@cdo/apps/quiz/builder/IntroScreenCard';
import {QuizConfigurationData} from '@cdo/apps/quiz/builder/types';

const INTRO_TEXT = 'This exam covers Units 1 to 3. You have 45 minutes.';

// Holds the edited text, as useQuizBuilderView does.
function renderCard(
  overrides: Partial<React.ComponentProps<typeof IntroScreenCard>> = {}
) {
  const onChange = jest.fn();
  const Wrapper = () => {
    const [text, setText] = useState(INTRO_TEXT);
    return (
      <IntroScreenCard
        customIntroText={text}
        savedCustomIntroText={INTRO_TEXT}
        hasTimeLimit={false}
        onChange={(fields: Partial<QuizConfigurationData>) => {
          onChange(fields);
          if (fields.customIntroText !== undefined) {
            setText(fields.customIntroText);
          }
        }}
        {...overrides}
      />
    );
  };
  render(<Wrapper />);
  return {onChange};
}

function expand() {
  fireEvent.click(screen.getByRole('button', {name: 'Edit intro screen'}));
}

describe('IntroScreenCard', () => {
  it('previews the content while collapsed, without the editor', () => {
    renderCard();
    expect(screen.getByText(INTRO_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('passes each edit on, with no Save button of its own', () => {
    const {onChange} = renderCard();
    expand();

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(INTRO_TEXT);
    fireEvent.change(textarea, {target: {value: '# Welcome'}});

    expect(onChange).toHaveBeenCalledWith({customIntroText: '# Welcome'});
    expect(screen.getByLabelText('Unsaved changes')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Save'})
    ).not.toBeInTheDocument();
  });

  it('discards changes back to the saved text', () => {
    renderCard();
    expand();

    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Edited'}});
    fireEvent.click(screen.getByRole('button', {name: 'Discard changes'}));

    expect(screen.getByRole('textbox')).toHaveValue(INTRO_TEXT);
    expect(screen.queryByLabelText('Unsaved changes')).not.toBeInTheDocument();
  });

  it('turns the intro screen off when removed from the quiz', () => {
    const {onChange} = renderCard();
    expand();

    fireEvent.click(screen.getByRole('button', {name: 'Remove from quiz'}));

    expect(onChange).toHaveBeenCalledWith({showIntroScreen: false});
  });

  it('blocks removing the intro screen while a time limit is set, and says why', () => {
    const {onChange} = renderCard({hasTimeLimit: true});
    expand();

    const remove = screen.getByRole('button', {name: 'Remove from quiz'});
    expect(remove).toHaveAttribute('aria-disabled', 'true');
    expect(remove).toHaveAccessibleDescription(
      'Remove the time limit in Configuration before removing the intro screen.'
    );

    fireEvent.click(remove);
    expect(onChange).not.toHaveBeenCalled();
  });
});
