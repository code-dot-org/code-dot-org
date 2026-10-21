import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import GenerateImageView from '@cdo/apps/p5lab/spritelab/lab2/views/GenerateImageView';

// The character-set offer has rules a refactor could silently break: it
// exists only for sprites drawn from a fresh base, and regenerating an
// existing set keeps it a set unless the student unchecks it.

// The student form's short label; the advanced form spells the offer out.
const SET_CHECKBOX = 'Generate animation';
const SET_CHECKBOX_ADVANCED = /Make a character set/;

const SHEET = {
  src: 'data:image/png;base64,',
  frameSize: {x: 100, y: 100},
  poses: {'stand-right': {start: 0, count: 1, frameDelay: 2}},
};

type ViewProps = React.ComponentProps<typeof GenerateImageView>;

function renderView(props: Partial<ViewProps> = {}) {
  return render(
    <ThemeProvider>
      <GenerateImageView onAccept={jest.fn()} onCancel={jest.fn()} {...props} />
    </ThemeProvider>
  );
}

describe('GenerateImageView character-set offer', () => {
  it('offers a set for a new sprite, checked', () => {
    renderView({create: {isNameTaken: () => false}});
    expect(screen.getByLabelText(SET_CHECKBOX)).toBeChecked();
  });

  it('does not offer a set for an object: a set would give it limbs', () => {
    renderView({create: {isNameTaken: () => false}});
    const type = screen.getByRole('combobox', {name: 'Type'});
    fireEvent.change(type, {target: {value: 'object'}});
    expect(screen.queryByLabelText(SET_CHECKBOX)).not.toBeInTheDocument();
    fireEvent.change(type, {target: {value: 'character'}});
    expect(screen.getByLabelText(SET_CHECKBOX)).toBeInTheDocument();
  });

  it('does not offer a set once a prompt is typed', () => {
    renderView({create: {isNameTaken: () => false}});
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'a fox'}});
    expect(screen.queryByLabelText(SET_CHECKBOX)).not.toBeInTheDocument();
  });

  it("locks a new sprite to the level's subject", () => {
    renderView({
      advanced: true,
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
      lockedImageSubject: 'object',
    });
    const type = screen.getByRole('combobox', {name: 'Type'});
    expect(type).toHaveValue('object');
    expect(type).toBeDisabled();
    expect(screen.queryByLabelText(SET_CHECKBOX)).not.toBeInTheDocument();
  });

  it('does not offer a set when the type is not sprite', () => {
    renderView({
      create: {isNameTaken: () => false},
      lockedImageType: 'background',
    });
    expect(screen.queryByLabelText(SET_CHECKBOX)).not.toBeInTheDocument();
  });

  it('pre-checks the set for an image that already is one', () => {
    renderView({
      existing: {imageType: 'sprite', getDataURI: async () => null},
      sheet: SHEET,
    });
    expect(screen.getByLabelText(SET_CHECKBOX)).toBeChecked();
  });

  it('leaves the set unchecked for a still image being regenerated', () => {
    renderView({
      existing: {imageType: 'sprite', getDataURI: async () => null},
    });
    expect(screen.getByLabelText(SET_CHECKBOX)).not.toBeChecked();
  });

  it('withdraws the offer when the base is a previous image, not fresh', () => {
    // Start-from radios exist only in the advanced form; the student form
    // always draws from a fresh base, so its offer never withdraws.
    renderView({
      advanced: true,
      existing: {imageType: 'sprite', getDataURI: async () => null},
    });
    expect(screen.getByLabelText(SET_CHECKBOX_ADVANCED)).toBeInTheDocument();
    fireEvent.click(
      screen.getByLabelText(/Use previous image/, {selector: 'input'})
    );
    expect(
      screen.queryByLabelText(SET_CHECKBOX_ADVANCED)
    ).not.toBeInTheDocument();
  });
});

describe('GenerateImageView type choice', () => {
  it('offers the type, the style and, for pixel art, the resolution as dropdowns', () => {
    renderView({create: {isNameTaken: () => false}, defaultStyle: 'pixel'});
    expect(screen.getByRole('combobox', {name: 'Type'})).toHaveValue(
      'character'
    );
    expect(screen.getByRole('combobox', {name: 'Style'})).toHaveValue('pixel');
    expect(screen.getByRole('combobox', {name: 'Resolution'})).toHaveValue('1');
    fireEvent.change(screen.getByRole('combobox', {name: 'Style'}), {
      target: {value: 'smooth'},
    });
    expect(screen.queryByRole('combobox', {name: 'Resolution'})).toBeNull();
  });

  it('disables the type when the level locks it, and when regenerating', () => {
    const {unmount} = renderView({
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
    });
    expect(screen.getByRole('combobox', {name: 'Type'})).toBeDisabled();
    expect(screen.getByRole('combobox', {name: 'Style'})).toBeEnabled();
    unmount();
    renderView({existing: {imageType: 'block', getDataURI: async () => null}});
    const type = screen.getByRole('combobox', {name: 'Type'});
    expect(type).toHaveValue('block');
    expect(type).toBeDisabled();
  });
});
