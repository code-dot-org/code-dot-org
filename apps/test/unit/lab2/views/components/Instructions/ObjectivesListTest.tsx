import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {ObjectiveItem} from '@cdo/apps/lab2/types';
import ObjectivesList from '@cdo/apps/lab2/views/components/Instructions/ObjectivesList';

jest.mock('@cdo/apps/lab2/views/components/TextToSpeech', () => ({
  __esModule: true,
  default: () => <div>Text to speech</div>,
}));

const ITEMS: ObjectiveItem[] = [
  {id: 'place', text: 'Place the **treasure**.', done: true},
  {id: 'code', text: 'Add a block.', done: false},
];

describe('ObjectivesList', () => {
  it('marks each item done or to do', () => {
    render(<ObjectivesList title="**Find it**" items={ITEMS} />);
    expect(screen.getByText('Find it')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Done:');
    expect(items[0]).toHaveTextContent('Place the treasure.');
    expect(items[1]).toHaveTextContent('To do:');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('reports hovers and clicks by item when asked', () => {
    const onItemHover = jest.fn();
    const onItemClick = jest.fn();
    render(
      <ObjectivesList
        items={ITEMS}
        onItemHover={onItemHover}
        onItemClick={onItemClick}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[1]);
    expect(onItemClick).toHaveBeenCalledWith(ITEMS[1], 1);
    const items = screen.getAllByRole('listitem');
    fireEvent.mouseEnter(items[0]);
    expect(onItemHover).toHaveBeenLastCalledWith(ITEMS[0], 0);
    fireEvent.mouseLeave(items[0]);
    expect(onItemHover).toHaveBeenLastCalledWith(undefined, 0);
  });
});
