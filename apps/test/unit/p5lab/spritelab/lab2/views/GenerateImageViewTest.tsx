import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import GenerateImageView from '@cdo/apps/p5lab/spritelab/lab2/views/GenerateImageView';

// The character-set offer has rules a refactor could silently break: it
// exists only for sprites drawn from a fresh base, and regenerating an
// existing set keeps it a set unless the student unchecks it.

const SET_CHECKBOX = /Make a character set/;

const SHEET = {
  src: 'data:image/png;base64,',
  frameSize: {x: 100, y: 100},
  poses: {'stand-right': {start: 0, count: 1}},
};

function renderView(props = {}) {
  return render(
    <GenerateImageView onAccept={jest.fn()} onCancel={jest.fn()} {...props} />
  );
}

describe('GenerateImageView character-set offer', () => {
  it('offers a set for a new sprite, unchecked', () => {
    renderView({create: {isNameTaken: () => false}});
    expect(screen.getByLabelText(SET_CHECKBOX)).not.toBeChecked();
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
    renderView({
      existing: {imageType: 'sprite', getDataURI: async () => null},
    });
    expect(screen.getByLabelText(SET_CHECKBOX)).toBeInTheDocument();
    fireEvent.click(
      screen.getByLabelText(/Use previous image/, {selector: 'input'})
    );
    expect(screen.queryByLabelText(SET_CHECKBOX)).not.toBeInTheDocument();
  });
});
