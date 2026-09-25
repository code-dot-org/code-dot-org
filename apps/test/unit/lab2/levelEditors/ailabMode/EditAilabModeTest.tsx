import {act, render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditAilabMode from '@cdo/apps/lab2/levelEditors/ailabMode/EditAilabMode';

const DATASETS = [
  {id: 'zoo', name: 'Zoo Animals'},
  {id: 'heart', name: 'Heart Disease'},
  {id: 'pizza_toy', name: 'Pizza Toppings', isToy: true},
];

function renderEditor(
  initialMode: string | null,
  initialUsesLab2 = true,
  subscribeToUsesLab2?: (onChange: (usesLab2: boolean) => void) => () => void
) {
  const {container} = render(
    <EditAilabMode
      initialMode={initialMode}
      datasets={DATASETS}
      initialUsesLab2={initialUsesLab2}
      subscribeToUsesLab2={subscribeToUsesLab2}
    />
  );
  // The submitted value lives in a hidden input, which has no accessible role.
  return () =>
    // eslint-disable-next-line no-restricted-properties
    (container.querySelector('[name="level[mode]"]') as HTMLInputElement).value;
}

function fakeLab2Checkbox() {
  let listener: ((usesLab2: boolean) => void) | undefined;
  return {
    subscribe: (onChange: (usesLab2: boolean) => void) => {
      listener = onChange;
      return () => (listener = undefined);
    },
    set: (usesLab2: boolean) => act(() => listener?.(usesLab2)),
  };
}

describe('EditAilabMode', () => {
  it('shows the JSON text area when Lab 2 is off', () => {
    const savedMode = renderEditor('{"hideSave": true}', false);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/not a valid JSON object/)
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', {name: 'Mode JSON'}), {
      target: {value: '{"hideSave": false}'},
    });
    expect(savedMode()).toBe('{"hideSave": false}');
  });

  it('switches editors when Lab 2 is toggled, carrying edits across', () => {
    const lab2 = fakeLab2Checkbox();
    const savedMode = renderEditor('{"hideSave": true}', false, lab2.subscribe);

    lab2.set(true);
    fireEvent.click(screen.getByRole('radio', {name: 'Zoo Animals (zoo)'}));

    lab2.set(false);
    expect(
      JSON.parse(
        (
          screen.getByRole('textbox', {
            name: 'Mode JSON',
          }) as HTMLTextAreaElement
        ).value
      )
    ).toEqual({hideSave: true, trainer: 'knn', datasets: ['zoo']});

    lab2.set(true);
    expect(
      screen.getByRole('radio', {name: 'Zoo Animals (zoo)'})
    ).toBeChecked();
    expect(JSON.parse(savedMode())).toEqual({
      hideSave: true,
      trainer: 'knn',
      datasets: ['zoo'],
    });
  });

  it('lists hideInstructionsOverlay as a key Lab 2 does not use', () => {
    renderEditor('{"hideInstructionsOverlay": true}');
    expect(
      screen.queryByRole('checkbox', {name: /instructions/})
    ).not.toBeInTheDocument();
    expect(screen.getByText(/hideInstructionsOverlay/)).toBeInTheDocument();
  });

  it('submits the original string unchanged until a field is edited', () => {
    const original = '{ "hideSave":true, "trainer":"knn" }\n  ';
    const savedMode = renderEditor(original);
    expect(savedMode()).toBe(original);
  });

  it('shows known values in the fields', () => {
    renderEditor(
      '{"datasets": ["zoo"], "trainer": "decisionTree", "requireAccuracy": 80, "hideSave": true}'
    );
    expect(
      screen.getByRole('radio', {name: 'Zoo Animals (zoo)'})
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

    fireEvent.click(screen.getByRole('radio', {name: 'Zoo Animals (zoo)'}));

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
    expect(JSON.parse(savedMode())).toEqual({trainer: 'knn'});
  });

  it('saves k-nearest neighbors when no trainer is set', () => {
    const savedMode = renderEditor('{"datasets": ["zoo"]}');
    expect(screen.getByRole('combobox', {name: 'Trainer'})).toHaveValue('knn');
    expect(JSON.parse(savedMode())).toEqual({
      datasets: ['zoo'],
      trainer: 'knn',
    });
  });

  it('does not add a trainer when Lab 2 is off', () => {
    const savedMode = renderEditor('{"datasets": ["zoo"]}', false);
    expect(savedMode()).toBe('{"datasets": ["zoo"]}');
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

  it('requires a dataset when none is set', () => {
    renderEditor('{"hideSave": true}');
    expect(screen.getByText(/Choose a dataset/)).toBeInTheDocument();
    screen
      .getAllByRole('radio')
      .forEach(radio => expect(radio).not.toBeChecked());
  });

  it('replaces several datasets with the one chosen', () => {
    const savedMode = renderEditor('{"datasets": ["zoo", "heart"]}');
    expect(screen.getByText(/several datasets/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('radio', {name: 'Pizza Toppings (pizza_toy)'})
    );

    expect(JSON.parse(savedMode())).toEqual({
      datasets: ['pizza_toy'],
      trainer: 'knn',
    });
    expect(screen.queryByText(/several datasets/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Choose a dataset/)).not.toBeInTheDocument();
  });

  it('falls back to a raw text area for a mode that is not a JSON object', () => {
    const original = "{'datasets': ['zoo']}";
    const savedMode = renderEditor(original);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByText(/not a valid JSON object/)).toBeInTheDocument();
    expect(savedMode()).toBe(original);
  });
});
