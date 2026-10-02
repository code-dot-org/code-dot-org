import {act, render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditAilabDynamicInstructions from '@cdo/apps/lab2/levelEditors/ailabDynamicInstructions/EditAilabDynamicInstructions';

const DEFAULTS = {
  results: 'Review the results.',
  trainModel: 'Your model is being trained.',
};

function renderEditor(
  initialDynamicInstructions: string | null,
  initialUsesLab2 = true,
  subscribeToUsesLab2?: (onChange: (usesLab2: boolean) => void) => () => void
) {
  const {container} = render(
    <EditAilabDynamicInstructions
      initialDynamicInstructions={initialDynamicInstructions}
      defaults={DEFAULTS}
      initialUsesLab2={initialUsesLab2}
      subscribeToUsesLab2={subscribeToUsesLab2}
    />
  );
  // The submitted value lives in a hidden input, which has no accessible role.
  const selector = '[name="level[dynamic_instructions]"]';
  return () =>
    // eslint-disable-next-line no-restricted-properties
    (container.querySelector(selector) as HTMLInputElement).value;
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

function field(name: string) {
  return screen.getByRole('textbox', {name}) as HTMLTextAreaElement;
}

describe('EditAilabDynamicInstructions', () => {
  it('shows the JSON text area unchanged when Lab 2 is off', () => {
    const original = '{"selectDataset": "Pick one.", "bogus": 3}';
    const saved = renderEditor(original, false);
    expect(
      screen.queryByRole('textbox', {name: 'Results screen'})
    ).not.toBeInTheDocument();
    expect(saved()).toBe(original);

    fireEvent.change(field('Dynamic instructions JSON'), {
      target: {value: '{"results": "Done."}'},
    });
    expect(saved()).toBe('{"results": "Done."}');
  });

  it('shows saved text in the fields and defaults as placeholders', () => {
    renderEditor('{"results": "How accurate was it?"}');
    expect(field('Results screen')).toHaveValue('How accurate was it?');
    expect(field('Train model screen')).toHaveValue('');
    expect(field('Train model screen')).toHaveAttribute(
      'placeholder',
      'Your model is being trained.'
    );
    expect(screen.queryByText(/will be removed/)).not.toBeInTheDocument();
  });

  it('omits keys Lab 2 never shows', () => {
    renderEditor(null);
    expect(screen.getAllByRole('textbox')).toHaveLength(10);
    expect(
      screen.queryByRole('textbox', {name: /dataset/i})
    ).not.toBeInTheDocument();
  });

  it('drops unknown keys and non-string values, and lists them', () => {
    const saved = renderEditor(
      '{"selectTrainer": "Set up training.", "selectDataset": "Pick.", "results": 5, "trainModel": "Wait.", "saveModel": ""}'
    );
    expect(screen.getByText(/will be removed/)).toHaveTextContent(
      'selectTrainer: "Set up training."; selectDataset: "Pick."; results: 5'
    );
    expect(JSON.parse(saved())).toEqual({trainModel: 'Wait.'});
  });

  it('replaces a value that is not valid JSON', () => {
    const saved = renderEditor("{'results': 'Done.'}");
    expect(screen.getByText(/will be removed/)).toHaveTextContent(
      'not valid JSON'
    );
    expect(saved()).toBe('');
  });

  it('adds a key when its field is filled and removes it when cleared', () => {
    const saved = renderEditor(null);
    fireEvent.change(field('After selecting a numerical column'), {
      target: {value: 'That column holds **numbers**.'},
    });
    expect(JSON.parse(saved())).toEqual({
      selectedFeatureNumerical: 'That column holds **numbers**.',
    });

    fireEvent.change(field('After selecting a numerical column'), {
      target: {value: '  '},
    });
    expect(saved()).toBe('');
  });

  it('switches editors when Lab 2 is toggled, carrying edits across', () => {
    const lab2 = fakeLab2Checkbox();
    const saved = renderEditor(
      '{"results": "Done.", "selectDataset": "Pick."}',
      false,
      lab2.subscribe
    );

    lab2.set(true);
    fireEvent.change(field('Train model screen'), {
      target: {value: 'Wait.'},
    });

    lab2.set(false);
    expect(JSON.parse(field('Dynamic instructions JSON').value)).toEqual({
      results: 'Done.',
      trainModel: 'Wait.',
    });

    lab2.set(true);
    expect(field('Results screen')).toHaveValue('Done.');
    expect(JSON.parse(saved())).toEqual({
      results: 'Done.',
      trainModel: 'Wait.',
    });
  });
});
