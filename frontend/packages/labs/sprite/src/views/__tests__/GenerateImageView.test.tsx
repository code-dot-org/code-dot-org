import 'vitest-canvas-mock';
import {fireEvent, render, screen} from '@testing-library/react';
import {type ComponentProps} from 'react';
import {describe, expect, it, vi} from 'vitest';

import GenerateImageView from '../GenerateImageView';

vi.mock('../../ai/images/imageGeneration', () => ({generateImage: vi.fn()}));
vi.mock('../../ai/images/characterSet', async importOriginal => ({
  ...(await importOriginal<typeof import('../../ai/images/characterSet')>()),
  generateCharacterSet: vi.fn(),
}));

// The character-set offer exists only for sprites drawn from a fresh base,
// and regenerating an existing set keeps it a set unless the student
// unchecks it.

// The student form's short label; the advanced form spells the offer out.
const SET_CHECKBOX = 'Generate animation';
const SET_CHECKBOX_ADVANCED = /Make a character set/;

const SHEET = {
  src: 'data:image/png;base64,',
  frameSize: {x: 100, y: 100},
  poses: {'stand-right': {start: 0, count: 1, frameDelay: 2}},
};

// No jest-dom here: read the input's state directly.
const checked = (element: HTMLElement) => (element as HTMLInputElement).checked;

type ViewProps = ComponentProps<typeof GenerateImageView>;

function renderView(props: Partial<ViewProps> = {}) {
  return render(
    <GenerateImageView onAccept={vi.fn()} onCancel={vi.fn()} {...props} />,
  );
}

describe('GenerateImageView character-set offer', () => {
  it('offers a set for a new sprite, checked', () => {
    renderView({create: {isNameTaken: () => false}});
    expect(checked(screen.getByLabelText(SET_CHECKBOX))).toBe(true);
  });

  it('does not offer a set for an object: a set would give it limbs', () => {
    renderView({create: {isNameTaken: () => false}});
    fireEvent.click(screen.getByRole('radio', {name: 'Object'}));
    expect(screen.queryByLabelText(SET_CHECKBOX)).toBeNull();
    fireEvent.click(screen.getByRole('radio', {name: 'Character'}));
    expect(screen.getByLabelText(SET_CHECKBOX)).toBeTruthy();
  });

  it('does not offer a set once a prompt is typed', () => {
    renderView({create: {isNameTaken: () => false}});
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'a fox'}});
    expect(screen.queryByLabelText(SET_CHECKBOX)).toBeNull();
  });

  it("locks a new sprite to the level's subject", () => {
    // The student form drops a locked type group; the advanced form keeps
    // it, so the locked subject shows there.
    const {unmount} = renderView({
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
      lockedImageSubject: 'object',
    });
    expect(screen.queryByLabelText(SET_CHECKBOX)).toBeNull();
    unmount();
    renderView({
      advanced: true,
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
      lockedImageSubject: 'object',
    });
    expect(checked(screen.getByRole('radio', {name: 'Object'}))).toBe(true);
    expect(screen.queryByLabelText(SET_CHECKBOX)).toBeNull();
  });

  it('does not offer a set when the type is not sprite', () => {
    renderView({
      create: {isNameTaken: () => false},
      lockedImageType: 'background',
    });
    expect(screen.queryByLabelText(SET_CHECKBOX)).toBeNull();
  });

  it('pre-checks the set for an image that already is one', () => {
    renderView({
      existing: {imageType: 'sprite', getDataURI: async () => null},
      sheet: SHEET,
    });
    expect(checked(screen.getByLabelText(SET_CHECKBOX))).toBe(true);
  });

  it('leaves the set unchecked for a still image being regenerated', () => {
    renderView({
      existing: {imageType: 'sprite', getDataURI: async () => null},
    });
    expect(checked(screen.getByLabelText(SET_CHECKBOX))).toBe(false);
  });

  it('withdraws the offer when the base is a previous image, not fresh', () => {
    // Start-from radios exist only in the advanced form; the student form
    // always draws from a fresh base, so its offer never withdraws.
    renderView({
      advanced: true,
      existing: {imageType: 'sprite', getDataURI: async () => null},
    });
    expect(screen.getByLabelText(SET_CHECKBOX_ADVANCED)).toBeTruthy();
    fireEvent.click(
      screen.getByLabelText(/Use previous image/, {selector: 'input'}),
    );
    expect(screen.queryByLabelText(SET_CHECKBOX_ADVANCED)).toBeNull();
  });
});

describe('GenerateImageView type choice', () => {
  it('offers the type for a new image', () => {
    renderView({create: {isNameTaken: () => false}});
    expect(screen.getByRole('radio', {name: 'Character'})).toBeTruthy();
  });

  it('drops the group when the level locks the type, in the student form', () => {
    renderView({
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
    });
    expect(screen.queryByRole('radio', {name: 'Character'})).toBeNull();
    // The style choice stays.
    expect(screen.getByRole('radio', {name: 'Pixel art'})).toBeTruthy();
  });

  it('keeps the locked group visible, disabled, in the advanced form', () => {
    renderView({
      advanced: true,
      create: {isNameTaken: () => false},
      lockedImageType: 'sprite',
    });
    // The group's fieldset disables it, which :disabled sees and .disabled
    // does not.
    expect(
      screen.getByRole('radio', {name: 'Character'}).matches(':disabled'),
    ).toBe(true);
  });
});
