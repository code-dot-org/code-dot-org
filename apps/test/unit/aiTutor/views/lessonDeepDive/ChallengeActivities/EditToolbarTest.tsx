import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditToolbar from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/EditToolbar';

const tool = (name: string) => screen.getByRole('button', {name});
const panel = (name: string) => screen.queryByRole('region', {name});

describe('EditToolbar', () => {
  it('starts with no panel open', () => {
    render(<EditToolbar />);

    expect(panel('Text')).not.toBeInTheDocument();
    expect(panel('Stickers')).not.toBeInTheDocument();
    expect(tool('Text')).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles the text panel from the Text tool', () => {
    render(<EditToolbar />);

    fireEvent.click(tool('Text'));
    expect(panel('Text')).toBeInTheDocument();
    expect(tool('Text')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(tool('Text'));
    expect(panel('Text')).not.toBeInTheDocument();
    expect(tool('Text')).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to the stickers panel from the Stickers tool', () => {
    render(<EditToolbar />);

    fireEvent.click(tool('Text'));
    fireEvent.click(tool('Stickers'));

    expect(panel('Text')).not.toBeInTheDocument();
    expect(panel('Stickers')).toBeInTheDocument();
    expect(tool('Stickers')).toHaveAttribute('aria-pressed', 'true');
    expect(tool('Text')).toHaveAttribute('aria-pressed', 'false');
  });

  it('returns focus to the opening tool when a panel is closed', () => {
    render(<EditToolbar />);

    fireEvent.click(tool('Stickers'));
    fireEvent.click(tool('Close Stickers'));

    expect(panel('Stickers')).not.toBeInTheDocument();
    expect(tool('Stickers')).toHaveFocus();
  });

  it('disables the tools that do nothing yet', () => {
    render(<EditToolbar />);

    for (const name of ['Effects', 'Rotate left', 'Rotate right', 'Delete']) {
      expect(tool(name)).toBeDisabled();
    }

    fireEvent.click(tool('Text'));
    expect(tool('Add to video')).toBeDisabled();
  });

  it('selects one color and one style at a time', () => {
    render(<EditToolbar />);
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
    render(<EditToolbar />);
    fireEvent.click(tool('Text'));

    const input = screen.getByLabelText('Type your text');
    fireEvent.change(input, {target: {value: 'Hello'}});

    expect(input).toHaveValue('Hello');
  });
});
