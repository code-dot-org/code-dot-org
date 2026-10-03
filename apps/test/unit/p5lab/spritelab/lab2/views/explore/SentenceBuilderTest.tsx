import {fireEvent, render, screen} from '@testing-library/react';
import React, {useState} from 'react';

import {
  CHARACTER_SENTENCE,
  Choices,
} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/exploreSentences';
import SentenceBuilder from '@cdo/apps/p5lab/spritelab/lab2/views/explore/SentenceBuilder';

const Harness: React.FunctionComponent<{initial?: Choices}> = ({
  initial = {},
}) => {
  const [choices, setChoices] = useState<Choices>(initial);
  return (
    <SentenceBuilder
      sentence={CHARACTER_SENTENCE}
      choices={choices}
      onChange={setChoices}
    />
  );
};

describe('SentenceBuilder', () => {
  it('opens a tray for a clicked slot and closes it on a pick', () => {
    render(<Harness />);
    expect(screen.queryByRole('group')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Choose a creature'}));
    expect(
      screen.getByRole('group', {name: 'Words for creature'})
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'cat'}));
    expect(
      screen.getByRole('button', {name: 'creature: cat. Change it'})
    ).toBeTruthy();
    expect(screen.queryByRole('group')).toBeNull();
    fireEvent.click(
      screen.getByRole('button', {name: 'creature: cat. Change it'})
    );
    fireEvent.click(screen.getByRole('button', {name: 'wizard'}));
    expect(
      screen.getByRole('button', {name: 'creature: wizard. Change it'})
    ).toBeTruthy();
  });

  it('removes a word with its x', () => {
    render(<Harness initial={{creature: 'cat'}} />);
    fireEvent.click(screen.getByRole('button', {name: 'Remove cat'}));
    expect(
      screen.getByRole('button', {name: 'Choose a creature'})
    ).toBeTruthy();
  });

  it('dims a phrase while its slot is empty', () => {
    render(<Harness initial={{creature: 'cat'}} />);
    const wearing = screen.getByText('wearing a').parentElement as HTMLElement;
    expect(wearing.className).toMatch(/dimmed/);
    fireEvent.click(
      screen.getByRole('button', {name: 'Choose a clothing (optional)'})
    );
    fireEvent.click(screen.getByRole('button', {name: 'hat'}));
    expect(wearing.className).not.toMatch(/dimmed/);
  });

  it('takes a dropped word on its own slot only', () => {
    render(<Harness />);
    const data: Record<string, string> = {};
    const dataTransfer = {
      setData: (type: string, value: string) => {
        data[type] = value;
      },
      getData: (type: string) => data[type] ?? '',
      types: ['application/x-spritelab2-word'],
      effectAllowed: 'copy',
    };
    fireEvent.click(screen.getByRole('button', {name: 'Choose a creature'}));
    fireEvent.dragStart(screen.getByRole('button', {name: 'penguin'}), {
      dataTransfer,
    });
    const adjective = screen
      .getByRole('button', {name: 'Choose a adjective (optional)'})
      .closest('span') as HTMLElement;
    fireEvent.drop(adjective, {dataTransfer});
    expect(
      screen.queryByRole('button', {name: /penguin\. Change it/})
    ).toBeNull();
    const creature = screen
      .getByRole('button', {name: 'Choose a creature'})
      .closest('span') as HTMLElement;
    fireEvent.drop(creature, {dataTransfer});
    expect(
      screen.getByRole('button', {name: 'creature: penguin. Change it'})
    ).toBeTruthy();
  });
});
