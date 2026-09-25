import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditAilabMode from '@cdo/apps/lab2/levelEditors/ailabMode/EditAilabMode';

const DATASETS = [
  {id: 'zoo', name: 'Zoo Animals'},
  {id: 'heart', name: 'Heart Disease'},
  {id: 'pizza_toy', name: 'Pizza Toppings', isToy: true},
];

function renderEditor(initialMode: string | null) {
  const {container} = render(
    <EditAilabMode initialMode={initialMode} datasets={DATASETS} />
  );
  // The submitted value lives in a hidden input, which has no accessible role.
  return () =>
    // eslint-disable-next-line no-restricted-properties
    (container.querySelector('[name="level[mode]"]') as HTMLInputElement).value;
}

describe('EditAilabMode', () => {
  it('submits the original string unchanged until a field is edited', () => {
    const original = '{ "hideSave":true }\n  ';
    const savedMode = renderEditor(original);
    expect(savedMode()).toBe(original);
  });

  it('shows known values in the fields', () => {
    renderEditor(
      '{"datasets": ["zoo"], "trainer": "decisionTree", "requireAccuracy": 80, "hideSave": true}'
    );
    expect(
      screen.getByRole('checkbox', {name: 'Zoo Animals (zoo)'})
    ).toBeChecked();
    expect(screen.getByRole('combobox', {name: 'Trainer'})).toHaveValue(
      'decisionTree'
    );
    expect(
      screen.getByRole('spinbutton', {name: /Required accuracy/})
    ).toHaveValue(80);
    expect(
      screen.getByRole('checkbox', {name: 'Hide the save model step'})
    ).toBeChecked();
  });

  it('keeps unknown keys and invalid values when another field changes', () => {
    const savedMode = renderEditor(
      '{"hideModelCard": true, "trainer": "svm", "hideSave": "yes"}'
    );
    expect(screen.getByText(/hideModelCard/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', {name: 'Zoo Animals (zoo)'}));

    expect(JSON.parse(savedMode())).toEqual({
      hideModelCard: true,
      trainer: 'svm',
      hideSave: 'yes',
      datasets: ['zoo'],
    });
  });

  it('removes a key when its field is cleared', () => {
    const savedMode = renderEditor('{"hideSave": true, "requireAccuracy": 70}');
    fireEvent.click(
      screen.getByRole('checkbox', {name: 'Hide the save model step'})
    );
    fireEvent.change(
      screen.getByRole('spinbutton', {name: /Required accuracy/}),
      {
        target: {value: ''},
      }
    );
    expect(savedMode()).toBe('');
  });

  it('sets the trainer and the required accuracy', () => {
    const savedMode = renderEditor(null);
    fireEvent.change(screen.getByRole('combobox', {name: 'Trainer'}), {
      target: {value: 'decisionTree'},
    });
    fireEvent.change(
      screen.getByRole('spinbutton', {name: /Required accuracy/}),
      {
        target: {value: '90'},
      }
    );
    expect(JSON.parse(savedMode())).toEqual({
      trainer: 'decisionTree',
      requireAccuracy: 90,
    });
  });

  it('hides CSV upload with an empty datasets list', () => {
    const savedMode = renderEditor('{"hideSave": true}');
    const upload = screen.getByRole('checkbox', {
      name: 'Allow students to upload their own CSV',
    });
    expect(upload).toBeChecked();

    fireEvent.click(upload);
    expect(JSON.parse(savedMode())).toEqual({hideSave: true, datasets: []});

    fireEvent.click(upload);
    expect(JSON.parse(savedMode())).toEqual({hideSave: true});
  });

  it('disables the CSV upload option when datasets are selected', () => {
    renderEditor('{"datasets": ["zoo"]}');
    const upload = screen.getByRole('checkbox', {
      name: 'Allow students to upload their own CSV',
    });
    expect(upload).not.toBeChecked();
    expect(upload).toBeDisabled();
  });

  it('falls back to a raw text area for a mode that is not a JSON object', () => {
    const original = "{'datasets': ['zoo']}";
    const savedMode = renderEditor(original);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(savedMode()).toBe(original);
  });
});
