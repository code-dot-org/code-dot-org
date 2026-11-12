import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import EditSpritelabConfig from '@cdo/apps/lab2/levelEditors/spritelabConfig/EditSpritelabConfig';

const savedValue = () =>
  JSON.parse(
    (document.getElementById('level_level_config') as HTMLInputElement).value
  );

// The library's text field names its input by its label and its help text
// together, so the fields are found by the start of the name.
const paletteRoles = () =>
  screen.getByRole('textbox', {name: /^Palette roles/}) as HTMLInputElement;

const renderForm = (initialConfig: unknown = null) =>
  render(
    <EditSpritelabConfig
      initialConfig={initialConfig}
      fromOlderProperties={{}}
    />
  );

describe('EditSpritelabConfig', () => {
  it("draws a field for each option of the lab's schema, under its group", () => {
    renderForm();
    expect(screen.getByRole('group', {name: 'Images tab'})).toBeTruthy();
    expect(screen.getByRole('group', {name: 'World tab'})).toBeTruthy();
    expect(screen.getByLabelText('Only this image')).toBeTruthy();
    expect(paletteRoles()).toBeTruthy();
    expect(screen.getByLabelText('Start pattern')).toBeTruthy();
    expect(savedValue()).toEqual({});
  });

  it('starts from the saved config', () => {
    renderForm({world: {paletteRoles: ['treasure', 'block']}});
    expect(paletteRoles().value).toBe('treasure, block');
  });

  it('saves a flag, a list of names and a list of lines in their groups', () => {
    renderForm();
    fireEvent.click(screen.getByLabelText('Only this image'));
    fireEvent.change(paletteRoles(), {target: {value: 'treasure, block'}});
    fireEvent.change(screen.getByLabelText('Start pattern'), {
      target: {value: '.S.\nBBB'},
    });
    expect(savedValue()).toEqual({
      images: {onlyThisImage: true},
      world: {
        paletteRoles: ['treasure', 'block'],
        startPattern: ['.S.', 'BBB'],
      },
    });
  });

  it('removes an option, and then its group, when the field is emptied', () => {
    renderForm({images: {onlyThisImage: true}});
    fireEvent.click(screen.getByLabelText('Only this image'));
    expect(savedValue()).toEqual({});
  });

  it("shows the schema's own message beside the field that is wrong", () => {
    renderForm({images: {makes: {type: 'background', subject: 'object'}}});
    expect(screen.getByText('Only a sprite has a subject.')).toBeTruthy();
  });

  it('shows what the older properties say when there are any', () => {
    render(
      <EditSpritelabConfig
        initialConfig={null}
        fromOlderProperties={{world: {paletteRoles: ['treasure']}}}
      />
    );
    expect(screen.getByText(/"paletteRoles"/)).toBeTruthy();
  });
});
