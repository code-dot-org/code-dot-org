import {act, render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditAilabMode from '@cdo/apps/lab2/levelEditors/ailabMode/EditAilabMode';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient');

const dataset = (id: string, name: string) => ({
  id,
  name,
  path: `datasets/${id}.csv`,
  metadataPath: `datasets/${id}.json`,
});

const DATASETS = [
  dataset('zoo', 'Zoo Animals'),
  dataset('heart', 'Heart Disease'),
  {...dataset('pizza_toy', 'Pizza Toppings'), isToy: true},
];

const ASSET_PATH = '/blockly/media/skins/ailab/datasets/';

const FILES: Record<string, string | object> = {
  // `name` has no type in the metadata, so students cannot choose it.
  'zoo.csv': 'name,legs,wings,animal\nTom,4,0,cat\nTweety,2,2,bird\n',
  'zoo.json': {
    card: {},
    defaultLabelColumn: 'animal',
    fields: [
      {id: 'legs', type: 'numerical'},
      {id: 'wings', type: 'numerical'},
      {id: 'animal'},
    ],
  },
  'heart.csv': 'age,sex\n50,M\n60,F\n',
  'heart.json': {
    card: {},
    fields: [
      {id: 'age', type: 'numerical'},
      {id: 'sex', type: 'categorical'},
    ],
  },
  // The default label names a column the CSV does not have.
  'pizza_toy.csv': 'topping,price\nham,3\nolive,2\n',
  'pizza_toy.json': {
    card: {},
    defaultLabelColumn: 'Topping?',
    fields: [{id: 'topping'}, {id: 'price', type: 'numerical'}],
  },
};

function serveFiles(files: Record<string, string | object>) {
  const file = (url: string) => {
    const name = url.replace(ASSET_PATH, '');
    if (!(name in files)) {
      throw new Error(`404 ${url}`);
    }
    return files[name];
  };
  jest
    .mocked(HttpClient.get)
    .mockImplementation(
      async url => ({text: async () => file(url)} as unknown as Response)
    );
  jest
    .mocked(HttpClient.fetchJson)
    .mockImplementation(
      async url => ({value: file(url), response: {} as Response} as never)
    );
}

beforeEach(() => {
  jest.mocked(HttpClient.get).mockReturnValue(new Promise(() => {}));
  jest.mocked(HttpClient.fetchJson).mockReturnValue(new Promise(() => {}));
});

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

const DATASET_REQUIRED =
  'Choose a dataset. The level cannot be saved without one.';

function datasetDropdown() {
  return screen.getByRole('combobox', {name: /^Dataset/});
}

function chooseDataset(datasetId: string) {
  fireEvent.change(datasetDropdown(), {target: {value: datasetId}});
}

function labelDropdown() {
  return screen.getByRole('combobox', {name: /^Label/});
}

function optionsOf(select: HTMLElement) {
  return Array.from((select as HTMLSelectElement).options).map(
    option => option.text
  );
}

function featuresLock() {
  return screen.getByRole('checkbox', {
    name: 'Lock the features so students cannot change them',
  });
}

function featuresDropdown() {
  return screen.getByRole('button', {name: /^Features/});
}

function featureCheckboxes() {
  return Array.from(
    // The menu has no accessible role of its own.
    document.querySelectorAll<HTMLInputElement>(
      '#ailab_mode_features-dropdown input[type="checkbox"]'
    )
  );
}

function featureOptions() {
  return featureCheckboxes().map(checkbox => checkbox.value);
}

function toggleFeature(column: string) {
  fireEvent.click(featureCheckboxes().find(box => box.value === column)!);
}

function columnsLoaded() {
  return waitFor(() => expect(labelDropdown()).toBeEnabled());
}

function pretrainedCheckbox() {
  return screen.getByRole('checkbox', {name: 'Pretrain the model'});
}

const PRETRAINED_COLUMNS_REQUIRED =
  'Choose a label and features to train the model on.';

describe('EditAilabMode', () => {
  it('shows the JSON text area unchanged when Lab 2 is off', () => {
    const original = '{"hideSave": "yes", "hideModelCard": true}';
    const savedMode = renderEditor(original, false);
    expect(
      screen.queryByRole('combobox', {name: /^Dataset/})
    ).not.toBeInTheDocument();
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
    chooseDataset('zoo');

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
    expect(datasetDropdown()).toHaveValue('zoo');
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
    expect(datasetDropdown()).toHaveValue('zoo');
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

  it('drops a hidden dataset view saved without pretraining', () => {
    const savedMode = renderEditor('{"hideDatasetView": true}');
    expect(JSON.parse(savedMode())).toEqual({trainer: 'knn'});
  });

  it('drops the training options saved with the testing view hidden', () => {
    const savedMode = renderEditor(
      '{"hideTestingView": true, "requireAccuracy": 70, "hideSave": true, "reserveLastRows": true}'
    );
    expect(JSON.parse(savedMode())).toEqual({
      hideTestingView: true,
      trainer: 'knn',
      reserveLastRows: true,
    });
  });

  it('clears and locks the training options while the testing view is hidden', () => {
    const savedMode = renderEditor(
      '{"requireAccuracy": 70, "hideSave": true, "reserveLastRows": true}'
    );
    const accuracy = screen.getByRole('spinbutton', {
      name: /Required accuracy/,
    });
    const hideSave = screen.getByRole('checkbox', {
      name: 'Hide the save model step',
    });
    const lastRows = screen.getByRole('checkbox', {
      name: 'Reserve the last rows for testing instead of random rows',
    });
    const hideTestingView = screen.getByRole('checkbox', {
      name: 'Hide training and testing so students only explore the dataset',
    });

    fireEvent.click(hideTestingView);
    [accuracy, hideSave, lastRows].forEach(field =>
      expect(field).toBeDisabled()
    );
    expect(accuracy).toHaveValue(null);
    expect(JSON.parse(savedMode())).toEqual({
      hideTestingView: true,
      trainer: 'knn',
      reserveLastRows: true,
    });

    fireEvent.click(hideTestingView);
    [accuracy, hideSave, lastRows].forEach(field =>
      expect(field).toBeEnabled()
    );
    expect(JSON.parse(savedMode())).toEqual({
      trainer: 'knn',
      reserveLastRows: true,
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
    expect(datasetDropdown()).toHaveValue('');
    expect(datasetDropdown()).toBeRequired();
    expect(datasetDropdown()).toBeInvalid();
    expect(screen.getByText(DATASET_REQUIRED)).toBeInTheDocument();

    chooseDataset('pizza_toy');

    expect(JSON.parse(savedMode())).toEqual({
      hideSave: true,
      trainer: 'knn',
      datasets: ['pizza_toy'],
    });
    expect(datasetDropdown()).toBeValid();
    expect(screen.queryByText(DATASET_REQUIRED)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', {name: 'Choose a dataset'})
    ).not.toBeInTheDocument();
  });

  it('lists regular datasets before toy datasets', () => {
    renderEditor(null);
    expect(
      screen
        .getAllByRole('option')
        .filter(option => option.closest('select') === datasetDropdown())
        .map(option => (option as HTMLOptionElement).value)
    ).toEqual(['', 'zoo', 'heart', 'pizza_toy']);
  });

  describe('label and features', () => {
    beforeEach(() => serveFiles(FILES));

    it('offers the columns students can choose', async () => {
      renderEditor('{"datasets": ["zoo"]}');
      await columnsLoaded();
      expect(optionsOf(labelDropdown())).toEqual([
        'None',
        'animal (default)',
        'legs',
        'wings',
      ]);
      expect(labelDropdown()).toBeValid();
      expect(featureOptions()).toEqual(['legs', 'wings', 'animal']);
    });

    it('waits for a dataset', () => {
      renderEditor(null);
      expect(labelDropdown()).toBeDisabled();
      expect(featuresDropdown()).toBeDisabled();
      expect(screen.getAllByText('Choose a dataset first.')).toHaveLength(2);
    });

    it('sets the label and the features', async () => {
      const savedMode = renderEditor('{"datasets": ["zoo"]}');
      await columnsLoaded();

      fireEvent.change(labelDropdown(), {target: {value: 'animal'}});
      toggleFeature('wings');
      toggleFeature('legs');

      expect(featureOptions()).toEqual(['legs', 'wings']);
      expect(featuresDropdown()).toHaveAccessibleName('Features, legs, wings');
      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
        label: 'animal',
        features: ['legs', 'wings'],
      });

      toggleFeature('legs');
      toggleFeature('wings');
      fireEvent.change(labelDropdown(), {target: {value: ''}});
      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
      });
    });

    it('selects and clears all the features', async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "label": "animal"}'
      );
      await columnsLoaded();

      fireEvent.click(screen.getByRole('button', {name: 'Select all'}));
      expect(JSON.parse(savedMode()).features).toEqual(['legs', 'wings']);

      fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
      expect(JSON.parse(savedMode())).not.toHaveProperty('features');
    });

    it('removes the starting label from the features', async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "features": ["legs", "wings", "animal"]}'
      );
      await columnsLoaded();

      fireEvent.click(
        screen.getByRole('checkbox', {
          name: 'Lock the label so students cannot change it',
        })
      );
      expect(JSON.parse(savedMode()).features).toEqual(['legs', 'wings']);

      fireEvent.change(labelDropdown(), {target: {value: 'legs'}});
      expect(JSON.parse(savedMode()).features).toEqual(['wings']);
    });

    it('clears them when the dataset changes', async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "label": "animal", "features": ["legs"]}'
      );
      await columnsLoaded();

      chooseDataset('heart');

      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['heart'],
        trainer: 'knn',
      });
      await waitFor(() =>
        expect(optionsOf(labelDropdown())).toEqual(['None', 'age', 'sex'])
      );
    });

    it("shows only the chosen dataset's columns", async () => {
      let releaseHeart = () => {};
      const heartHeld = new Promise<void>(resolve => (releaseHeart = resolve));
      const serve = jest.mocked(HttpClient.get).getMockImplementation()!;
      jest.mocked(HttpClient.get).mockImplementation(async url => {
        if (url.endsWith('heart.csv')) {
          await heartHeld;
        }
        return serve(url);
      });
      renderEditor('{"datasets": ["zoo"]}');
      await columnsLoaded();

      chooseDataset('heart');
      expect(labelDropdown()).toBeDisabled();

      chooseDataset('zoo');
      await columnsLoaded();
      await act(async () => {
        releaseHeart();
        await new Promise(resolve => setTimeout(resolve));
      });
      expect(optionsOf(labelDropdown())).toEqual([
        'None',
        'animal (default)',
        'legs',
        'wings',
      ]);
    });

    it("shows the dataset's default label when locked with none set", async () => {
      const savedMode = renderEditor('{"datasets": ["zoo"]}');
      await columnsLoaded();
      const lock = screen.getByRole('checkbox', {
        name: 'Lock the label so students cannot change it',
      });

      fireEvent.click(lock);

      expect(labelDropdown()).toHaveValue('animal');
      expect(optionsOf(labelDropdown())).toEqual([
        'animal (default)',
        'legs',
        'wings',
      ]);
      expect(featureOptions()).toEqual(['legs', 'wings']);
      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
        hideSelectLabel: true,
      });

      fireEvent.click(lock);

      expect(labelDropdown()).toHaveValue('');
    });

    it.each(['heart', 'pizza_toy'])(
      'asks for a label to lock when %s has no usable default',
      async datasetId => {
        renderEditor(`{"datasets": ["${datasetId}"], "hideSelectLabel": true}`);
        await columnsLoaded();
        expect(
          screen.getByText(
            'This dataset has no default label. Choose a label to lock.'
          )
        ).toBeInTheDocument();
        expect(labelDropdown()).toBeInvalid();
      }
    );

    it('offers None under the lock only when no label is shown', async () => {
      renderEditor(
        '{"datasets": ["heart"], "label": "age", "hideSelectLabel": true}'
      );
      await columnsLoaded();
      expect(optionsOf(labelDropdown())).toEqual(['age', 'sex']);
    });

    it('flags saved columns students cannot choose', async () => {
      renderEditor(
        '{"datasets": ["zoo"], "label": "name", "features": ["legs", "fins"]}'
      );
      await columnsLoaded();
      expect(labelDropdown()).toHaveValue('name');
      expect(
        screen.getByText('Students cannot choose "name" in this dataset.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Students will not start with these features: fins.')
      ).toBeInTheDocument();
    });

    it('drops saved features students will not start with when the features change', async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "features": ["legs", "fins"]}'
      );
      await columnsLoaded();

      toggleFeature('wings');

      expect(JSON.parse(savedMode()).features).toEqual(['legs', 'wings']);
      expect(
        screen.queryByText(/Students will not start with these features/)
      ).not.toBeInTheDocument();
    });

    it('requires another label in place of a locked one students cannot choose', async () => {
      renderEditor(
        '{"datasets": ["zoo"], "label": "name", "hideSelectLabel": true}'
      );
      await columnsLoaded();
      expect(labelDropdown()).toHaveValue('');
      expect(labelDropdown()).toBeInvalid();
    });

    it('locks the features, asking for some to lock', async () => {
      const savedMode = renderEditor('{"datasets": ["zoo"]}');
      await columnsLoaded();

      fireEvent.click(featuresLock());
      expect(
        screen.getByText('Choose the features to lock.')
      ).toBeInTheDocument();
      expect(featuresLock()).toBeInvalid();

      toggleFeature('legs');

      expect(
        screen.queryByText('Choose the features to lock.')
      ).not.toBeInTheDocument();
      expect(featuresLock()).toBeValid();
      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
        lockFeatures: true,
        features: ['legs'],
      });
    });

    it('asks for a column to predict when every column is locked', async () => {
      renderEditor('{"datasets": ["zoo"], "lockFeatures": true}');
      await columnsLoaded();
      const noLabelLeft =
        'Leave a column out for students to predict, or choose a label.';

      fireEvent.click(screen.getByRole('button', {name: 'Select all'}));
      expect(screen.getByText(noLabelLeft)).toBeInTheDocument();
      expect(featuresLock()).toBeInvalid();

      fireEvent.change(labelDropdown(), {target: {value: 'animal'}});
      expect(screen.queryByText(noLabelLeft)).not.toBeInTheDocument();
      expect(featuresLock()).toBeValid();
    });

    it('pretrains with both locks and the last rows in place of a required accuracy, then restores them', async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "label": "animal", "features": ["legs"], "requireAccuracy": 80}'
      );
      await columnsLoaded();
      const labelLock = screen.getByRole('checkbox', {
        name: 'Lock the label so students cannot change it',
      });
      const lastRows = screen.getByRole('checkbox', {
        name: 'Reserve the last rows for testing instead of random rows',
      });
      const accuracy = screen.getByRole('spinbutton', {
        name: /Required accuracy/,
      });

      fireEvent.click(pretrainedCheckbox());

      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
        label: 'animal',
        features: ['legs'],
        pretrained: true,
        hideSelectLabel: true,
        lockFeatures: true,
        reserveLastRows: true,
      });
      [labelLock, featuresLock(), lastRows, accuracy].forEach(field =>
        expect(field).toBeDisabled()
      );
      expect(accuracy).toHaveValue(null);

      fireEvent.click(pretrainedCheckbox());

      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
        label: 'animal',
        features: ['legs'],
        requireAccuracy: 80,
      });
      [labelLock, featuresLock(), lastRows, accuracy].forEach(field =>
        expect(field).toBeEnabled()
      );
      expect(lastRows).not.toBeChecked();
      expect(accuracy).toHaveValue(80);
    });

    it('restores the defaults when a level saved pretrained stops pretraining', async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "pretrained": true, "label": "animal", "features": ["legs"]}'
      );
      await columnsLoaded();

      fireEvent.click(pretrainedCheckbox());

      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
        label: 'animal',
        features: ['legs'],
      });
    });

    it('clears the training options again when pretraining restores a hidden testing view', async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "label": "animal", "features": ["legs"], "hideTestingView": true}'
      );
      await columnsLoaded();
      const hideSave = screen.getByRole('checkbox', {
        name: 'Hide the save model step',
      });

      fireEvent.click(pretrainedCheckbox());
      fireEvent.click(hideSave);
      fireEvent.click(pretrainedCheckbox());

      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
        label: 'animal',
        features: ['legs'],
        hideTestingView: true,
      });
      expect(hideSave).not.toBeChecked();
      expect(hideSave).toBeDisabled();
    });

    it('asks for a label and features students can choose to pretrain on', async () => {
      renderEditor(
        '{"datasets": ["zoo"], "pretrained": true, "label": "name", "features": ["name"]}'
      );
      await columnsLoaded();
      expect(pretrainedCheckbox()).toHaveAccessibleDescription(
        PRETRAINED_COLUMNS_REQUIRED
      );
      expect(pretrainedCheckbox()).toBeInvalid();

      fireEvent.change(labelDropdown(), {target: {value: 'animal'}});
      expect(pretrainedCheckbox()).toBeInvalid();

      toggleFeature('legs');

      expect(
        screen.queryByText(PRETRAINED_COLUMNS_REQUIRED)
      ).not.toBeInTheDocument();
      expect(pretrainedCheckbox()).toBeValid();
    });

    it('asks for a feature besides the label to pretrain on', async () => {
      renderEditor(
        '{"datasets": ["zoo"], "pretrained": true, "label": "animal", "features": ["animal"]}'
      );
      await columnsLoaded();
      expect(pretrainedCheckbox()).toBeInvalid();
    });

    it("pretrains on the dataset's default label once the columns load", async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "features": ["legs"]}'
      );
      expect(pretrainedCheckbox()).toBeDisabled();
      await columnsLoaded();

      fireEvent.click(pretrainedCheckbox());

      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
        label: 'animal',
        features: ['legs'],
        pretrained: true,
        hideSelectLabel: true,
        lockFeatures: true,
        reserveLastRows: true,
      });
      expect(pretrainedCheckbox()).toBeValid();
    });

    it('locks a saved pretrained level and drops the settings pretraining replaces', () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "pretrained": true, "label": "animal", "features": ["legs"], "reserveLastRows": false, "requireAccuracy": 80}'
      );
      expect(JSON.parse(savedMode())).toEqual({
        datasets: ['zoo'],
        trainer: 'knn',
        label: 'animal',
        features: ['legs'],
        pretrained: true,
        hideSelectLabel: true,
        lockFeatures: true,
        reserveLastRows: true,
      });
    });

    it('offers to hide the dataset view only while pretrained', async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "label": "animal", "features": ["legs"]}'
      );
      await columnsLoaded();
      const hideDatasetView = () =>
        screen.queryByRole('checkbox', {
          name: 'Hide the dataset view so students start on testing',
        });
      expect(hideDatasetView()).not.toBeInTheDocument();

      fireEvent.click(pretrainedCheckbox());
      fireEvent.click(hideDatasetView()!);
      expect(JSON.parse(savedMode())).toMatchObject({
        pretrained: true,
        hideDatasetView: true,
      });

      fireEvent.click(pretrainedCheckbox());
      expect(hideDatasetView()).not.toBeInTheDocument();
      expect(JSON.parse(savedMode())).not.toHaveProperty('hideDatasetView');
    });

    it('replaces a hidden testing view', async () => {
      const savedMode = renderEditor(
        '{"datasets": ["zoo"], "label": "animal", "features": ["legs"], "hideTestingView": true}'
      );
      await columnsLoaded();
      const hideTestingView = screen.getByRole('checkbox', {
        name: 'Hide training and testing so students only explore the dataset',
      });

      fireEvent.click(pretrainedCheckbox());
      expect(hideTestingView).toBeDisabled();
      expect(JSON.parse(savedMode())).not.toHaveProperty('hideTestingView');
    });

    it("reports a dataset whose columns don't load", async () => {
      serveFiles({});
      renderEditor('{"datasets": ["zoo"]}');
      expect(
        await screen.findByText("Could not load the dataset's columns.")
      ).toBeInTheDocument();
      expect(labelDropdown()).toBeDisabled();
      expect(featuresDropdown()).toBeDisabled();
    });
  });
});
