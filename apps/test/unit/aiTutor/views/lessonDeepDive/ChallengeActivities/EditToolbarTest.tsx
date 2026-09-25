import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditToolbar from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/EditToolbar';

const renderToolbar = (
  props: Partial<React.ComponentProps<typeof EditToolbar>> = {}
) =>
  render(
    <EditToolbar
      onAddText={jest.fn()}
      canDelete={false}
      onDelete={jest.fn()}
      {...props}
    />
  );

const tool = (name: string) => screen.getByRole('button', {name});
const panel = (name: string) => screen.queryByRole('region', {name});

describe('EditToolbar', () => {
  it('starts with no panel open', () => {
    renderToolbar();

    expect(panel('Text')).not.toBeInTheDocument();
    expect(panel('Stickers')).not.toBeInTheDocument();
    expect(tool('Text')).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles the text panel from the Text tool', () => {
    renderToolbar();

    fireEvent.click(tool('Text'));
    expect(panel('Text')).toBeInTheDocument();
    expect(tool('Text')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(tool('Text'));
    expect(panel('Text')).not.toBeInTheDocument();
    expect(tool('Text')).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to the stickers panel from the Stickers tool', () => {
    renderToolbar();

    fireEvent.click(tool('Text'));
    fireEvent.click(tool('Stickers'));

    expect(panel('Text')).not.toBeInTheDocument();
    expect(panel('Stickers')).toBeInTheDocument();
    expect(tool('Stickers')).toHaveAttribute('aria-pressed', 'true');
    expect(tool('Text')).toHaveAttribute('aria-pressed', 'false');
  });

  it('returns focus to the opening tool when a panel is closed', () => {
    renderToolbar();

    fireEvent.click(tool('Stickers'));
    fireEvent.click(tool('Close Stickers'));

    expect(panel('Stickers')).not.toBeInTheDocument();
    expect(tool('Stickers')).toHaveFocus();
  });

  it('disables the tools that do nothing yet', () => {
    renderToolbar();

    for (const name of ['Effects', 'Rotate left', 'Rotate right']) {
      expect(tool(name)).toBeDisabled();
    }
  });

  it('adds the typed text with the chosen color and style', () => {
    const onAddText = jest.fn();
    renderToolbar({onAddText});
    fireEvent.click(tool('Text'));

    expect(tool('Add to video')).toBeDisabled();
    const input = screen.getByLabelText('Type your text');
    fireEvent.change(input, {target: {value: '  '}});
    expect(tool('Add to video')).toBeDisabled();

    fireEvent.change(input, {target: {value: ' Hello '}});
    fireEvent.click(screen.getByRole('radio', {name: 'Pink'}));
    fireEvent.click(screen.getByRole('radio', {name: 'Glow'}));
    fireEvent.click(tool('Add to video'));

    expect(onAddText).toHaveBeenCalledWith({
      text: 'Hello',
      color: '#e0529c',
      style: 'Glow',
    });
    expect(input).toHaveValue('');
    expect(screen.getByRole('radio', {name: 'Pink'})).toBeChecked();
    expect(screen.getByRole('radio', {name: 'Glow'})).toBeChecked();
  });

  it('deletes only when there is a selection', () => {
    const onDelete = jest.fn();
    const {rerender} = renderToolbar({onDelete});
    expect(tool('Delete')).toBeDisabled();

    rerender(
      <EditToolbar onAddText={jest.fn()} canDelete onDelete={onDelete} />
    );
    fireEvent.click(tool('Delete'));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('selects one color and one style at a time', () => {
    renderToolbar();
    fireEvent.click(tool('Text'));

    expect(screen.getByRole('radio', {name: 'White'})).toBeChecked();
    fireEvent.click(screen.getByRole('radio', {name: 'Pink'}));
    expect(screen.getByRole('radio', {name: 'Pink'})).toBeChecked();
    expect(screen.getByRole('radio', {name: 'White'})).not.toBeChecked();

    expect(screen.getByRole('radio', {name: 'Normal'})).toBeChecked();
    fireEvent.click(screen.getByRole('radio', {name: 'Glow'}));
    expect(screen.getByRole('radio', {name: 'Glow'})).toBeChecked();
    expect(screen.getByRole('radio', {name: 'Normal'})).not.toBeChecked();
  });

  it('keeps what is typed', () => {
    renderToolbar();
    fireEvent.click(tool('Text'));

    const input = screen.getByLabelText('Type your text');
    fireEvent.change(input, {target: {value: 'Hello'}});

    expect(input).toHaveValue('Hello');
  });
});
