import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import {
  INTRO_SCREEN_LOCKED_REASON,
  INTRO_SCREEN_REQUIRED_ERROR,
  TIME_LIMIT_ERROR,
} from '@cdo/apps/quiz/builder/constants';
import QuizConfigurationPanel from '@cdo/apps/quiz/builder/QuizConfigurationPanel';
import {QuizConfigurationData} from '@cdo/apps/quiz/builder/types';
import HttpClient from '@cdo/apps/util/HttpClient';

// No time limit by default.
const INITIAL_VALUES: QuizConfigurationData = {
  showCorrectness: true,
  revealAnswerExplanation: false,
  showIntroScreen: true,
  purpose: 'practice',
  allowMultipleAttempts: true,
  showQuestionsAfterSubmit: false,
};

const TIME_LIMIT_LABEL = /Set time limit/;

// Holds the draft, as useQuizBuilderView does.
function renderPanel(values: Partial<QuizConfigurationData> = {}) {
  const onChange = jest.fn();
  const Wrapper = () => {
    const [draft, setDraft] = useState({...INITIAL_VALUES, ...values});
    return (
      <QuizConfigurationPanel
        values={draft}
        onChange={fields => {
          onChange(fields);
          setDraft(prev => ({...prev, ...fields}));
        }}
      />
    );
  };
  render(<Wrapper />);
  return {onChange};
}

const isChecked = (label: string) =>
  (screen.getByLabelText(label) as HTMLInputElement).checked;

describe('QuizConfigurationPanel', () => {
  it('reports each edit and sends nothing to the server', () => {
    const put = jest.spyOn(HttpClient, 'put');
    const {onChange} = renderPanel();

    fireEvent.click(screen.getByLabelText('Allow multiple attempts'));
    fireEvent.change(screen.getByLabelText(/Quiz display name/), {
      target: {value: 'Unit 1 check'},
    });

    expect(onChange).toHaveBeenCalledWith({allowMultipleAttempts: false});
    expect(onChange).toHaveBeenCalledWith({displayName: 'Unit 1 check'});
    expect(isChecked('Allow multiple attempts')).toBe(false);
    expect(put).not.toHaveBeenCalled();
  });

  it('shows the values it is given, such as the intro screen removed in the workspace', () => {
    const {rerender} = render(
      <QuizConfigurationPanel values={INITIAL_VALUES} onChange={jest.fn()} />
    );
    expect(isChecked('Show intro screen')).toBe(true);

    rerender(
      <QuizConfigurationPanel
        values={{...INITIAL_VALUES, showIntroScreen: false}}
        onChange={jest.fn()}
      />
    );
    expect(isChecked('Show intro screen')).toBe(false);
  });

  it("choosing a purpose for the first time applies that purpose's defaults in one change", () => {
    const {onChange} = renderPanel({purpose: undefined});
    expect(screen.getByText('What is this quiz for?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Exam', {exact: true}));

    expect(onChange).toHaveBeenCalledWith({
      purpose: 'exam',
      showIntroScreen: true,
      timeLimitMinutes: undefined,
      allowMultipleAttempts: false,
      showCorrectness: false,
      revealAnswerExplanation: false,
      showQuestionsAfterSubmit: false,
    });
    expect(
      screen.queryByText('What is this quiz for?')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Purpose')).toHaveValue('exam');
    expect(isChecked('Allow multiple attempts')).toBe(false);
    expect(isChecked('Show correctness')).toBe(false);
  });

  it('exam_simulation defaults: correctness shown, questions and explanation hidden', () => {
    renderPanel({purpose: undefined});

    fireEvent.click(screen.getByText('Exam simulation', {exact: true}));

    expect(isChecked('Show correctness')).toBe(true);
    expect(isChecked('Show questions after submit')).toBe(false);
    expect(
      screen.queryByLabelText('Reveal answer and explanation')
    ).not.toBeInTheDocument();
  });

  it("clears a time limit when the chosen purpose's defaults have none", () => {
    renderPanel({purpose: undefined, timeLimitMinutes: 10});

    fireEvent.click(screen.getByText('Practice', {exact: true}));

    expect(screen.getByLabelText(TIME_LIMIT_LABEL)).toHaveValue(null);
  });

  it('changing an already-set purpose via the dropdown leaves every other field alone', () => {
    const {onChange} = renderPanel();

    fireEvent.change(screen.getByLabelText('Purpose'), {
      target: {value: 'exam'},
    });

    expect(onChange).toHaveBeenCalledWith({purpose: 'exam'});
    expect(isChecked('Show intro screen')).toBe(INITIAL_VALUES.showIntroScreen);
  });

  it('reports the time limit as a number, or unset when blank', () => {
    const {onChange} = renderPanel();
    const field = screen.getByLabelText(TIME_LIMIT_LABEL);

    fireEvent.change(field, {target: {value: '10'}});
    expect(onChange).toHaveBeenLastCalledWith({
      timeLimitMinutes: 10,
      showIntroScreen: true,
    });

    fireEvent.change(field, {target: {value: ''}});
    expect(onChange).toHaveBeenLastCalledWith({timeLimitMinutes: undefined});
  });

  it('shows an error on a time limit that is not a positive whole number', () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText(TIME_LIMIT_LABEL), {
      target: {value: '0'},
    });

    expect(screen.getAllByText(TIME_LIMIT_ERROR).length).toBeGreaterThan(0);
  });

  it('locks show intro screen on while a time limit is set, and says why', () => {
    renderPanel({timeLimitMinutes: 10});

    const toggle = screen.getByLabelText('Show intro screen');
    expect(toggle).toBeChecked();
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAccessibleDescription(INTRO_SCREEN_LOCKED_REASON);
  });

  it('turns the intro screen on when a time limit is set', () => {
    renderPanel({showIntroScreen: false});

    fireEvent.change(screen.getByLabelText(TIME_LIMIT_LABEL), {
      target: {value: '10'},
    });

    expect(isChecked('Show intro screen')).toBe(true);
    expect(
      screen.queryByText(INTRO_SCREEN_REQUIRED_ERROR)
    ).not.toBeInTheDocument();
  });

  it('turning off showCorrectness also turns off reveal in the same change', () => {
    const {onChange} = renderPanel({
      showQuestionsAfterSubmit: true,
      revealAnswerExplanation: true,
    });

    fireEvent.click(screen.getByLabelText('Show correctness'));

    expect(onChange).toHaveBeenCalledWith({
      showCorrectness: false,
      revealAnswerExplanation: false,
    });
  });

  it('turning off showQuestionsAfterSubmit also turns off reveal in the same change', () => {
    const {onChange} = renderPanel({
      showQuestionsAfterSubmit: true,
      revealAnswerExplanation: true,
    });

    fireEvent.click(screen.getByLabelText('Show questions after submit'));

    expect(onChange).toHaveBeenCalledWith({
      showQuestionsAfterSubmit: false,
      revealAnswerExplanation: false,
    });
  });

  it('changes reveal answer/explanation on its own once shown', () => {
    const {onChange} = renderPanel({showQuestionsAfterSubmit: true});

    fireEvent.click(screen.getByLabelText('Reveal answer and explanation'));

    expect(onChange).toHaveBeenCalledWith({revealAnswerExplanation: true});
  });

  it('hides the reveal toggle when questions are hidden after submit, even if correctness is shown', () => {
    renderPanel({showCorrectness: true, showQuestionsAfterSubmit: false});

    expect(
      screen.queryByLabelText('Reveal answer and explanation')
    ).not.toBeInTheDocument();
  });
});
