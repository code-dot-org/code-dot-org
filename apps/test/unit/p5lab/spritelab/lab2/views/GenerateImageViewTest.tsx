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
    <GenerateImageView onAccept={jest.fn()} onCancel={jest.fn()} {...props} />
  );
}

describe('GenerateImageView character-set offer', () => {
  it('offers a set for a new sprite, unchecked', () => {
    renderView({create: {isNameTaken: () => false}});
    expect(screen.getByLabelText(SET_CHECKBOX)).not.toBeChecked();
  });

  it('does not offer a set for an object: a set would give it limbs', () => {
    renderView({create: {isNameTaken: () => false}});
    fireEvent.click(screen.getByRole('radio', {name: 'Object'}));
    expect(screen.queryByLabelText(SET_CHECKBOX)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', {name: 'Character'}));
    expect(screen.getByLabelText(SET_CHECKBOX)).toBeInTheDocument();
  });

  it('does not offer a set once a prompt is typed', () => {
    renderView({create: {isNameTaken: () => false}});
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'a fox'}});
    expect(screen.queryByLabelText(SET_CHECKBOX)).not.toBeInTheDocument();
  });

  it("locks a new sprite to the level's subject", () => {
    // The student form drops a locked type group; the advanced form keeps
    // it, so the locked subject shows there.
    const {unmount} = renderView({
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
      lockedImageSubject: 'object',
    });
    expect(screen.queryByLabelText(SET_CHECKBOX)).not.toBeInTheDocument();
    unmount();
    renderView({
      advanced: true,
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
      lockedImageSubject: 'object',
    });
    expect(screen.getByRole('radio', {name: 'Object'})).toBeChecked();
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
  it('offers the type for a new image', () => {
    renderView({create: {isNameTaken: () => false}});
    expect(screen.getByRole('radio', {name: 'Character'})).toBeInTheDocument();
  });

  it('drops the group when the level locks the type, in the student form', () => {
    renderView({
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
    });
    expect(
      screen.queryByRole('radio', {name: 'Character'})
    ).not.toBeInTheDocument();
    // The style choice stays.
    expect(screen.getByRole('radio', {name: 'Pixel art'})).toBeInTheDocument();
  });

  it('keeps the locked group visible, disabled, in the advanced form', () => {
    renderView({
      advanced: true,
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
    });
    expect(screen.getByRole('radio', {name: 'Character'})).toBeDisabled();
  });
});
