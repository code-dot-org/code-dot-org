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
  it('shows the JSON text area unchanged when Lab 2 is off', () => {
    const original = '{"hideSave": "yes", "hideModelCard": true}';
    const savedMode = renderEditor(original, false);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(savedMode()).toBe(original);

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
    expect(screen.queryByText(/will be removed/)).not.toBeInTheDocument();
  });

  it('drops unknown keys and invalid values, and lists them', () => {
    const savedMode = renderEditor(
      '{"hideModelCard": true, "hideInstructionsOverlay": true, "trainer": "svm", "hideSave": "yes", "datasets": ["zoo", "heart"], "requireAccuracy": 50}'
    );
    expect(screen.getByText(/will be removed/)).toHaveTextContent(
      'hideModelCard: true; hideInstructionsOverlay: true; trainer: "svm"; hideSave: "yes"; datasets: ["zoo","heart"]'
    );
    expect(
      screen.queryByRole('checkbox', {name: /instructions/})
    ).not.toBeInTheDocument();
    expect(JSON.parse(savedMode())).toEqual({
      requireAccuracy: 50,
      trainer: 'knn',
    });
  });

  it('replaces a mode that is not valid JSON', () => {
    const savedMode = renderEditor("{'datasets': ['zoo']}");
    expect(screen.getByText(/will be removed/)).toHaveTextContent(
      'not valid JSON'
    );
    expect(JSON.parse(savedMode())).toEqual({trainer: 'knn'});
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

  it('does not save an out-of-range accuracy', () => {
    const savedMode = renderEditor('{"requireAccuracy": 70}');
    fireEvent.change(
      screen.getByRole('spinbutton', {name: /Required accuracy/}),
      {
        target: {value: '150'},
      }
    );
    expect(
      screen.getByText('Enter a number from 0 to 100.')
    ).toBeInTheDocument();
    expect(JSON.parse(savedMode())).toEqual({trainer: 'knn'});
  });

  it('accepts a decimal accuracy and limits the input natively', () => {
    const savedMode = renderEditor(null);
    const accuracy = screen.getByRole('spinbutton', {
      name: /Required accuracy/,
    });
    expect(accuracy).toHaveAttribute('min', '0');
    expect(accuracy).toHaveAttribute('max', '100');
    expect(accuracy).toHaveAttribute('step', 'any');

    fireEvent.change(accuracy, {target: {value: '99.5'}});
    expect(accuracy).toBeValid();
    expect(JSON.parse(savedMode())).toEqual({
      trainer: 'knn',
      requireAccuracy: 99.5,
    });

    fireEvent.change(accuracy, {target: {value: '150'}});
    expect(accuracy).toBeInvalid();
  });

  it('saves k-nearest neighbors when no trainer is set', () => {
    const savedMode = renderEditor('{"datasets": ["zoo"]}');
    expect(screen.getByRole('combobox', {name: 'Trainer'})).toHaveValue('knn');
    expect(JSON.parse(savedMode())).toEqual({
      datasets: ['zoo'],
      trainer: 'knn',
    });
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

  it('requires a dataset until one is chosen', () => {
    const savedMode = renderEditor('{"hideSave": true}');
    expect(screen.getByText(/Choose a dataset/)).toBeInTheDocument();
    screen
      .getAllByRole('radio')
      .forEach(radio => expect(radio).not.toBeChecked());

    fireEvent.click(
      screen.getByRole('radio', {name: 'Pizza Toppings (pizza_toy)'})
    );

    expect(JSON.parse(savedMode())).toEqual({
      hideSave: true,
      trainer: 'knn',
      datasets: ['pizza_toy'],
    });
    expect(screen.queryByText(/Choose a dataset/)).not.toBeInTheDocument();
  });
});
