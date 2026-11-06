import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditSpritelabMode from '@cdo/apps/lab2/levelEditors/spritelabMode/EditSpritelabMode';
import {LevelModeObject} from '@cdo/apps/lab2/levelEditors/spritelabMode/spritelabMode';

const KIND = /^Kind/;
const IMAGE_TYPE = /^Image type/;
const IMAGE_SUBJECT = /^Image subject/;
const IMAGE_ROLE = /^Image role/;
const PALETTE_ROLES = /^Palette roles/;
const IMAGE_FIRST = /^Enable the Images tab/;

const dropdown = (name: RegExp) => screen.getByRole('combobox', {name});
const textbox = (name: RegExp) => screen.getByRole('textbox', {name});

// What the form would submit for level[level_mode].
function submitted(container: HTMLElement) {
  // A hidden input has no accessible role of its own.
  // eslint-disable-next-line no-restricted-properties
  const input = container.querySelector(
    '[name="level[level_mode]"]'
  ) as HTMLInputElement;
  return input.value;
}

function renderEditor(initialMode: LevelModeObject | null) {
  return render(
    <EditSpritelabMode initialMode={initialMode} initialUsesLab2 />
  );
}

const choose = (name: RegExp, value: string) =>
  fireEvent.change(dropdown(name), {target: {value}});

const type = (name: RegExp, value: string) =>
  fireEvent.change(textbox(name), {target: {value}});

describe('EditSpritelabMode', () => {
  it('submits an empty object for a level with no mode', () => {
    const {container} = renderEditor(null);
    expect(submitted(container)).toBe('{}');
  });

  it('never submits a blank string, which the server cannot parse', () => {
    const {container} = renderEditor({});
    expect(submitted(container)).not.toBe('');
  });

  it('round-trips a saved mode untouched', () => {
    const mode = {
      kind: 'world',
      imageType: 'sprite',
      imageSubject: 'object',
      imageRole: 'treasure',
      paletteRoles: ['treasure', 'block'],
      imageFirst: true,
    };
    const {container} = renderEditor(mode);
    expect(JSON.parse(submitted(container))).toEqual(mode);
  });

  it('drops stale keys', () => {
    const {container} = renderEditor({
      kind: 'image',
      imageType: 'block',
      sentence: 'block',
      placeOne: true,
    });
    expect(JSON.parse(submitted(container))).toEqual({
      kind: 'image',
      imageType: 'block',
    });
  });

  it('clears the whole mode when the kind is not a real kind', () => {
    const {container} = renderEditor({kind: 'build', imageType: 'sprite'});
    expect(submitted(container)).toBe('{}');
  });

  it('writes the kind the author picks', () => {
    const {container} = renderEditor(null);
    choose(KIND, 'freeplay');
    expect(JSON.parse(submitted(container))).toEqual({kind: 'freeplay'});
  });

  it('clears the mode when the kind is set back to none', () => {
    const {container} = renderEditor({kind: 'world', imageType: 'sprite'});
    choose(KIND, '');
    expect(submitted(container)).toBe('{}');
  });

  it('drops the keys a new kind cannot use, from the fields as well', () => {
    const {container} = renderEditor({
      kind: 'world',
      imageType: 'sprite',
      paletteRoles: ['treasure'],
    });
    choose(KIND, 'freeplay');
    expect(JSON.parse(submitted(container))).toEqual({kind: 'freeplay'});
    choose(KIND, 'world');
    expect(submitted(container)).toBe('{"kind":"world"}');
    expect(textbox(PALETTE_ROLES)).toHaveValue('');
  });

  it('shows the image subject only for a sprite', () => {
    renderEditor({kind: 'image', imageType: 'block'});
    expect(
      screen.queryByRole('combobox', {name: IMAGE_SUBJECT})
    ).not.toBeInTheDocument();
    choose(IMAGE_TYPE, 'sprite');
    expect(dropdown(IMAGE_SUBJECT)).toBeInTheDocument();
  });

  it('shows palette roles only on a world level', () => {
    renderEditor({kind: 'code'});
    expect(
      screen.queryByRole('textbox', {name: PALETTE_ROLES})
    ).not.toBeInTheDocument();
    choose(KIND, 'world');
    expect(textbox(PALETTE_ROLES)).toBeInTheDocument();
  });

  it('keeps the order typed in palette roles', () => {
    const {container} = renderEditor({kind: 'world'});
    type(PALETTE_ROLES, 'treasure, block');
    expect(JSON.parse(submitted(container)).paletteRoles).toEqual([
      'treasure',
      'block',
    ]);
  });

  it('accepts a space typed into the image role', () => {
    const {container} = renderEditor({kind: 'image', imageType: 'background'});
    let typed = '';
    for (const character of 'platform background') {
      typed = (textbox(IMAGE_ROLE) as HTMLInputElement).value + character;
      type(IMAGE_ROLE, typed);
    }
    expect(textbox(IMAGE_ROLE)).toHaveValue('platform background');
    expect(JSON.parse(submitted(container)).imageRole).toBe(
      'platform background'
    );
  });

  it('keeps a trailing separator the author is still typing', () => {
    const {container} = renderEditor({kind: 'world'});
    type(PALETTE_ROLES, 'treasure, ');
    expect(textbox(PALETTE_ROLES)).toHaveValue('treasure, ');
    expect(JSON.parse(submitted(container)).paletteRoles).toEqual(['treasure']);
  });

  it('removes a field rather than submitting a blank value', () => {
    const {container} = renderEditor({kind: 'image', imageRole: 'hero'});
    type(IMAGE_ROLE, '');
    expect(JSON.parse(submitted(container))).toEqual({kind: 'image'});
  });

  it('removes the image-first flag rather than submitting false', () => {
    const {container} = renderEditor({kind: 'code', imageFirst: true});
    fireEvent.click(screen.getByRole('checkbox', {name: IMAGE_FIRST}));
    expect(JSON.parse(submitted(container))).toEqual({kind: 'code'});
  });
});
