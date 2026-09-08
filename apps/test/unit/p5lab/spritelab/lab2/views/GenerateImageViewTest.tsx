import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {DEFAULT_IMAGE_MODEL_ID} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import GenerateImageView from '@cdo/apps/p5lab/spritelab/lab2/views/GenerateImageView';
import experiments from '@cdo/apps/util/experiments';
import {AiImageModelIds} from '@cdo/generated-scripts/sharedConstants';

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

describe('GenerateImageView model choice', () => {
  afterEach(() => jest.restoreAllMocks());

  function withExperiment(on: boolean) {
    jest.spyOn(experiments, 'isEnabledAllowingQueryString').mockReturnValue(on);
  }

  it('offers every model, grouped by provider', () => {
    withExperiment(true);
    renderView({create: {isNameTaken: () => false}});
    const select = screen.getByRole('combobox', {name: /model/i});

    const values = Array.from(select.querySelectorAll('option')).map(
      option => (option as HTMLOptionElement).value
    );
    // Every OpenAI image model the constants declare, plus the default the
    // registry falls back to.
    for (const id of AiImageModelIds) {
      expect(values).toContain(id);
    }
    expect(values).toContain(DEFAULT_IMAGE_MODEL_ID);

    const groups = Array.from(select.querySelectorAll('optgroup')).map(
      group => (group as HTMLOptGroupElement).label
    );
    expect(groups).toEqual(['Google', 'OpenAI']);
  });

  it('is hidden unless the experiment is on', () => {
    withExperiment(false);
    renderView({create: {isNameTaken: () => false}});
    expect(screen.queryByRole('combobox', {name: /model/i})).toBeNull();
  });
});
