import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {ActivePrompt} from '@cdo/apps/p5lab/spritelab/lab2/redux/spriteLab2Redux';
import PromptBar from '@cdo/apps/p5lab/spritelab/lab2/views/components/PromptBar';

const namePrompt: ActivePrompt = {
  promptText: 'What is your name?',
  variableName: 'name',
};

describe('PromptBar', () => {
  it('shows no field without a question', () => {
    render(<PromptBar prompt={null} onAnswer={jest.fn()} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('labels the field with the question', () => {
    render(<PromptBar prompt={namePrompt} onAnswer={jest.fn()} />);
    expect(
      screen.getByRole('textbox', {name: 'What is your name?'})
    ).toBeTruthy();
  });

  it('answers on Submit and clears the field', () => {
    const onAnswer = jest.fn();
    render(<PromptBar prompt={namePrompt} onAnswer={onAnswer} />);
    const field = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(field, {target: {value: 'Ada'}});
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onAnswer).toHaveBeenCalledWith('name', 'Ada');
    expect(field.value).toBe('');
  });

  it('answers when the form is submitted from the field', () => {
    const onAnswer = jest.fn();
    render(<PromptBar prompt={namePrompt} onAnswer={onAnswer} />);
    const field = screen.getByRole('textbox');
    fireEvent.change(field, {target: {value: '7'}});
    fireEvent.submit(field);
    expect(onAnswer).toHaveBeenCalledWith('name', '7');
  });

  it('shows the question but takes no answer while disabled', () => {
    const onAnswer = jest.fn();
    render(<PromptBar prompt={namePrompt} onAnswer={onAnswer} disabled />);
    const field = screen.getByRole('textbox', {name: 'What is your name?'});
    const submit = screen.getByRole('button', {name: 'Submit'});
    expect((field as HTMLInputElement).disabled).toBe(true);
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.submit(field);
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('shows the newest question and drops the half-typed answer', () => {
    const onAnswer = jest.fn();
    const {rerender} = render(
      <PromptBar prompt={namePrompt} onAnswer={onAnswer} />
    );
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Ad'}});
    rerender(
      <PromptBar
        prompt={{promptText: 'How old are you?', variableName: 'age'}}
        onAnswer={onAnswer}
      />
    );
    const field = screen.getByRole('textbox', {
      name: 'How old are you?',
    }) as HTMLInputElement;
    expect(field.value).toBe('');
    fireEvent.change(field, {target: {value: '9'}});
    fireEvent.submit(field);
    expect(onAnswer).toHaveBeenCalledWith('age', '9');
  });
});
