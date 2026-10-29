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

  it('answers on Send and clears the field', () => {
    const onAnswer = jest.fn();
    render(<PromptBar prompt={namePrompt} onAnswer={onAnswer} />);
    const field = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(field, {target: {value: 'Ada'}});
    fireEvent.click(screen.getByRole('button', {name: 'Send'}));
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
    const send = screen.getByRole('button', {name: 'Send'});
    expect((field as HTMLInputElement).disabled).toBe(true);
    expect((send as HTMLButtonElement).disabled).toBe(true);
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

  it('keeps the half-typed answer when the same question is asked again', () => {
    const {rerender} = render(
      <PromptBar prompt={namePrompt} onAnswer={jest.fn()} />
    );
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Ad'}});
    rerender(<PromptBar prompt={{...namePrompt}} onAnswer={jest.fn()} />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Ad');
  });

  it('keeps the half-typed answer across a rerun that asks again', () => {
    const {rerender} = render(
      <PromptBar prompt={namePrompt} onAnswer={jest.fn()} />
    );
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Ad'}});
    rerender(<PromptBar prompt={null} onAnswer={jest.fn()} />);
    rerender(<PromptBar prompt={{...namePrompt}} onAnswer={jest.fn()} />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Ad');
  });

  it('drops the half-typed answer when the same text asks for another variable', () => {
    const {rerender} = render(
      <PromptBar prompt={namePrompt} onAnswer={jest.fn()} />
    );
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Ad'}});
    rerender(
      <PromptBar
        prompt={{...namePrompt, variableName: 'nickname'}}
        onAnswer={jest.fn()}
      />
    );
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
  });

  describe('with choices', () => {
    const colorPrompt: ActivePrompt = {
      promptText: 'Pick a color',
      variableName: 'color',
      choices: ['red', 'blue', 'red'],
    };

    it('offers a button per choice, grouped under the question', () => {
      render(<PromptBar prompt={colorPrompt} onAnswer={jest.fn()} />);
      const group = screen.getByRole('group', {name: 'Pick a color'});
      expect(group.querySelectorAll('button')).toHaveLength(3);
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('answers with the chosen choice', () => {
      const onAnswer = jest.fn();
      render(<PromptBar prompt={colorPrompt} onAnswer={onAnswer} />);
      fireEvent.click(screen.getByRole('button', {name: 'blue'}));
      expect(onAnswer).toHaveBeenCalledWith('color', 'blue');
    });

    it('takes no answer while disabled', () => {
      const onAnswer = jest.fn();
      render(<PromptBar prompt={colorPrompt} onAnswer={onAnswer} disabled />);
      const blue = screen.getByRole('button', {name: 'blue'});
      expect((blue as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(blue);
      expect(onAnswer).not.toHaveBeenCalled();
    });

    it('replaces a typed question', () => {
      const {rerender} = render(
        <PromptBar prompt={namePrompt} onAnswer={jest.fn()} />
      );
      rerender(<PromptBar prompt={colorPrompt} onAnswer={jest.fn()} />);
      expect(screen.queryByRole('textbox')).toBeNull();
      expect(screen.getByRole('group', {name: 'Pick a color'})).toBeTruthy();
    });
  });
});
