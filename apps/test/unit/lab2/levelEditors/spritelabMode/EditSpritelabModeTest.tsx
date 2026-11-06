import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditSpritelabMode from '@cdo/apps/lab2/levelEditors/spritelabMode/EditSpritelabMode';
import {LevelModeObject} from '@cdo/apps/lab2/levelEditors/spritelabMode/spritelabMode';

// Names are anchored because a field's accessible name carries its helper
// message, and several of those mention the other fields.
const KIND = /^Kind/;
const IMAGE_TYPE = /^Image type/;
const IMAGE_SUBJECT = /^Image subject/;
const IMAGE_ROLE = /^Image role/;
const PALETTE_ROLES = /^Palette roles/;
const IMAGE_FIRST = /^Open on the Images tab/;

const dropdown = (name: RegExp) => screen.getByRole('combobox', {name});
const textbox = (name: RegExp) => screen.getByRole('textbox', {name});

// What the form would submit for level[level_mode]. A hidden input has no
// accessible role of its own.
function submitted(container: HTMLElement) {
  // eslint-disable-next-line no-restricted-properties
  const input = container.querySelector(
    '[name="level[level_mode]"]'
  ) as HTMLInputElement;
  return input.value;
}

function renderEditor(initialMode: LevelModeObject | null, usesLab2 = true) {
  return render(
    <EditSpritelabMode initialMode={initialMode} initialUsesLab2={usesLab2} />
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
    const mode = {kind: 'world', imageType: 'sprite', imageRole: 'treasure'};
    const {container} = renderEditor(mode);
    expect(JSON.parse(submitted(container))).toEqual(mode);
  });

  it('drops stale keys and says which ones', () => {
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
    expect(screen.getByText(/will be removed when you save/)).toHaveTextContent(
      'sentence: "block"; placeOne: true'
    );
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

  it('drops the keys a new kind cannot use', () => {
    const {container} = renderEditor({
      kind: 'world',
      imageType: 'sprite',
      paletteRoles: ['treasure'],
    });
    choose(KIND, 'freeplay');
    expect(JSON.parse(submitted(container))).toEqual({kind: 'freeplay'});
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

  it('warns when the image type and palette roles disagree', () => {
    renderEditor({
      kind: 'world',
      imageType: 'sprite',
      paletteRoles: ['treasure'],
    });
    expect(
      screen.getByText(/Palette roles already choose the images/)
    ).toBeInTheDocument();
  });

  it('says the settings do nothing until Lab 2 is on', () => {
    renderEditor({kind: 'code'}, false);
    expect(
      screen.getByText(/only on the Lab 2 version of Sprite Lab/)
    ).toBeInTheDocument();
  });
});
