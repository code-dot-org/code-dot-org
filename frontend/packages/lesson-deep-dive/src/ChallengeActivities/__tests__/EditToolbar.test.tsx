import {fireEvent, render, screen} from '@testing-library/react';
import {type ComponentProps} from 'react';
import {vi} from 'vitest';

import {type StickerSection} from '../../types';
import EditToolbar from '../EditToolbar';

const STICKER_SECTIONS: StickerSection[] = [
  {
    title: 'Reactions',
    stickers: [
      {name: 'Thumbs up', src: 'thumbs-up.svg'},
      {name: 'Fire', src: 'fire.svg'},
    ],
  },
  {title: 'Just for fun', stickers: [{name: 'Ghost', src: 'ghost.svg'}]},
];

const renderToolbar = (
  props: Partial<ComponentProps<typeof EditToolbar>> = {},
) =>
  render(
    <EditToolbar
      stickerSections={STICKER_SECTIONS}
      onAddText={vi.fn()}
      onAddSticker={vi.fn()}
      canDelete={false}
      onDelete={vi.fn()}
      {...props}
    />,
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
    const onAddText = vi.fn();
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
    const onDelete = vi.fn();
    const {rerender} = renderToolbar({onDelete});
    expect(tool('Delete')).toBeDisabled();

    rerender(
      <EditToolbar
        stickerSections={STICKER_SECTIONS}
        onAddText={vi.fn()}
        onAddSticker={vi.fn()}
        canDelete
        onDelete={onDelete}
      />,
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

  it('lists every sticker by name under its section', () => {
    renderToolbar();
    fireEvent.click(tool('Stickers'));

    for (const {title} of STICKER_SECTIONS) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    const stickers = STICKER_SECTIONS.flatMap(section => section.stickers);
    for (const {name} of stickers) {
      expect(tool(name)).toBeInTheDocument();
    }
  });

  it('adds the clicked sticker and keeps the panel open', () => {
    const onAddSticker = vi.fn();
    renderToolbar({onAddSticker});
    fireEvent.click(tool('Stickers'));

    fireEvent.click(tool('Fire'));
    fireEvent.click(tool('Ghost'));

    expect(onAddSticker.mock.calls.map(([sticker]) => sticker.name)).toEqual([
      'Fire',
      'Ghost',
    ]);
    expect(panel('Stickers')).toBeInTheDocument();
  });
});
