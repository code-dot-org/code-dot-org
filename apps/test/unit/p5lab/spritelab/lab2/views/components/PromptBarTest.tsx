import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import PromptBar from '@cdo/apps/p5lab/spritelab/lab2/views/components/PromptBar';
import {SpritelabPrompt} from '@cdo/apps/types/redux';

const textPrompt: SpritelabPrompt = {
  promptType: 'TEXT',
  promptText: 'What is your name?',
  variableName: 'name',
};

describe('PromptBar', () => {
  it('shows no field without a question', () => {
    render(<PromptBar onAnswer={jest.fn()} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows no field for a multiple-choice question', () => {
    render(
      <PromptBar
        prompt={{
          promptType: 'MULTIPLE_CHOICE',
          promptText: 'Pick one',
          variableName: 'pick',
          choices: ['a', 'b'],
        }}
        onAnswer={jest.fn()}
      />
    );
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('labels the field with the question', () => {
    render(<PromptBar prompt={textPrompt} onAnswer={jest.fn()} />);
    expect(
      screen.getByRole('textbox', {name: 'What is your name?'})
    ).toBeTruthy();
  });

  it('answers on Submit and clears the field', () => {
    const onAnswer = jest.fn();
    render(<PromptBar prompt={textPrompt} onAnswer={onAnswer} />);
    const field = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(field, {target: {value: 'Ada'}});
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onAnswer).toHaveBeenCalledWith('name', 'Ada');
    expect(field.value).toBe('');
  });

  it('answers when the form is submitted from the field', () => {
    const onAnswer = jest.fn();
    render(<PromptBar prompt={textPrompt} onAnswer={onAnswer} />);
    const field = screen.getByRole('textbox');
    fireEvent.change(field, {target: {value: '7'}});
    fireEvent.submit(field);
    expect(onAnswer).toHaveBeenCalledWith('name', '7');
  });
});
